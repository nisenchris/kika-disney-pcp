# LaunchDarkly Setup Guide

This guide will help you configure the LaunchDarkly SDK keys for the Disney Demo application.

## Overview

This application demonstrates how LaunchDarkly feature flags coordinate between frontend and backend using conversation IDs as context keys. The demo shows how different user tiers receive different features without the backend needing to know user details.

## Prerequisites

- LaunchDarkly account with a project created
- Access to your project's SDK keys

## Getting Your SDK Keys

### 1. Frontend Client-Side ID

1. Log into [LaunchDarkly](https://app.launchdarkly.com)
2. Navigate to **Account Settings** > **Projects**
3. Select your project
4. Click on **Environments** tab
5. Choose your environment (e.g., "Test" or "Production")
6. Copy the **Client-side ID** (NOT the SDK key)

### 2. Backend Server SDK Key

1. In the same environment view
2. Copy the **SDK key** (this is different from Client-side ID)
3. Keep this secret and never commit it to version control

### 3. Project Key

1. In your project settings
2. Find the **Project key** (usually a short identifier like `default` or `my-project`)

## Configuration Steps

### Frontend Configuration

1. Open `src/main/webapp/environments/environment.development.ts`
2. Replace the empty `ldClientId` with your Client-side ID:

```typescript
export const environment = {
  VERSION: 'DEV',
  DEBUG_INFO_ENABLED: true,
  ldClientId: 'your-client-side-id-here',
};
```

### Backend Configuration

1. Open `src/main/resources/config/application-dev.yml`
2. Add your SDK keys under the `launchdarkly` section:

```yaml
launchdarkly:
  sdk-key: your-server-sdk-key-here
  project-key: your-project-key-here
```

**Important:** Never commit these values to Git. The files are already configured with empty values.

## Required Feature Flags

You need to create two feature flags in your LaunchDarkly project. See `FLAGS.md` for detailed flag configuration.

### Frontend Flag: `quick-test-conversation-prefix`

- **Type:** String (multi-variate)
- **Client-side SDK:** ✅ Enabled (MUST be enabled)
- **Default value:** `""` (empty string)
- **Variations:** `beta`, `test`, `premium`, `""` (empty)

### Backend Flag: `quick-test-voice-chat-enabled`

- **Type:** Boolean
- **Server-side SDK:** ✅ Enabled
- **Default value:** `false`

## Demo Scenarios

Once configured, you can test these scenarios:

### Anonymous User (no login)
- **Behavior:** No prefix in conversationID
- **ConversationID:** `conv_x9y8z1a2`
- **Voice feature:** Disabled
- **Expected:** No voice button, no audio in response

### Beta User
- **Email:** Any email with beta checkbox checked
- **ConversationID:** `beta_conv_x9y8z1a2`
- **Voice feature:** Depends on flag rules
- **Badge:** Gray "BETA"

### Test User
- **Email:** `test@disney.com`
- **ConversationID:** `test_conv_x9y8z1a2`
- **Voice feature:** Enabled (with default rules)
- **Badge:** Blue "TEST"

### Premium User
- **Email:** `premium@example.com`
- **ConversationID:** `premium_conv_x9y8z1a2`
- **Voice feature:** Enabled (with default rules)
- **Badge:** Gold "PREMIUM"

## Running the Application

### Start Backend

```bash
./mvnw spring-boot:run
```

Backend will be available at: `http://localhost:8080`

### Start Frontend

```bash
npm start
```

Frontend will be available at: `http://localhost:4200`

## Verifying the Setup

### 1. Check Backend Logs

Look for these log messages on startup:

```
LaunchDarkly client initialized successfully
```

If you see warnings about missing SDK key, check your configuration.

### 2. Test Flag Evaluation

1. Login with `premium@example.com`
2. Send a message in the chat
3. Check backend logs for:
   ```
   Evaluated voice-chat-enabled flag for conversationID 'premium_conv_xxx': true
   ```

### 3. Check Frontend

1. Verify tier badge appears in navbar
2. Verify conversationID is displayed with prefix highlighted
3. Send a message and check for:
   - Backend flag indicator (green or red badge)
   - Audio player (if flag enabled)

## Troubleshooting

### "LaunchDarkly client not available" Warning

- Verify SDK key is set in `application-dev.yml`
- Check the key is correct and hasn't expired
- Ensure the key is for the correct environment

### Flags Not Working

- Verify flags exist in LaunchDarkly dashboard
- Check flag names match exactly: `conversation-prefix` and `voice-chat-enabled`
- Ensure flags are enabled (toggled on)
- Check targeting rules are set up correctly

### Frontend Can't Connect

- Verify Client-side ID (not SDK key) is used
- Check browser console for LaunchDarkly errors
- Ensure CORS is configured if using custom domain

### Backend Returns Default Values

- Check that `voice-chat-enabled` flag exists
- Verify context kind is set to "conversation"
- Check that targeting rules use the conversation ID as the context key

## Security Notes

- **Never commit SDK keys** to version control
- Use environment variables in production
- Rotate keys if accidentally exposed
- Use different keys for each environment (dev, staging, prod)

## Additional Resources

- [LaunchDarkly Documentation](https://docs.launchdarkly.com/)
- [Java SDK Reference](https://docs.launchdarkly.com/sdk/server-side/java)
- [JavaScript SDK Reference](https://docs.launchdarkly.com/sdk/client-side/javascript)
- [Context Documentation](https://docs.launchdarkly.com/home/contexts)

## Support

For issues related to:
- **Application code:** Check the implementation files
- **LaunchDarkly setup:** Consult LaunchDarkly support
- **Flag configuration:** See `LAUNCHDARKLY_FLAGS.md`



