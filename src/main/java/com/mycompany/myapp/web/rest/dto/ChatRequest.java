package com.mycompany.myapp.web.rest.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO for chat message requests.
 * 
 * Note: conversationID is now passed via X-Conversation-ID header instead of in the request body.
 * See ChatController for how it's extracted from the header.
 */
public class ChatRequest {

    @NotBlank
    private String message;

    public ChatRequest() {}

    public ChatRequest(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    @Override
    public String toString() {
        return "ChatRequest{" +
            "message='" + message + '\'' +
            '}';
    }
}
