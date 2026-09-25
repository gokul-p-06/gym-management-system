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
@RequestMapping("/fee-reminders")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_STAFF')")
public class FeeReminderController {

    private final MemberRepository memberRepository;
    private final PaymentRepository paymentRepository;

    public FeeReminderController(
            MemberRepository memberRepository,
            PaymentRepository paymentRepository) {

        this.memberRepository = memberRepository;
        this.paymentRepository = paymentRepository;
    }

    // =========================
    // GET FEE REMINDERS
    // =========================

    @GetMapping
    public ResponseEntity<?> getFeeReminders() {

        LocalDate today = LocalDate.now();

        List<Member> members =
                memberRepository.findAll();

        List<Map<String, Object>> reminders =
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

            /*
             * Reminder should show:
             *
             * 1. Overdue
             * 2. Due today
             * 3. Within next 2 days
             *
             * Example:
             *
             * Fee date = Aug 23
             * Today    = Aug 25
             * days     = -2
             *
             * -> Reminder
             *
             * Fee date = Aug 27
             * Today    = Aug 25
             * days     = 2
             *
             * -> Reminder
             */

            if (daysRemaining > 2) {
                continue;
            }

            // =========================
            // CURRENT CYCLE PAYMENT
            // =========================

            boolean alreadyPaid =
                    hasPaidCurrentCycle(
                            member,
                            feeDate,
                            durationMonths,
                            today
                    );

            /*
             * If current cycle is already paid,
             * don't show reminder.
             */
            if (alreadyPaid) {
                continue;
            }

            // =========================
            // REMINDER OBJECT
            // =========================

            Map<String, Object> reminder =
                    new HashMap<>();

            reminder.put(
                    "memberId",
                    member.getId()
            );

            reminder.put(
                    "memberName",
                    member.getName()
            );

            reminder.put(
                    "phone",
                    member.getPhone()
            );

            reminder.put(
                    "email",
                    member.getEmail()
            );

            reminder.put(
                    "joinDate",
                    joinDate
            );

            reminder.put(
                    "planName",
                    plan.getName()
            );

            reminder.put(
                    "durationMonths",
                    durationMonths
            );

            reminder.put(
                    "feeDate",
                    feeDate
            );

            reminder.put(
                    "daysRemaining",
                    daysRemaining
            );

            // =========================
            // STATUS
            // =========================

            String status;

            if (daysRemaining < 0) {

                status = "PENDING";

            } else if (daysRemaining == 0) {

                status = "DUE TODAY";

            } else {

                status = "UPCOMING";
            }

            reminder.put(
                    "status",
                    status
            );

            reminder.put(
                    "dueToday",
                    daysRemaining == 0
            );

            reminder.put(
                    "overdue",
                    daysRemaining < 0
            );

            // =========================
            // MESSAGE
            // =========================

            if (daysRemaining < 0) {

                long overdueDays =
                        Math.abs(daysRemaining);

                if (overdueDays == 1) {

                    reminder.put(
                            "message",
                            member.getName()
                                    + " fees overdue by 1 day"
                    );

                } else {

                    reminder.put(
                            "message",
                            member.getName()
                                    + " fees overdue by "
                                    + overdueDays
                                    + " days"
                    );
                }

            } else if (daysRemaining == 0) {

                reminder.put(
                        "message",
                        member.getName()
                                + " fees due today"
                );

            } else if (daysRemaining == 1) {

                reminder.put(
                        "message",
                        member.getName()
                                + " fees due in 1 day"
                );

            } else {

                reminder.put(
                        "message",
                        member.getName()
                                + " fees due in "
                                + daysRemaining
                                + " days"
                );
            }

            reminders.add(reminder);
        }

        // =========================
        // SORT
        // =========================

        /*
         * Overdue first.
         *
         * Example:
         *
         * Aug 22
         * Aug 23
         * Aug 24
         * Aug 26
         * Aug 27
         *
         * So closest/current reminder
         * is shown first.
         */

        reminders.sort(
                Comparator.comparing(
                        item ->
                                (LocalDate)
                                        item.get(
                                                "feeDate"
                                        )
                )
        );

        return ResponseEntity.ok(
                reminders
        );
    }

    // =========================
    // CHECK CURRENT CYCLE PAYMENT
    // =========================

    private boolean hasPaidCurrentCycle(
            Member member,
            LocalDate feeDate,
            int durationMonths,
            LocalDate today) {

        List<Payment> payments =
                paymentRepository
                        .findByMemberIdAndStatusIgnoreCase(
                                member.getId(),
                                "PAID"
                        );

        if (payments == null ||
                payments.isEmpty()) {

            return false;
        }

        /*
         * Current cycle starts
         * durationMonths before fee date.
         *
         * Monthly:
         * feeDate - 1 month
         *
         * 3 months:
         * feeDate - 3 months
         */

        LocalDate cycleStart =
                feeDate.minusMonths(
                        durationMonths
                );

        for (Payment payment : payments) {

            if (payment.getPaymentDate() == null) {
                continue;
            }

            try {

                LocalDate paymentDate =
                        LocalDate.parse(
                                payment.getPaymentDate()
                        );

                /*
                 * Payment must be inside
                 * current membership cycle.
                 */

                if (!paymentDate.isBefore(
                        cycleStart)
                        && !paymentDate.isAfter(
                                today)) {

                    return true;
                }

            } catch (
                    java.time.format.DateTimeParseException e) {

                // Ignore invalid payment dates.
            }
        }

        return false;
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
         * fee date = join date.
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
         * Past fee date is NOT moved
         * to next month.
         *
         * This allows backend to identify:
         *
         * feeDate < today
         *
         * as PENDING.
         */

        return feeDate;
    }
}