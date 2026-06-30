package com.resumeparser.util;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeparser.entity.Candidate;
import org.apache.poi.common.usermodel.HyperlinkType;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ExcelExportUtil {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static ByteArrayInputStream candidatesToExcel(List<Candidate> candidates) throws IOException {
        String[] columns = {
                "ID",
                "Name",
                "Email",
                "Phone",
                "Skills",
                "Experience (Years)",
                "Current Company",
                "Education (with CGPA)",
                "Location",
                "Upload Date",
                "Resume Link"
        };

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Candidates");

            // Fonts
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerFont.setFontHeightInPoints((short) 12);

            Font dataFont = workbook.createFont();
            dataFont.setFontHeightInPoints((short) 11);

            // Cell Styles
            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);
            headerCellStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerCellStyle.setAlignment(HorizontalAlignment.LEFT);
            headerCellStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            headerCellStyle.setBorderBottom(BorderStyle.MEDIUM);

            CellStyle dataCellStyle = workbook.createCellStyle();
            dataCellStyle.setFont(dataFont);
            dataCellStyle.setBorderBottom(BorderStyle.THIN);
            dataCellStyle.setBorderLeft(BorderStyle.THIN);
            dataCellStyle.setBorderRight(BorderStyle.THIN);
            dataCellStyle.setBorderTop(BorderStyle.THIN);

            CellStyle altDataCellStyle = workbook.createCellStyle();
            altDataCellStyle.cloneStyleFrom(dataCellStyle);
            altDataCellStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            altDataCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Hyperlink Font (created once)
            Font linkFont = workbook.createFont();
            linkFont.setFontHeightInPoints((short) 11);
            linkFont.setUnderline(Font.U_SINGLE);
            linkFont.setColor(IndexedColors.BLUE.getIndex());

            // Hyperlink Cell Styles (defined explicitly without cloning to be 100% stable)
            CellStyle hlinkDataCellStyle = workbook.createCellStyle();
            hlinkDataCellStyle.setFont(linkFont);
            hlinkDataCellStyle.setBorderBottom(BorderStyle.THIN);
            hlinkDataCellStyle.setBorderLeft(BorderStyle.THIN);
            hlinkDataCellStyle.setBorderRight(BorderStyle.THIN);
            hlinkDataCellStyle.setBorderTop(BorderStyle.THIN);

            CellStyle hlinkAltDataCellStyle = workbook.createCellStyle();
            hlinkAltDataCellStyle.setFont(linkFont);
            hlinkAltDataCellStyle.setBorderBottom(BorderStyle.THIN);
            hlinkAltDataCellStyle.setBorderLeft(BorderStyle.THIN);
            hlinkAltDataCellStyle.setBorderRight(BorderStyle.THIN);
            hlinkAltDataCellStyle.setBorderTop(BorderStyle.THIN);
            hlinkAltDataCellStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            hlinkAltDataCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Row height
            Row headerRow = sheet.createRow(0);
            headerRow.setHeightInPoints(28);

            // Header columns
            for (int col = 0; col < columns.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(columns[col]);
                cell.setCellStyle(headerCellStyle);
            }

            // Freeze Pane (Freeze Header row)
            sheet.createFreezePane(0, 1);

            // Populate Data
            int rowIdx = 1;
            for (Candidate candidate : candidates) {
                Row row = sheet.createRow(rowIdx++);
                row.setHeightInPoints(20);

                CellStyle currentStyle = (rowIdx % 2 == 0) ? altDataCellStyle : dataCellStyle;

                // ID
                Cell idCell = row.createCell(0);
                if (candidate.getId() != null) {
                    idCell.setCellValue(candidate.getId());
                } else {
                    idCell.setCellValue("");
                }
                idCell.setCellStyle(currentStyle);

                // Name
                Cell nameCell = row.createCell(1);
                nameCell.setCellValue(safeString(candidate.getName()));
                nameCell.setCellStyle(currentStyle);

                // Email
                Cell emailCell = row.createCell(2);
                emailCell.setCellValue(safeString(candidate.getEmail()));
                emailCell.setCellStyle(currentStyle);

                // Phone
                Cell phoneCell = row.createCell(3);
                phoneCell.setCellValue(safeString(candidate.getPhone()));
                phoneCell.setCellStyle(currentStyle);

                // Skills
                Cell skillsCell = row.createCell(4);
                skillsCell.setCellValue(cleanJsonList(candidate.getSkills()));
                skillsCell.setCellStyle(currentStyle);

                // Experience (Years)
                Cell expCell = row.createCell(5);
                expCell.setCellValue(extractExperienceYears(candidate.getExperience()));
                expCell.setCellStyle(currentStyle);

                // Current Company
                Cell compCell = row.createCell(6);
                compCell.setCellValue(extractCurrentCompany(candidate.getExperience()));
                compCell.setCellStyle(currentStyle);

                // Education (with CGPA)
                Cell eduCell = row.createCell(7);
                eduCell.setCellValue(formatEducationSummary(candidate.getEducation()));
                eduCell.setCellStyle(currentStyle);

                // Location
                Cell locCell = row.createCell(8);
                locCell.setCellValue(extractLocation(candidate));
                locCell.setCellStyle(currentStyle);

                // Upload Date
                Cell dateCell = row.createCell(9);
                dateCell.setCellValue(java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("dd-MM-yyyy")));
                dateCell.setCellStyle(currentStyle);

                // Resume Link
                Cell linkCell = row.createCell(10);
                String fileName = safeString(candidate.getResumeFileName());
                linkCell.setCellValue(fileName);
                if (!fileName.isEmpty()) {
                    try {
                        CreationHelper createHelper = workbook.getCreationHelper();
                        Hyperlink link = createHelper.createHyperlink(HyperlinkType.FILE);
                        // Safely encode spaces and special characters for URI compliance in POI
                        String encodedAddr = fileName.replace("\\", "/")
                                                     .replace(" ", "%20")
                                                     .replace("#", "%23");
                        link.setAddress(encodedAddr);
                        linkCell.setHyperlink(link);

                        CellStyle currentLinkStyle = (rowIdx % 2 == 0) ? hlinkAltDataCellStyle : hlinkDataCellStyle;
                        linkCell.setCellStyle(currentLinkStyle);
                    } catch (Exception e) {
                        // Fallback to normal style if hyperlink creation fails
                        linkCell.setCellStyle(currentStyle);
                    }
                } else {
                    linkCell.setCellStyle(currentStyle);
                }
            }

            // Auto-size all columns
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
                // Set slightly wider padding, limiting to POI maximum of 255 characters (255 * 256)
                int currentWidth = sheet.getColumnWidth(i);
                int newWidth = Math.min(currentWidth + 1200, 255 * 256);
                sheet.setColumnWidth(i, newWidth);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    private static String safeString(String val) {
        return val != null ? val : "";
    }

    private static String cleanJsonList(String json) {
        if (json == null || json.isEmpty()) {
            return "";
        }
        try {
            List<String> list = objectMapper.readValue(json, new TypeReference<List<String>>() {});
            return String.join(", ", list);
        } catch (Exception e) {
            return json.replace("[", "").replace("]", "").replace("\"", "").trim();
        }
    }

    public static String extractExperienceYears(String experienceText) {
        if (experienceText == null || experienceText.trim().isEmpty()) {
            return "Fresher";
        }
        String textLower = experienceText.toLowerCase().trim();
        if (textLower.contains("fresher")) {
            return "Fresher";
        }

        Pattern yearPattern = Pattern.compile("(\\d+(?:\\.\\d+)?)\\s*[+\\-]?\\s*(?:year|yr)s?", Pattern.CASE_INSENSITIVE);
        Matcher yearMatcher = yearPattern.matcher(experienceText);
        if (yearMatcher.find()) {
            try {
                double years = Double.parseDouble(yearMatcher.group(1));
                if (years == 1.0) {
                    return "1 Year";
                } else if (years == Math.floor(years)) {
                    return (int) years + " Years";
                } else {
                    return years + " Years";
                }
            } catch (NumberFormatException e) {
                // Ignore
            }
        }

        Pattern monthPattern = Pattern.compile("(\\d+)\\s*[+\\-]?\\s*(?:month|mo)s?", Pattern.CASE_INSENSITIVE);
        Matcher monthMatcher = monthPattern.matcher(experienceText);
        if (monthMatcher.find()) {
            try {
                int months = Integer.parseInt(monthMatcher.group(1));
                double years = months / 12.0;
                years = Math.round(years * 10.0) / 10.0;
                if (years == 1.0) {
                    return "1 Year";
                } else if (years == Math.floor(years)) {
                    return (int) years + " Years";
                } else {
                    return years + " Years";
                }
            } catch (NumberFormatException e) {
                // Ignore
            }
        }

        return "Fresher";
    }

    public static String extractCurrentCompany(String experienceText) {
        if (experienceText == null || experienceText.trim().isEmpty()) {
            return "N/A";
        }
        
        String[] lines = experienceText.split("\\r?\\n");
        List<String> candidateLines = new ArrayList<>();
        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.isEmpty()) continue;
            String lower = trimmed.toLowerCase();
            if (lower.equals("experience") || lower.equals("experience:") || 
                lower.equals("work experience") || lower.equals("work experience:") ||
                lower.equals("professional experience") || lower.equals("professional experience:")) {
                continue;
            }
            if (trimmed.startsWith("-") || trimmed.startsWith("*") || trimmed.startsWith("•")) {
                trimmed = trimmed.substring(1).trim();
            }
            if (!trimmed.isEmpty()) {
                candidateLines.add(trimmed);
            }
        }
        
        if (candidateLines.isEmpty()) {
            return "N/A";
        }
        
        int linesToCheck = Math.min(2, candidateLines.size());
        for (int i = 0; i < linesToCheck; i++) {
            String line = candidateLines.get(i);
            
            Pattern atPattern = Pattern.compile("\\bat\\s+([A-Za-z0-9\\s,.&\\-]{2,50})", Pattern.CASE_INSENSITIVE);
            Matcher atMatcher = atPattern.matcher(line);
            if (atMatcher.find()) {
                String company = atMatcher.group(1).trim();
                company = cleanCompanySuffixes(company);
                if (isValidCompany(company)) {
                    return company;
                }
            }
            
            Pattern companyPrefixPattern = Pattern.compile("(?:company|employer|organization)\\s*:\\s*([A-Za-z0-9\\s,.&\\-]{2,50})", Pattern.CASE_INSENSITIVE);
            Matcher cpMatcher = companyPrefixPattern.matcher(line);
            if (cpMatcher.find()) {
                String company = cpMatcher.group(1).trim();
                company = cleanCompanySuffixes(company);
                if (isValidCompany(company)) {
                    return company;
                }
            }
            
            String[] separators = {"\\|", " - ", " – ", ","};
            for (String sep : separators) {
                if (line.contains(sep.replace("\\", ""))) {
                    String[] parts = line.split(sep);
                    if (parts.length >= 2) {
                        String part1 = parts[0].trim();
                        String part2 = parts[1].trim();
                        
                        boolean p1IsRole = isLikelyRole(part1);
                        boolean p2IsRole = isLikelyRole(part2);
                        
                        if (p1IsRole && !p2IsRole) {
                            String company = cleanCompanySuffixes(part2);
                            if (isValidCompany(company)) {
                                return company;
                            }
                        } else if (!p1IsRole && p2IsRole) {
                            String company = cleanCompanySuffixes(part1);
                            if (isValidCompany(company)) {
                                return company;
                            }
                        }
                    }
                }
            }
            
            Pattern suffixPattern = Pattern.compile("([A-Z][A-Za-z0-9\\s.&\\-]{1,40}\\s+(?:Ltd|Inc|Co|Corporation|Corp|Solutions|Technologies|Services|Systems|Labs|Partners|Group|University))", Pattern.CASE_INSENSITIVE);
            Matcher suffixMatcher = suffixPattern.matcher(line);
            if (suffixMatcher.find()) {
                return suffixMatcher.group(1).trim();
            }
        }
        
        String firstLine = candidateLines.get(0);
        if (firstLine.length() > 2 && firstLine.length() < 40 && !isLikelyRole(firstLine)) {
            return cleanCompanySuffixes(firstLine);
        }
        
        return "N/A";
    }

    private static String cleanCompanySuffixes(String company) {
        company = company.replaceAll("\\(.*\\)", "").trim();
        int commaIdx = company.indexOf(',');
        if (commaIdx > 0) {
            String before = company.substring(0, commaIdx).trim();
            if (before.length() > 2) {
                company = before;
            }
        }
        int dashIdx = company.indexOf(" - ");
        if (dashIdx > 0) {
            String before = company.substring(0, dashIdx).trim();
            if (before.length() > 2) {
                company = before;
            }
        }
        return company;
    }

    private static boolean isValidCompany(String name) {
        if (name == null || name.isEmpty()) return false;
        String lower = name.toLowerCase();
        return !lower.contains("present") && !lower.contains("current") && 
               !lower.contains("developed") && !lower.contains("responsible") && 
               !lower.contains("experience");
    }

    private static boolean isLikelyRole(String text) {
        String lower = text.toLowerCase();
        String[] roleKeywords = {
            "engineer", "developer", "analyst", "manager", "consultant", "specialist", 
            "lead", "architect", "intern", "director", "designer", "admin", "officer", 
            "programmer", "fresher", "student", "candidate", "member", "head", "founder", "co-founder"
        };
        for (String keyword : roleKeywords) {
            if (lower.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    public static String formatEducationSummary(String educationText) {
        if (educationText == null || educationText.trim().isEmpty()) {
            return "N/A";
        }

        String[] lines = educationText.split("\\r?\\n");
        List<String> cleanLines = new ArrayList<>();
        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.isEmpty()) continue;
            String lower = trimmed.toLowerCase();
            if (lower.equals("education") || lower.equals("education:") || 
                lower.equals("academic background") || lower.equals("academic background:") ||
                lower.equals("academics") || lower.equals("academics:")) {
                continue;
            }
            if (trimmed.startsWith("-") || trimmed.startsWith("*") || trimmed.startsWith("•")) {
                trimmed = trimmed.substring(1).trim();
            }
            if (!trimmed.isEmpty()) {
                cleanLines.add(trimmed);
            }
        }

        if (cleanLines.isEmpty()) {
            return "N/A";
        }

        String degree = null;
        String college = null;
        String gpa = null;
        String year = null;

        Pattern gpaPattern = Pattern.compile("(?:cgpa|gpa|g.p.a)\\s*[:\\-]?\\s*(\\d+(?:\\.\\d+)?)(?:\\s*/\\s*\\d+(?:\\.\\d+)?)?|(\\d+(?:\\.\\d+)?)\\s*(?:cgpa|gpa|g.p.a)|(\\d+(?:\\.\\d+)?)\\s*%", Pattern.CASE_INSENSITIVE);
        Matcher gpaMatcher = gpaPattern.matcher(educationText);
        if (gpaMatcher.find()) {
            if (gpaMatcher.group(1) != null) {
                gpa = "CGPA: " + gpaMatcher.group(1);
            } else if (gpaMatcher.group(2) != null) {
                gpa = "CGPA: " + gpaMatcher.group(2);
            } else if (gpaMatcher.group(3) != null) {
                gpa = gpaMatcher.group(3) + "%";
            }
        }

        Pattern yearPattern = Pattern.compile("\\b(19\\d{2}|20\\d{2})\\b");
        Matcher yearMatcher = yearPattern.matcher(educationText);
        int maxYear = 0;
        while (yearMatcher.find()) {
            try {
                int y = Integer.parseInt(yearMatcher.group(1));
                if (y > maxYear) {
                    maxYear = y;
                }
            } catch (NumberFormatException e) {
                // Ignore
            }
        }
        if (maxYear > 0) {
            year = String.valueOf(maxYear);
        }

        int linesToScan = Math.min(3, cleanLines.size());
        for (int i = 0; i < linesToScan; i++) {
            String line = cleanLines.get(i);
            String lineCleaned = line.replaceAll("(?:cgpa|gpa|g.p.a)\\s*[:\\-]?\\s*\\d+(?:\\.\\d+)?(?:\\s*/\\s*\\d+(?:\\.\\d+)?)?|\\b(19\\d{2}|20\\d{2})\\b|\\d+(?:\\.\\d+)?\\s*%", "").trim();
            lineCleaned = lineCleaned.replaceAll("^[,|\\-\\s]+|[,|\\-\\s]+$", "").trim();
            
            if (lineCleaned.isEmpty()) continue;

            if (degree == null && isLikelyDegree(lineCleaned)) {
                degree = lineCleaned;
            } else if (college == null && isLikelyCollege(lineCleaned)) {
                college = lineCleaned;
            }
        }

        if (degree == null && !cleanLines.isEmpty()) {
            String first = cleanLines.get(0);
            if (college == null || !first.contains(college)) {
                degree = first.replaceAll("(?:cgpa|gpa|g.p.a)\\s*[:\\-]?\\s*\\d+(?:\\.\\d+)?(?:\\s*/\\s*\\d+(?:\\.\\d+)?)?|\\b(19\\d{2}|20\\d{2})\\b|\\d+(?:\\.\\d+)?\\s*%", "").trim();
                degree = degree.replaceAll("^[,|\\-\\s]+|[,|\\-\\s]+$", "").trim();
            }
        }

        if (college == null && cleanLines.size() > 1) {
            String second = cleanLines.get(1);
            if (degree == null || !second.contains(degree)) {
                college = second.replaceAll("(?:cgpa|gpa|g.p.a)\\s*[:\\-]?\\s*\\d+(?:\\.\\d+)?(?:\\s*/\\s*\\d+(?:\\.\\d+)?)?|\\b(19\\d{2}|20\\d{2})\\b|\\d+(?:\\.\\d+)?\\s*%", "").trim();
                college = college.replaceAll("^[,|\\-\\s]+|[,|\\-\\s]+$", "").trim();
            }
        }

        List<String> parts = new ArrayList<>();
        if (degree != null && !degree.isEmpty()) {
            parts.add(degree);
        }
        if (college != null && !college.isEmpty()) {
            parts.add(college);
        }
        if (gpa != null && !gpa.isEmpty()) {
            parts.add(gpa);
        }
        if (year != null && !year.isEmpty()) {
            parts.add(year);
        }

        if (parts.isEmpty()) {
            return "N/A";
        }

        return String.join(" | ", parts);
    }

    private static boolean isLikelyDegree(String text) {
        String lower = text.toLowerCase();
        String[] degreeKeywords = {
            "b.e", "b.tech", "btech", "b.sc", "bsc", "b.s", "m.s", "m.tech", "mtech", 
            "m.b.a", "mba", "b.com", "bcom", "m.com", "mcom", "phd", "ph.d", "bachelor", "master",
            "diploma", "hsc", "ssc", "high school"
        };
        for (String keyword : degreeKeywords) {
            if (lower.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private static boolean isLikelyCollege(String text) {
        String lower = text.toLowerCase();
        String[] collegeKeywords = {
            "university", "college", "institute", "school", "academy", "iit", "nit", "bits", "iiit"
        };
        for (String keyword : collegeKeywords) {
            if (lower.contains(keyword)) {
                return true;
            }
        }
        if (text.matches("[A-Z]{3,6}")) {
            return true;
        }
        return false;
    }

    public static String extractLocation(Candidate candidate) {
        if (candidate.getSummary() != null) {
            Pattern p = Pattern.compile("(?:location|based in|residing in|address)\\s*[:\\-]?\\s*([A-Za-z0-9\\s,]{2,30})", Pattern.CASE_INSENSITIVE);
            Matcher m = p.matcher(candidate.getSummary());
            if (m.find()) {
                return m.group(1).trim();
            }
        }
        return "N/A";
    }
}

