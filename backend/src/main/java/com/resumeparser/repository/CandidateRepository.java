package com.resumeparser.repository;

import com.resumeparser.entity.Candidate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    @Query("SELECT c FROM Candidate c WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.phone) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.skills) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.experience) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Candidate> searchCandidates(@Param("search") String search, Pageable pageable);

    @Query("SELECT c FROM Candidate c WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.phone) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.skills) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.experience) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Candidate> searchCandidatesList(@Param("search") String search);

    boolean existsByEmail(String email);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByPhone(String phone);
    boolean existsByFileHash(String fileHash);

    java.util.Optional<Candidate> findFirstByEmailIgnoreCase(String email);
    java.util.Optional<Candidate> findFirstByPhone(String phone);
    java.util.Optional<Candidate> findFirstByFileHash(String fileHash);
}
