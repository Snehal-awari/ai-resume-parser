package com.resumeparser.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.resumeparser.entity.Candidate;
import com.resumeparser.entity.Role;
import com.resumeparser.entity.User;
import com.resumeparser.exception.BadRequestException;
import com.resumeparser.exception.ResourceNotFoundException;
import com.resumeparser.repository.CandidateRepository;
import com.resumeparser.repository.UserRepository;
import com.resumeparser.service.AdminStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // --- Stats ---
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCandidates", candidateRepository.count());
        // Since each candidate represents a resume, total resumes uploaded matches total candidates
        stats.put("totalResumes", candidateRepository.count());
        stats.put("totalHR", userRepository.countByRole(Role.HR));
        stats.put("totalAdmin", userRepository.countByRole(Role.ADMIN));
        return ResponseEntity.ok(stats);
    }

    // --- User Management ---
    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getUsers() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> result = users.stream().map(u -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("username", u.getUsername());
            map.put("email", u.getEmail());
            map.put("role", u.getRole().name());
            map.put("active", !AdminStore.isUserDeactivated(u.getUsername()));
            
            // Fetch metadata
            Map<String, Object> meta = AdminStore.getUserMetadata(u.getUsername());
            String createdDate = (String) meta.getOrDefault("createdDate", "N/A");
            map.put("createdDate", createdDate);
            
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/users")
    public ResponseEntity<?> createHRUser(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String email = payload.get("email");
        String password = payload.get("password");

        if (username == null || username.trim().isEmpty() ||
            email == null || email.trim().isEmpty() ||
            password == null || password.trim().isEmpty()) {
            throw new BadRequestException("Username, email, and password are required.");
        }

        if (userRepository.existsByUsername(username.trim())) {
            throw new BadRequestException("Username is already taken.");
        }

        if (userRepository.existsByEmail(email.trim())) {
            throw new BadRequestException("Email is already in use.");
        }

        User user = User.builder()
                .username(username.trim())
                .email(email.trim())
                .password(passwordEncoder.encode(password))
                .role(Role.HR)
                .build();

        User saved = userRepository.save(user);
        
        // Save metadata (creation date)
        AdminStore.saveUserMetadata(saved.getUsername());
        
        String currentAdmin = SecurityContextHolder.getContext().getAuthentication().getName();
        AdminStore.logActivity(currentAdmin, "CREATE_USER", "Created HR account: " + saved.getUsername());

        return ResponseEntity.ok(Collections.singletonMap("message", "HR account created successfully."));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> editHRUser(@PathVariable("id") Long id, @RequestBody Map<String, String> payload) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        String email = payload.get("email");
        if (email != null && !email.trim().isEmpty() && !email.equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(email.trim())) {
                throw new BadRequestException("Email is already in use.");
            }
            user.setEmail(email.trim());
        }

        userRepository.save(user);

        String currentAdmin = SecurityContextHolder.getContext().getAuthentication().getName();
        AdminStore.logActivity(currentAdmin, "EDIT_USER", "Updated account details for: " + user.getUsername());

        return ResponseEntity.ok(Collections.singletonMap("message", "HR account updated successfully."));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteHRUser(@PathVariable("id") Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (user.getRole() == Role.ADMIN) {
            throw new BadRequestException("Cannot delete an Administrator account.");
        }

        userRepository.delete(user);
        
        // Also clean up from deactivation store if present
        AdminStore.activateUser(user.getUsername());

        String currentAdmin = SecurityContextHolder.getContext().getAuthentication().getName();
        AdminStore.logActivity(currentAdmin, "DELETE_USER", "Deleted HR account: " + user.getUsername());

        return ResponseEntity.ok(Collections.singletonMap("message", "HR account deleted successfully."));
    }

    @PostMapping("/users/{id}/toggle")
    public ResponseEntity<?> toggleUserActivation(@PathVariable("id") Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (user.getRole() == Role.ADMIN) {
            throw new BadRequestException("Cannot deactivate an Administrator account.");
        }

        boolean currentlyActive = !AdminStore.isUserDeactivated(user.getUsername());
        String currentAdmin = SecurityContextHolder.getContext().getAuthentication().getName();

        if (currentlyActive) {
            AdminStore.deactivateUser(user.getUsername());
            AdminStore.logActivity(currentAdmin, "DEACTIVATE_USER", "Deactivated HR account: " + user.getUsername());
            return ResponseEntity.ok(Map.of("message", "HR account deactivated successfully.", "active", false));
        } else {
            AdminStore.activateUser(user.getUsername());
            AdminStore.logActivity(currentAdmin, "ACTIVATE_USER", "Activated HR account: " + user.getUsername());
            return ResponseEntity.ok(Map.of("message", "HR account activated successfully.", "active", true));
        }
    }

    @PostMapping("/users/{id}/reset-password")
    public ResponseEntity<?> resetHRPassword(@PathVariable("id") Long id, @RequestBody Map<String, String> payload) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        String newPassword = payload.get("password");
        if (newPassword == null || newPassword.trim().isEmpty()) {
            throw new BadRequestException("New password is required.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        String currentAdmin = SecurityContextHolder.getContext().getAuthentication().getName();
        AdminStore.logActivity(currentAdmin, "RESET_PASSWORD", "Reset password for HR account: " + user.getUsername());

        return ResponseEntity.ok(Collections.singletonMap("message", "Password reset successfully."));
    }

    // --- Activity Logs ---
    @GetMapping("/logs")
    public ResponseEntity<List<Map<String, Object>>> getActivityLogs() {
        List<Map<String, Object>> logs = AdminStore.loadActivityLogs();
        // Return reverse chronological order
        Collections.reverse(logs);
        return ResponseEntity.ok(logs);
    }

    // --- Recycle Bin ---
    @GetMapping("/recycle-bin")
    public ResponseEntity<List<Map<String, Object>>> getRecycleBin() {
        return ResponseEntity.ok(AdminStore.loadRecycleBin());
    }

    @PostMapping("/recycle-bin/{id}/restore")
    public ResponseEntity<?> restoreCandidate(@PathVariable("id") Long id) {
        Map<String, Object> map = AdminStore.findInRecycleBin(id);
        if (map == null) {
            throw new ResourceNotFoundException("Candidate not found in Recycle Bin with id: " + id);
        }

        LocalDateTime createdDate = null;
        if (map.get("createdDate") != null) {
            try {
                createdDate = LocalDateTime.parse((String) map.get("createdDate"));
            } catch (Exception e) {
                // Ignore
            }
        }

        Candidate candidate = Candidate.builder()
                .name((String) map.get("name"))
                .email((String) map.get("email"))
                .phone((String) map.get("phone"))
                .linkedin((String) map.get("linkedin"))
                .github((String) map.get("github"))
                .skills((String) map.get("skills"))
                .experience((String) map.get("experience"))
                .education((String) map.get("education"))
                .projects((String) map.get("projects"))
                .summary((String) map.get("summary"))
                .resumeFileName((String) map.get("resumeFileName"))
                .fileHash((String) map.get("fileHash"))
                .createdDate(createdDate)
                .build();

        Candidate restored = candidateRepository.save(candidate);
        AdminStore.removeFromRecycleBin(id);

        String currentAdmin = SecurityContextHolder.getContext().getAuthentication().getName();
        AdminStore.logActivity(currentAdmin, "RESTORE_CANDIDATE", "Restored candidate: " + restored.getName());

        return ResponseEntity.ok(Collections.singletonMap("message", "Candidate restored successfully."));
    }

    @DeleteMapping("/recycle-bin/{id}/permanent")
    public ResponseEntity<?> permanentlyDeleteCandidate(@PathVariable("id") Long id) {
        Map<String, Object> map = AdminStore.findInRecycleBin(id);
        if (map == null) {
            throw new ResourceNotFoundException("Candidate not found in Recycle Bin with id: " + id);
        }

        AdminStore.removeFromRecycleBin(id);

        String currentAdmin = SecurityContextHolder.getContext().getAuthentication().getName();
        AdminStore.logActivity(currentAdmin, "PERMANENT_DELETE_CANDIDATE", "Permanently deleted candidate from Recycle Bin: " + map.get("name"));

        return ResponseEntity.ok(Collections.singletonMap("message", "Candidate permanently deleted."));
    }

    // --- System Reports ---
    @GetMapping("/reports")
    public ResponseEntity<Map<String, Object>> getReports() {
        Map<String, Object> report = new HashMap<>();

        // 1. Resume uploads by date
        List<Candidate> candidates = candidateRepository.findAll();
        Map<String, Long> uploadsByDate = candidates.stream()
                .filter(c -> c.getCreatedDate() != null)
                .collect(Collectors.groupingBy(
                        c -> c.getCreatedDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")),
                        Collectors.counting()
                ));
        report.put("uploadsByDate", uploadsByDate);

        // 2. Candidate statistics (skills count)
        Map<String, Integer> skillCounts = new HashMap<>();
        ObjectMapper mapper = new ObjectMapper();
        for (Candidate c : candidates) {
            if (c.getSkills() != null && !c.getSkills().isEmpty()) {
                try {
                    List<String> skills = mapper.readValue(c.getSkills(), new TypeReference<List<String>>() {});
                    for (String skill : skills) {
                        String s = skill.trim().toLowerCase();
                        if (!s.isEmpty()) {
                            skillCounts.put(s, skillCounts.getOrDefault(s, 0) + 1);
                        }
                    }
                } catch (Exception e) {
                    // Ignore malformed skills
                }
            }
        }
        // Take top 10 skills
        Map<String, Integer> topSkills = skillCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(10)
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (e1, e2) -> e1,
                        LinkedHashMap::new
                ));
        report.put("topSkills", topSkills);

        return ResponseEntity.ok(report);
    }

    @GetMapping("/reports/export")
    public ResponseEntity<String> exportSystemReports() {
        List<Map<String, Object>> logs = AdminStore.loadActivityLogs();
        StringBuilder csv = new StringBuilder();
        csv.append("Username,Action,Details,Timestamp\n");
        for (Map<String, Object> log : logs) {
            csv.append(escapeCsv((String) log.get("username"))).append(",")
               .append(escapeCsv((String) log.get("action"))).append(",")
               .append(escapeCsv((String) log.get("details"))).append(",")
               .append(escapeCsv((String) log.get("timestamp"))).append("\n");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=system_activity_report.csv");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv.toString());
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
