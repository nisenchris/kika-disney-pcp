# Audio Visualizer Feature

## Overview

The audio visualizer replaces the basic HTML audio controls with a ChatGPT-style animated icon that pulses in sync with audio playback using the Web Audio API.

## Implementation

### Components Created

1. **AudioVisualizerComponent** (`src/main/webapp/app/chat/audio-visualizer/`)
   - TypeScript component with Web Audio API integration
   - SVG-based circular visualization with pulse rings
   - Real-time amplitude analysis driving animation
   - Play/pause toggle functionality

### Key Features

- **Real-time Audio Analysis**: Uses Web Audio API's `AnalyserNode` to analyze audio frequency data
- **Animated Pulse Rings**: 3 concentric rings that scale and fade based on audio amplitude
- **Smooth Transitions**: CSS transitions and requestAnimationFrame for fluid animations
- **Click to Play/Pause**: Simple interaction model with visual feedback
- **Theme Support**: Adapts to light/dark themes automatically

## How It Works

### Web Audio API Pipeline

```
Audio Element → MediaElementSource → AnalyserNode → Audio Destination
                                            ↓
                                    Frequency Data (FFT)
                                            ↓
                                    Calculate Amplitude
                                            ↓
                                    Drive SVG Animation
```

### Animation Details

- **FFT Size**: 256 (provides 128 frequency bins)
- **Update Loop**: `requestAnimationFrame` for 60fps updates
- **Smoothing**: Amplitude values are smoothed with 70/30 weighting to prevent jitter
- **Ring Scales**: Each ring scales proportionally based on:
  - Base scale: 1 + (ringIndex × 0.15)
  - Amplitude boost: amplitude × (0.3 + ringIndex × 0.1)

## LaunchDarkly Integration

The visualizer **respects the existing LaunchDarkly flag setup**:

- **Backend Flag**: `voice-chat-enabled` (no changes needed)
- **Condition**: The visualizer only appears when `msg.voiceAudioUrl` is present
- **Behavior**: When the flag is disabled, users see the "Voice upgrade not active" message

This is purely a **UI enhancement** - no changes to flag configuration or evaluation logic are required.

## Demo Audio

The backend uses a placeholder audio URL for demonstration. To use Mickey Mouse audio:

### Option 1: Public Domain Audio
Search the Internet Archive for public domain Disney audio:
- Visit https://archive.org
- Search for "Mickey Mouse public domain"
- Download and host the audio file

### Option 2: Text-to-Speech Services
Use AI voice generation services:
- **ElevenLabs**: https://elevenlabs.io (character voices)
- **Google Cloud TTS**: https://cloud.google.com/text-to-speech
- **Amazon Polly**: https://aws.amazon.com/polly

### Option 3: Licensed Content
Contact Disney for licensing official Mickey Mouse audio clips.

### Updating the Audio URL

Edit `src/main/java/com/mycompany/myapp/web/rest/ChatController.java`:

```java
private static final String MOCK_AUDIO_URL = "YOUR_AUDIO_URL_HERE";
```

## Testing

1. **Start the application**:
   ```bash
   ./mvnw
   ```

2. **Login with a premium or test tier user**:
   - Email: `premium@example.com` or `test@example.com`
   - This ensures the `voice-chat-enabled` flag is active

3. **Send a message in the chat**:
   - The animated orb will appear in the message footer
   - Click the orb to play/pause the audio
   - Watch the rings pulse in sync with the audio

4. **Test with flag disabled**:
   - Login with a standard user (e.g., `user@example.com`)
   - The visualizer won't appear (as expected)

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (requires user interaction to start audio)
- **Mobile**: Works on iOS Safari and Chrome Android

## Technical Notes

### Audio Context Initialization

The `AudioContext` is created on first play, not on component load. This is required by browser autoplay policies that prevent audio from playing without user interaction.

### Memory Management

The component properly cleans up resources on destroy:
- Cancels animation frame requests
- Disconnects audio nodes
- Closes the audio context

### Performance

The visualization is lightweight:
- Minimal DOM updates (transform and opacity only)
- Hardware-accelerated SVG animations
- ~60fps on modern devices

## Customization

### Adjust Sensitivity

In `audio-visualizer.component.ts`, modify the amplitude calculation:

```typescript
// More sensitive (larger pulses)
const smoothed = currentAmplitude * 0.5 + normalized * 0.5;

// Less sensitive (smaller pulses)
const smoothed = currentAmplitude * 0.8 + normalized * 0.2;
```

### Change Colors

In `audio-visualizer.component.scss`, update the colors:

```scss
.base-orb {
  fill: rgba(YOUR_COLOR_HERE, 0.95);
}

.pulse-ring {
  stroke: rgba(YOUR_COLOR_HERE, 0.6);
}
```

### Adjust Ring Count

Add or remove rings in `audio-visualizer.component.html`:

```html
<!-- Add a 4th ring -->
<circle
  cx="50"
  cy="50"
  r="35"
  class="pulse-ring pulse-ring--4"
  [style.transform]="'scale(' + getRingScale(4) + ')'"
  [style.opacity]="getRingOpacity(4)"
/>
```

## Files Modified

- `src/main/webapp/app/chat/chat.component.html` - Replaced audio controls
- `src/main/webapp/app/chat/chat.component.ts` - Added visualizer import
- `src/main/webapp/app/chat/chat.component.scss` - Updated audio-card styles
- `src/main/java/com/mycompany/myapp/web/rest/ChatController.java` - Added demo audio URL documentation

## Files Created

- `src/main/webapp/app/chat/audio-visualizer/audio-visualizer.component.ts`
- `src/main/webapp/app/chat/audio-visualizer/audio-visualizer.component.html`
- `src/main/webapp/app/chat/audio-visualizer/audio-visualizer.component.scss`

