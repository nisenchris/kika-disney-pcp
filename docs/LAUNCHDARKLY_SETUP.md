# 🚀 LaunchDarkly Setup Guide

This guide will walk you through securely configuring LaunchDarkly SDK keys for this application following security best practices.

## 📋 Table of Contents

- [Overview](#overview)
- [Getting Your SDK Keys](#getting-your-sdk-keys)
- [Local Development Setup](#local-development-setup)
- [Production Setup](#production-setup)
- [Verifying Your Setup](#verifying-your-setup)
- [Troubleshooting](#troubleshooting)
- [Security Best Practices](#security-best-practices)

---

## 🎯 Overview

This application uses **two different types** of LaunchDarkly keys:

1. **Server SDK Key** (Backend) - Used by the Java/Spring Boot backend
   - ⚠️ **KEEP SECRET** - Never expose to clients or commit to version control
   - Used for server-side flag evaluation

2. **Client-side ID** (Frontend) - Used by the Angular frontend
   - ✅ Safe to expose in browser - This is public by design
   - Used for client-side flag evaluation

**Important:** These are stored as **environment variables**, not hardcoded in configuration files.

---

## 🔑 Getting Your SDK Keys

### Step 1: Log into LaunchDarkly

1. Go to [https://app.launchdarkly.com](https://app.launchdarkly.com)
2. Sign in to your account

### Step 2: Navigate to Your Project

1. Click on **Account Settings** (bottom left, gear icon)
2. Select **Projects** from the left menu
3. Click on your project (or create a new one if needed)

### Step 3: Get Your Keys

For each environment (e.g., "Test", "Production"):

1. Click on the **environment name** (e.g., "Test")
2. You'll see two important values:
   - **SDK Key**: Starts with `sdk-...` (for backend)
   - **Client-side ID**: A long alphanumeric string (for frontend)

3. Copy both values - you'll need them in the next step

**Note:** The **Project Key** can be found in the Project Settings (optional, used for some admin operations)

---

## 💻 Local Development Setup

### Method 1: Using .env.local File (Recommended)

This is the easiest method for local development.

#### Step 1: Create Your Environment File

1. Copy the example file to create your local environment file:

```bash
cp env.example .env.local
```

#### Step 2: Edit .env.local

Open `.env.local` and replace the placeholder values with your actual keys:

```bash
# Backend - Server SDK Key
LD_SDK_KEY=sdk-fb434e2c-4276-4c65-a0ff-070908ca1a06

# Backend - Project Key (optional)
LD_PROJECT_KEY=your-project-key

# Frontend - Client-side ID
LD_CLIENT_ID=6762fbcfa4b5f40d3c4fe21b
```

**Important:** Never commit `.env.local` to Git! It's already in `.gitignore`.

#### Step 3: Load Environment Variables

**For Backend (Terminal 1):**

```bash
# Load environment variables and start backend
source ./load-env.sh
./mvnw spring-boot:run -Dmaven.test.skip=true
```

**For Frontend (Terminal 2):**

```bash
# Load environment variables and start frontend
source ./load-env.sh
./npmw start
```

### Method 2: Export Environment Variables Directly

Alternatively, you can export the variables directly in your terminal:

**For Backend:**

```bash
export LD_SDK_KEY="sdk-your-key-here"
export LD_PROJECT_KEY="your-project-key"
./mvnw spring-boot:run -Dmaven.test.skip=true
```

**For Frontend:**

```bash
export LD_CLIENT_ID="your-client-id-here"
./npmw start
```

### Method 3: IDE Configuration

Most IDEs allow you to set environment variables in run configurations:

**IntelliJ IDEA:**
1. Edit Run Configuration
2. Add Environment Variables:
   - `LD_SDK_KEY=sdk-your-key-here`
   - `LD_CLIENT_ID=your-client-id-here`

**VS Code:**
1. Edit `.vscode/launch.json`
2. Add `env` section to your configuration:

```json
{
  "configurations": [{
    "env": {
      "LD_SDK_KEY": "sdk-your-key-here",
      "LD_CLIENT_ID": "your-client-id-here"
    }
  }]
}
```

---

## 🏭 Production Setup

In production, **NEVER use .env files**. Instead, set environment variables through your deployment platform.

### Docker

```dockerfile
# Dockerfile
ENV LD_SDK_KEY=${LD_SDK_KEY}
ENV LD_CLIENT_ID=${LD_CLIENT_ID}
```

```bash
# Running the container
docker run -e LD_SDK_KEY="sdk-your-key" -e LD_CLIENT_ID="your-id" your-app
```

### Kubernetes

```yaml
# deployment.yaml
apiVersion: v1
kind: Secret
metadata:
  name: launchdarkly-secrets
type: Opaque
stringData:
  LD_SDK_KEY: sdk-your-key-here
---
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      containers:
      - name: app
        envFrom:
        - secretRef:
            name: launchdarkly-secrets
        env:
        - name: LD_CLIENT_ID
          value: "your-client-id"
```

### Heroku

```bash
heroku config:set LD_SDK_KEY="sdk-your-key"
heroku config:set LD_CLIENT_ID="your-client-id"
```

### AWS

- **Elastic Beanstalk**: Set in Environment Properties
- **ECS**: Set in Task Definition environment variables
- **Lambda**: Set in Function Environment Variables or use AWS Secrets Manager

### Other Platforms

- **Azure App Service**: Application Settings
- **Google Cloud Run**: Environment variables in service configuration
- **Netlify/Vercel**: Environment variables in project settings

---

## ✅ Verifying Your Setup

### Backend Verification

1. Start the backend:
```bash
source ./load-env.sh
./mvnw spring-boot:run -Dmaven.test.skip=true
```

2. You should see the helper script output:
```
Loading environment variables from .env.local...
✅ Environment variables loaded:
   LD_SDK_KEY: sdk-508b0ff4-c8f9-4c... (40 chars)
   LD_CLIENT_ID: 690bd2c45c18d909be87... (24 chars)
   LD_PROJECT_KEY: app-team-pcp-conversation-bridge
```

3. Then look for this log message:
```
✅ LaunchDarkly client initialized successfully
```

4. If you see this warning instead, your SDK key isn't set correctly:
```
⚠️ LaunchDarkly SDK key not configured. Feature flags will use default values.
```

### Frontend Verification

1. Start the frontend:
```bash
source ./load-env.sh
./npmw start
```

2. You should see the helper script output confirming variables are loaded

3. Open browser console at [http://localhost:4200](http://localhost:4200)

4. After logging in, look for:
```
🚀 Initializing LaunchDarkly with user context: { email: "...", beta: ... }
✅ Flag evaluated: conversationid-prefix = ...
```

5. If you see this warning, your Client-side ID isn't set:
```
⚠️ LaunchDarkly client ID not configured. Using default (no prefix).
```

---

## 🔧 Troubleshooting

### "LaunchDarkly client not initialized" Warning

**Cause:** Environment variable not set or not loaded

**Solutions:**

1. **Verify environment variable is set:**
```bash
echo $LD_SDK_KEY      # Should output: sdk-...
echo $LD_CLIENT_ID    # Should output: your-client-id
```

2. **Make sure you exported variables before starting the app:**
```bash
export $(cat .env.local | xargs)
```

3. **Verify .env.local file exists and has correct values:**
```bash
cat .env.local
```

### Environment Variables Not Loaded

**Symptom:** Empty values when echoing variables

**Solution:** Make sure to use the helper script in the **same terminal session** where you start the app:

```bash
# In the SAME terminal:
source ./load-env.sh
./mvnw spring-boot:run -Dmaven.test.skip=true  # or ./npmw start
```

### Keys Not Working

1. **Verify key format:**
   - Server SDK Key should start with `sdk-`
   - Client-side ID is just alphanumeric (no prefix)

2. **Check environment in LaunchDarkly:**
   - Make sure you're using keys from the correct environment (Test, Production, etc.)

3. **Verify flags exist:**
   - Make sure the flags `conversationid-prefix` and `voice-chat-enabled` exist in your LaunchDarkly project
   - See [FLAGS.md](FLAGS.md) for flag configuration details

### Frontend Not Receiving Flags

**Common issues:**

1. **Wrong key type used:** Frontend needs **Client-side ID**, not SDK Key
2. **Build not picking up environment variable:** 
   - Make sure to export `LD_CLIENT_ID` before running `npm start`
   - Restart the dev server after setting the variable
3. **Flag not toggled ON:** Check LaunchDarkly dashboard

---

## 🔒 Security Best Practices

### ✅ DO:

- ✅ Use environment variables for all keys
- ✅ Keep `.env.local` in `.gitignore`
- ✅ Use different keys for each environment (dev, staging, prod)
- ✅ Rotate keys periodically (especially if compromised)
- ✅ Use secrets management in production (AWS Secrets Manager, Azure Key Vault, etc.)
- ✅ Limit permissions of SDK keys in LaunchDarkly to minimum required

### ❌ DON'T:

- ❌ Commit `.env.local` or any file with actual keys to Git
- ❌ Hardcode keys in source files
- ❌ Share SDK keys in chat, email, or documentation
- ❌ Use production keys in development
- ❌ Store keys in plain text files in production
- ❌ Expose Server SDK Keys to the frontend/browser

### If Keys Are Compromised

1. **Immediately rotate the keys** in LaunchDarkly:
   - Go to your environment settings
   - Click "Reset SDK Key" or "Reset Client-side ID"
   
2. **Update all deployments** with new keys

3. **Review access logs** in LaunchDarkly to check for unauthorized usage

---

## 📚 Additional Resources

- [LaunchDarkly Documentation](https://docs.launchdarkly.com/)
- [Java SDK Reference](https://docs.launchdarkly.com/sdk/server-side/java)
- [JavaScript SDK Reference](https://docs.launchdarkly.com/sdk/client-side/javascript)
- [Security Best Practices](https://docs.launchdarkly.com/home/security)

---

## 🆘 Need Help?

- **Setup Issues:** See [SETUP.md](SETUP.md)
- **Flag Configuration:** See [FLAGS.md](FLAGS.md)
- **LaunchDarkly Support:** [support@launchdarkly.com](mailto:support@launchdarkly.com)

