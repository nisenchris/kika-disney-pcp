# 🎯 Live Demo Script: LaunchDarkly Flag Coordination

## Demo Overview

This demo showcases **frontend/backend feature flag coordination** using LaunchDarkly with **complete data separation**.

**Key Points:**
- Frontend and backend are COMPLETELY separate
- Backend NEVER sees user email or personal data
- Only a conversation ID is passed between systems
- Two feature flags coordinate to deliver personalized experiences

**Demo Flow:**
1. **App Demo:** Show standard user → internal tester (@disney.com) experiences
2. **LaunchDarkly Dashboard:** Show flags and ADD beta/EAP targeting LIVE
3. **App Demo:** Show premium beta user experience with new rules
4. **Code Walkthrough:** Brief look at implementation (3 min)

---

## 🎬 Pre-Demo Setup

### 1. Open These Tabs/Windows

- **Browser Tab 1:** Application login page (`http://localhost:8080`)
- **Browser Tab 2:** Browser DevTools (F12) - Console tab open
- **Browser Tab 3:** Browser DevTools - Network tab ready
- **Terminal/IDE:** Backend logs visible
- **LaunchDarkly Dashboard:** Your project with the two flags visible

### 2. Initial LaunchDarkly Flag Configuration

Ensure these flags are configured BEFORE the demo:

**Flag #1: `quick-test-conversation-prefix`**
- Type: String (multivariate)
- Client-side SDK: ✅ Enabled
- Variations: `premium`, `test`, `beta`, `""` (empty)
- **Initial targeting rules:**
  - Rule 1: If email starts with `premium` → serve `premium`
  - Rule 2: If email ends with `@disney.com` → serve `test`
  - Default: serve `""` (empty)

**Flag #2: `quick-test-voice-chat-enabled`**
- Type: Boolean
- Server-side only
- **Initial targeting rules:**
  - Rule 1: If conversation ID starts with `premium_` → serve `true`
  - Rule 2: If conversation ID starts with `test_` → serve `true`
  - Default: serve `false`

---

## 🎤 Demo Script

### Part 0: Hook (30 seconds)

**Problem Statement:**

> "Imagine you're Disney. You want to test new voice features in production with internal testers before rolling out to millions of park guests. How do you do this safely, without maintaining separate environments, and without the backend knowing who's who?
>
> Today I'll show you how to solve this with LaunchDarkly using a pattern that maintains complete privacy separation between frontend and backend."

**Show:**
- The login page
- Point out the simple interface: email and beta checkbox

---

### Part 1: App Demo - Standard User (2 minutes)

**Say:**

> "Let's start with a standard guest experience - no special access."

**Do:**
1. Ensure Console tab is visible
2. Enter email: `user@example.com`
3. Keep beta checkbox **unchecked**
4. Click "Continue"

**Point out in Console:**
```
🚀 Initializing LaunchDarkly with user context: { email: "user@example.com", beta: false }
✅ Flag evaluated: quick-test-conversation-prefix = (empty)
📋 Generated conversation ID: conv_xyz78901
```

**Say:**

> "Notice the conversation ID has no prefix - just 'conv_' followed by a unique ID. This is our baseline guest experience."

**Show in UI:**
- Sidebar: Tier badge shows "NO PREFIX" (gray)
- Conversation ID: `conv_xyz78901`

**Do:**
1. Type message: "Hello, testing the demo"
2. Click Send
3. Open Network tab
4. Click on `/api/chat/message` request
5. Show Request Headers: `X-Conversation-ID: conv_xyz78901`
6. Show Request Payload: only has `{ "message": "..." }`

**Point out in Response:**
- No audio visualizer
- Sidebar shows: Backend Voice: ❌ Disabled

**Say:**

> "Standard guests don't get the voice feature. The conversation ID was passed via HTTP header - notice the request body only contains business data, not the conversation ID."

---

### Part 2: App Demo - Internal Tester (@disney.com) (3 minutes)

**Say:**

> "Now let's see what happens with an internal Disney tester account."

**Do:**
1. Log out
2. Login with: `tester@disney.com`
3. Keep beta checkbox **unchecked**
4. Click "Continue"

**Point out in Console:**
```
🚀 Initializing LaunchDarkly with user context: { email: "tester@disney.com", beta: false }
✅ Flag evaluated: quick-test-conversation-prefix = test
📋 Generated conversation ID: test_conv_abc456
```

**Say:**

> "See the difference? Now we have a 'test_' prefix because the email ends with @disney.com. The LaunchDarkly targeting rule detected this and returned 'test' as the prefix."

**Show in UI:**
- Sidebar: Tier badge shows "TEST" (blue)
- Conversation ID: `test_conv_abc456`

