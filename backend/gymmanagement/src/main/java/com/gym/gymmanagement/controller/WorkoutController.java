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
import com.gym.gymmanagement.entity.Workout;
import com.gym.gymmanagement.repository.MemberRepository;
import com.gym.gymmanagement.repository.WorkoutRepository;

@RestController
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
@RequestMapping("/workouts")
public class WorkoutController {

    private final WorkoutRepository workoutRepository;
    private final MemberRepository memberRepository;

    public WorkoutController(
            WorkoutRepository workoutRepository,
            MemberRepository memberRepository) {

        this.workoutRepository = workoutRepository;
        this.memberRepository = memberRepository;
    }

    // =========================
    // ADD WORKOUT
    // =========================

    @PostMapping
    public ResponseEntity<?> addWorkout(
            @RequestBody Workout workout) {

        if (workout.getMember() == null
                || workout.getMember().getId() == null) {

            return ResponseEntity
                    .badRequest()
                    .body("Member is required.");
        }

        Member member =
                memberRepository.findById(
                        workout.getMember().getId()
                ).orElse(null);

        if (member == null) {
            return ResponseEntity
                    .notFound()
                    .build();
        }

        workout.setMember(member);

        return ResponseEntity.ok(
                workoutRepository.save(workout)
        );
    }

    // =========================
    // GET ALL WORKOUTS
    // =========================

    @GetMapping
    public List<Workout> getAllWorkouts() {
        return workoutRepository.findAll();
    }

    // =========================
    // GET WORKOUT BY ID
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<?> getWorkoutById(
            @PathVariable Long id) {

        Workout workout =
                workoutRepository.findById(id)
                        .orElse(null);

        if (workout == null) {
            return ResponseEntity
                    .notFound()
                    .build();
        }

        return ResponseEntity.ok(workout);
    }

    // =========================
    // UPDATE WORKOUT
    // =========================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateWorkout(
            @PathVariable Long id,
            @RequestBody Workout updatedWorkout) {

        Workout existingWorkout =
                workoutRepository.findById(id)
                        .orElse(null);

        if (existingWorkout == null) {
            return ResponseEntity
                    .notFound()
                    .build();
        }

        if (updatedWorkout.getMember() == null
                || updatedWorkout.getMember().getId() == null) {

            return ResponseEntity
                    .badRequest()
                    .body("Member is required.");
        }

        Member member =
                memberRepository.findById(
                        updatedWorkout
                                .getMember()
                                .getId()
                ).orElse(null);

        if (member == null) {
            return ResponseEntity
                    .notFound()
                    .build();
        }

        existingWorkout.setWorkoutName(
                updatedWorkout.getWorkoutName()
        );

        existingWorkout.setWorkoutDate(
                updatedWorkout.getWorkoutDate()
        );

        existingWorkout.setDuration(
                updatedWorkout.getDuration()
        );

        existingWorkout.setStatus(
                updatedWorkout.getStatus()
        );

        existingWorkout.setMember(member);

        return ResponseEntity.ok(
                workoutRepository.save(
                        existingWorkout
                )
        );
    }

    // =========================
    // DELETE WORKOUT
    // =========================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteWorkout(
            @PathVariable Long id) {

        if (!workoutRepository.existsById(id)) {
            return ResponseEntity
                    .notFound()
                    .build();
        }

        workoutRepository.deleteById(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}