package com.skylebank.api.repositories;

import com.skylebank.api.models.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository interface managing database access for Complaint entities.
 */
@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<Complaint> findAllByOrderByCreatedAtDesc();
}
