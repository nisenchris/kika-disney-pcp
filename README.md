# Kika Disney PCP

A JHipster-based chat application demonstrating LaunchDarkly feature flags with context-based targeting patterns.

## 🎯 Overview

This is a proof-of-concept application showcasing how LaunchDarkly feature flags can coordinate between frontend and backend using conversation IDs as context keys. The application demonstrates tier-based feature rollout without requiring the backend to know user details.

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

## 📋 Key Features

- **Chat Interface**: Simple chat UI demonstrating feature flag coordination
- **LaunchDarkly Integration**: 
  - Frontend evaluates user-based flags to determine tier
  - Backend evaluates conversation-based flags for features
  - No user data required by backend
- **Tier System**: Premium, Test, Beta, and Anonymous user tiers
- **Clean Architecture**: Separation of concerns between frontend and backend contexts

## 🏗️ Architecture

```
Frontend (Angular) → Evaluates user flags → Generates conversation ID with tier prefix
                                              ↓
Backend (Spring Boot) → Receives conversation ID → Evaluates conversation flags → Returns features
```

## 📚 Documentation

Detailed documentation has been organized in the `docs/` folder:

- **docs/SETUP.md** - Complete LaunchDarkly setup instructions
- **docs/FLAGS.md** - Flag configuration and targeting rules
- **docs/ARCHITECTURE.md** - Technical implementation details

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

## 📝 Development Notes

This application was generated using JHipster 8.11.0 and customized to demonstrate LaunchDarkly integration patterns. The original authentication system was simplified to a mock login for demo purposes.

## 🔗 Links

- [JHipster Documentation](https://www.jhipster.tech/documentation-archive/v8.11.0)
- [LaunchDarkly Documentation](https://docs.launchdarkly.com)

## 📄 License

UNLICENSED - Internal use only

---

**Note**: This is a demonstration application for understanding LaunchDarkly context-based feature flagging patterns.
