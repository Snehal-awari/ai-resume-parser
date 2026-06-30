package com.resumeparser.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.resumeparser.entity.Candidate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;

public class AdminStore {
    private static final Logger logger = LoggerFactory.getLogger(AdminStore.class);
    private static final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
    private static final Path ADMIN_DIR = Paths.get("admin_data");
    private static final Path DEACTIVATED_FILE = ADMIN_DIR.resolve("deactivated_users.json");
    private static final Path RECYCLE_BIN_FILE = ADMIN_DIR.resolve("recycle_bin.json");
    private static final Path LOGS_FILE = ADMIN_DIR.resolve("activity_logs.json");
    private static final Path USERS_METADATA_FILE = ADMIN_DIR.resolve("users_metadata.json");

    static {
        try {
            if (!Files.exists(ADMIN_DIR)) {
                Files.createDirectories(ADMIN_DIR);
            }
        } catch (IOException e) {
            logger.error("Failed to create admin_data directory: {}", e.getMessage());
        }
    }

    // --- Deactivated Users ---
    public static synchronized boolean isUserDeactivated(String username) {
        if (username == null) return false;
        Set<String> deactivated = loadDeactivatedUsers();
        return deactivated.contains(username.toLowerCase().trim());
    }

    public static synchronized void deactivateUser(String username) {
        if (username == null) return;
        Set<String> deactivated = loadDeactivatedUsers();
        deactivated.add(username.toLowerCase().trim());
        saveDeactivatedUsers(deactivated);
    }

    public static synchronized void activateUser(String username) {
        if (username == null) return;
        Set<String> deactivated = loadDeactivatedUsers();
        deactivated.remove(username.toLowerCase().trim());
        saveDeactivatedUsers(deactivated);
    }

    private static Set<String> loadDeactivatedUsers() {
        if (!Files.exists(DEACTIVATED_FILE)) {
            return new HashSet<>();
        }
        try {
            return objectMapper.readValue(Files.readAllBytes(DEACTIVATED_FILE), new TypeReference<Set<String>>() {});
        } catch (IOException e) {
            logger.error("Error reading deactivated users: {}", e.getMessage());
            return new HashSet<>();
        }
    }

    private static void saveDeactivatedUsers(Set<String> users) {
        try {
            Files.write(DEACTIVATED_FILE, objectMapper.writeValueAsBytes(users));
        } catch (IOException e) {
            logger.error("Error saving deactivated users: {}", e.getMessage());
        }
    }

    // --- Recycle Bin ---
    public static synchronized void addToRecycleBin(Candidate candidate) {
        if (candidate == null) return;
        List<Map<String, Object>> bin = loadRecycleBin();
        
        Map<String, Object> map = new HashMap<>();
        map.put("id", candidate.getId());
        map.put("name", candidate.getName());
        map.put("email", candidate.getEmail());
        map.put("phone", candidate.getPhone());
        map.put("linkedin", candidate.getLinkedin());
        map.put("github", candidate.getGithub());
        map.put("skills", candidate.getSkills());
        map.put("experience", candidate.getExperience());
        map.put("education", candidate.getEducation());
        map.put("projects", candidate.getProjects());
        map.put("summary", candidate.getSummary());
        map.put("resumeFileName", candidate.getResumeFileName());
        map.put("fileHash", candidate.getFileHash());
        map.put("createdDate", candidate.getCreatedDate() != null ? candidate.getCreatedDate().toString() : null);
        map.put("deletedDate", LocalDateTime.now().toString());

        bin.add(map);
        saveRecycleBin(bin);
    }

    public static synchronized List<Map<String, Object>> loadRecycleBin() {
        if (!Files.exists(RECYCLE_BIN_FILE)) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(Files.readAllBytes(RECYCLE_BIN_FILE), new TypeReference<List<Map<String, Object>>>() {});
        } catch (IOException e) {
            logger.error("Error reading recycle bin: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    public static synchronized Map<String, Object> findInRecycleBin(Long id) {
        List<Map<String, Object>> bin = loadRecycleBin();
        for (Map<String, Object> item : bin) {
            Number binId = (Number) item.get("id");
            if (binId != null && binId.longValue() == id) {
                return item;
            }
        }
        return null;
    }

    public static synchronized void removeFromRecycleBin(Long id) {
        List<Map<String, Object>> bin = loadRecycleBin();
        bin.removeIf(item -> {
            Number binId = (Number) item.get("id");
            return binId != null && binId.longValue() == id;
        });
        saveRecycleBin(bin);
    }

    private static void saveRecycleBin(List<Map<String, Object>> bin) {
        try {
            Files.write(RECYCLE_BIN_FILE, objectMapper.writeValueAsBytes(bin));
        } catch (IOException e) {
            logger.error("Error saving recycle bin: {}", e.getMessage());
        }
    }

    // --- Activity Logs ---
    public static synchronized void logActivity(String username, String action, String details) {
        List<Map<String, Object>> logs = loadActivityLogs();
        
        Map<String, Object> log = new HashMap<>();
        log.put("username", username != null ? username : "System");
        log.put("action", action);
        log.put("details", details);
        log.put("timestamp", LocalDateTime.now().toString());
        
        logs.add(log);
        saveActivityLogs(logs);
    }

    public static synchronized List<Map<String, Object>> loadActivityLogs() {
        if (!Files.exists(LOGS_FILE)) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(Files.readAllBytes(LOGS_FILE), new TypeReference<List<Map<String, Object>>>() {});
        } catch (IOException e) {
            logger.error("Error reading activity logs: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    private static void saveActivityLogs(List<Map<String, Object>> logs) {
        try {
            Files.write(LOGS_FILE, objectMapper.writeValueAsBytes(logs));
        } catch (IOException e) {
            logger.error("Error saving activity logs: {}", e.getMessage());
        }
    }

    // --- Users Metadata ---
    public static synchronized void saveUserMetadata(String username) {
        if (username == null) return;
        Map<String, Map<String, Object>> metadata = loadUsersMetadata();
        
        Map<String, Object> userMeta = new HashMap<>();
        userMeta.put("createdDate", LocalDateTime.now().toString());
        
        metadata.put(username.toLowerCase().trim(), userMeta);
        saveUsersMetadata(metadata);
    }

    public static synchronized Map<String, Object> getUserMetadata(String username) {
        if (username == null) return Collections.emptyMap();
        Map<String, Map<String, Object>> metadata = loadUsersMetadata();
        return metadata.getOrDefault(username.toLowerCase().trim(), Collections.emptyMap());
    }

    private static Map<String, Map<String, Object>> loadUsersMetadata() {
        if (!Files.exists(USERS_METADATA_FILE)) {
            return new HashMap<>();
        }
        try {
            return objectMapper.readValue(Files.readAllBytes(USERS_METADATA_FILE), new TypeReference<Map<String, Map<String, Object>>>() {});
        } catch (IOException e) {
            logger.error("Error reading users metadata: {}", e.getMessage());
            return new HashMap<>();
        }
    }

    private static void saveUsersMetadata(Map<String, Map<String, Object>> metadata) {
        try {
            Files.write(USERS_METADATA_FILE, objectMapper.writeValueAsBytes(metadata));
        } catch (IOException e) {
            logger.error("Error saving users metadata: {}", e.getMessage());
        }
    }
}
