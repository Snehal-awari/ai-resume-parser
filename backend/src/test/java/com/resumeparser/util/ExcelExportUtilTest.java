package com.resumeparser.util;

import com.resumeparser.entity.Candidate;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class ExcelExportUtilTest {

    @Test
    public void testExtractExperienceYears() {
        // Fresher cases
        assertEquals("Fresher", ExcelExportUtil.extractExperienceYears("Fresher"));
        assertEquals("Fresher", ExcelExportUtil.extractExperienceYears("I am a fresher looking for opportunities"));
        
        // Year cases
        assertEquals("5 Years", ExcelExportUtil.extractExperienceYears("A highly skilled software engineer with 5 years of experience"));
        assertEquals("1 Year", ExcelExportUtil.extractExperienceYears("I have 1 year of experience as an intern"));
        assertEquals("2.5 Years", ExcelExportUtil.extractExperienceYears("Total 2.5 Years of experience in Java development"));
        assertEquals("6 Years", ExcelExportUtil.extractExperienceYears("6+ yrs of experience"));
        
        // Month cases
        assertEquals("0.5 Years", ExcelExportUtil.extractExperienceYears("6 months of internship experience"));
        assertEquals("1.5 Years", ExcelExportUtil.extractExperienceYears("18 months of experience"));
        
        // Null / empty / unavailable cases
        assertEquals("Fresher", ExcelExportUtil.extractExperienceYears(null));
        assertEquals("Fresher", ExcelExportUtil.extractExperienceYears(""));
        assertEquals("Fresher", ExcelExportUtil.extractExperienceYears("Software Engineer at Tech Corp"));
    }

    @Test
    public void testExtractCurrentCompany() {
        // "at" pattern
        assertEquals("Tech Corp", ExcelExportUtil.extractCurrentCompany("Senior Software Engineer at Tech Corp\n- Developed microservices"));
        assertEquals("Google", ExcelExportUtil.extractCurrentCompany("Worked as a Software Engineer at Google (2020-2024)"));
        
        // "Company:" pattern
        assertEquals("Tech Corp", ExcelExportUtil.extractCurrentCompany("Company: Tech Corp\nRole: Developer"));
        
        // Split pattern (role | company)
        assertEquals("Tech Corp", ExcelExportUtil.extractCurrentCompany("Software Engineer | Tech Corp"));
        assertEquals("Tech Corp", ExcelExportUtil.extractCurrentCompany("Tech Corp | Software Engineer"));
        assertEquals("Tech Corp", ExcelExportUtil.extractCurrentCompany("Software Engineer - Tech Corp"));
        
        // Suffix pattern
        assertEquals("Tech Corp Ltd", ExcelExportUtil.extractCurrentCompany("Tech Corp Ltd, Bangalore"));
        
        // Null / empty / unavailable cases
        assertEquals("N/A", ExcelExportUtil.extractCurrentCompany(null));
        assertEquals("N/A", ExcelExportUtil.extractCurrentCompany(""));
    }

    @Test
    public void testFormatEducationSummary() {
        // Exact examples from requirements
        assertEquals("B.E Computer Engineering | MITAOE | CGPA: 8.2 | 2026", 
            ExcelExportUtil.formatEducationSummary("B.E Computer Engineering\nMITAOE\nCGPA: 8.2\n2026"));
        assertEquals("B.Com | SSPU | 2027", 
            ExcelExportUtil.formatEducationSummary("B.Com\nSSPU\n2027"));
            
        // Stanford test case
        assertEquals("Bachelor of Science in Computer Science | Stanford University | 2019", 
            ExcelExportUtil.formatEducationSummary("Bachelor of Science in Computer Science\nStanford University, 2015 - 2019"));
            
        // Null / empty / unavailable cases
        assertEquals("N/A", ExcelExportUtil.formatEducationSummary(null));
        assertEquals("N/A", ExcelExportUtil.formatEducationSummary(""));
    }

    @Test
    public void testExtractLocation() {
        Candidate candidateWithLoc = Candidate.builder()
            .summary("A software engineer based in San Francisco, CA. Specialized in backend development.")
            .build();
        assertEquals("San Francisco, CA", ExcelExportUtil.extractLocation(candidateWithLoc));
        
        Candidate candidateWithoutLoc = Candidate.builder()
            .summary("A software engineer specialized in backend development.")
            .build();
        assertEquals("N/A", ExcelExportUtil.extractLocation(candidateWithoutLoc));
        
        Candidate candidateNullSummary = Candidate.builder().build();
        assertEquals("N/A", ExcelExportUtil.extractLocation(candidateNullSummary));
    }

    @Test
    public void testCandidatesToExcel() throws Exception {
        java.util.List<Candidate> list = new java.util.ArrayList<>();
        list.add(Candidate.builder()
            .id(1L)
            .name("John Doe")
            .email("john@example.com")
            .phone("1234567890")
            .skills("[\"Java\", \"Spring\"]")
            .experience("5 years of experience")
            .education("B.S. in CS")
            .resumeFileName("john_resume.pdf")
            .build());
        
        java.io.ByteArrayInputStream in = ExcelExportUtil.candidatesToExcel(list);
        org.junit.jupiter.api.Assertions.assertNotNull(in);
        org.junit.jupiter.api.Assertions.assertTrue(in.available() > 0);
    }
}
