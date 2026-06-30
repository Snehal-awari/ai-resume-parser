package com.resumeparser.controller;

import com.resumeparser.dto.CandidateDto;
import com.resumeparser.service.CandidateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/candidates")
public class CandidateController {

    @Autowired
    private CandidateService candidateService;

    @GetMapping
    public ResponseEntity<Page<CandidateDto>> getCandidates(
            @RequestParam(value = "search", required = false, defaultValue = "") String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortBy", defaultValue = "createdDate") String sortBy,
            @RequestParam(value = "direction", defaultValue = "DESC") String direction) {

        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<CandidateDto> pageResult = candidateService.getAllCandidates(search, pageable);
        return ResponseEntity.ok(pageResult);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CandidateDto> getCandidateById(@PathVariable("id") Long id) {
        CandidateDto candidate = candidateService.getCandidateById(id);
        return ResponseEntity.ok(candidate);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CandidateDto> updateCandidate(@PathVariable("id") Long id, @RequestBody CandidateDto candidateDto) {
        CandidateDto updated = candidateService.updateCandidate(id, candidateDto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCandidate(@PathVariable("id") Long id) {
        candidateService.deleteCandidate(id);
        return ResponseEntity.ok().body(java.util.Collections.singletonMap("message", "Candidate deleted successfully."));
    }

    @PostMapping("/{id}/match")
    public ResponseEntity<String> matchCandidate(@PathVariable("id") Long id, @RequestBody java.util.Map<String, String> requestBody) {
        String jobDescription = requestBody.get("jobDescription");
        if (jobDescription == null || jobDescription.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Job description is required.");
        }
        String matchResultJson = candidateService.matchCandidateWithJob(id, jobDescription);
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
                .body(matchResultJson);
    }
}
