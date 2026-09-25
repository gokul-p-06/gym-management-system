package com.gym.gymmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gym.gymmanagement.Member;

public interface MemberRepository extends JpaRepository<Member, Long> {

}