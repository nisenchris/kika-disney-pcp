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
 * REST controller for handling chat messages and demonstrating LaunchDarkly flag evaluation.
 */
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private static final Logger log = LoggerFactory.getLogger(ChatController.class);
    private static final String MOCK_AUDIO_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

    private final LaunchDarklyService launchDarklyService;

    public ChatController(LaunchDarklyService launchDarklyService) {
        this.launchDarklyService = launchDarklyService;
    }

    /**
     * POST /api/chat/message : Process a chat message and return response with voice audio if flag is enabled.
     *
     * @param conversationID the conversation ID from X-Conversation-ID header
     * @param request the chat request containing the message
     * @return the chat response with text, optional audio URL, and flag evaluation result
     */
    @PostMapping("/message")
    public ResponseEntity<ChatResponse> sendMessage(
        @RequestHeader(value = "X-Conversation-ID", required = false) String conversationID,
        @Valid @RequestBody ChatRequest request
    ) {
        log.info("Received chat message from conversationID: {}", conversationID);
        log.debug("Message content: {}", request.getMessage());

        // Handle missing conversation ID
        if (conversationID == null || conversationID.isEmpty()) {
            log.warn("No X-Conversation-ID header provided, using anonymous context");
            conversationID = "anonymous";
        }

        // Evaluate voice-chat-enabled flag using conversationID as context key
        boolean voiceEnabled = launchDarklyService.evaluateVoiceChat(conversationID);

        // Prepare response
        String textResponse = "Hi! How can I help you today? " +
            "I'm demonstrating LaunchDarkly's feature flag coordination between frontend and backend.";

        String voiceAudioUrl = voiceEnabled ? MOCK_AUDIO_URL : null;

        long timestamp = System.currentTimeMillis();

        ChatResponse response = new ChatResponse(
            textResponse,
            voiceAudioUrl,
            voiceEnabled,
            conversationID,
            timestamp
        );

        log.info("Sending response for conversationID: {} - Voice enabled: {}", 
            conversationID, voiceEnabled);

        if (voiceEnabled) {
            log.info("Voice audio URL included in response");
        } else {
            log.info("Voice audio URL NOT included (flag disabled or tier not eligible)");
        }

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

