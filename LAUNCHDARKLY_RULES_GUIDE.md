# LaunchDarkly Flag Configuration Guide

This guide shows you how to configure the LaunchDarkly flags to control the demo behavior.

## Overview

The application has **NO hardcoded tier logic**. Everything is controlled by LaunchDarkly flags:

1. **Frontend Flag** (`quick-test-conversation-prefix`): Determines what prefix to add to conversation IDs
2. **Backend Flag** (`quick-test-voice-chat-enabled`): Determines if voice features are enabled for a conversation

---

## Flag 1: `quick-test-conversation-prefix` (Frontend)

**Type:** String  
**Purpose:** Returns the prefix to use for the conversation ID  
**Evaluated By:** Frontend using User context  

### User Context Attributes Available:
- `key`: User's email (e.g., "test@disney.com")
- `email`: User's email (e.g., "test@disney.com")
- `beta`: Boolean (true/false) - whether beta checkbox was checked

### Example Rules Configuration:

```yaml
# Rule 1: Disney employees get "test" prefix
IF user.email ENDS_WITH "@disney.com"
THEN serve: "test"

# Rule 2: Premium users get "premium" prefix  
IF user.email STARTS_WITH "premium"
THEN serve: "premium"

# Rule 3: Beta testers get "beta" prefix
IF user.beta IS true
THEN serve: "beta"

# Rule 4: Internal team gets "internal" prefix
IF user.email CONTAINS "acme-corp"
THEN serve: "internal"

# Default: No prefix (anonymous user)
ELSE serve: ""
```

### Result Examples:
- `test@disney.com` → prefix: `"test"` → conversationID: `test_conv_abc123`
- `premium@example.com` → prefix: `"premium"` → conversationID: `premium_conv_xyz789`
- `user@example.com` (with beta) → prefix: `"beta"` → conversationID: `beta_conv_def456`
- `regular@example.com` → prefix: `""` → conversationID: `conv_ghi012`

---

## Flag 2: `quick-test-voice-chat-enabled` (Backend)

**Type:** Boolean  
**Purpose:** Determines if voice features should be enabled  
**Evaluated By:** Backend using Conversation context  

### Conversation Context Attributes Available:
- `key`: The conversation ID (e.g., "premium_conv_abc123")
- `kind`: Always "conversation"

### Example Rules Configuration:

```yaml
# Rule 1: Enable voice for premium conversations
IF context.key STARTS_WITH "premium_"
THEN serve: true

# Rule 2: Enable voice for test conversations
IF context.key STARTS_WITH "test_"
THEN serve: true

# Rule 3: Enable voice for internal conversations
IF context.key STARTS_WITH "internal_"
THEN serve: true

# Default: Voice disabled
ELSE serve: false
```

### How It Works:

1. **User logs in**: `test@disney.com`
2. **Frontend evaluates** `quick-test-conversation-prefix`:
   - User context: `{ key: "test@disney.com", email: "test@disney.com", beta: false }`
   - Flag returns: `"test"`
   - ConversationID generated: `test_conv_9cehmTrz`

3. **User sends chat message**: Frontend sends `{ conversationID: "test_conv_9cehmTrz", message: "hello" }`

4. **Backend evaluates** `quick-test-voice-chat-enabled`:
   - Conversation context: `{ key: "test_conv_9cehmTrz", kind: "conversation" }`
   - Flag checks: Does key start with "test_"? → YES
   - Flag returns: `true`
   - Backend includes voice audio URL in response

---

## Setting Up Rules in LaunchDarkly UI

### For `quick-test-conversation-prefix`:

1. Go to your LaunchDarkly dashboard
2. Navigate to **Feature Flags** → `quick-test-conversation-prefix`
3. Click **Add Rule**
4. Configure targeting rules:
   - **Attribute**: `email`
   - **Operator**: `ends with`
   - **Value**: `@disney.com`
   - **Serve**: `"test"`
5. Add more rules as needed
6. Set default variation to `""` (empty string)

### For `quick-test-voice-chat-enabled`:

1. Go to your LaunchDarkly dashboard
2. Navigate to **Feature Flags** → `quick-test-voice-chat-enabled`
3. Click **Add Rule**
4. Configure targeting rules:
   - **Attribute**: `key`
   - **Operator**: `starts with`
   - **Value**: `premium_`
   - **Serve**: `true`
5. Add rule for `test_` prefix
6. Set default variation to `false`

---

## Testing Different Scenarios

### Scenario 1: Premium User
**Login:** `premium@example.com`  
**Expected:**
- Frontend flag returns: `"premium"`
- ConversationID: `premium_conv_xxxxx`
- Backend flag returns: `true` (voice enabled)
- UI shows: Yellow "PREMIUM" badge, audio player visible

### Scenario 2: Disney Test User
**Login:** `test@disney.com`  
**Expected:**
- Frontend flag returns: `"test"`
- ConversationID: `test_conv_xxxxx`
- Backend flag returns: `true` (voice enabled)
- UI shows: Blue "TEST" badge, audio player visible

### Scenario 3: Beta User
**Login:** `user@example.com` + Beta checkbox checked  
**Expected:**
- Frontend flag returns: `"beta"`
- ConversationID: `beta_conv_xxxxx`
- Backend flag returns: `false` (voice disabled, unless you add beta to backend rules)
- UI shows: Gray "BETA" badge, no audio player

### Scenario 4: Anonymous User
**Login:** `user@example.com` (no beta checkbox)  
**Expected:**
- Frontend flag returns: `""`
- ConversationID: `conv_xxxxx`
- Backend flag returns: `false` (voice disabled)
- UI shows: Gray "NO PREFIX" badge, no audio player

---

## Key Benefits

✅ **No code changes needed** - All tier logic controlled by LaunchDarkly  
✅ **Privacy-preserving** - Backend never sees user email, only conversation ID  
✅ **Flexible** - Add new tiers/prefixes without deploying code  
✅ **Testable** - Use LaunchDarkly's targeting rules for A/B testing  
✅ **Auditable** - All flag evaluations logged in LaunchDarkly  

---

## Debugging

### Frontend Console Logs:
```javascript
LaunchDarkly evaluated prefix for test@disney.com: "test"
Generated conversationID: test_conv_9cehmTrz
```

### Backend Logs:
```
Evaluated quick-test-voice-chat-enabled flag for conversationID 'test_conv_9cehmTrz': true
Context details - Key: test_conv_9cehmTrz, Kind: conversation
```

---

## Advanced: Dynamic Prefix Assignment

You can create complex rules in LaunchDarkly:

**Example: Gradual rollout of premium features**
- 10% of users get "premium" prefix
- 20% of beta users get "premium" prefix  
- Disney employees always get "test" prefix
- Everyone else gets no prefix

This is all controlled through LaunchDarkly's percentage rollouts and targeting rules!

