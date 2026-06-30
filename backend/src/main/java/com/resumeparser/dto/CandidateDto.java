package com.resumeparser.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String linkedin;
    private String github;
    private List<String> skills;
    private String experience;
    private String education;
    private List<String> projects;
    private String summary;
    private String resumeFileName;
    private LocalDateTime createdDate;
}
