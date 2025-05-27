package com.gptwrapper.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
    private static final List<Map<String, String>> chatHistory = new ArrayList<>();

    @PostMapping("/send")
    public Map<String, String> send(@RequestBody Map<String, String> payload) {
        String userId = payload.get("userId");
        String message = payload.get("message");
        Map<String, String> userMsg = Map.of("userId", userId, "message", message);
        chatHistory.add(userMsg);
        // Simulate AI response
        Map<String, String> aiMsg = Map.of("userId", "ai", "message", "Echo: " + message);
        chatHistory.add(aiMsg);
        return Map.of("status", "ok");
    }

    @GetMapping("/history")
    public List<Map<String, String>> history(@RequestParam String userId) {
        return chatHistory;
    }
} 