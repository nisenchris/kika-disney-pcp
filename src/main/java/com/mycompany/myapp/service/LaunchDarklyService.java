package com.mycompany.myapp.service;

import com.launchdarkly.sdk.LDContext;
import com.launchdarkly.sdk.server.LDClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * 🎯 DEMO: Backend LaunchDarkly Integration
 * 
 * This service demonstrates FLAG #2: quick-test-voice-chat-enabled
 * 
 * What it does:
 * - Receives conversation ID from frontend via X-Conversation-ID header
 * - Creates a LaunchDarkly context of kind "conversation" (NOT "user")
 * - Evaluates the 'quick-test-voice-chat-enabled' flag based on conversation ID pattern
 * - Returns boolean: true (voice enabled) or false (voice disabled)
 * 
 * KEY PRIVACY FEATURE:
 * - Backend NEVER receives user email or personal data
 * - Only receives conversation ID like "premium_conv_abc12345"
 * - Flag targeting rules check the prefix pattern (e.g., "starts with premium_")
 * 
 * This demonstrates frontend/backend flag coordination with complete data separation!
 */
@Service
public class LaunchDarklyService {

    private static final Logger log = LoggerFactory.getLogger(LaunchDarklyService.class);
    
    // 🎯 FLAG #2: Server-side voice chat feature flag
    private static final String VOICE_CHAT_FLAG = "quick-test-voice-chat-enabled";

    private final LDClient ldClient;

    public LaunchDarklyService(LDClient ldClient) {
        this.ldClient = ldClient;
    }

    /**
     * 🎯 DEMO STEP 3: Backend Flag Evaluation
     * 
     * Evaluates the voice-chat-enabled flag using the conversation ID as context.
     * 
     * @param conversationID The conversation ID from X-Conversation-ID header
     *                       Examples: "premium_conv_abc123", "test_conv_xyz789", "conv_def456"
     * @return true if voice is enabled for this conversation tier, false otherwise
     */
    public boolean evaluateVoiceChat(String conversationID) {
        if (ldClient == null) {
            log.warn("⚠️ LaunchDarkly client not available. Returning false for voice-chat-enabled flag.");
            log.warn("⚠️ Configure LD_SDK_KEY environment variable to enable flag evaluation.");
            return false;
        }

        try {
            // Create LaunchDarkly context with "conversation" kind
            // This is DIFFERENT from the frontend "user" context!
            LDContext context = LDContext.builder(conversationID)
                .kind("conversation")  // Important: kind = "conversation" not "user"
                .build();

            // 🎯 FLAG #2: Evaluate 'quick-test-voice-chat-enabled'
            boolean flagValue = ldClient.boolVariation(VOICE_CHAT_FLAG, context, false);

            log.info("✅ Flag evaluated: {} for conversationID '{}' = {}", 
                VOICE_CHAT_FLAG, conversationID, flagValue);
            
            log.debug("📋 Context details - Key: {}, Kind: {}", 
                context.getKey(), context.getKind());

            return flagValue;
        } catch (Exception e) {
            log.error("❌ Error evaluating LaunchDarkly flag for conversationID: {}", conversationID, e);
            return false;
        }
    }
}

