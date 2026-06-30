package com.resumeparser.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "candidates")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = true)
    private String name;

    @Column(nullable = true)
    private String email;

    @Column(nullable = true)
    private String phone;

    @Column(nullable = true)
    private String linkedin;

    @Column(nullable = true)
    private String github;

    @Column(columnDefinition = "TEXT")
    private String skills; // JSON String or comma-separated list of skills

    @Column(columnDefinition = "TEXT")
    private String experience;

    @Column(columnDefinition = "TEXT")
    private String education;

    @Column(columnDefinition = "TEXT")
    private String projects; // JSON String representing list of project titles

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(name = "resume_file_name")
    private String resumeFileName;

    @Column(name = "file_hash", nullable = true)
    private String fileHash;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
    }
}
