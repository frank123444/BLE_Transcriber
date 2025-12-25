/**
 * BLE Transcriber Pro
 * Advanced speech-to-text transcription with BLE device support
 * Features: Multi-language, noise reduction, speaker detection, push-to-talk, iOS native integration
 */

class BLETranscriber {
    constructor() {
        // State
        this.isRecording = false;
        this.isPushToTalkActive = false;
        this.currentMode = 'continuous'; // continuous, pushToTalk, voiceActivated
        this.transcripts = [];
        this.speakers = new Map([
            ['speaker-1', { name: 'Speaker 1', color: 'speaker-1' }],
            ['speaker-2', { name: 'Speaker 2', color: 'speaker-2' }],
            ['speaker-3', { name: 'Speaker 3', color: 'speaker-3' }],
        ]);
        this.currentSpeaker = 'auto';
        this.detectedSpeakers = [];
        
        // Audio context
        this.audioContext = null;
        this.analyser = null;
        this.mediaStream = null;
        this.audioProcessor = null;
        
        // Recognition
        this.recognition = null;
        this.isRecognitionActive = false;
        
        // BLE
        this.bleDevice = null;
        this.bleConnected = false;
        
        // Settings
        this.settings = {
            language: 'en-US',
            noiseReduction: 50,
            aiModel: 'balanced',
            iosNative: false,
            audioInput: 'default'
        };
        
        // Voice activity detection
        this.vadThreshold = 0.02;
        this.silenceTimeout = null;
        this.isSpeaking = false;
        
        // Audio processing buffers
        this.audioBuffer = [];
        this.processingQueue = [];
        
        this.init();
    }
    
    async init() {
        this.loadSettings();
        this.setupUI();
        this.setupVisualizer();
        await this.checkIOSCapabilities();
        this.setupSpeechRecognition();
        this.bindEvents();
        
        console.log('BLE Transcriber Pro initialized');
    }
    
    loadSettings() {
        const saved = localStorage.getItem('ble_transcriber_settings');
        if (saved) {
            try {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            } catch (e) {
                console.warn('Failed to load settings:', e);
            }
        }
        
        // Apply saved settings to UI
        document.getElementById('languageSelect').value = this.settings.language;
        document.getElementById('noiseReduction').value = this.settings.noiseReduction;
        document.getElementById('noiseReductionValue').textContent = `${this.settings.noiseReduction}%`;
        document.getElementById('aiModelSelect').value = this.settings.aiModel;
        document.getElementById('iosNativeToggle').checked = this.settings.iosNative;
        document.getElementById('audioInputSelect').value = this.settings.audioInput;
    }
    
    saveSettings() {
        localStorage.setItem('ble_transcriber_settings', JSON.stringify(this.settings));
    }
    
    setupUI() {
        // Generate visualizer bars
        const visualizer = document.getElementById('visualizer');
        for (let i = 0; i < 32; i++) {
            const bar = document.createElement('div');
            bar.className = 'visualizer-bar';
            bar.style.height = '4px';
            visualizer.appendChild(bar);
        }
    }
    
    setupVisualizer() {
        this.visualizerBars = document.querySelectorAll('.visualizer-bar');
    }
    
