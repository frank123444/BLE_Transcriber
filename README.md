# Bluetooth Audio Transcriber

A real-time speech-to-text web app that works with Bluetooth headsets, AirPods, and microphones. No installation required - runs directly in your browser.

## 🎯 Live Demo

**[Open the App →](https://YOUR_USERNAME.github.io/BLE_Transcriber/)**

*(Replace `YOUR_USERNAME` with your GitHub handle after enabling GitHub Pages.)*

## ✨ Features

- **Real-time transcription** - Speech converts to text as you speak
- **Bluetooth support** - Uses connected Bluetooth headset microphone (AirPods, etc.)
- **14 languages** - English, German, French, Spanish, Chinese, Japanese, and more
- **Audio level meter** - Visual feedback showing microphone input
- **Copy & Share** - Export your transcription easily
- **Dark mode** - Automatically adapts to your device settings
- **PWA ready** - Add to home screen for app-like experience

## 📱 How to Use

### On iPhone/iPad (Safari)

1. Open the app in **Safari**
1. Connect your **Bluetooth headset** (AirPods, etc.)
1. Tap **Start** and allow microphone access
1. Start speaking - text appears in real-time!

### Add to Home Screen

1. Tap the **Share** button in Safari
1. Tap **“Add to Home Screen”**
1. Now it launches like a native app!

### On Desktop (Chrome)

1. Open the app in **Chrome**
1. Click **Start** and allow microphone access
1. Start speaking!

## 🛠 Setup GitHub Pages

GitHub Pages is configured to publish straight from the repository root:

1. Push this repo to GitHub and ensure your default branch is **main** (or update `.github/pages.yml` to match).
1. Pages will deploy automatically from `main` via the included `Deploy GitHub Pages` workflow.
1. The generated site is served directly from the existing `index.html` in the repository root—no build step required.
1. After the workflow succeeds, your app is live at `https://YOUR_USERNAME.github.io/BLE_Transcriber/`.

## 📁 Files

```
├── index.html    # The complete web app (single file)
└── README.md     # This file
```

## 🌐 Browser Support

|Browser         |Support            |
|----------------|-------------------|
|Safari (iOS)    |✅ Full support     |
|Chrome (Desktop)|✅ Full support     |
|Chrome (Android)|✅ Full support     |
|Firefox         |❌ No Web Speech API|
|Edge            |✅ Full support     |

## 🔒 Privacy

- Audio is processed by your browser’s speech recognition service (Apple/Google)
- No data is stored or sent to any third-party servers
- Works entirely client-side

## 📄 License

MIT License - free to use, modify, and distribute.
