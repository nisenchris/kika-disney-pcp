# Conversation ID via HTTP Header - Implementation Guide

## Overview

The `conversationID` is passed from frontend to backend via the `X-Conversation-ID` HTTP header. This is a cleaner architectural pattern than passing it in the request body because:

1. **Contextual Information**: ConversationID is contextual metadata (like auth tokens), not part of the business payload
2. **Automatic Injection**: HTTP interceptors automatically add it to ALL requests
3. **Consistency**: Backend can extract it consistently from headers, regardless of endpoint
4. **Clean Payloads**: Request bodies focus only on business data

---

## Frontend Implementation

### 1. HTTP Interceptor (Automatically Adds Header)

**File:** `src/main/webapp/app/interceptors/conversation-id.interceptor.ts`

```typescript
@Injectable()
export class ConversationIdInterceptor implements HttpInterceptor {
  constructor(private ldService: LaunchDarklyService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const userContext = this.ldService.getCurrentUserContext();

    // Only add header if we have a conversationID
    if (userContext?.conversationId) {
      const clonedRequest = req.clone({
        setHeaders: {
          'X-Conversation-ID': userContext.conversationId,
        },
      });

      console.log(`[ConversationID Interceptor] Added header: X-Conversation-ID = ${userContext.conversationId}`);

      return next.handle(clonedRequest);
    }

    // No conversationID available (e.g., user not logged in)
    return next.handle(req);
  }
}
```

**Key Points:**
- Runs on EVERY outgoing HTTP request
- Reads current conversationID from LaunchDarklyService
- Adds `X-Conversation-ID` header automatically
- Logs for debugging

### 2. Interceptor Registration

**File:** `src/main/webapp/app/core/interceptor/index.ts`

```typescript
export const httpInterceptorProviders = [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: ConversationIdInterceptor,
    multi: true,
  },
  // ... other interceptors
];
```

**Key Point:** Registered FIRST so it runs before other interceptors

### 3. API Service (Clean Request Body)

**File:** `src/main/webapp/app/services/chat-api.service.ts`

```typescript
export interface ChatRequest {
  message: string;
  // conversationID is now passed via X-Conversation-ID header (see ConversationIdInterceptor)
}

export class ChatApiService {
  sendMessage(request: ChatRequest): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(
      this.applicationConfigService.getEndpointFor('api/chat/message'),
      request
    );
  }
}
```

**Key Points:**
- Request body only contains business data (`message`)
- No need to manually add conversationID
- Cleaner, simpler API calls

### 4. Component (Simplified Calls)

**File:** `src/main/webapp/app/chat/chat.component.ts`

```typescript
async sendMessage(): Promise<void> {
  const message = this.messageInput.trim();
  if (!message || this.isSending()) return;

  this.isSending.set(true);

  try {
    // conversationID is automatically added as X-Conversation-ID header by ConversationIdInterceptor
    const response = await this.chatService
      .sendMessage({
        message,  // Only send the message!
      })
      .toPromise();

    // ... handle response
  }
}
```

**Key Point:** Component code is simpler - no need to pass conversationID manually

---

## Backend Implementation

### 1. Controller (Extract from Header)

**File:** `src/main/java/com/mycompany/myapp/web/rest/ChatController.java`

```java
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

    // ... rest of logic
}
```

**Key Points:**
- Uses `@RequestHeader` annotation to extract header value
- `required = false` allows requests without the header (graceful degradation)
- Falls back to "anonymous" if header is missing
- Logs conversationID for debugging

### 2. Request DTO (Clean)

**File:** `src/main/java/com/mycompany/myapp/web/rest/dto/ChatRequest.java`

```java
public class ChatRequest {
    @NotBlank
    private String message;

    // Note: conversationID is now passed via X-Conversation-ID header
    // See ChatController for how it's extracted

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
```

**Key Point:** DTO is cleaner - only contains business data

---

## HTTP Request/Response Example

### Request (from Browser)

```http
POST /api/chat/message HTTP/1.1
Host: localhost:8080
Content-Type: application/json
X-Conversation-ID: premium_conv_abc12345

{
  "message": "Hello, testing voice features"
}
```

**Notice:**
- `X-Conversation-ID: premium_conv_abc12345` in headers
- Request body only has `message`

### Response (from Backend)

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "textResponse": "Hi! How can I help you today?...",
  "voiceAudioUrl": "https://example.com/audio.mp3",
  "backendFlagResult": true,
  "conversationID": "premium_conv_abc12345",
  "timestamp": 1762290123456
}
```

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  1. USER LOGS IN                                             │
│     LaunchDarkly evaluates: quick-test-conversation-prefix   │
│     Generates: premium_conv_abc12345                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  2. USER SENDS CHAT MESSAGE                                  │
│     Component calls: chatService.sendMessage({ message })    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  3. HTTP INTERCEPTOR ADDS HEADER (AUTOMATIC)                 │
│     ConversationIdInterceptor reads: conversationID          │
│     Adds header: X-Conversation-ID: premium_conv_abc12345    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  4. HTTP REQUEST TO BACKEND                                  │
│     POST /api/chat/message                                   │
│     Headers:                                                 │
│       X-Conversation-ID: premium_conv_abc12345               │
│     Body:                                                    │
│       { "message": "Hello..." }                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  5. BACKEND EXTRACTS HEADER                                  │
│     @RequestHeader("X-Conversation-ID") String conversationID│
│     → conversationID = "premium_conv_abc12345"               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  6. BACKEND EVALUATES LAUNCHDARKLY FLAG                      │
│     LDContext = { key: "premium_conv_abc12345" }             │
│     Flag: quick-test-voice-chat-enabled                      │
│     Rule: IF key STARTS_WITH "premium_" → true               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  7. BACKEND RETURNS RESPONSE                                 │
│     { textResponse, voiceAudioUrl, backendFlagResult: true } │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  8. FRONTEND DISPLAYS RESULT                                 │
│     - Shows text response                                    │
│     - Shows audio player (because voice enabled)             │
│     - Updates sidebar: "Backend Voice Flag: Enabled ✓"       │
└─────────────────────────────────────────────────────────────┘
```

