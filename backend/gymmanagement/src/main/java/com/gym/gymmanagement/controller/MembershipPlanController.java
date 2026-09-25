package com.gym.gymmanagement.controller;

import java.util.List;

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

import com.gym.gymmanagement.entity.MembershipPlan;
import com.gym.gymmanagement.repository.MembershipPlanRepository;

@RestController
@RequestMapping("/plans")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_STAFF')")
public class MembershipPlanController {

    private final MembershipPlanRepository membershipPlanRepository;

    public MembershipPlanController(
            MembershipPlanRepository membershipPlanRepository) {

        this.membershipPlanRepository =
                membershipPlanRepository;
    }

    // =========================
    // ADD PLAN
    // ADMIN ONLY
    // =========================

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addPlan(
            @RequestBody MembershipPlan plan) {

        if (plan.getDurationMonths() <= 0) {
            return ResponseEntity
                    .badRequest()
                    .body("Duration must be greater than 0 months.");
        }

        return ResponseEntity.ok(
                membershipPlanRepository.save(plan)
        );
    }

    // =========================
    // GET ALL PLANS
    // ADMIN + STAFF
    // =========================

    @GetMapping
    public List<MembershipPlan> getAllPlans() {

        return membershipPlanRepository.findAll();
    }

    // =========================
    // GET PLAN BY ID
    // ADMIN + STAFF
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<?> getPlanById(
            @PathVariable Long id) {

        MembershipPlan plan =
                membershipPlanRepository
                        .findById(id)
                        .orElse(null);

        if (plan == null) {
            return ResponseEntity
                    .notFound()
                    .build();
        }

        return ResponseEntity.ok(plan);
    }

    // =========================
    // UPDATE PLAN
    // ADMIN ONLY
    // =========================

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updatePlan(
            @PathVariable Long id,
            @RequestBody MembershipPlan updatedPlan) {

        MembershipPlan existingPlan =
                membershipPlanRepository
                        .findById(id)
                        .orElse(null);

        if (existingPlan == null) {
            return ResponseEntity
                    .notFound()
                    .build();
        }

        if (updatedPlan.getDurationMonths() <= 0) {
            return ResponseEntity
                    .badRequest()
                    .body("Duration must be greater than 0 months.");
        }

        existingPlan.setName(
                updatedPlan.getName()
        );

        existingPlan.setDurationMonths(
                updatedPlan.getDurationMonths()
        );

        existingPlan.setPrice(
                updatedPlan.getPrice()
        );

        existingPlan.setDescription(
                updatedPlan.getDescription()
        );

        return ResponseEntity.ok(
                membershipPlanRepository.save(
                        existingPlan
                )
        );
    }

    // =========================
    // DELETE PLAN
    // ADMIN ONLY
    // =========================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deletePlan(
            @PathVariable Long id) {

        if (!membershipPlanRepository
                .existsById(id)) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        membershipPlanRepository.deleteById(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}