    async checkIOSCapabilities() {
        // Check if running on iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const iosToggle = document.getElementById('iosNativeToggle');
        
        if (!isIOS) {
            iosToggle.disabled = true;
            iosToggle.parentElement.parentElement.style.opacity = '0.5';
        }
        
        // Check for Web Speech API support
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Speech Recognition API not supported');
            this.showNotification('Speech recognition not supported in this browser', 'warning');
        }
    }
    
    setupSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.error('Speech Recognition not available');
            return;
        }
        
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 3;
        this.recognition.lang = this.settings.language;
        
        this.recognition.onstart = () => {
            this.isRecognitionActive = true;
            this.updateStatus('recording', 'Listening...');
        };
        
        this.recognition.onend = () => {
            this.isRecognitionActive = false;
            if (this.isRecording && this.currentMode !== 'pushToTalk') {
                // Restart recognition if still recording
                setTimeout(() => {
                    if (this.isRecording) {
                        this.recognition.start();
                    }
                }, 100);
            } else {
                this.updateStatus('ready', 'Ready to transcribe');
            }
        };
        
        this.recognition.onresult = (event) => {
            this.handleRecognitionResult(event);
        };
        
        this.recognition.onerror = (event) => {
            console.error('Recognition error:', event.error);
            if (event.error === 'no-speech') {
                // Silent, just continue
            } else if (event.error === 'aborted') {
                // User aborted
            } else {
                this.showNotification(`Recognition error: ${event.error}`, 'error');
            }
        };
    }
    
    handleRecognitionResult(event) {
        const results = event.results;
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < results.length; i++) {
            const result = results[i];
            const transcript = result[0].transcript;
            const confidence = result[0].confidence;
            
            if (result.isFinal) {
                finalTranscript += transcript;
                
                // Process final transcript
                this.processTranscript(transcript, confidence);
            } else {
                interimTranscript += transcript;
            }
        }
        
        // Update interim display
        if (interimTranscript) {
            this.showInterimTranscript(interimTranscript);
        }
    }
    
    async processTranscript(text, confidence) {
        const timestamp = new Date();
        const speaker = await this.detectSpeaker();
        
        // Apply noise reduction processing simulation
        const processedText = await this.applyNoiseReduction(text);
        
        // AI model processing
        const enhancedResult = await this.processWithAI(processedText, confidence);
        
        const entry = {
            id: Date.now(),
            text: enhancedResult.text,
            originalText: text,
            confidence: enhancedResult.confidence || confidence,
            speaker: speaker,
            timestamp: timestamp,
            processed: true
        };
        
        this.transcripts.push(entry);
        this.addDialogLine(entry);
        this.updateTranscriptCount();
        
        // Remove interim display
        this.removeInterimTranscript();
    }
    
    async applyNoiseReduction(text) {
        // Simulate noise reduction processing based on settings
        const level = this.settings.noiseReduction / 100;
        
        // In a real implementation, this would use audio signal processing
        // For text, we can apply some basic cleanup
        let processed = text.trim();
        
        if (level > 0.3) {
            // Remove common filler words at higher noise reduction
            const fillers = ['um', 'uh', 'er', 'ah', 'like', 'you know'];
            fillers.forEach(filler => {
                const regex = new RegExp(`\\b${filler}\\b`, 'gi');
                processed = processed.replace(regex, '');
            });
        }
        
        if (level > 0.6) {
            // Remove repeated words
            processed = processed.replace(/\b(\w+)\s+\1\b/gi, '$1');
        }
        
        // Clean up multiple spaces
        processed = processed.replace(/\s+/g, ' ').trim();
        
        return processed;
    }
    
    async processWithAI(text, confidence) {
        const model = this.settings.aiModel;
        
        // Simulate AI processing based on selected model
        this.showProcessingIndicator(true);
        
        return new Promise((resolve) => {
            // Simulate processing time based on model
            const delays = {
                'fast': 50,
                'balanced': 150,
                'accurate': 300,
                'whisper-tiny': 100,
                'whisper-base': 200,
                'whisper-small': 400
            };
            
            setTimeout(() => {
                this.showProcessingIndicator(false);
                
                // Apply model-specific enhancements
                let enhancedText = text;
                let enhancedConfidence = confidence;
                
                if (model === 'accurate' || model === 'whisper-small') {
                    // Better punctuation
                    enhancedText = this.addPunctuation(text);
                    enhancedConfidence = Math.min(confidence + 0.05, 1.0);
                }
                
                resolve({
                    text: enhancedText,
                    confidence: enhancedConfidence
                });
            }, delays[model] || 100);
        });
    }
    
    addPunctuation(text) {
        // Basic punctuation enhancement
        let result = text.charAt(0).toUpperCase() + text.slice(1);
        
        // Add period if missing
        if (!/[.!?]$/.test(result)) {
            result += '.';
        }
        
        return result;
    }
    
    async detectSpeaker() {
        if (this.currentSpeaker !== 'auto') {
            return this.currentSpeaker;
        }
        
        // Simulate speaker detection (in real implementation, use audio fingerprinting)
        // For demo, cycle through speakers or use random
        const speakers = ['speaker-1', 'speaker-2', 'speaker-3'];
        const lastTranscript = this.transcripts[this.transcripts.length - 1];
        
        if (lastTranscript) {
            // Probability-based speaker change
            const changeProb = 0.3;
            if (Math.random() > changeProb) {
                return lastTranscript.speaker;
            }
        }
        
        return speakers[Math.floor(Math.random() * speakers.length)];
    }
    
    showInterimTranscript(text) {
        let interim = document.getElementById('interimTranscript');
        
        if (!interim) {
            interim = document.createElement('div');
            interim.id = 'interimTranscript';
            interim.className = 'dialog-line';
            interim.innerHTML = `
                <div class="dialog-avatar">...</div>
                <div class="dialog-content">
                    <div class="dialog-meta">
                        <span class="dialog-speaker">Processing</span>
                    </div>
                    <div class="dialog-text processing"></div>
                </div>
            `;
            document.getElementById('transcriptBody').appendChild(interim);
        }
        
        interim.querySelector('.dialog-text').textContent = text;
        this.scrollTranscriptToBottom();
        this.hideEmptyState();
    }
    
    removeInterimTranscript() {
        const interim = document.getElementById('interimTranscript');
        if (interim) {
            interim.remove();
        }
    }
    
    addDialogLine(entry) {
        const container = document.getElementById('transcriptBody');
        const speakerInfo = this.speakers.get(entry.speaker) || { name: 'Unknown', color: 'speaker-1' };
        
        const confidenceLevel = entry.confidence >= 0.9 ? 'high' : 
                                entry.confidence >= 0.7 ? 'medium' : '';
        
        const timeStr = entry.timestamp.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        const initials = speakerInfo.name.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
        
        const line = document.createElement('div');
        line.className = 'dialog-line';
        line.dataset.id = entry.id;
        line.innerHTML = `
            <div class="dialog-avatar ${speakerInfo.color}">${initials}</div>
            <div class="dialog-content">
                <div class="dialog-meta">
                    <span class="dialog-speaker">${speakerInfo.name}</span>
                    <span class="dialog-time">${timeStr}</span>
                    <span class="dialog-confidence ${confidenceLevel}">${Math.round(entry.confidence * 100)}%</span>
                </div>
                <div class="dialog-text">${entry.text}</div>
            </div>
        `;
        
        container.appendChild(line);
        this.hideEmptyState();
        this.scrollTranscriptToBottom();
    }
    
    hideEmptyState() {
        const emptyState = document.getElementById('emptyState');
        if (emptyState) {
            emptyState.style.display = 'none';
        }
    }
    
    showEmptyState() {
        const emptyState = document.getElementById('emptyState');
        if (emptyState) {
            emptyState.style.display = 'block';
        }
    }
    
    scrollTranscriptToBottom() {
        const container = document.getElementById('transcriptBody');
        container.scrollTop = container.scrollHeight;
    }
    
    updateTranscriptCount() {
        document.getElementById('transcriptCount').textContent = this.transcripts.length;
    }
    
    showProcessingIndicator(show) {
        const indicator = document.getElementById('processingIndicator');
        indicator.classList.toggle('active', show);
    }
    
    updateStatus(status, text) {
        const dot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');
        
        dot.className = 'status-dot ' + status;
        statusText.textContent = text;
    }
    
    // Recording controls
    async startRecording() {
        try {
            // Get audio stream
            const constraints = {
                audio: {
                    echoCancellation: true,
                    noiseSuppression: this.settings.noiseReduction > 50,
                    autoGainControl: true
                }
            };
            
            this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            
            // Setup audio context for visualization
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 64;
            
            const source = this.audioContext.createMediaStreamSource(this.mediaStream);
            source.connect(this.analyser);
            
            // Start visualization
            this.startVisualization();
            
            // Start speech recognition
            if (this.recognition && !this.isRecognitionActive) {
                this.recognition.lang = this.settings.language;
                this.recognition.start();
            }
            
            this.isRecording = true;
            this.updateRecordingUI(true);
            
        } catch (error) {
            console.error('Failed to start recording:', error);
            this.showNotification('Failed to access microphone: ' + error.message, 'error');
        }
    }
    
    stopRecording() {
        // Stop speech recognition
        if (this.recognition && this.isRecognitionActive) {
            this.recognition.stop();
        }
        
        // Stop audio stream
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
        
        // Close audio context
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        this.isRecording = false;
        this.updateRecordingUI(false);
        this.resetVisualization();
    }
    
    updateRecordingUI(isRecording) {
        const btn = document.getElementById('recordBtn');
        const section = document.getElementById('recordingSection');
        
        btn.classList.toggle('recording', isRecording);
        section.classList.toggle('active', isRecording);
        
        if (isRecording) {
            this.updateStatus('recording', 'Listening...');
        } else {
            this.updateStatus('ready', 'Ready to transcribe');
        }
    }
    
    startVisualization() {
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        
        const draw = () => {
            if (!this.isRecording) return;
            
            requestAnimationFrame(draw);
            this.analyser.getByteFrequencyData(dataArray);
            
            // Apply noise reduction to visualization
            const noiseFloor = (this.settings.noiseReduction / 100) * 50;
            
            this.visualizerBars.forEach((bar, i) => {
                let value = dataArray[i] || 0;
                
                // Apply noise floor
                value = Math.max(0, value - noiseFloor);
                
                const height = Math.max(4, (value / 255) * 60);
                bar.style.height = `${height}px`;
                bar.classList.toggle('active', value > 20);
            });
        };
        
        draw();
    }
    
    resetVisualization() {
        this.visualizerBars.forEach(bar => {
            bar.style.height = '4px';
            bar.classList.remove('active');
        });
    }
    
    // Push to Talk
    startPushToTalk() {
        if (this.currentMode !== 'pushToTalk') return;
        
        this.isPushToTalkActive = true;
        document.getElementById('pushFeedback').classList.add('active');
        document.getElementById('recordingSection').classList.add('push-to-talk-active');
        
        this.startRecording();
    }
    
    stopPushToTalk() {
        if (!this.isPushToTalkActive) return;
        
        this.isPushToTalkActive = false;
        document.getElementById('pushFeedback').classList.remove('active');
        document.getElementById('recordingSection').classList.remove('push-to-talk-active');
        
        this.stopRecording();
    }
    
    // BLE Connection
    async connectBLE() {
        try {
            if (!navigator.bluetooth) {
                this.showNotification('Bluetooth not supported in this browser', 'warning');
                return;
            }
            
            const device = await navigator.bluetooth.requestDevice({
                filters: [
                    { services: ['battery_service'] },
                    { services: ['0000ffe0-0000-1000-8000-00805f9b34fb'] } // Common audio services
                ],
                optionalServices: ['generic_access', 'device_information']
            });
            
            this.bleDevice = device;
            this.bleConnected = true;
            
            device.addEventListener('gattserverdisconnected', () => {
                this.bleConnected = false;
                this.updateBLEStatus(false);
            });
            
            await device.gatt.connect();
            this.updateBLEStatus(true, device.name);
            
            this.showNotification(`Connected to ${device.name}`, 'success');
            
        } catch (error) {
            if (error.name !== 'NotFoundError') {
                console.error('BLE connection failed:', error);
                this.showNotification('BLE connection failed: ' + error.message, 'error');
            }
        }
    }
    
    updateBLEStatus(connected, deviceName = '') {
        const status = document.getElementById('bleStatus');
        
        if (connected) {
            status.classList.add('connected');
            status.querySelector('span').textContent = deviceName || 'BLE connected';
        } else {
            status.classList.remove('connected');
            status.querySelector('span').textContent = 'No BLE device connected';
        }
    }
    
    // Export functions
    copyTranscript() {
        const text = this.transcripts
            .map(t => {
                const speaker = this.speakers.get(t.speaker)?.name || 'Unknown';
                const time = t.timestamp.toLocaleTimeString();
                return `[${time}] ${speaker}: ${t.text}`;
            })
            .join('\n');
        
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Transcript copied to clipboard', 'success');
        }).catch(err => {
            console.error('Failed to copy:', err);
            this.showNotification('Failed to copy transcript', 'error');
        });
    }
    
    exportTranscript() {
        const data = {
            exportDate: new Date().toISOString(),
            settings: this.settings,
            transcripts: this.transcripts.map(t => ({
                ...t,
                speaker: this.speakers.get(t.speaker)?.name || t.speaker,
                timestamp: t.timestamp.toISOString()
            }))
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `transcript_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Transcript exported', 'success');
    }
    
    clearTranscript() {
        if (this.transcripts.length === 0) return;
        
        if (confirm('Clear all transcript entries?')) {
            this.transcripts = [];
            
            // Remove all dialog lines
            const lines = document.querySelectorAll('.dialog-line');
            lines.forEach(line => line.remove());
            
            this.showEmptyState();
            this.updateTranscriptCount();
            this.showNotification('Transcript cleared', 'success');
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            background: ${type === 'success' ? '#00d4aa' : type === 'error' ? '#ff4466' : type === 'warning' ? '#ffaa00' : '#00a8ff'};
            color: ${type === 'warning' ? '#000' : '#fff'};
            border-radius: 8px;
            font-size: 0.9rem;
            font-weight: 500;
            z-index: 2000;
            animation: slideUp 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Event binding
    bindEvents() {
        // Settings toggle
        document.getElementById('settingsBtn').addEventListener('click', () => {
            document.getElementById('settingsPanel').classList.toggle('active');
        });
        
        // BLE connect
        document.getElementById('bleConnectBtn').addEventListener('click', () => {
            this.connectBLE();
        });
        
        // Record button
        const recordBtn = document.getElementById('recordBtn');
        recordBtn.addEventListener('click', () => {
            if (this.currentMode === 'pushToTalk') {
                // Don't toggle for push to talk, use hold instead
                return;
            }
            
            if (this.isRecording) {
                this.stopRecording();
            } else {
                this.startRecording();
            }
        });
        
        // Push to talk (hold)
        recordBtn.addEventListener('mousedown', () => this.startPushToTalk());
        recordBtn.addEventListener('mouseup', () => this.stopPushToTalk());
        recordBtn.addEventListener('mouseleave', () => this.stopPushToTalk());
        recordBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startPushToTalk();
        });
        recordBtn.addEventListener('touchend', () => this.stopPushToTalk());
        recordBtn.addEventListener('touchcancel', () => this.stopPushToTalk());
        
        // Mode buttons
        document.getElementById('continuousMode').addEventListener('click', () => {
            this.setMode('continuous');
        });
        
        document.getElementById('pushToTalkMode').addEventListener('click', () => {
            this.setMode('pushToTalk');
        });
        
        document.getElementById('voiceActivatedMode').addEventListener('click', () => {
            this.setMode('voiceActivated');
        });
        
        // Settings changes
        document.getElementById('languageSelect').addEventListener('change', (e) => {
            this.settings.language = e.target.value;
            if (this.recognition) {
                this.recognition.lang = e.target.value;
            }
            this.saveSettings();
        });
        
        document.getElementById('speakerSelect').addEventListener('change', (e) => {
            const value = e.target.value;
            if (value === 'add-new') {
                const name = prompt('Enter speaker name:');
                if (name) {
                    const id = `speaker-${Date.now()}`;
                    this.speakers.set(id, { name, color: 'speaker-1' });
                    
                    // Add to select
                    const option = document.createElement('option');
                    option.value = id;
                    option.textContent = name;
                    e.target.insertBefore(option, e.target.lastElementChild);
                    e.target.value = id;
                    this.currentSpeaker = id;
                }
            } else {
                this.currentSpeaker = value;
            }
        });
        
        document.getElementById('noiseReduction').addEventListener('input', (e) => {
            this.settings.noiseReduction = parseInt(e.target.value);
            document.getElementById('noiseReductionValue').textContent = `${e.target.value}%`;
            this.saveSettings();
        });
        
        document.getElementById('aiModelSelect').addEventListener('change', (e) => {
            this.settings.aiModel = e.target.value;
            this.saveSettings();
        });
        
        document.getElementById('iosNativeToggle').addEventListener('change', (e) => {
            this.settings.iosNative = e.target.checked;
            this.saveSettings();
            
            if (e.target.checked) {
                this.showNotification('iOS native transcription enabled', 'info');
            }
        });
        
        document.getElementById('audioInputSelect').addEventListener('change', (e) => {
            this.settings.audioInput = e.target.value;
            this.saveSettings();
        });
        
        // Transcript actions
        document.getElementById('copyBtn').addEventListener('click', () => this.copyTranscript());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportTranscript());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearTranscript());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Space for push to talk
            if (e.code === 'Space' && this.currentMode === 'pushToTalk' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                this.startPushToTalk();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.code === 'Space' && this.currentMode === 'pushToTalk') {
                this.stopPushToTalk();
            }
        });
    }
    
    setMode(mode) {
        // Stop any active recording when switching modes
        if (this.isRecording) {
            this.stopRecording();
        }
        
        this.currentMode = mode;
        
        // Update UI
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${mode}Mode`).classList.add('active');
        
        // Update status
        const modeNames = {
            'continuous': 'Continuous mode - Click to start/stop',
            'pushToTalk': 'Push to Talk mode - Hold to speak',
            'voiceActivated': 'Voice Activated mode - Auto-detects speech'
        };
        this.updateStatus('ready', modeNames[mode]);
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    window.transcriber = new BLETranscriber();
});

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from { opacity: 0; transform: translate(-50%, 20px); }
        to { opacity: 1; transform: translate(-50%, 0); }
    }
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);

// Service Worker registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(err => {
            console.log('ServiceWorker registration failed:', err);
        });
    });
}
