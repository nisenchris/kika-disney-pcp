# LaunchDarkly Flag Configuration

This document details the feature flags required for the quick-test demo application.

## 🎯 Demo Overview

This demo shows how to coordinate feature flags between frontend and backend using LaunchDarkly, while maintaining **complete separation** between the two systems.

**Key Concept:** The frontend generates a conversation ID with a tier prefix, and the backend uses that ID (not user data) to evaluate features.

## Flag Creation

**Note:** Flags should be created via the LaunchDarkly web interface or using the MCP server integration when you provide your project key.

## Required Flags

### 1. Frontend Flag: `quick-test-conversation-prefix`

**Purpose:** Determines the tier prefix added to conversation IDs based on user attributes (email, beta).

#### Configuration

- **Flag Key:** `quick-test-conversation-prefix`
- **Name:** Quick Test Conversation Prefix
- **Type:** String (multi-variate flag)
- **Client-side SDK:** ✅ Enabled (MUST be enabled)
- **Description:** Returns the tier prefix to prepend to conversation IDs (beta, test, premium, or empty string)

#### Variations

| Variation Name | Value | Description |
|---------------|-------|-------------|
| Premium | `premium` | Premium tier users |
| Test | `test` | Test/Disney internal users |
| Beta | `beta` | Beta early access users |
| None | `""` | Anonymous/default (empty string) |

#### Default Rule

- **Serve:** `""` (empty string - no prefix)

#### Context Configuration

- **Context Kind:** `user`
- **Context Key Attribute:** `email`
- **Custom Attributes:**
  - `email` (string)
  - `beta` (boolean)

#### Example Targeting Rules (Optional)

These rules can be configured in LaunchDarkly to automatically assign tiers:

```
Rule 1: Email Domain Targeting
  - IF email ENDS WITH @disney.com
  - SERVE "test"

Rule 2: Premium with Beta
  - IF email STARTS WITH premium AND beta IS true
  - SERVE "premium" (can use for progressive rollout)

Rule 3: Premium Users
  - IF email STARTS WITH premium
  - SERVE "premium"

Rule 4: Beta Access
  - IF beta IS true
  - SERVE "beta"

Default:
  - SERVE "" (empty string)
```

---

### 2. Backend Flag: `quick-test-voice-chat-enabled`

**Purpose:** Controls whether voice audio URLs are included in chat responses based on conversation tier.

#### Configuration

- **Flag Key:** `quick-test-voice-chat-enabled`
- **Name:** Quick Test Voice Chat Enabled
- **Type:** Boolean
- **Client-side SDK:** ❌ Disabled (server-side only)
- **Description:** Enables voice audio responses for eligible conversation tiers

#### Variations

| Variation Name | Value | Description |
|---------------|-------|-------------|
| Enabled | `true` | Voice feature available |
| Disabled | `false` | Voice feature not available |

#### Default Rule

- **Serve:** `false` (disabled by default)

#### Context Configuration

- **Context Kind:** `conversation`
- **Context Key Attribute:** The conversation ID itself (e.g., `premium_conv_a1b2c3d4`)
- **Important:** The context kind MUST be set to `"conversation"` not `"user"`

#### Example Targeting Rules (Optional)

```
Rule 1: Premium Tier
  - IF key (conversationID) STARTS WITH premium_
  - SERVE true

Rule 2: Test Tier
  - IF key (conversationID) STARTS WITH test_
  - SERVE true

Rule 3: Percentage Rollout (Optional)
  - Serve true to 10% of remaining contexts
  - Serve false to 90% of remaining contexts

Default:
  - SERVE false
```

#### Regex Pattern for Targeting (Alternative)

```
Pattern: ^(premium|test)_conv_
Matches:
  ✓ premium_conv_abc123
  ✓ test_conv_xyz789
  ✗ beta_conv_def456
  ✗ conv_ghi789
```

---

## Flag Coordination Strategy

### How It Works

1. **User Login (Frontend)**
   - User enters email and beta checkbox
   - Frontend creates user context: `{ kind: 'user', key: email, email: email, beta: boolean }`
   - Frontend evaluates `quick-test-conversation-prefix` flag
   - Returns prefix: `"beta"`, `"test"`, `"premium"`, or `""` (empty)

2. **Conversation ID Generation (Frontend)**
   - If prefix returned: `{prefix}_conv_{shortId}` (e.g., `premium_conv_a1b2c3d4`)
   - If empty prefix: `conv_{shortId}` (e.g., `conv_x9y8z1a2`)

