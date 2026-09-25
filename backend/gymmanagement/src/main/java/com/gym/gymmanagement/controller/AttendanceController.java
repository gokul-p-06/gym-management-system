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
import com.gym.gymmanagement.entity.Attendance;
import com.gym.gymmanagement.repository.AttendanceRepository;
import com.gym.gymmanagement.repository.MemberRepository;

@RestController
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
@RequestMapping("/attendance")
public class AttendanceController {

    private final AttendanceRepository attendanceRepository;
    private final MemberRepository memberRepository;

    public AttendanceController(
            AttendanceRepository attendanceRepository,
            MemberRepository memberRepository) {

        this.attendanceRepository = attendanceRepository;
        this.memberRepository = memberRepository;
    }

    // =========================
    // ADD ATTENDANCE
    // =========================

    @PostMapping
    public ResponseEntity<?> addAttendance(
            @RequestBody Attendance attendance) {

        if (attendance.getMember() == null
                || attendance.getMember().getId() == null) {

            return ResponseEntity.badRequest()
                    .body("Member is required.");
        }

        Member member =
                memberRepository.findById(
                        attendance.getMember().getId()
                ).orElse(null);

        if (member == null) {
            return ResponseEntity.notFound().build();
        }

        attendance.setMember(member);

        return ResponseEntity.ok(
                attendanceRepository.save(attendance)
        );
    }

    // =========================
    // GET ALL ATTENDANCE
    // =========================

    @GetMapping
    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    // =========================
    // GET ATTENDANCE BY ID
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<?> getAttendanceById(
            @PathVariable Long id) {

        Attendance attendance =
                attendanceRepository.findById(id)
                        .orElse(null);

        if (attendance == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(attendance);
    }

    // =========================
    // UPDATE ATTENDANCE
    // =========================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAttendance(
            @PathVariable Long id,
            @RequestBody Attendance updatedAttendance) {

        Attendance existingAttendance =
                attendanceRepository.findById(id)
                        .orElse(null);

        if (existingAttendance == null) {
            return ResponseEntity.notFound().build();
        }

        if (updatedAttendance.getMember() == null
                || updatedAttendance.getMember().getId() == null) {

            return ResponseEntity.badRequest()
                    .body("Member is required.");
        }

        Member member =
                memberRepository.findById(
                        updatedAttendance
                                .getMember()
                                .getId()
                ).orElse(null);

        if (member == null) {
            return ResponseEntity.notFound().build();
        }

        existingAttendance.setAttendanceDate(
                updatedAttendance.getAttendanceDate()
        );

        existingAttendance.setStatus(
                updatedAttendance.getStatus()
        );

        existingAttendance.setMember(member);

        return ResponseEntity.ok(
                attendanceRepository.save(
                        existingAttendance
                )
        );
    }

    // =========================
    // DELETE ATTENDANCE
    // =========================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAttendance(
            @PathVariable Long id) {

        if (!attendanceRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        attendanceRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}