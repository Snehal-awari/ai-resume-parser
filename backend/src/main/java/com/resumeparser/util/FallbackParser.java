package com.resumeparser.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class FallbackParser {
    private static final Logger logger = LoggerFactory.getLogger(FallbackParser.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();

    private static final String[] COMMON_SKILLS = {
        "Java", "Python", "JavaScript", "TypeScript", "C++", "C#", "Ruby", "PHP", "Go", "Rust", "Swift", "Kotlin",
        "HTML", "CSS", "SQL", "NoSQL", "MongoDB", "PostgreSQL", "MySQL", "Oracle", "Redis", "Cassandra",
        "React", "Angular", "Vue", "Node.js", "Express", "Spring Boot", "Spring", "Django", "Flask", "Laravel", "ASP.NET",
        "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Git", "GitHub", "CI/CD", "Jenkins", "Terraform", "Ansible",
        "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Scikit-Learn", "Pandas", "NumPy",
        "Hadoop", "Spark", "Kafka", "Linux", "Unix", "Android", "iOS", "REST API", "GraphQL", "Microservices"
    };

    public static String parse(String text) {
        logger.info("Parsing resume text using local Java FallbackParser...");
        Map<String, Object> result = new LinkedHashMap<>();

        // 1. Extract Email
        String email = extractEmail(text);
        result.put("email", email);

        // 2. Extract Phone
        String phone = extractPhone(text);
        result.put("phone", phone);

        // 3. Extract LinkedIn URL
        String linkedin = extractLinkedIn(text);
        result.put("linkedin", linkedin);

        // 4. Extract GitHub URL
        String github = extractGitHub(text);
        result.put("github", github);

        // 5. Extract Full Name
        String name = extractName(text);
        result.put("name", name);

        // 6. Extract Skills
        List<String> skills = extractSkills(text);
        result.put("skills", skills);

        // 7. Extract Education
        String education = extractEducation(text);
        result.put("education", education);

        // 8. Extract Experience
        String experience = extractExperience(text);
        result.put("experience", experience);

        // 9. Extract Projects
        List<String> projects = extractProjects(text);
        result.put("projects", projects);

        // 10. Extract Summary
        String summary = extractSummary(text);
        result.put("summary", summary);

        try {
            return objectMapper.writeValueAsString(result);
        } catch (Exception e) {
            logger.error("Failed to serialize fallback parsing result to JSON", e);
            // Return a safe fallback JSON string manually if Jackson fails
            return "{\"name\":\"" + escapeJson(name) + "\",\"email\":\"" + escapeJson(email) + "\",\"phone\":\"" + escapeJson(phone) + "\",\"linkedin\":\"" + escapeJson(linkedin) + "\",\"github\":\"" + escapeJson(github) + "\",\"skills\":[],\"experience\":\"\",\"education\":\"\",\"projects\":[],\"summary\":\"\"}";
        }
    }

    private static String extractEmail(String text) {
        Pattern pattern = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
        Matcher matcher = pattern.matcher(text);
        return matcher.find() ? matcher.group().trim() : "";
    }

    private static String extractPhone(String text) {
        // Match standard phone patterns: +1-123-456-7890, (123) 456-7890, 1234567890, etc.
        Pattern pattern = Pattern.compile("(?:\\+?\\d{1,3}[-.\\s]?)?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}");
        Matcher matcher = pattern.matcher(text);
        return matcher.find() ? matcher.group().trim() : "";
    }

    private static String extractLinkedIn(String text) {
        Pattern pattern = Pattern.compile("https?://(?:www\\.)?linkedin\\.com/in/[a-zA-Z0-9_-]+/?");
        Matcher matcher = pattern.matcher(text);
        return matcher.find() ? matcher.group().trim() : "";
    }

    private static String extractGitHub(String text) {
        Pattern pattern = Pattern.compile("https?://(?:www\\.)?github\\.com/[a-zA-Z0-9_-]+/?");
        Matcher matcher = pattern.matcher(text);
        return matcher.find() ? matcher.group().trim() : "";
    }

    private static String extractName(String text) {
        String[] lines = text.split("\n");
        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.isEmpty()) continue;
            
            // Skip lines containing contact details or typical headers
            if (trimmed.contains("@") || 
                trimmed.toLowerCase().contains("http") || 
                trimmed.toLowerCase().contains("resume") || 
                trimmed.toLowerCase().contains("cv") || 
                trimmed.matches(".*\\d{4,}.*")) {
                continue;
            }
            
            String[] words = trimmed.split("\\s+");
            if (words.length >= 2 && words.length <= 4) {
                boolean looksLikeName = true;
                for (String word : words) {
                    if (!word.isEmpty() && !Character.isUpperCase(word.charAt(0)) && !word.matches("[a-zA-Z.]+")) {
                        looksLikeName = false;
                        break;
                    }
                }
                if (looksLikeName) {
                    return trimmed;
                }
            }
        }
        
        // Ultimate fallback: first non-empty line
        for (String line : lines) {
            String trimmed = line.trim();
            if (!trimmed.isEmpty()) {
                return trimmed;
            }
        }
        return "Unknown Candidate";
    }

    private static List<String> extractSkills(String text) {
        List<String> matchedSkills = new ArrayList<>();
        for (String skill : COMMON_SKILLS) {
            String patternStr;
            if (skill.equals("C++")) {
                patternStr = "C\\+\\+";
            } else if (skill.equals("C#")) {
                patternStr = "C#";
            } else if (skill.equals("Node.js")) {
                patternStr = "Node\\.js";
            } else if (skill.equals("Spring Boot")) {
                patternStr = "Spring\\s+Boot";
            } else if (skill.equals("REST API")) {
                patternStr = "REST\\s+API";
            } else {
                patternStr = "\\b" + Pattern.quote(skill) + "\\b";
            }
            
            Pattern pattern = Pattern.compile(patternStr, Pattern.CASE_INSENSITIVE);
            if (pattern.matcher(text).find()) {
                matchedSkills.add(skill);
            }
        }
        return matchedSkills;
    }

    private static String extractEducation(String text) {
        String[] keywords = {"education", "academic background", "academics", "qualification", "qualifications", "academic profile", "study"};
        String[] stopKeywords = {"experience", "work", "employment", "projects", "skills", "professional experience", "work experience", "certifications", "interests"};
        return extractSection(text, keywords, stopKeywords);
    }

    private static String extractExperience(String text) {
        String[] keywords = {"experience", "work experience", "employment", "employment history", "professional experience", "work history", "career history"};
        String[] stopKeywords = {"education", "projects", "skills", "academic background", "certifications", "interests", "languages"};
        String result = extractSection(text, keywords, stopKeywords);
        return result.isEmpty() ? "Fresher" : result;
    }

    private static List<String> extractProjects(String text) {
        String[] keywords = {"projects", "personal projects", "academic projects", "key projects", "technical projects"};
        String[] stopKeywords = {"education", "experience", "skills", "work experience", "certifications", "interests", "languages"};
        String projectsSection = extractSection(text, keywords, stopKeywords);
        
        List<String> projectsList = new ArrayList<>();
        if (!projectsSection.isEmpty()) {
            String[] lines = projectsSection.split("\n");
            for (String line : lines) {
                String trimmed = line.trim();
                if (trimmed.isEmpty()) continue;
                
                // Clean bullet points
                if (trimmed.startsWith("-") || trimmed.startsWith("*") || trimmed.startsWith("•")) {
                    trimmed = trimmed.substring(1).trim();
                }
                
                // Heuristic: If line contains a colon or dash separating title and description
                String title = trimmed;
                if (trimmed.contains(":")) {
                    String part = trimmed.split(":")[0].trim();
                    if (part.length() > 3 && part.length() < 40) {
                        title = part;
                    }
                } else if (trimmed.contains(" - ")) {
                    String part = trimmed.split(" - ")[0].trim();
                    if (part.length() > 3 && part.length() < 40) {
                        title = part;
                    }
                }
                
                // If we extracted a specific title or the line itself is short and doesn't end with a period
                if (title.length() > 3 && (title.length() < 50 || !trimmed.endsWith("."))) {
                    projectsList.add(title);
                }
            }
        }
        
        // If no specific project titles found but the section is not empty, use the first line
        if (projectsList.isEmpty() && !projectsSection.isEmpty()) {
            String[] lines = projectsSection.split("\n");
            for (String line : lines) {
                String trimmed = line.trim();
                if (!trimmed.isEmpty()) {
                    if (trimmed.startsWith("-") || trimmed.startsWith("*") || trimmed.startsWith("•")) {
                        trimmed = trimmed.substring(1).trim();
                    }
                    projectsList.add(trimmed);
                    break;
                }
            }
        }
        return projectsList;
    }

    private static String extractSummary(String text) {
        String[] keywords = {"summary", "professional summary", "profile", "career objective", "objective", "about me"};
        String[] stopKeywords = {"experience", "work", "education", "skills", "projects", "certifications"};
        String summary = extractSection(text, keywords, stopKeywords);
        
        if (summary.isEmpty()) {
            // Take the first 3 lines of the resume after the name (excluding contact details) as summary
            String[] lines = text.split("\n");
            StringBuilder sb = new StringBuilder();
            int count = 0;
            for (int i = 1; i < lines.length && count < 3; i++) {
                String trimmed = lines[i].trim();
                if (trimmed.isEmpty() || trimmed.contains("@") || trimmed.toLowerCase().contains("http") || trimmed.matches(".*\\d{4,}.*")) {
                    continue;
                }
                sb.append(trimmed).append(" ");
                count++;
            }
            summary = sb.toString().trim();
        }
        return summary;
    }

    private static String extractSection(String text, String[] sectionKeywords, String[] stopKeywords) {
        String[] lines = text.split("\n");
        StringBuilder sectionContent = new StringBuilder();
        boolean inSection = false;
        int lineCountAfterStart = 0;

        for (String line : lines) {
            String trimmed = line.trim();
            String lower = trimmed.toLowerCase();

            if (!inSection) {
                for (String keyword : sectionKeywords) {
                    if (lower.equals(keyword) || 
                        lower.startsWith(keyword + " ") || 
                        lower.startsWith(keyword + ":") || 
                        lower.endsWith(" " + keyword)) {
                        inSection = true;
                        break;
                    }
                }
            } else {
                // Check if we hit a stop keyword (another section)
                boolean hitStop = false;
                for (String stopKeyword : stopKeywords) {
                    if (lower.equals(stopKeyword) || 
                        lower.startsWith(stopKeyword + " ") || 
                        lower.startsWith(stopKeyword + ":") || 
                        lower.endsWith(" " + stopKeyword)) {
                        hitStop = true;
                        break;
                    }
                }
                if (hitStop) {
                    break;
                }
                sectionContent.append(trimmed).append("\n");
                lineCountAfterStart++;
                
                // Limit section size to avoid capturing the whole remaining resume
                if (lineCountAfterStart > 15) {
                    break;
                }
            }
        }
        return sectionContent.toString().trim();
    }

    private static String escapeJson(String str) {
        if (str == null) return "";
        return str.replace("\\", "\\\\")
                  .replace("\"", "\\\"")
                  .replace("\b", "\\b")
                  .replace("\f", "\\f")
                  .replace("\n", "\\n")
                  .replace("\r", "\\r")
                  .replace("\t", "\\t");
    }
}