**Do:**
1. Type message: "Testing internal features"
2. Click Send
3. Show Network tab: `X-Conversation-ID: test_conv_abc456`

**Show in Backend Logs:**
```
📨 Received chat message
📋 Conversation ID from header: test_conv_abc456
✅ Flag evaluated: quick-test-voice-chat-enabled for conversationID 'test_conv_abc456' = true
📤 Sending response - Voice enabled: true - Audio URL: included
```

**Point out in Response:**
- Audio visualizer now appears! 🎵
- Sidebar shows: Backend Voice: ✅ Enabled

**Say:**

> "Same backend code, but different experience! The backend never saw the email - only the conversation ID pattern. It evaluated the flag and said 'test_ prefix = voice enabled'.
>
> This is how Disney can test features in production with internal accounts before rolling to guests."

**KEY PRIVACY POINT:**

> "The backend NEVER sees that this is tester@disney.com - it only sees 'test_conv_abc456'. Complete privacy separation."

---

### Part 3: LaunchDarkly Dashboard - Show Existing Flags (3 minutes)

**Say:**

> "Let's look at how this works in LaunchDarkly. The beauty here is that I can change these rules without deploying any code."

#### 3.1 Frontend Flag

**Do:**
1. Open `quick-test-conversation-prefix` flag in LaunchDarkly
2. Show **Variations:** `premium`, `test`, `beta`, `""` (empty)
3. Show **Targeting Rules:**
   - Rule 1: "If email starts with `premium`" → serve `premium`
   - Rule 2: "If email ends with `@disney.com`" → serve `test`
   - Default: serve `""` (empty)

**Say:**

> "The first flag evaluates user attributes - email and beta status - and returns a tier prefix. This is a client-side flag evaluated in the browser."

#### 3.2 Backend Flag

**Do:**
1. Open `quick-test-voice-chat-enabled` flag
2. Show **Targeting Rules:**
   - Rule 1: "If key starts with `premium_`" → serve `true`
   - Rule 2: "If key starts with `test_`" → serve `true`
   - Default: serve `false`

**Say:**

> "The second flag evaluates conversation ID patterns - server-side only. Notice it uses the context kind 'conversation', not 'user'. The backend reads the prefix from the conversation ID to determine features.
>
> Two flags coordinating - frontend generates the prefix, backend reads it. Neither system needs to know about the other's implementation."

#### 3.3 Personalization Talking Point

**Say:**

> "This pattern isn't just for feature flags - it's powerful for personalization too. For example, imagine Disney knows a guest's party size when they visit the park. You could create rules like:
> - If party size less than 2 → serve 'Small' prefix
> - If party size 2 to 6 → serve 'Medium' prefix  
> - If party size greater than 6 → serve 'Large' prefix
>
> Then your voice recommendation engine could tailor suggestions based on party size - all without the backend knowing any personal details. Small parties get different restaurant recommendations than large groups, all based on that prefix pattern."

**Security Mention:**

> "And for sensitive use cases, you could use unguessable prefixes like 'b7x9k_' instead of 'beta_' for security through obscurity."

---

### Part 4: LaunchDarkly Dashboard - ADD Beta/EAP LIVE (4 minutes)

**Say:**

> "Now let's add a beta program for our premium users who sign up for early access. I'm going to do this live - no code deployment needed."

#### 4.1 Edit Frontend Flag

**Do:**
1. Edit `quick-test-conversation-prefix` flag
2. Click "Add rule" ABOVE the existing `premium` rule
3. Configure:
   - **Name:** "Premium Beta / Early Access Program"
   - **Condition 1:** "If email starts with `premium`"
   - **AND Condition 2:** "If beta attribute equals `true`"
   - **Serve:** `beta`
4. Save changes

**Say:**

> "This rule will catch premium users who've opted into our Early Access Program via the beta checkbox. These users get the beta prefix, which gives them access to experimental features first.
>
> Notice I placed this ABOVE the regular premium rule - rule priority matters in LaunchDarkly!"

#### 4.2 Edit Backend Flag

**Do:**
1. Edit `quick-test-voice-chat-enabled` flag
2. Click "Add rule" at the top
3. Configure:
   - **Name:** "Beta/EAP Voice Access"
   - **Condition:** "If key starts with `beta_`"
   - **Serve:** `true`
4. Save changes

**Say:**

> "Now the backend will enable voice for any conversation ID starting with 'beta_'. The two flags are now coordinated for our new beta program."

**Result:**

> "We just created a beta/early access program across frontend and backend - in under 2 minutes, no code deployment. Let's see it in action."

---

### Part 5: App Demo - Premium Beta User (3 minutes)

**Say:**

