# LaunchDarkly Feature Flag Coordination Demo

A demo application showcasing how to coordinate LaunchDarkly feature flags between frontend and backend systems while maintaining complete data separation.

## 🎯 Overview

This application demonstrates a powerful pattern: **frontend and backend systems coordinating features through LaunchDarkly flags without sharing user data.**

**Key Concept:** The frontend evaluates a user-based flag to generate a tier-prefixed conversation ID (e.g., `premium_conv_abc123`). The backend receives only this ID via HTTP header and evaluates its own flag based on the ID pattern - never seeing the user's email or personal information.

## 🚀 Quick Start

### Prerequisites

- JDK 17 or higher
- Node.js 22.15.0 or higher
- Maven 3.2.5 or higher

### Running the Application

**Backend:**
```bash
./mvnw
```

**Frontend:**
```bash
./npmw start
```

Access the application at [http://localhost:4200](http://localhost:4200)

## 🎯 Two Feature Flags Demonstrated

### FLAG #1: `quick-test-conversation-prefix` (Frontend)
- **Evaluated by:** Frontend LaunchDarkly SDK (client-side)
- **Context:** User (email, beta status)
- **Returns:** Tier prefix string ("premium", "test", "beta", or "")
- **Purpose:** Generates conversation ID with tier embedded in the prefix

### FLAG #2: `quick-test-voice-chat-enabled` (Backend)
- **Evaluated by:** Backend LaunchDarkly SDK (server-side)
- **Context:** Conversation (conversation ID pattern)
- **Returns:** Boolean (true = voice enabled, false = disabled)
- **Purpose:** Determines if voice audio should be included in chat responses

## 📋 Key Features

- **Complete Data Separation**: Backend never sees user email - only conversation ID
- **HTTP Header Pattern**: Conversation ID passed via `X-Conversation-ID` header
- **Automatic Injection**: HTTP interceptor handles header addition
- **Visual Flag Indicators**: UI shows both frontend and backend flag results
- **Clean Architecture**: Each system evaluates its own flags independently

## 🏗️ Architecture Flow

```
1. User Login
   └─> Frontend evaluates FLAG #1 (quick-test-conversation-prefix)
       └─> Returns tier prefix based on user attributes
           └─> Generates conversation ID: "premium_conv_abc123"

2. User Sends Message
   └─> HTTP Interceptor adds X-Conversation-ID header automatically
       └─> Request sent to backend with conversation ID in header
           └─> Backend extracts conversation ID from header

3. Backend Processing
   └─> Backend evaluates FLAG #2 (quick-test-voice-chat-enabled)
       └─> Uses conversation ID as context key
           └─> Returns true/false based on ID pattern
               └─> Conditionally includes voice audio URL

4. Frontend Display
   └─> Shows flag results in UI
       └─> Displays audio visualizer if voice enabled
```

## 📚 Documentation

**Essential docs for your demo:**

- **📖 [DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md)** ⭐ - Complete live demo script with talking points
- **🚩 [FLAGS.md](docs/FLAGS.md)** - Flag configuration and targeting rules
- **⚙️ [SETUP.md](docs/SETUP.md)** - LaunchDarkly setup instructions

## 🛠️ Technology Stack

- **Backend**: Spring Boot 3.4.5, Java 17, PostgreSQL
- **Frontend**: Angular 19, TypeScript, Bootstrap 5
- **Feature Flags**: LaunchDarkly SDK
- **Build Tools**: Maven, npm

## 📦 Building for Production

### Package as JAR
```bash
./mvnw -Pprod clean verify
```

### Run Production Build
```bash
java -jar target/*.jar
```

## 🧪 Testing

### Backend Tests
```bash
./mvnw verify
```

### Frontend Tests
```bash
./npmw test
```

## 🎤 Giving the Demo

See **[docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md)** for a complete 15-20 minute demo presentation including:
- Pre-demo setup checklist
- Step-by-step walkthrough with talking points
- What to show in console, network tab, and logs
- Code file presentation order
- Q&A key points

## 🔗 Resources

- [LaunchDarkly Documentation](https://docs.launchdarkly.com)
- [LaunchDarkly Contexts](https://docs.launchdarkly.com/home/contexts)
- [Feature Flag Best Practices](https://docs.launchdarkly.com/guides/flags/creating-flags)

---

**This is a demonstration application showcasing LaunchDarkly feature flag coordination patterns with privacy-first architecture.**
