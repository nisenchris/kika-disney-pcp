# LaunchDarkly Prefix Coordination Demo

A JHipster-based chat application demonstrating how LaunchDarkly feature flags coordinate between frontend and backend using conversation IDs as context keys.

## 🎯 What This Demo Shows

This demo illustrates a powerful LaunchDarkly pattern:
- **Frontend evaluates** user-based flags to determine tier
- **Tier information travels** via conversation ID prefix
- **Backend evaluates** conversation-based flags for features
- **No user data needed** by backend - only the conversation ID

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND (Angular)                                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 1. User Login: email + beta checkbox                   │ │
│  │ 2. LaunchDarkly evaluates: conversation-prefix flag    │ │
│  │ 3. Generate conversationID: {prefix}_conv_{nanoid}     │ │
│  │    Examples:                                           │ │
│  │    - premium_conv_a1b2c3d4                            │ │
│  │    - test_conv_x9y8z1a2                              │ │
│  │    - conv_m5n6o7p8 (no prefix = anonymous)           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ POST /api/chat/message
                            │ { conversationID, message }
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  BACKEND (Spring Boot)                                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 1. Receive conversationID (just a string)             │ │
│  │ 2. Create LD context: kind="conversation"             │ │
│  │                      key=conversationID                │ │
│  │ 3. Evaluate: voice-chat-enabled flag                  │ │
│  │ 4. Response includes:                                 │ │
│  │    - textResponse (always)                            │ │
│  │    - voiceAudioUrl (if flag=true, else null)         │ │
│  │    - backendFlagResult (for visual indicator)        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## ✅ Implementation Complete

All code has been implemented:

### Frontend (Angular)
- ✅ Mock login with email + beta checkbox
- ✅ LaunchDarkly service (user context, conversation ID generation)
- ✅ Chat component with visual flag indicators
- ✅ Navbar with tier badges
- ✅ Professional Disney-style UI

### Backend (Spring Boot)
- ✅ LaunchDarkly configuration & service
- ✅ Chat REST controller
- ✅ DTOs (ChatRequest, ChatResponse)
- ✅ Comprehensive logging

### Documentation
- ✅ `LAUNCHDARKLY_SETUP.md` - SDK key configuration guide
- ✅ `LAUNCHDARKLY_FLAGS.md` - Flag creation & targeting rules
- ✅ Environment example files

## 🚀 Next Steps

### 1. Configure LaunchDarkly SDK Keys

Follow `LAUNCHDARKLY_SETUP.md` to:
- Get your Client-side ID and Server SDK key
- Update `environment.development.ts`
- Update `application-dev.yml`

### 2. Create Feature Flags

**Option A: Manual Creation**
- Follow instructions in `LAUNCHDARKLY_FLAGS.md`
- Create flags via LaunchDarkly web interface

**Option B: MCP Server (Recommended)**
- Provide your LaunchDarkly project key
- Flags will be created automatically via MCP

Required flags:
- `conversation-prefix` (string, client-side)
- `voice-chat-enabled` (boolean, server-side)

### 3. Run the Application

**Backend:**
```bash
./mvnw spring-boot:run
```

**Frontend:**
```bash
npm start
```

**Access:** http://localhost:4200

## 🎭 Demo Scenarios

### Scenario 1: Anonymous User
- Don't login or logout
- ConversationID: `conv_x9y8z1a2`
- Backend flag: ❌ Voice disabled
- No tier badge

### Scenario 2: Beta User
- Email: `beta@example.com` + beta checkbox
- ConversationID: `beta_conv_a1b2c3d4`
- Tier badge: Gray "BETA"
- Backend flag: Depends on rules

### Scenario 3: Test User (Disney Internal)
- Email: `test@disney.com`
- ConversationID: `test_conv_x9y8z1a2`
- Tier badge: Blue "TEST"
- Backend flag: ✅ Voice enabled (with default rules)

### Scenario 4: Premium User
- Email: `premium@example.com`
- ConversationID: `premium_conv_m5n6o7p8`
- Tier badge: Gold "PREMIUM"
- Backend flag: ✅ Voice enabled (with default rules)

## 🔍 Visual Indicators

The UI clearly shows the coordination:

1. **Navbar**
   - Email address
   - Tier badge (color-coded by tier)

2. **Chat Sidebar**
   - Full conversation ID with prefix highlighted
   - Beta attribute status

3. **Chat Messages**
   - Backend flag badge: Green "Voice ✓" or Red "Voice ✗"
   - Audio player (when voice enabled)
   - Timestamp

## 📁 Key Files

### Frontend
- `src/main/webapp/app/services/launchdarkly.service.ts`
- `src/main/webapp/app/services/chat-api.service.ts`
- `src/main/webapp/app/login/login.component.ts`
- `src/main/webapp/app/chat/chat.component.ts`
- `src/main/webapp/app/layouts/navbar/navbar.component.ts`

### Backend
- `src/main/java/com/mycompany/myapp/config/LaunchDarklyConfig.java`
- `src/main/java/com/mycompany/myapp/service/LaunchDarklyService.java`
- `src/main/java/com/mycompany/myapp/web/rest/ChatController.java`
- `src/main/java/com/mycompany/myapp/web/rest/dto/ChatRequest.java`
- `src/main/java/com/mycompany/myapp/web/rest/dto/ChatResponse.java`

### Configuration
- `src/main/webapp/environments/environment.development.ts`
- `src/main/resources/config/application-dev.yml`

## 🎓 Learning Points

### 1. Context Types
- Frontend uses **user context** (email, beta)
- Backend uses **conversation context** (conversationID only)
- Contexts are isolated - backend doesn't see user data

### 2. Prefix Strategy
- Tier information encoded in conversation ID
- Pattern matching enables powerful targeting
- No PII needed in backend evaluations

### 3. Flag Coordination
- Multiple flags work together seamlessly
- Frontend controls UI elements
- Backend controls data/features
- Visual indicators prove synchronization

### 4. Default Behavior
- Graceful fallback when SDK not configured
- Default logic based on prefix patterns
- Application works in demo mode without LaunchDarkly

## 🛠️ Customization

### Adding New Tiers

1. Update `conversation-prefix` flag variations
2. Add targeting rules in LaunchDarkly
3. Update tier badge styling in navbar component
4. Update backend targeting rules

### Adding New Features

1. Create new feature flag (client or server)
2. Evaluate in appropriate service
3. Add UI indicators
4. Update documentation

## 📚 Additional Documentation

- `LAUNCHDARKLY_SETUP.md` - Detailed SDK configuration
- `LAUNCHDARKLY_FLAGS.md` - Flag creation and targeting
- `LAUNCHDARKLY_FLAGS.md` - Advanced targeting examples

## 🤝 Support

For questions about:
- **Implementation:** Review key files and documentation
- **LaunchDarkly:** See official docs or support
- **JHipster:** See JHipster documentation

## 📝 Notes

- Uses `nanoid` for short, unique conversation IDs
- Removed original JHipster authentication for simplicity
- Mock audio URL used for demo (https://www.soundhelix.com/)
- All styling uses Bootstrap 5 + custom gradients
- Backend logs all flag evaluations for debugging

---

**Ready for your Disney demo!** 🎬

Just configure the SDK keys and create the flags, then you're all set to demonstrate LaunchDarkly's powerful context-based feature flagging.

