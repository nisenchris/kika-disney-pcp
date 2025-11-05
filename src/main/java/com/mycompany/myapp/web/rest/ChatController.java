package com.mycompany.myapp.web.rest;

import com.mycompany.myapp.service.LaunchDarklyService;
import com.mycompany.myapp.web.rest.dto.ChatRequest;
import com.mycompany.myapp.web.rest.dto.ChatResponse;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 🎯 DEMO: Chat API Controller
 * 
 * This controller demonstrates how the backend:
 * 1. Receives conversation ID via X-Conversation-ID header (NOT in request body)
 * 2. Evaluates the 'quick-test-voice-chat-enabled' flag using that conversation ID
 * 3. Returns voice audio URL only if the flag is enabled for that tier
 * 
 * KEY ARCHITECTURE:
 * - Frontend and backend are COMPLETELY SEPARATE
 * - Backend NEVER sees user email or personal data
 * - Only receives conversation ID like "premium_conv_abc12345"
 * - LaunchDarkly targeting rules determine features based on ID pattern
 */
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private static final Logger log = LoggerFactory.getLogger(ChatController.class);
    
    /**
     * Demo audio URL for the animated audio visualizer.
     * 
     * In production, this would be a real audio URL from a TTS service.
     * For demo purposes, we use a local audio file served by the application.
     * 
     * Audio file: src/main/webapp/content/audio/welcome-back-pal-ready-for-some-fun.mp3
     * The frontend AudioVisualizerComponent creates a ChatGPT-style animated orb.
     */
    private static final String MOCK_AUDIO_URL = "/content/audio/welcome-back-pal-ready-for-some-fun.mp3";

    private final LaunchDarklyService launchDarklyService;

    public ChatController(LaunchDarklyService launchDarklyService) {
        this.launchDarklyService = launchDarklyService;
    }

    /**
     * 🎯 DEMO ENDPOINT: Send Chat Message
     * 
     * POST /api/chat/message : Process a chat message and return response with voice audio if flag is enabled.
     * 
     * Flow:
     * 1. Extract conversation ID from X-Conversation-ID header (automatically added by frontend interceptor)
     * 2. Evaluate 'quick-test-voice-chat-enabled' flag using conversation ID as context
     * 3. Include voice audio URL ONLY if flag returns true
     * 4. Return response to frontend with flag evaluation result
     * 
     * @param conversationID Conversation ID from X-Conversation-ID header (e.g., "premium_conv_abc123")
     * @param request The chat request containing only the message (business data)
     * @return ChatResponse with text, optional audio URL, and flag evaluation result
     */
    @PostMapping("/message")
    public ResponseEntity<ChatResponse> sendMessage(
        @RequestHeader(value = "X-Conversation-ID", required = false) String conversationID,
        @Valid @RequestBody ChatRequest request
    ) {
        log.info("📨 Received chat message");
        log.info("📋 Conversation ID from header: {}", conversationID != null ? conversationID : "(none)");
        log.debug("💬 Message content: {}", request.getMessage());

        // Handle missing conversation ID (graceful degradation)
        if (conversationID == null || conversationID.isEmpty()) {
            log.warn("⚠️ No X-Conversation-ID header provided, using 'anonymous' context");
            conversationID = "anonymous";
        }

        // 🎯 FLAG #2: Evaluate 'quick-test-voice-chat-enabled' flag
        boolean voiceEnabled = launchDarklyService.evaluateVoiceChat(conversationID);

        // Prepare response
        String textResponse = "Hi! How can I help you today? " +
            "I'm demonstrating LaunchDarkly's feature flag coordination between frontend and backend.";

        // 🎯 Include voice audio URL ONLY if flag is enabled
        String voiceAudioUrl = voiceEnabled ? MOCK_AUDIO_URL : null;

        long timestamp = System.currentTimeMillis();

        ChatResponse response = new ChatResponse(
            textResponse,
            voiceAudioUrl,
            voiceEnabled,  // Include flag result so frontend can display it
            conversationID,
            timestamp
        );

        log.info("📤 Sending response - Voice enabled: {} - Audio URL: {}", 
            voiceEnabled, voiceEnabled ? "included" : "NOT included");

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/chat/health : Health check endpoint for the chat service.
     *
     * @return OK if service is running
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Chat service is running");
    }
}

