package com.gym.gymmanagement.controller;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gym.gymmanagement.Member;
import com.gym.gymmanagement.entity.MembershipPlan;
import com.gym.gymmanagement.entity.Payment;
import com.gym.gymmanagement.repository.MemberRepository;
import com.gym.gymmanagement.repository.PaymentRepository;

@RestController
@RequestMapping("/fee-activity")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_STAFF')")
public class FeeActivityController {

    private final MemberRepository memberRepository;
    private final PaymentRepository paymentRepository;

    public FeeActivityController(
            MemberRepository memberRepository,
            PaymentRepository paymentRepository) {

        this.memberRepository = memberRepository;
        this.paymentRepository = paymentRepository;
    }

    // =========================
    // GET FEE ACTIVITY
    // =========================

    @GetMapping
    public ResponseEntity<?> getFeeActivity() {

        LocalDate today = LocalDate.now();

        List<Member> members =
                memberRepository.findAll();

        List<Payment> payments =
                paymentRepository.findAll();

        List<Map<String, Object>> activities =
                new ArrayList<>();

        for (Member member : members) {

            // =========================
            // JOIN DATE
            // =========================

            if (member.getJoinDate() == null) {
                continue;
            }

            // =========================
            // MEMBERSHIP PLAN
            // =========================

            MembershipPlan plan =
                    member.getMembershipPlan();

            if (plan == null) {
                continue;
            }

            int durationMonths =
                    plan.getDurationMonths();

            if (durationMonths <= 0) {
                continue;
            }

            LocalDate joinDate =
                    member.getJoinDate();

            // =========================
            // CURRENT FEE DATE
            // =========================

            LocalDate feeDate =
                    calculateCurrentFeeDate(
                            joinDate,
                            durationMonths,
                            today
                    );

            long daysRemaining =
                    ChronoUnit.DAYS.between(
                            today,
                            feeDate
                    );

            // =========================
            // CURRENT CYCLE PAYMENT
            // =========================

            Payment latestPayment = null;

            /*
             * IMPORTANT:
             *
             * If fee date has already passed,
             * the current cycle is:
             *
             * previous fee date -> today
             *
             * If fee date is today/future,
             * current cycle is:
             *
             * feeDate - duration -> today
             */
            LocalDate cycleStart =
                    feeDate.minusMonths(
                            durationMonths
                    );

            for (Payment payment : payments) {

                if (payment.getMember() == null) {
                    continue;
                }

                if (!member.getId().equals(
                        payment.getMember().getId())) {
                    continue;
                }

                String paymentStatus =
                        payment.getStatus();

                if (paymentStatus == null ||
                        !paymentStatus.equalsIgnoreCase("PAID")) {
                    continue;
                }

                if (payment.getPaymentDate() == null) {
                    continue;
                }

                try {

                    LocalDate paymentDate =
                            LocalDate.parse(
                                    payment.getPaymentDate()
                            );

                    /*
                     * Payment belongs to the
                     * current membership cycle.
                     */
                    if (!paymentDate.isBefore(
                            cycleStart)
                            && !paymentDate.isAfter(
                                    today)) {

                        if (latestPayment == null) {

                            latestPayment =
                                    payment;

                        } else {

                            LocalDate latestPaymentDate =
                                    LocalDate.parse(
                                            latestPayment
                                                    .getPaymentDate()
                                    );

                            if (paymentDate.isAfter(
                                    latestPaymentDate)) {

                                latestPayment =
                                        payment;
                            }
                        }
                    }

                } catch (
                        java.time.format.DateTimeParseException e) {

                    // Ignore invalid payment dates.
                }
            }

            // =========================
            // STATUS
            // =========================

            String status;

            if (latestPayment != null) {

                /*
                 * Member has already paid
                 * for this membership cycle.
                 */
                status = "PAID";

            } else if (daysRemaining < 0) {

                /*
                 * Fee date has passed and
                 * payment has not been made.
                 */
                status = "PENDING";

            } else if (daysRemaining == 0) {

                /*
                 * Fee is due today.
                 */
                status = "DUE TODAY";

            } else {

                /*
                 * Fee date is still in future.
                 */
                status = "UPCOMING";
            }

            // =========================
            // ACTIVITY OBJECT
            // =========================

            Map<String, Object> activity =
                    new HashMap<>();

            activity.put(
                    "memberId",
                    member.getId()
            );

            activity.put(
                    "memberName",
                    member.getName()
            );

            activity.put(
                    "phone",
                    member.getPhone()
            );

            activity.put(
                    "email",
                    member.getEmail()
            );

            activity.put(
                    "joinDate",
                    joinDate
            );

            activity.put(
                    "planName",
                    plan.getName()
            );

            activity.put(
                    "durationMonths",
                    durationMonths
            );

            activity.put(
                    "feeDate",
                    feeDate
            );

            activity.put(
                    "daysRemaining",
                    daysRemaining
            );

            activity.put(
                    "status",
                    status
            );

            // =========================
            // PAYMENT DETAILS
            // =========================

            if (latestPayment != null) {

                activity.put(
                        "paymentId",
                        latestPayment.getId()
                );

                activity.put(
                        "paymentDate",
                        latestPayment.getPaymentDate()
                );

                activity.put(
                        "amount",
                        latestPayment.getAmount()
                );

                activity.put(
                        "paymentMethod",
                        latestPayment.getPaymentMethod()
                );

            } else {

                activity.put(
                        "paymentId",
                        null
                );

                activity.put(
                        "paymentDate",
                        null
                );

                activity.put(
                        "amount",
                        0
                );

                activity.put(
                        "paymentMethod",
                        null
                );
            }

            activities.add(activity);
        }

        // =========================
        // SORT
        // =========================

        /*
         * Nearest/current fee date first.
         * Old pending dates will also stay visible.
         */
        activities.sort(
                Comparator.comparing(
                        item ->
                                (LocalDate)
                                        item.get(
                                                "feeDate"
                                        )
                )
        );

        return ResponseEntity.ok(
                activities
        );
    }

    // =========================
    // CALCULATE CURRENT FEE DATE
    // =========================

    private LocalDate calculateCurrentFeeDate(
            LocalDate joinDate,
            int durationMonths,
            LocalDate today) {

        /*
         * Before or on join date:
         * first fee date is join date.
         */
        if (!today.isAfter(joinDate)) {
            return joinDate;
        }

        // =========================
        // MONTHS PASSED
        // =========================

        int monthsPassed =
                (today.getYear()
                        - joinDate.getYear())
                        * 12
                        + today.getMonthValue()
                        - joinDate.getMonthValue();

        // =========================
        // COMPLETED CYCLES
        // =========================

        int cycles =
                monthsPassed
                        / durationMonths;

        // =========================
        // CURRENT FEE DATE
        // =========================

        LocalDate feeDate =
                joinDate.plusMonths(
                        (long) cycles
                                * durationMonths
                );

        /*
         * IMPORTANT:
         *
         * DO NOT move a past fee date
         * to the next cycle.
         *
         * Example:
         *
         * Join date = 25 July
         * Monthly plan
         * Today = 27 August
         *
         * Fee date = 25 August
         *
         * Since 25 Aug has passed,
         * status becomes PENDING.
         */
        return feeDate;
    }
}