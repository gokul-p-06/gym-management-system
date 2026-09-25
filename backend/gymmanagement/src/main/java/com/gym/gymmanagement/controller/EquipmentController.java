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

import com.gym.gymmanagement.entity.Equipment;
import com.gym.gymmanagement.repository.EquipmentRepository;

@RestController
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("/equipment")
public class EquipmentController {

    private final EquipmentRepository equipmentRepository;

    public EquipmentController(EquipmentRepository equipmentRepository) {
        this.equipmentRepository = equipmentRepository;
    }

    @PostMapping
    public ResponseEntity<Equipment> addEquipment(
            @RequestBody Equipment equipment) {

        return ResponseEntity.ok(
                equipmentRepository.save(equipment));
    }

    @GetMapping
    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getEquipmentById(
            @PathVariable Long id) {

        Equipment equipment =
                equipmentRepository.findById(id).orElse(null);

        if (equipment == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(equipment);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEquipment(
            @PathVariable Long id,
            @RequestBody Equipment updatedEquipment) {

        Equipment existingEquipment =
                equipmentRepository.findById(id).orElse(null);

        if (existingEquipment == null) {
            return ResponseEntity.notFound().build();
        }

        existingEquipment.setName(updatedEquipment.getName());
        existingEquipment.setCategory(updatedEquipment.getCategory());
        existingEquipment.setQuantity(updatedEquipment.getQuantity());
        existingEquipment.setCondition(updatedEquipment.getCondition());
        existingEquipment.setPurchaseDate(
                updatedEquipment.getPurchaseDate());

        return ResponseEntity.ok(
                equipmentRepository.save(existingEquipment));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEquipment(
            @PathVariable Long id) {

        if (!equipmentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        equipmentRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}