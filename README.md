# BLE Transcriber Pro

A professional-grade speech-to-text transcription application with Bluetooth Low Energy (BLE) device support, optimized for iOS.

![BLE Transcriber Pro](icon-192.svg)

## Features

### 🌍 Multi-Language Support
- **18+ Languages**: English (US/UK), German (DE/CH), French (FR/CH), Italian, Spanish, Portuguese, Dutch, Japanese, Chinese (Simplified/Traditional), Korean, Russian, Arabic, Hindi
- **Auto-detect Mode**: Automatically detects the spoken language
- Real-time language switching during transcription

### 🔊 Adjustable Noise Reduction
- **0-100% Slider**: Fine-tune noise reduction levels
- Removes background noise from audio input
- Configurable filler word removal (um, uh, er, like)
- Duplicate word detection and cleanup

### 👥 Speaker Selection & Detection
- **Auto-detect Speakers**: AI-powered speaker diarization
- **Manual Selection**: Assign transcripts to specific speakers
- **Add Custom Speakers**: Create and manage speaker profiles
- Visual speaker avatars with color coding

### 🎙️ Recording Modes

#### Continuous Mode
- Click to start/stop recording
- Continuous speech recognition
- Ideal for long transcription sessions

#### Push-to-Talk Mode
- Hold button to record
- Space bar keyboard shortcut
- Visual feedback overlay
- Perfect for precise control

#### Voice Activated Mode
- Auto-detects when speech begins
- Automatic silence detection
- Hands-free operation

### 📝 Dialog Line Display
- **Speaker Attribution**: Each line shows the speaker
- **Timestamps**: Precise time markers
- **Confidence Scores**: AI confidence percentage
- Color-coded speaker avatars
- Real-time interim transcript display

### 🤖 AI Processing Models
- **Fast**: Low latency, quick results
- **Balanced**: Optimal speed/accuracy trade-off
- **Accurate**: Best quality, enhanced punctuation
- **Whisper Models**: Tiny, Base, Small variants

### 📱 iOS Integration
- **Native Speech Framework**: Toggle for iOS Speech Recognition
- **PWA Support**: Install as standalone app
- **Safe Area Handling**: Proper notch/home indicator support
- Haptic feedback support

### 🔗 BLE Device Support
- Connect Bluetooth audio devices
- Device status indicator
- Auto-reconnection handling

## Installation

### Web Browser
Simply open `index.html` in a modern browser (Chrome, Safari, Edge, Firefox).

### iOS PWA Installation
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Tap "Add"

### Local Development
```bash
# Clone the repository
git clone https://github.com/frank123444/BLE_Transcriber.git
cd BLE_Transcriber

# Serve locally (Python)
python -m http.server 8000

# Or use any static file server
npx serve .
```

## Usage

### Basic Transcription
1. Select your language from settings
2. Adjust noise reduction if needed
3. Click the record button (or hold for push-to-talk)
4. Speak clearly into the microphone
5. View real-time transcription in the dialog panel

### Speaker Management
1. Open Settings panel
2. Select "Active Speaker" dropdown
3. Choose auto-detect or manual speaker
4. Add new speakers with "+ Add New Speaker"

### Export Options
- **Copy**: Copy full transcript to clipboard
- **Export**: Download as JSON file
- **Clear**: Remove all transcript entries

## Settings

| Setting | Description | Options |
|---------|-------------|---------|
| Language | Speech recognition language | 18+ languages + auto-detect |
| Active Speaker | Current speaker assignment | Auto-detect / Manual selection |
| Noise Reduction | Background noise filtering | 0-100% slider |
| AI Model | Processing accuracy/speed | Fast / Balanced / Accurate / Whisper variants |
| iOS Native | Use iOS Speech Framework | On / Off |
| Audio Input | Input device selection | Default / BLE device |

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Best performance |
| Safari | ✅ Full | iOS native features |
| Edge | ✅ Full | Chromium-based |
| Firefox | ⚠️ Partial | Limited Speech API |

## API Reference

### BLETranscriber Class

```javascript
// Initialize
const transcriber = new BLETranscriber();

// Start recording
transcriber.startRecording();

// Stop recording
transcriber.stopRecording();

// Connect BLE device
transcriber.connectBLE();

// Export transcript
transcriber.exportTranscript();

// Access settings
transcriber.settings.language = 'de-DE';
transcriber.saveSettings();
```

### Events

The transcriber emits results through the Speech Recognition API:
- `onstart`: Recognition started
- `onend`: Recognition ended
- `onresult`: New transcript available
- `onerror`: Error occurred

## File Structure

```
BLE_Transcriber/
├── index.html      # Main HTML with UI
├── app.js          # Application logic
├── sw.js           # Service Worker for PWA
├── manifest.json   # PWA manifest
├── icon-192.svg    # App icon
└── README.md       # Documentation
```

## Customization

### Theming
Modify CSS variables in `index.html`:
```css
:root {
    --accent-primary: #00d4aa;
    --accent-secondary: #00a8ff;
    --bg-primary: #0a0a0f;
    /* ... */
}
```

### Adding Languages
Add options to the language select in `index.html`:
```html
<option value="language-code">Language Name</option>
```

## Troubleshooting

### Microphone Access Denied
- Check browser permissions
- Ensure HTTPS or localhost
- Try refreshing the page

### Speech Recognition Not Working
- Verify language selection
- Check internet connection (some APIs require it)
- Try Chrome for best compatibility

### BLE Connection Issues
- Ensure Bluetooth is enabled
- Check device compatibility
- Try re-pairing the device

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - See LICENSE file for details

## Credits

- Speech Recognition: Web Speech API
- Icons: Custom SVG design
- Fonts: JetBrains Mono, Space Grotesk

---

Built with ❤️ for accurate transcription
