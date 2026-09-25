package com.gym.gymmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.gym.gymmanagement.entity.Attendance;

public interface AttendanceRepository
        extends JpaRepository<Attendance, Long> {

    @Modifying
    @Transactional
    @Query("DELETE FROM Attendance a WHERE a.member.id = :memberId")
    void deleteByMemberId(
            @Param("memberId") Long memberId
    );
}