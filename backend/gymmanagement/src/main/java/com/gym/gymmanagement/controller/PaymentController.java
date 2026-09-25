package com.gym.gymmanagement.controller;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gym.gymmanagement.Member;
import com.gym.gymmanagement.entity.Payment;
import com.gym.gymmanagement.repository.MemberRepository;
import com.gym.gymmanagement.repository.PaymentRepository;

@RestController
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("/payments")
public class PaymentController {

    private final PaymentRepository paymentRepository;
    private final MemberRepository memberRepository;

    public PaymentController(
            PaymentRepository paymentRepository,
            MemberRepository memberRepository) {

        this.paymentRepository = paymentRepository;
        this.memberRepository = memberRepository;
    }

    // =====================================================
    // ADD PAYMENT
    // =====================================================

    @PostMapping
    public ResponseEntity<?> addPayment(
            @RequestBody Payment payment) {

        if (payment.getMember() == null
                || payment.getMember().getId() == null) {

            return ResponseEntity
                    .badRequest()
                    .body("Member is required.");
        }

        Member member =
                memberRepository.findById(
                        payment.getMember().getId()
                ).orElse(null);

        if (member == null) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        payment.setMember(member);

        return ResponseEntity.ok(
                paymentRepository.save(payment)
        );
    }

    // =====================================================
    // GET ALL PAYMENTS
    // =====================================================

    @GetMapping
    public List<Payment> getAllPayments() {

        return paymentRepository.findAll();
    }

    // =====================================================
    // REVENUE HISTORY
    // =====================================================

    @GetMapping("/revenue")
    public ResponseEntity<?> getRevenueHistory() {

        LocalDate today =
                LocalDate.now();

        int currentYear =
                today.getYear();

        int currentMonth =
                today.getMonthValue();

        List<Payment> payments =
                paymentRepository.findAll();

        double thisMonthRevenue = 0.0;

        double thisYearRevenue = 0.0;

        int thisMonthPaymentCount = 0;

        int thisYearPaymentCount = 0;

        // =================================================
        // MONTH-WISE REVENUE
        // =================================================

        List<Map<String, Object>> monthWiseRevenue =
                new ArrayList<>();

        for (int month = 1; month <= 12; month++) {

            Map<String, Object> monthData =
                    new LinkedHashMap<>();

            monthData.put(
                    "monthNumber",
                    month
            );

            monthData.put(
                    "month",
                    YearMonth.of(
                            currentYear,
                            month
                    )
                    .getMonth()
                    .toString()
            );

            monthData.put(
                    "revenue",
                    0.0
            );

            monthData.put(
                    "paymentCount",
                    0
            );

            monthWiseRevenue.add(
                    monthData
            );
        }

        // =================================================
        // CALCULATE REVENUE
        // =================================================

        for (Payment payment : payments) {

            // Only PAID payments are revenue
            if (payment.getStatus() == null
                    || !payment.getStatus()
                            .equalsIgnoreCase("PAID")) {

                continue;
            }

            // Payment date required
            if (payment.getPaymentDate() == null) {
                continue;
            }

            LocalDate paymentDate;

            try {

                paymentDate =
                        LocalDate.parse(
                                payment.getPaymentDate()
                        );

            } catch (Exception e) {

                // Ignore invalid payment date
                continue;
            }

            /*
             * Payment amount.
             *
             * getAmount() is a primitive numeric
             * value in your Payment entity,
             * so don't compare it with null.
             */
            double amount =
                    payment.getAmount();

            // =================================================
            // THIS YEAR
            // =================================================

            if (paymentDate.getYear()
                    == currentYear) {

                thisYearRevenue += amount;

                thisYearPaymentCount++;

                int monthIndex =
                        paymentDate.getMonthValue()
                                - 1;

                Map<String, Object> monthData =
                        monthWiseRevenue.get(
                                monthIndex
                        );

                double currentRevenue =
                        ((Number)
                                monthData.get(
                                        "revenue"
                                ))
                                .doubleValue();

                int currentCount =
                        ((Number)
                                monthData.get(
                                        "paymentCount"
                                ))
                                .intValue();

                monthData.put(
                        "revenue",
                        currentRevenue + amount
                );

                monthData.put(
                        "paymentCount",
                        currentCount + 1
                );
            }

            // =================================================
            // THIS MONTH
            // =================================================

            if (paymentDate.getYear()
                    == currentYear
                    && paymentDate.getMonthValue()
                    == currentMonth) {

                thisMonthRevenue += amount;

                thisMonthPaymentCount++;
            }
        }

        // =================================================
        // RESPONSE
        // =================================================

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "month",
                today.getMonth()
                        .toString()
        );

        response.put(
                "monthNumber",
                currentMonth
        );

        response.put(
                "year",
                currentYear
        );

        response.put(
                "thisMonthRevenue",
                thisMonthRevenue
        );

        response.put(
                "thisYearRevenue",
                thisYearRevenue
        );

        response.put(
                "thisMonthPaymentCount",
                thisMonthPaymentCount
        );

        response.put(
                "thisYearPaymentCount",
                thisYearPaymentCount
        );

        response.put(
                "monthWiseRevenue",
                monthWiseRevenue
        );

        return ResponseEntity.ok(
                response
        );
    }

    // =====================================================
    // GET PAYMENT BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getPaymentById(
            @PathVariable Long id) {

        Payment payment =
                paymentRepository.findById(id)
                        .orElse(null);

        if (payment == null) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        return ResponseEntity.ok(
                payment
        );
    }

    // =====================================================
    // UPDATE PAYMENT
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePayment(
            @PathVariable Long id,
            @RequestBody Payment updatedPayment) {

        Payment existingPayment =
                paymentRepository.findById(id)
                        .orElse(null);

        if (existingPayment == null) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        if (updatedPayment.getMember() == null
                || updatedPayment.getMember().getId() == null) {

            return ResponseEntity
                    .badRequest()
                    .body("Member is required.");
        }

        Member member =
                memberRepository.findById(
                        updatedPayment
                                .getMember()
                                .getId()
                )
                .orElse(null);

        if (member == null) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        existingPayment.setAmount(
                updatedPayment.getAmount()
        );

        existingPayment.setPaymentDate(
                updatedPayment.getPaymentDate()
        );

        existingPayment.setPaymentMethod(
                updatedPayment.getPaymentMethod()
        );

        existingPayment.setStatus(
                updatedPayment.getStatus()
        );

        existingPayment.setMember(
                member
        );

        return ResponseEntity.ok(
                paymentRepository.save(
                        existingPayment
                )
        );
    }

    // =====================================================
    // DELETE PAYMENT
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePayment(
            @PathVariable Long id) {

        if (!paymentRepository.existsById(id)) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        paymentRepository.deleteById(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}