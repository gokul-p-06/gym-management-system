package com.gym.gymmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gym.gymmanagement.entity.Equipment;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {

}