---

## Benefits of Header-Based Approach

### ✅ Cleaner Architecture
- ConversationID is metadata, not business data
- Separation of concerns: context vs payload
- Similar to how authentication tokens are passed

### ✅ Automatic & Consistent
- HTTP interceptor handles it automatically
- No risk of forgetting to add conversationID to a request
- Every request gets the header if user is logged in

### ✅ Backend Flexibility
- Backend can extract header in middleware/filters
- Can apply to multiple endpoints easily
- Can add additional validation/logging centrally

### ✅ Easier Testing
- Can mock/inject headers in tests
- Can test with and without headers easily
- Backend can gracefully handle missing headers

### ✅ Standard Pattern
- Common practice for contextual information
- Similar to `Authorization`, `X-Request-ID`, etc.
- Well-understood by developers

---

## Debugging Tips

### Frontend Console Logs

When you send a message, you should see:

```javascript
[ConversationID Interceptor] Added header: X-Conversation-ID = premium_conv_abc12345
```

### Backend Logs

When backend receives the request:

```
Received chat message from conversationID: premium_conv_abc12345
Evaluated quick-test-voice-chat-enabled flag for conversationID 'premium_conv_abc12345': true
```

### Browser DevTools Network Tab

1. Open DevTools → Network
2. Send a chat message
3. Click on the `/api/chat/message` request
4. Look at **Request Headers** section:
   - Should see: `X-Conversation-ID: premium_conv_abc12345`
5. Look at **Payload** section:
   - Should only see: `{ "message": "..." }`

---

## Demo Script Update

When presenting to Disney, mention:

**"One key architectural decision: We pass the conversation ID via HTTP header, not in the request body."**

**Show the Network tab:**
- "See this `X-Conversation-ID` header? That's automatically added by our HTTP interceptor."
- "The request body only contains business data - the message itself."
- "This follows the same pattern as authentication tokens - contextual information in headers."

**Show the code:**
- "The interceptor runs on every request and automatically adds the conversation ID."
- "The backend extracts it from the header using `@RequestHeader`."
- "This means developers never have to remember to add it manually."

**Benefits:**
- "Cleaner separation between context and business logic"
- "Automatic and consistent across all API calls"
- "Industry-standard pattern for passing contextual metadata"
- "Makes the LaunchDarkly integration transparent to business logic"

---

## Testing the Change

### Test 1: Login and Send Message
1. Login with any email
2. Open browser console
3. Send a chat message
4. **Verify:** Console shows `[ConversationID Interceptor] Added header: X-Conversation-ID = ...`
5. **Verify:** Backend logs show conversationID received

### Test 2: Network Inspection
1. Open DevTools → Network tab
2. Send a chat message
3. Click the `/api/chat/message` request
4. **Verify:** Request Headers include `X-Conversation-ID`
5. **Verify:** Request Payload does NOT include `conversationID`

### Test 3: Backend Response
1. Send a message
2. Check the response
3. **Verify:** Response still includes `conversationID` (backend echoes it back)
4. **Verify:** `backendFlagResult` is correct based on prefix

---

## Migration Notes

### What Changed

**Frontend:**
- ✅ Added `ConversationIdInterceptor` 
- ✅ Removed `conversationID` from `ChatRequest` interface
- ✅ Simplified component calls (no longer need to pass conversationID)

**Backend:**
- ✅ Updated `ChatController` to use `@RequestHeader`
- ✅ Removed `conversationID` field from `ChatRequest` DTO
- ✅ Added graceful fallback for missing header

### Backward Compatibility

If you need to support both header AND body (during migration):

```java
@PostMapping("/message")
public ResponseEntity<ChatResponse> sendMessage(
    @RequestHeader(value = "X-Conversation-ID", required = false) String headerConversationID,
    @Valid @RequestBody ChatRequest request
) {
    // Prefer header, fall back to body if present
    String conversationID = headerConversationID != null ? headerConversationID : request.getConversationID();
    
    if (conversationID == null || conversationID.isEmpty()) {
        conversationID = "anonymous";
    }
    
    // ... rest of logic
}
```

---

## Summary

✅ **Frontend**: HTTP interceptor automatically adds `X-Conversation-ID` header  
✅ **Backend**: `@RequestHeader` extracts conversationID from header  
✅ **Result**: Cleaner code, automatic injection, industry-standard pattern  
✅ **Privacy**: Backend still never sees user email, only conversationID  
✅ **LaunchDarkly**: Same flag evaluation logic, just cleaner transport  

**This is production-ready!** 🚀

