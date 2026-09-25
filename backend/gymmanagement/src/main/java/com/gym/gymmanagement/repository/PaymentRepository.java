package com.gym.gymmanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.gym.gymmanagement.entity.Payment;

public interface PaymentRepository
        extends JpaRepository<Payment, Long> {

    List<Payment> findByMemberIdAndStatusIgnoreCase(
            Long memberId,
            String status
    );

    @Modifying
    @Transactional
    @Query("DELETE FROM Payment p WHERE p.member.id = :memberId")
    void deleteByMemberId(
            @Param("memberId") Long memberId
    );
}