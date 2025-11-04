package com.mycompany.myapp.web.rest.dto;

public class ChatResponse {

    private String textResponse;
    private String voiceAudioUrl;
    private boolean backendFlagResult;
    private String conversationID;
    private long timestamp;

    public ChatResponse() {}

    public ChatResponse(
        String textResponse,
        String voiceAudioUrl,
        boolean backendFlagResult,
        String conversationID,
        long timestamp
    ) {
        this.textResponse = textResponse;
        this.voiceAudioUrl = voiceAudioUrl;
        this.backendFlagResult = backendFlagResult;
        this.conversationID = conversationID;
        this.timestamp = timestamp;
    }

    public String getTextResponse() {
        return textResponse;
    }

    public void setTextResponse(String textResponse) {
        this.textResponse = textResponse;
    }

    public String getVoiceAudioUrl() {
        return voiceAudioUrl;
    }

    public void setVoiceAudioUrl(String voiceAudioUrl) {
        this.voiceAudioUrl = voiceAudioUrl;
    }

    public boolean isBackendFlagResult() {
        return backendFlagResult;
    }

    public void setBackendFlagResult(boolean backendFlagResult) {
        this.backendFlagResult = backendFlagResult;
    }

    public String getConversationID() {
        return conversationID;
    }

    public void setConversationID(String conversationID) {
        this.conversationID = conversationID;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    @Override
    public String toString() {
        return "ChatResponse{" +
            "textResponse='" + textResponse + '\'' +
            ", voiceAudioUrl='" + voiceAudioUrl + '\'' +
            ", backendFlagResult=" + backendFlagResult +
            ", conversationID='" + conversationID + '\'' +
            ", timestamp=" + timestamp +
            '}';
    }
}

