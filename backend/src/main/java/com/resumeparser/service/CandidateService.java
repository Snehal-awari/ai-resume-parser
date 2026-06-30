package com.resumeparser.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeparser.dto.CandidateDto;
import com.resumeparser.entity.Candidate;
import com.resumeparser.exception.BadRequestException;
import com.resumeparser.exception.ResourceNotFoundException;
import com.resumeparser.repository.CandidateRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CandidateService {

    private static final Logger logger = LoggerFactory.getLogger(CandidateService.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private GeminiService geminiService;

    @Transactional(readOnly = true)
    public boolean existsByFileHash(String fileHash) {
        return fileHash != null && candidateRepository.existsByFileHash(fileHash);
    }

    @Transactional
    @SuppressWarnings("unchecked")
    public CandidateDto saveParsedResume(String jsonResult, String fileName, String fileHash) {
        try {
            Map<String, Object> map = objectMapper.readValue(jsonResult, new TypeReference<Map<String, Object>>() {});

            String email = (String) map.get("email");
            String phone = (String) map.get("phone");

            Candidate existingCandidate = null;
            if (email != null && !email.trim().isEmpty()) {
                existingCandidate = candidateRepository.findFirstByEmailIgnoreCase(email.trim()).orElse(null);
            }
            if (existingCandidate == null && phone != null && !phone.trim().isEmpty()) {
                existingCandidate = candidateRepository.findFirstByPhone(phone.trim()).orElse(null);
            }
            if (existingCandidate == null && fileHash != null) {
                existingCandidate = candidateRepository.findFirstByFileHash(fileHash).orElse(null);
            }

            if (existingCandidate != null) {
                logger.info("Duplicate candidate found (ID: {}). Returning existing record without saving.", existingCandidate.getId());
                return convertToDto(existingCandidate);
            }

            List<String> skills = (List<String>) map.getOrDefault("skills", Collections.emptyList());
            List<String> projects = (List<String>) map.getOrDefault("projects", Collections.emptyList());

            Candidate candidate = Candidate.builder()
                    .name((String) map.get("name"))
                    .email(email)
                    .phone(phone)
                    .linkedin((String) map.get("linkedin"))
                    .github((String) map.get("github"))
                    .skills(objectMapper.writeValueAsString(skills))
                    .experience((String) map.get("experience"))
                    .education((String) map.get("education"))
                    .projects(objectMapper.writeValueAsString(projects))
                    .summary((String) map.get("summary"))
                    .resumeFileName(fileName)
                    .fileHash(fileHash)
                    .build();

            Candidate saved = candidateRepository.save(candidate);
            logger.info("Successfully saved parsed candidate: {}", saved.getName());
            return convertToDto(saved);
        } catch (com.resumeparser.exception.ConflictException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Failed to parse and save candidate JSON: {}", e.getMessage());
            throw new BadRequestException("Invalid parsed JSON payload schema: " + e.getMessage());
        }
    }

    @Transactional
    public CandidateDto saveParsedResume(String jsonResult, String fileName) {
        return saveParsedResume(jsonResult, fileName, null);
    }

    @Transactional(readOnly = true)
    public Page<CandidateDto> getAllCandidates(String search, Pageable pageable) {
        Page<Candidate> candidatesPage = candidateRepository.searchCandidates(search, pageable);
        return candidatesPage.map(this::convertToDto);
    }

    @Transactional(readOnly = true)
    public List<Candidate> getAllCandidatesList() {
        return candidateRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Candidate> getCandidatesByIds(List<Long> ids) {
        return candidateRepository.findAllById(ids);
    }

    @Transactional(readOnly = true)
    public List<Candidate> getCandidatesBySearch(String search) {
        return candidateRepository.searchCandidatesList(search);
    }

    @Transactional(readOnly = true)
    public CandidateDto getCandidateById(Long id) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with id: " + id));
        return convertToDto(candidate);
    }

    @Transactional
    public CandidateDto updateCandidate(Long id, CandidateDto dto) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with id: " + id));

        try {
            candidate.setName(dto.getName());
            candidate.setEmail(dto.getEmail());
            candidate.setPhone(dto.getPhone());
            candidate.setLinkedin(dto.getLinkedin());
            candidate.setGithub(dto.getGithub());
            candidate.setSkills(objectMapper.writeValueAsString(dto.getSkills() != null ? dto.getSkills() : Collections.emptyList()));
            candidate.setExperience(dto.getExperience());
            candidate.setEducation(dto.getEducation());
            candidate.setProjects(objectMapper.writeValueAsString(dto.getProjects() != null ? dto.getProjects() : Collections.emptyList()));
            candidate.setSummary(dto.getSummary());

            Candidate updated = candidateRepository.save(candidate);
            logger.info("Successfully updated candidate: {}", updated.getName());
            return convertToDto(updated);
        } catch (Exception e) {
            throw new BadRequestException("Failed to update candidate record: " + e.getMessage());
        }
    }

    @Transactional
    public void deleteCandidate(Long id) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with id: " + id));

        // Save to Recycle Bin file
        AdminStore.addToRecycleBin(candidate);

        candidateRepository.delete(candidate);
        logger.info("Successfully deleted candidate with id: {}", id);

        // Log activity
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        AdminStore.logActivity(username, "DELETE_CANDIDATE", "Deleted candidate: " + candidate.getName());
    }

    public CandidateDto convertToDto(Candidate candidate) {
        try {
            List<String> skillsList = objectMapper.readValue(candidate.getSkills(), new TypeReference<List<String>>() {});
            List<String> projectsList = objectMapper.readValue(candidate.getProjects(), new TypeReference<List<String>>() {});
            return CandidateDto.builder()
                    .id(candidate.getId())
                    .name(candidate.getName())
                    .email(candidate.getEmail())
                    .phone(candidate.getPhone())
                    .linkedin(candidate.getLinkedin())
                    .github(candidate.getGithub())
                    .skills(skillsList)
                    .experience(candidate.getExperience())
                    .education(candidate.getEducation())
                    .projects(projectsList)
                    .summary(candidate.getSummary())
                    .resumeFileName(candidate.getResumeFileName())
                    .createdDate(candidate.getCreatedDate())
                    .build();
        } catch (Exception e) {
            return CandidateDto.builder()
                    .id(candidate.getId())
                    .name(candidate.getName())
                    .email(candidate.getEmail())
                    .phone(candidate.getPhone())
                    .linkedin(candidate.getLinkedin())
                    .github(candidate.getGithub())
                    .skills(Collections.emptyList())
                    .experience(candidate.getExperience())
                    .education(candidate.getEducation())
                    .projects(Collections.emptyList())
                    .summary(candidate.getSummary())
                    .resumeFileName(candidate.getResumeFileName())
                    .createdDate(candidate.getCreatedDate())
                    .build();
        }
    }

    @Transactional(readOnly = true)
    public String matchCandidateWithJob(Long id, String jobDescription) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with id: " + id));

        String candidateProfile = String.format(
                "Name: %s\nSkills: %s\nExperience: %s\nEducation: %s\nProjects: %s\nSummary: %s",
                candidate.getName(),
                candidate.getSkills(),
                candidate.getExperience(),
                candidate.getEducation(),
                candidate.getProjects(),
                candidate.getSummary()
        );

        return geminiService.matchProfileWithJob(candidateProfile, jobDescription);
    }
}
