package com.resumeparser.controller;

import com.resumeparser.dto.CandidateDto;
import com.resumeparser.exception.BadRequestException;
import com.resumeparser.service.CandidateService;
import com.resumeparser.service.GeminiService;
import com.resumeparser.util.PdfParserUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.InputStream;

@RestController
@RequestMapping("/api/resume")
public class ResumeController {

    private static final Logger logger = LoggerFactory.getLogger(ResumeController.class);

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private CandidateService candidateService;

    private String calculateSha256(byte[] bytes) {
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(bytes);
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to calculate SHA-256 hash", e);
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<CandidateDto> uploadResume(@RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                throw new BadRequestException("Uploaded file is empty.");
            }

            String contentType = file.getContentType();
            String originalFilename = file.getOriginalFilename();
            if ((contentType != null && !contentType.equalsIgnoreCase("application/pdf")) || 
                (originalFilename != null && !originalFilename.toLowerCase().endsWith(".pdf"))) {
                throw new BadRequestException("Only PDF resume files are supported.");
            }

            // Check file size (limit: 10MB)
            if (file.getSize() > 10 * 1024 * 1024) {
                throw new BadRequestException("File size exceeds the limit of 10MB.");
            }

            // Calculate SHA-256 hash of the file
            byte[] fileBytes;
            try {
                fileBytes = file.getBytes();
            } catch (Exception e) {
                logger.error("Failed to read file bytes: {}", e.getMessage());
                throw new BadRequestException("Failed to read file bytes: " + e.getMessage());
            }
            String fileHash = calculateSha256(fileBytes);



            logger.info("Extracting text from PDF: {}", originalFilename);
            String extractedText;
            try (InputStream is = new java.io.ByteArrayInputStream(fileBytes)) {
                extractedText = PdfParserUtil.extractText(is);
            } catch (Exception e) {
                logger.error("Failed to read PDF file content: {}", e.getMessage());
                throw new BadRequestException("Failed to read PDF file: " + e.getMessage());
            }

            if (extractedText == null || extractedText.trim().isEmpty()) {
                throw new BadRequestException("Scanned PDF not supported. Please upload text-based resume.");
            }

            logger.info("Sending extracted text of size {} to Gemini API...", extractedText.length());
            String jsonResult = geminiService.parseResumeText(extractedText);

            logger.info("Saving parsed candidate information to database...");
            CandidateDto candidateDto = candidateService.saveParsedResume(jsonResult, originalFilename, fileHash);

            // Log upload activity
            String currentUsername = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
            com.resumeparser.service.AdminStore.logActivity(currentUsername, "UPLOAD_RESUME", "Uploaded resume: " + originalFilename + " (Candidate: " + candidateDto.getName() + ")");

            return ResponseEntity.ok(candidateDto);
        } catch (BadRequestException | com.resumeparser.exception.ConflictException e) {
            throw e; // Caught by GlobalExceptionHandler
        } catch (Throwable t) {
            logger.error("Failed to parse resume: {}", t.getMessage(), t);
            throw new BadRequestException("Failed to parse resume: " + t.getMessage());
        }
    }
}
