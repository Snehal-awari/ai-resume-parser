package com.resumeparser.util;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class FallbackParserTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    public void testFallbackParser_Success() throws Exception {
        String sampleResume = """
                John Doe
                Software Engineer
                
                Contact:
                Email: john.doe@example.com
                Phone: +1-123-456-7890
                LinkedIn: https://linkedin.com/in/johndoe
                GitHub: https://github.com/johndoe
                
                Summary:
                A highly skilled software engineer with 5 years of experience building web applications.
                Specialized in backend development and cloud architecture.
                
                Skills:
                Java, Spring Boot, Python, Docker, Kubernetes, AWS, SQL
                
                Experience:
                Senior Software Engineer at Tech Corp
                - Developed microservices using Java and Spring Boot.
                - Deployed applications to AWS using Kubernetes.
                
                Education:
                Bachelor of Science in Computer Science
                Stanford University, 2015 - 2019
                
                Projects:
                E-Commerce Platform: Built a scalable shopping cart microservice.
                Task Manager App: Created a task management tool using Python and Flask.
                """;

        String jsonResult = FallbackParser.parse(sampleResume);
        assertNotNull(jsonResult);

        // Parse the JSON string back to a Map to verify values
        Map<String, Object> map = objectMapper.readValue(jsonResult, new TypeReference<Map<String, Object>>() {});

        assertEquals("John Doe", map.get("name"));
        assertEquals("john.doe@example.com", map.get("email"));
        assertEquals("+1-123-456-7890", map.get("phone"));
        assertEquals("https://linkedin.com/in/johndoe", map.get("linkedin"));
        assertEquals("https://github.com/johndoe", map.get("github"));
        
        // Skills
        @SuppressWarnings("unchecked")
        List<String> skills = (List<String>) map.get("skills");
        assertNotNull(skills);
        assertTrue(skills.contains("Java"));
        assertTrue(skills.contains("Spring Boot"));
        assertTrue(skills.contains("Python"));
        assertTrue(skills.contains("Docker"));
        assertTrue(skills.contains("Kubernetes"));
        assertTrue(skills.contains("AWS"));
        assertTrue(skills.contains("SQL"));

        // Education
        String education = (String) map.get("education");
        assertTrue(education.contains("Stanford University"));
        assertTrue(education.contains("Bachelor of Science"));

        // Experience
        String experience = (String) map.get("experience");
        assertTrue(experience.contains("Senior Software Engineer"));
        assertTrue(experience.contains("Tech Corp"));

        // Projects
        @SuppressWarnings("unchecked")
        List<String> projects = (List<String>) map.get("projects");
        assertNotNull(projects);
        assertFalse(projects.isEmpty());
        assertTrue(projects.stream().anyMatch(p -> p.contains("E-Commerce Platform")));
        assertTrue(projects.stream().anyMatch(p -> p.contains("Task Manager App")));

        // Summary
        String summary = (String) map.get("summary");
        assertTrue(summary.contains("highly skilled software engineer"));
    }
}
