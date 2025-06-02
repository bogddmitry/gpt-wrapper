package com.gptwrapper.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.time.Instant;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
    static class Message {
        public String senderId;
        public String content;
        public Instant timestamp;
        public Message(String senderId, String content) {
            this.senderId = senderId;
            this.content = content;
            this.timestamp = Instant.now();
        }
    }

    static class Chat {
        public String id;
        public String userId;
        public String title;
        public List<Message> messages = new ArrayList<>();
        public Instant created;
        public Instant lastModified;
        public Chat(String userId, String title) {
            this.id = UUID.randomUUID().toString();
            this.userId = userId;
            this.title = title;
            this.created = Instant.now();
            this.lastModified = this.created;
        }
    }

    private static final Map<String, List<Chat>> userChats = new HashMap<>();

    @GetMapping("/list")
    public List<Map<String, Object>> listChats(@RequestParam String userId) {
        List<Chat> chats = userChats.getOrDefault(userId, new ArrayList<>());
        List<Map<String, Object>> result = new ArrayList<>();
        for (Chat chat : chats) {
            Map<String, Object> chatInfo = new HashMap<>();
            chatInfo.put("id", chat.id);
            chatInfo.put("title", chat.title);
            chatInfo.put("created", chat.created);
            chatInfo.put("lastModified", chat.lastModified);
            result.add(chatInfo);
        }
        return result;
    }

    @PostMapping("/new")
    public Map<String, Object> newChat(@RequestBody Map<String, String> payload) {
        String userId = payload.get("userId");
        Chat chat = new Chat(userId, null); // No title at creation
        userChats.computeIfAbsent(userId, k -> new ArrayList<>()).add(chat);
        Map<String, Object> result = new HashMap<>();
        result.put("id", chat.id);
        result.put("title", chat.title);
        result.put("created", chat.created);
        result.put("lastModified", chat.lastModified);
        return result;
    }

    @GetMapping("/messages")
    public List<Message> getMessages(@RequestParam String userId, @RequestParam String chatId) {
        List<Chat> chats = userChats.getOrDefault(userId, new ArrayList<>());
        for (Chat chat : chats) {
            if (chat.id.equals(chatId)) {
                return chat.messages;
            }
        }
        return new ArrayList<>();
    }

    @PostMapping("/send")
    public Map<String, String> send(@RequestBody Map<String, String> payload) {
        String userId = payload.get("userId");
        String chatId = payload.get("chatId");
        String message = payload.get("message");
        List<Chat> chats = userChats.getOrDefault(userId, new ArrayList<>());
        for (Chat chat : chats) {
            if (chat.id.equals(chatId)) {
                // Set title to first message if not set
                if (chat.title == null || chat.title.isEmpty()) {
                    chat.title = message;
                }
                chat.messages.add(new Message(userId, message));
                chat.lastModified = Instant.now();
                // Simulate AI response
                chat.messages.add(new Message("ai", "Echo: " + message));
                chat.lastModified = Instant.now();
                return Map.of("status", "ok");
            }
        }
        return Map.of("status", "chat_not_found");
    }
} 