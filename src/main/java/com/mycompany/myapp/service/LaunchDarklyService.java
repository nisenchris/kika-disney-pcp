package com.mycompany.myapp.service;

import com.launchdarkly.sdk.LDContext;
import com.launchdarkly.sdk.server.LDClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class LaunchDarklyService {

    private static final Logger log = LoggerFactory.getLogger(LaunchDarklyService.class);
    private static final String VOICE_CHAT_FLAG = "quick-test-voice-chat-enabled";

    private final LDClient ldClient;

    public LaunchDarklyService(LDClient ldClient) {
        this.ldClient = ldClient;
    }

    public boolean evaluateVoiceChat(String conversationID) {
        if (ldClient == null) {
            log.warn("LaunchDarkly client not available. Returning false for voice-chat-enabled flag.");
            log.warn("Configure LaunchDarkly SDK key to enable flag evaluation.");
            return false;
        }

        try {
            // Create context with conversationID as the key and "conversation" as the kind
            LDContext context = LDContext.builder(conversationID)
                .kind("conversation")
                .build();

            boolean flagValue = ldClient.boolVariation(VOICE_CHAT_FLAG, context, false);

            log.info("Evaluated {} flag for conversationID '{}': {}", 
                VOICE_CHAT_FLAG, conversationID, flagValue);
            
            log.debug("Context details - Key: {}, Kind: {}", 
                context.getKey(), context.getKind());

            return flagValue;
        } catch (Exception e) {
            log.error("Error evaluating LaunchDarkly flag for conversationID: {}", conversationID, e);
            return false;
        }
    }
}

