package com.resumeparser.controller;

import com.resumeparser.entity.Candidate;
import com.resumeparser.service.CandidateService;
import com.resumeparser.util.ExcelExportUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ExportController {

    @Autowired
    private CandidateService candidateService;

    @GetMapping({"/export/excel", "/resumes/export/excel"})
    public ResponseEntity<InputStreamResource> exportToExcel(
            @RequestParam(value = "ids", required = false) List<Long> ids,
            @RequestParam(value = "search", required = false) String search) throws IOException {
        List<Candidate> candidates;
        if (ids != null && !ids.isEmpty()) {
            candidates = candidateService.getCandidatesByIds(ids);
        } else if (search != null && !search.trim().isEmpty()) {
            candidates = candidateService.getCandidatesBySearch(search);
        } else {
            candidates = candidateService.getAllCandidatesList();
        }
        
        ByteArrayInputStream in = ExcelExportUtil.candidatesToExcel(candidates);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=resumes.xlsx");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }
}
