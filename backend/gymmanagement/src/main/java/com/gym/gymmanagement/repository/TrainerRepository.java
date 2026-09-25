package com.gym.gymmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gym.gymmanagement.entity.Trainer;

public interface TrainerRepository extends JpaRepository<Trainer, Long> {

}