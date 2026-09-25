package com.gym.gymmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gym.gymmanagement.entity.MembershipPlan;

public interface MembershipPlanRepository extends JpaRepository<MembershipPlan, Long> {

}