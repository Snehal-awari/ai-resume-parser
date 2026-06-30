package com.resumeparser.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeparser.exception.BadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Service
public class GeminiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiService.class);
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private void validateApiKey() {
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty() || "Resume Parser API Key".equals(geminiApiKey.trim())) {
            logger.error("Gemini API key is missing or invalid.");
            throw new BadRequestException("Gemini API key is not configured. Please set the gemini.api.key property in application.properties.");
        }
    }

    @SuppressWarnings("unchecked")
    public String parseResumeText(String resumeText) {
        try {
            validateApiKey();
            String url = geminiApiUrl + "?key=" + geminiApiKey;

            // Build the prompt instructing Gemini
            String prompt = "You are a professional CV parser. You must extract structured information from the following resume text.\n"
                    + "Follow these rules closely:\n"
                    + "1. Candidate Name: Extract the full name of the candidate.\n"
                    + "2. Email: Extract email address. If unavailable, return empty string.\n"
                    + "3. Phone: Extract phone number. If unavailable, return empty string.\n"
                    + "4. LinkedIn: Extract LinkedIn profile URL. If unavailable, return empty string.\n"
                    + "5. GitHub: Extract GitHub profile URL. If unavailable, return empty string.\n"
                    + "6. Technical Skills: Extract all programming languages, frameworks, libraries, databases, cloud providers, and development tools into a list. Do not include soft skills.\n"
                    + "7. Experience: Extract professional experience text. If the candidate has no professional experience and is a fresher, set this to exactly 'Fresher'.\n"
                    + "8. Education: Extract education details (degrees, universities, graduation years).\n"
                    + "9. Projects: Extract a list of all project titles.\n"
                    + "10. Summary: Extract a professional summary or profile objective.\n"
                    + "Important rules:\n"
                    + "- Do not guess values. If something is not in the text, return an empty string or empty list.\n"
                    + "- Do not include labels or formatting tags inside the values.\n"
                    + "- Return ONLY valid JSON matching the schema.\n\n"
                    + "Resume Text:\n" + resumeText;

            // Build Gemini Request Payload
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", prompt);

            Map<String, Object> partsMap = new HashMap<>();
            partsMap.put("parts", Collections.singletonList(textPart));

            Map<String, Object> contentsMap = new HashMap<>();
            contentsMap.put("contents", Collections.singletonList(partsMap));

            // Enforce JSON schema
            Map<String, Object> stringType = Map.of("type", "STRING");
            Map<String, Object> stringArrayType = Map.of(
                    "type", "ARRAY",
                    "items", Map.of("type", "STRING")
            );

            Map<String, Object> properties = new LinkedHashMap<>();
            properties.put("name", stringType);
            properties.put("email", stringType);
            properties.put("phone", stringType);
            properties.put("linkedin", stringType);
            properties.put("github", stringType);
            properties.put("skills", stringArrayType);
            properties.put("experience", stringType);
            properties.put("education", stringType);
            properties.put("projects", stringArrayType);
            properties.put("summary", stringType);

            Map<String, Object> responseSchema = new HashMap<>();
            responseSchema.put("type", "OBJECT");
            responseSchema.put("properties", properties);
            responseSchema.put("required", List.of("name", "email", "phone", "linkedin", "github", "skills", "experience", "education", "projects", "summary"));

            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("responseMimeType", "application/json");
            generationConfig.put("responseSchema", responseSchema);

            contentsMap.put("generationConfig", generationConfig);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(contentsMap, headers);

            logger.info("Sending request to Gemini API...");
            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseMap = objectMapper.readValue(response.getBody(), new TypeReference<Map<String, Object>>() {});
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseMap.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> candidateNode = candidates.get(0);
                    Map<String, Object> contentNode = (Map<String, Object>) candidateNode.get("content");
                    if (contentNode != null) {
                        List<Map<String, Object>> resParts = (List<Map<String, Object>>) contentNode.get("parts");
                        if (resParts != null && !resParts.isEmpty()) {
                            String resultText = (String) resParts.get(0).get("text");
                            logger.info("Received valid structured response from Gemini API.");
                            return resultText;
                        }
                    }
                }
            }
            throw new BadRequestException("Invalid response layout from Gemini API.");
        } catch (Exception e) {
            logger.warn("Gemini API parsing failed: {}. Automatically switching to local Java fallback parser...", e.getMessage());
            try {
                return com.resumeparser.util.FallbackParser.parse(resumeText);
            } catch (Exception ex) {
                logger.error("Local Java fallback parser also failed: {}", ex.getMessage());
                throw new BadRequestException("Failed to parse resume using both Gemini API and local fallback: " + ex.getMessage());
            }
        }
    }

    @SuppressWarnings("unchecked")
    public String matchProfileWithJob(String candidateProfile, String jobDescription) {
        validateApiKey();
        String url = geminiApiUrl + "?key=" + geminiApiKey;

        String prompt = "You are an AI recruitment assistant. You must analyze the matching level of the following candidate profile against the job description.\n"
                + "Follow these rules closely:\n"
                + "1. Match Score: Estimate a match percentage score (0 to 100) based on skills and experience matching.\n"
                + "2. Matched Skills: List key technical skills from the candidate profile that directly match the job description.\n"
                + "3. Missing Skills: List key technical skills or requirements from the job description that are missing in the candidate profile.\n"
                + "4. Recommendation: Provide a concise, professional assessment explaining the score and the candidate's fit.\n"
                + "Return ONLY valid JSON matching the schema.\n\n"
                + "Candidate Profile:\n" + candidateProfile + "\n\n"
                + "Job Description:\n" + jobDescription;

        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);

        Map<String, Object> partsMap = new HashMap<>();
        partsMap.put("parts", Collections.singletonList(textPart));

        Map<String, Object> contentsMap = new HashMap<>();
        contentsMap.put("contents", Collections.singletonList(partsMap));

        Map<String, Object> properties = new LinkedHashMap<>();
        properties.put("matchScore", Map.of("type", "INTEGER"));
        properties.put("matchedSkills", Map.of(
                "type", "ARRAY",
                "items", Map.of("type", "STRING")
        ));
        properties.put("missingSkills", Map.of(
                "type", "ARRAY",
                "items", Map.of("type", "STRING")
        ));
        properties.put("recommendation", Map.of("type", "STRING"));

        Map<String, Object> responseSchema = new HashMap<>();
        responseSchema.put("type", "OBJECT");
        responseSchema.put("properties", properties);
        responseSchema.put("required", List.of("matchScore", "matchedSkills", "missingSkills", "recommendation"));

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("responseMimeType", "application/json");
        generationConfig.put("responseSchema", responseSchema);

        contentsMap.put("generationConfig", generationConfig);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(contentsMap, headers);

        try {
            logger.info("Sending match evaluation request to Gemini API...");
            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseMap = objectMapper.readValue(response.getBody(), new TypeReference<Map<String, Object>>() {});
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseMap.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> candidateNode = candidates.get(0);
                    Map<String, Object> contentNode = (Map<String, Object>) candidateNode.get("content");
                    if (contentNode != null) {
                        List<Map<String, Object>> resParts = (List<Map<String, Object>>) contentNode.get("parts");
                        if (resParts != null && !resParts.isEmpty()) {
                            return (String) resParts.get(0).get("text");
                        }
                    }
                }
            }
            throw new BadRequestException("Failed to get response from Gemini match evaluator.");
        } catch (Exception e) {
            logger.error("Error communicating with Gemini API during match: {}", e.getMessage());
            throw new BadRequestException("Gemini matching service error: " + e.getMessage());
        }
    }
}
