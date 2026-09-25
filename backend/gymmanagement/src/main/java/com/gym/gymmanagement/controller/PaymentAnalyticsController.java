package com.gym.gymmanagement.controller;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gym.gymmanagement.entity.Payment;
import com.gym.gymmanagement.repository.PaymentRepository;

@RestController
@RequestMapping("/payment-analytics")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_STAFF')")
public class PaymentAnalyticsController {

    private final PaymentRepository paymentRepository;

    public PaymentAnalyticsController(
            PaymentRepository paymentRepository) {

        this.paymentRepository = paymentRepository;
    }

    @GetMapping
    public ResponseEntity<?> getPaymentAnalytics() {

        LocalDate today = LocalDate.now();

        int currentYear =
                today.getYear();

        List<Payment> payments =
                paymentRepository.findAll();

        double overallTotal = 0;
        double thisYearTotal = 0;

        int overallCount = 0;
        int thisYearCount = 0;

        // =========================
        // MONTH-WISE CURRENT YEAR
        // =========================

        Map<Integer, Double> monthlyTotals =
                new LinkedHashMap<>();

        Map<Integer, Integer> monthlyCounts =
                new LinkedHashMap<>();

        for (int month = 1; month <= 12; month++) {

            monthlyTotals.put(
                    month,
                    0.0
            );

            monthlyCounts.put(
                    month,
                    0
            );
        }

        // =========================
        // PROCESS PAYMENTS
        // =========================

        for (Payment payment : payments) {

            if (payment == null) {
                continue;
            }

            if (payment.getPaymentDate() == null) {
                continue;
            }

            if (payment.getStatus() == null ||
                    !payment.getStatus()
                            .equalsIgnoreCase("PAID")) {

                continue;
            }

            LocalDate paymentDate;

            try {

                paymentDate =
                        LocalDate.parse(
                                payment.getPaymentDate()
                        );

            } catch (
                    java.time.format.DateTimeParseException e) {

                continue;
            }

            double amount =
                    payment.getAmount();

            // =========================
            // OVERALL
            // =========================

            overallTotal += amount;
            overallCount++;

            // =========================
            // CURRENT YEAR
            // =========================

            if (paymentDate.getYear() ==
                    currentYear) {

                thisYearTotal += amount;
                thisYearCount++;

                int month =
                        paymentDate.getMonthValue();

                monthlyTotals.put(
                        month,
                        monthlyTotals.get(month)
                                + amount
                );

                monthlyCounts.put(
                        month,
                        monthlyCounts.get(month)
                                + 1
                );
            }
        }

        // =========================
        // MONTHLY RESPONSE
        // =========================

        String[] monthNames = {
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December"
        };

        List<Map<String, Object>> monthlyData =
                new ArrayList<>();

        for (int month = 1; month <= 12; month++) {

            Map<String, Object> monthData =
                    new LinkedHashMap<>();

            monthData.put(
                    "month",
                    month
            );

            monthData.put(
                    "monthName",
                    monthNames[month - 1]
            );

            monthData.put(
                    "year",
                    currentYear
            );

            monthData.put(
                    "amount",
                    monthlyTotals.get(month)
            );

            monthData.put(
                    "paymentCount",
                    monthlyCounts.get(month)
            );

            monthlyData.add(
                    monthData
            );
        }

        // =========================
        // FINAL RESPONSE
        // =========================

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "year",
                currentYear
        );

        response.put(
                "overallTotal",
                overallTotal
        );

        response.put(
                "overallPaymentCount",
                overallCount
        );

        response.put(
                "thisYearTotal",
                thisYearTotal
        );

        response.put(
                "thisYearPaymentCount",
                thisYearCount
        );

        response.put(
                "monthlyPayments",
                monthlyData
        );

        return ResponseEntity.ok(
                response
        );
    }
}