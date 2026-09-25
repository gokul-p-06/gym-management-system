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

import com.gym.gymmanagement.Member;
import com.gym.gymmanagement.entity.MembershipPlan;
import com.gym.gymmanagement.repository.AttendanceRepository;
import com.gym.gymmanagement.repository.MemberRepository;
import com.gym.gymmanagement.repository.MembershipPlanRepository;
import com.gym.gymmanagement.repository.PaymentRepository;
import com.gym.gymmanagement.repository.WorkoutRepository;

import jakarta.validation.Valid;

@RestController
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_STAFF')")
@RequestMapping("/members")
public class MemberController {

    private final MemberRepository memberRepository;
    private final MembershipPlanRepository membershipPlanRepository;
    private final PaymentRepository paymentRepository;
    private final AttendanceRepository attendanceRepository;
    private final WorkoutRepository workoutRepository;

    public MemberController(
            MemberRepository memberRepository,
            MembershipPlanRepository membershipPlanRepository,
            PaymentRepository paymentRepository,
            AttendanceRepository attendanceRepository,
            WorkoutRepository workoutRepository) {

        this.memberRepository = memberRepository;
        this.membershipPlanRepository = membershipPlanRepository;
        this.paymentRepository = paymentRepository;
        this.attendanceRepository = attendanceRepository;
        this.workoutRepository = workoutRepository;
    }

    // =========================
    // ADD MEMBER
    // =========================

    @PostMapping
    public ResponseEntity<?> addMember(
            @RequestBody @Valid Member member) {

        if (member.getJoinDate() == null) {
            return ResponseEntity
                    .badRequest()
                    .body("Join date is required.");
        }

        if (member.getMembershipPlan() == null
                || member.getMembershipPlan().getId() == null) {

            return ResponseEntity
                    .badRequest()
                    .body("Membership plan is required.");
        }

        Long planId =
                member.getMembershipPlan().getId();

        MembershipPlan plan =
                membershipPlanRepository
                        .findById(planId)
                        .orElse(null);

        if (plan == null) {
            return ResponseEntity
                    .notFound()
                    .build();
        }

        member.setMembershipPlan(plan);

        return ResponseEntity.ok(
                memberRepository.save(member)
        );
    }

    // =========================
    // GET ALL MEMBERS
    // =========================

    @GetMapping
    public List<Member> getAllMembers() {

        return memberRepository.findAll();
    }

    // =========================
    // GET MEMBER BY ID
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<?> getMemberById(
            @PathVariable Long id) {

        Member member =
                memberRepository
                        .findById(id)
                        .orElse(null);

        if (member == null) {
            return ResponseEntity
                    .notFound()
                    .build();
        }

        return ResponseEntity.ok(member);
    }

    // =========================
    // UPDATE MEMBER
    // =========================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMember(
            @PathVariable Long id,
            @RequestBody @Valid Member updatedMember) {

        Member existingMember =
                memberRepository
                        .findById(id)
                        .orElse(null);

        if (existingMember == null) {
            return ResponseEntity
                    .notFound()
                    .build();
        }

        existingMember.setName(
                updatedMember.getName()
        );

        existingMember.setEmail(
                updatedMember.getEmail()
        );

        existingMember.setPhone(
                updatedMember.getPhone()
        );

        if (updatedMember.getJoinDate() != null) {

            existingMember.setJoinDate(
                    updatedMember.getJoinDate()
            );
        }

        if (updatedMember.getMembershipPlan() == null
                || updatedMember
                        .getMembershipPlan()
                        .getId() == null) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Membership plan is required."
                    );
        }

        Long planId =
                updatedMember
                        .getMembershipPlan()
                        .getId();

        MembershipPlan plan =
                membershipPlanRepository
                        .findById(planId)
                        .orElse(null);

        if (plan == null) {
            return ResponseEntity
                    .notFound()
                    .build();
        }

        existingMember.setMembershipPlan(plan);

        return ResponseEntity.ok(
                memberRepository.save(
                        existingMember
                )
        );
    }

    // =========================
    // DELETE MEMBER
    // =========================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteMember(
            @PathVariable Long id) {

        if (!memberRepository.existsById(id)) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        try {

            // Delete payment records
            paymentRepository.deleteByMemberId(id);

            // Delete attendance records
            attendanceRepository.deleteByMemberId(id);

            // Delete workout records
            workoutRepository.deleteByMemberId(id);

            // Delete member
            memberRepository.deleteById(id);

            return ResponseEntity
                    .noContent()
                    .build();

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Unable to delete member: "
                            + e.getMessage()
                    );
        }
    }
}