3. **Message Sent to Backend**
   - Header: `X-Conversation-ID: {conversationID}`
   - Payload: `{ message }` (only business data)
   - Backend receives only the conversation ID string (NEVER user email!)

4. **Backend Flag Evaluation**
   - Backend creates context: `{ kind: 'conversation', key: conversationID }`
   - Backend evaluates `quick-test-voice-chat-enabled` flag
   - Returns boolean based on conversation ID pattern

5. **Response Coordination**
   - If flag = `true`: Include voice audio URL
   - If flag = `false`: Voice audio URL is null
   - Frontend displays backend flag status visually

### Key Insight

The **conversation ID itself carries the tier information** through its prefix. The backend doesn't need to know user details—it only needs to evaluate flags based on the conversation ID pattern.

---

## Testing Your Flags

### Using LaunchDarkly Dashboard

1. **Navigate to your flag**
2. **Use the "Test" tab**
3. **Enter test contexts:**

#### Test `quick-test-conversation-prefix` Flag

```json
{
  "kind": "user",
  "key": "premium@example.com",
  "email": "premium@example.com",
  "beta": false
}
```

Expected result: `"premium"`

#### Test `quick-test-voice-chat-enabled` Flag

```json
{
  "kind": "conversation",
  "key": "premium_conv_a1b2c3d4"
}
```

Expected result: `true` (with default rules)

```json
{
  "kind": "conversation",
  "key": "conv_x9y8z1a2"
}
```

Expected result: `false`

---

## Advanced Targeting Examples

### Progressive Rollout within Premium Tier

```
Rule: Premium Beta EAP
  - IF key STARTS WITH premium_ AND originally evaluated with beta = true
  - SERVE true
  - Percentage: 25% (gradual rollout)
```

### A/B Testing

```
Rule: A/B Test Voice Feature
  - Target: All premium_conv_* contexts
  - Variation A (Voice ON): 50%
  - Variation B (Voice OFF): 50%
```

### Temporary Feature Access

```
Rule: Limited Time Beta Access
  - IF key STARTS WITH beta_
  - SERVE true
  - Schedule: Enable from Date X to Date Y
```

---

## Flag Management Best Practices

1. **Start with Default Rules**
   - Use simple pattern matching initially
   - Add complex targeting as needed

2. **Use Targeting Rules, Not Code**
   - Leverage LaunchDarkly's targeting UI
   - Avoid hardcoding tier logic in the application

3. **Monitor Flag Evaluations**
   - Use LaunchDarkly's debugger to see evaluations in real-time
   - Check backend logs for evaluation results

4. **Clean Flag Configuration**
   - Remove unused variations
   - Archive deprecated rules
   - Document business logic in flag descriptions

5. **Test Before Production**
   - Use LaunchDarkly's test tab
   - Verify rules with multiple context examples
   - Check both enabled and disabled states

---

## Creating Flags via MCP Server

When you're ready to create the flags, provide your LaunchDarkly project key and the flags can be created automatically using the MCP server integration.

Example command (will be executed when you provide project key):

```
Create flag: quick-test-conversation-prefix
  - Type: multivariate string
  - Variations: beta, test, premium, ""
  - Default: ""
  
Create flag: quick-test-voice-chat-enabled
  - Type: boolean
  - Variations: true, false
  - Default: false
```

---

## Troubleshooting

### Frontend Flag Not Working

- ✅ Verify flag key is exactly `quick-test-conversation-prefix`
- ✅ Ensure flag is toggled ON in LaunchDarkly
- ✅ Check Client-side SDK is enabled for this flag
- ✅ Verify context has correct attributes (email, beta)
- ✅ Check browser console for LaunchDarkly initialization logs

### Backend Flag Not Working

- ✅ Verify flag key is exactly `quick-test-voice-chat-enabled`
- ✅ Check context kind is "conversation" not "user"
- ✅ Ensure conversation ID format is correct (e.g., "premium_conv_abc123")
- ✅ Verify targeting rules match your conversation ID patterns
- ✅ Check backend logs for flag evaluation messages

### Flags Return Default Values

- Check if LaunchDarkly SDK is properly initialized
- Verify SDK keys are correct
- Check network connectivity to LaunchDarkly
- Review targeting rules match your test contexts

---

## Additional Resources

- [LaunchDarkly Flag Types](https://docs.launchdarkly.com/home/flags/variations)
- [Targeting Rules](https://docs.launchdarkly.com/home/flags/targeting-rules)
- [Contexts and Segments](https://docs.launchdarkly.com/home/contexts)
- [Custom Contexts](https://docs.launchdarkly.com/home/contexts/custom-contexts)



