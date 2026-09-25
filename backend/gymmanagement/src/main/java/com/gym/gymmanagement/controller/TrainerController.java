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

import com.gym.gymmanagement.entity.Trainer;
import com.gym.gymmanagement.repository.TrainerRepository;

@RestController
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("/trainers")
public class TrainerController {

    private final TrainerRepository trainerRepository;

    public TrainerController(TrainerRepository trainerRepository) {
        this.trainerRepository = trainerRepository;
    }

    @PostMapping
    public ResponseEntity<Trainer> addTrainer(
            @RequestBody Trainer trainer) {

        return ResponseEntity.ok(
                trainerRepository.save(trainer));
    }

    @GetMapping
    public List<Trainer> getAllTrainers() {
        return trainerRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTrainerById(
            @PathVariable Long id) {

        Trainer trainer =
                trainerRepository.findById(id).orElse(null);

        if (trainer == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(trainer);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTrainer(
            @PathVariable Long id,
            @RequestBody Trainer updatedTrainer) {

        Trainer existingTrainer =
                trainerRepository.findById(id).orElse(null);

        if (existingTrainer == null) {
            return ResponseEntity.notFound().build();
        }

        existingTrainer.setName(updatedTrainer.getName());
        existingTrainer.setEmail(updatedTrainer.getEmail());
        existingTrainer.setPhone(updatedTrainer.getPhone());
        existingTrainer.setSpecialization(
                updatedTrainer.getSpecialization());

        return ResponseEntity.ok(
                trainerRepository.save(existingTrainer));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTrainer(
            @PathVariable Long id) {

        if (!trainerRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        trainerRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}