> "Now let's log in as a premium user who's opted into the Early Access Program."

**Do:**
1. Refresh the app (to pick up the new flag rules)
2. Log out if needed
3. Login with: `premium@example.com`
4. **Check the beta checkbox** ✅
5. Click "Continue"

**Point out in Console:**
```
🚀 Initializing LaunchDarkly with user context: { email: "premium@example.com", beta: true }
✅ Flag evaluated: quick-test-conversation-prefix = beta
📋 Generated conversation ID: beta_conv_xyz789
```

**Say:**

> "Perfect! Even though the email starts with 'premium', the beta attribute is true, so our new rule kicked in first and returned 'beta' prefix. This user is in our Early Access Program."

**Show in UI:**
- Sidebar: Tier badge shows "BETA" (different color)
- Conversation ID: `beta_conv_xyz789`

**Do:**
1. Send a message
2. Show audio visualizer appears
3. Show Backend Voice: ✅ Enabled

**Show in Backend Logs:**
```
📋 Conversation ID from header: beta_conv_xyz789
✅ Flag evaluated: quick-test-voice-chat-enabled for conversationID 'beta_conv_xyz789' = true
```

**Say:**

> "Multi-attribute targeting in action! We're targeting based on:
> - Email pattern (premium users)
> - AND beta checkbox (EAP signup)
>
> This gives us sophisticated segmentation: Standard guests → Internal testers → Premium users → Premium beta users. All without deploying code."

---

### Part 6: Privacy & Architecture Benefits (2 minutes)

**Say:**

> "Let me summarize why this architecture is powerful for organizations like Disney or any enterprise with strict privacy requirements:
>
> **Complete Separation:**
> - Frontend evaluates flags based on user attributes (email, beta status)
> - Backend evaluates flags based on conversation ID pattern
> - Backend NEVER sees user email or PII
>
> **Standard HTTP Patterns:**
> - Conversation ID passed as header (like Authorization tokens)
> - Automatic injection via HTTP interceptor
> - Clean request bodies with only business data
>
> **LaunchDarkly Coordination:**
> - Frontend flag generates the tier prefix
> - Backend flag reads the prefix to determine features
> - Both flags can be updated independently without code changes
> - Full audit trail and flag evaluation history in LaunchDarkly
>
> **Scalability:**
> - Same pattern works for ANY number of services
> - Each service evaluates its own flags based on conversation ID
> - No shared user database needed
> - Perfect for microservices architecture"

---

## 🔍 Code Walkthrough (3 minutes - KEEP BRIEF!)

**Say:**

> "Let me quickly show you how this works under the hood. I'll keep this brief - just the key integration points."

### File 1: Frontend Flag Evaluation (45 seconds)

**File:** `src/main/webapp/app/services/launchdarkly.service.ts`

**Show lines 69-75:**
```typescript
// 🎯 FLAG #1: Evaluate 'quick-test-conversation-prefix'
const prefix = this.ldClient.variation('quick-test-conversation-prefix', '');
const conversationId = this.generateConversationId(prefix);
```

**Say:**

> "Frontend evaluates the user context and gets back a tier prefix. Then generates the conversation ID with that prefix embedded."

---

### File 2: HTTP Interceptor (45 seconds)

**File:** `src/main/webapp/app/interceptors/conversation-id.interceptor.ts`

**Show lines 30-40:**
```typescript
const clonedRequest = req.clone({
  setHeaders: {
    'X-Conversation-ID': userContext.conversationId,
  },
});
```

**Say:**

> "This interceptor runs on every HTTP request and automatically adds the X-Conversation-ID header. Developers never have to remember to add it manually - it's automatic."

---

### File 3: Backend Flag Evaluation (45 seconds)

**File:** `src/main/java/com/mycompany/myapp/service/LaunchDarklyService.java`

**Show lines 60-65:**
```java
// Create LaunchDarkly context with "conversation" kind
LDContext context = LDContext.builder(conversationID)
    .kind("conversation")  // Important: NOT "user"
    .build();

// 🎯 FLAG #2: Evaluate 'quick-test-voice-chat-enabled'
boolean flagValue = ldClient.boolVariation(VOICE_CHAT_FLAG, context, false);
```

**Say:**

> "Backend creates a LaunchDarkly context of kind 'conversation' - not 'user' - using the conversation ID as the key. It evaluates the flag based on the ID pattern, never seeing the email."

---

### File 4: Controller (45 seconds)

**File:** `src/main/java/com/mycompany/myapp/web/rest/ChatController.java`

**Show line 49 and 80:**
```java
@RequestHeader(value = "X-Conversation-ID", required = false) String conversationID

// Later...
boolean voiceEnabled = launchDarklyService.evaluateVoiceChat(conversationID);
String voiceAudioUrl = voiceEnabled ? MOCK_AUDIO_URL : null;
```

**Say:**

> "Backend extracts the conversation ID from the header using Spring's @RequestHeader annotation. Based on the flag result, it conditionally includes the voice audio URL in the response.
>
> Clean separation - each system evaluates its own flags independently."

---

## 🎯 Key Talking Points Summary

Use these for Q&A or emphasis:

### Privacy & Compliance
- "Backend never sees user email - only a conversation ID"
- "Perfect for GDPR, CCPA, or any privacy-sensitive environment"
- "Frontend and backend can be managed by different teams with different data access levels"

### Developer Experience
- "HTTP interceptor automatically adds the conversation ID - developers can't forget it"
- "Clean request bodies with only business data"
- "Standard pattern that's easy to understand and maintain"

### LaunchDarkly Power
- "Two flags coordinate without direct communication between systems"
- "Change targeting rules without deploying code"
- "Full audit trail of every flag evaluation"
- "Can do progressive rollouts, A/B tests, scheduled releases"

### Architecture
- "Scalable to any number of services"
- "Works perfectly with microservices"
- "Conversation ID is the only shared context"
- "Each service evaluates its own flags independently"

---

## 📋 Demo Checklist

Before starting the demo:

- [ ] Backend is running and logs are visible (INFO level)
- [ ] Frontend is built and accessible at http://localhost:8080
- [ ] LaunchDarkly flags are configured with INITIAL targeting rules (see Pre-Demo Setup)
- [ ] Browser DevTools are ready (Console + Network tabs)
- [ ] Test emails ready:
  - [ ] `user@example.com` (standard user)
  - [ ] `tester@disney.com` (internal tester)
  - [ ] `premium@example.com` (premium user for beta demo)
- [ ] LaunchDarkly dashboard open in a browser tab with edit permissions
- [ ] This script is printed or on a second monitor
- [ ] Practice the beta rule addition (Part 4) - it's your big moment!

---

## ⚠️ Common Demo Gotchas

### Issue: Flag returns default value
- **Check:** Is the flag toggled ON in LaunchDarkly?
- **Check:** Are the targeting rules configured correctly?
- **Check:** Is the SDK key valid?

### Issue: Backend doesn't receive conversation ID
- **Check:** Is the HTTP interceptor registered?
- **Check:** Are you logged in? (No context = no header)
- **Check:** Network tab - is the header present?

### Issue: Console logs not showing
- **Check:** Browser console filter settings
- **Check:** Log level in backend (should be INFO or DEBUG)

---

## 🎬 Closing (1 minute)

**Say:**

> "Let me summarize what we've demonstrated today:
>
> **What we built:**
> - Frontend/backend feature coordination using LaunchDarkly
> - Complete privacy separation - backend never sees user email
> - Multi-attribute targeting for sophisticated segmentation
> - We added a beta/early access program LIVE in under 2 minutes
>
> **Real-world use cases:**
> - Testing in production with internal accounts (@disney.com)
> - Beta/early access programs for premium users
> - Tier-based feature access (free/premium)
> - Personalization (like party size example for recommendations)
> - Regional rollouts
> - A/B testing with backend coordination
>
> **The power of this pattern:**
> - Scales to ANY number of microservices
> - Each service evaluates its own flags independently
> - Conversation ID is the only shared context
> - No shared user database needed
> - Change targeting rules without code deployment
> - Full audit trail in LaunchDarkly
>
> The key insight: The conversation ID is a privacy-safe identifier that carries just enough context to make intelligent decisions, without exposing sensitive information."

**Questions?**

---

## 📚 Resources to Share

After the demo, share these with the audience:

- **Flag Configuration Guide:** `docs/FLAGS.md` - Detailed flag setup
- **Setup Instructions:** `docs/SETUP.md` - How to configure LaunchDarkly SDK keys
- **Code Repository:** [Your GitHub URL]
- **LaunchDarkly Docs:** [https://docs.launchdarkly.com/home/contexts](https://docs.launchdarkly.com/home/contexts)

---

## ⏱️ Time Breakdown

- Part 0: Hook (0.5 min)
- Part 1: Standard user demo (2 min)
- Part 2: Internal tester demo (3 min)
- Part 3: LD dashboard - existing flags (3 min)
- Part 4: LD dashboard - add beta/EAP LIVE (4 min)
- Part 5: Premium beta user demo (3 min)
- Part 6: Privacy & architecture benefits (2 min)
- Code walkthrough (3 min - optional)
- Closing (1 min)

**Total: ~18-21 minutes**

---

**Good luck with your demo! 🚀**

