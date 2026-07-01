// Sound management
let sounds = {
    timer: {
        start: null,
        tick: null,
        end: null
    },
    stopwatch: {
        start: null,
        stop: null,
        milestone: null
    },
    custom: {
        start: null
    }
};

let audioElements = {};

// Load uploaded sounds
function loadSound(inputId, category, type) {
    const input = document.getElementById(inputId);
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            sounds[category][type] = url;
            updateSoundSelects();
        }
    });
}

// Update sound select dropdowns (for preset + uploaded)
function updateSoundSelects() {
    // For now, simple - we'll expand with presets later
    console.log('Sounds updated');
}

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});

// ====================== TIMER ======================
let timerInterval = null;
let timerTimeLeft = 0;
let isTimerRunning = false;
let timerAutoRestart = false;

const timerDisplay = document.getElementById('timer-time');
const startBtn = document.getElementById('start-timer');
const pauseBtn = document.getElementById('pause-timer');
const resetBtn = document.getElementById('reset-timer');

function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function playSound(soundUrl) {
    if (!soundUrl) return;
    const audio = new Audio(soundUrl);
    audio.play().catch(e => console.log('Audio play failed:', e));
}

function startTimer() {
    if (isTimerRunning) return;
    
    const hours = parseInt(document.getElementById('timer-hours').value) || 0;
    const minutes = parseInt(document.getElementById('timer-minutes').value) || 0;
    const seconds = parseInt(document.getElementById('timer-seconds').value) || 0;
    
    timerTimeLeft = hours * 3600 + minutes * 60 + seconds;
    
    if (timerTimeLeft <= 0) return;
    
    playSound(sounds.timer.start);
    isTimerRunning = true;
    timerAutoRestart = document.getElementById('auto-restart').checked;
    
    timerInterval = setInterval(() => {
        timerTimeLeft--;
        timerDisplay.textContent = formatTime(timerTimeLeft);
        
        const tickInterval = parseInt(document.getElementById('tick-interval').value) || 0;
        
        if (tickInterval > 0 && timerTimeLeft % tickInterval === 0) {
            playSound(sounds.timer.tick);
        } else if (tickInterval === 0 && sounds.timer.tick) {
            // Continuous tick - restart sound
            playSound(sounds.timer.tick);
        }
        
        if (timerTimeLeft <= 0) {
            clearInterval(timerInterval);
            playSound(sounds.timer.end);
            isTimerRunning = false;
            
            if (timerAutoRestart) {
                setTimeout(() => startTimer(), 1000);
            }
        }
    }, 1000);
    
    timerDisplay.textContent = formatTime(timerTimeLeft);
}

function pauseTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
}

function resetTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    timerTimeLeft = 0;
    timerDisplay.textContent = '00:00:00';
}

// ====================== STOPWATCH ======================
let stopwatchInterval = null;
let stopwatchTime = 0;
let isStopwatchRunning = false;
let laps = [];

const swDisplay = document.getElementById('stopwatch-time');
const startSwBtn = document.getElementById('start-stopwatch');
const stopSwBtn = document.getElementById('stop-stopwatch');
const resetSwBtn = document.getElementById('reset-stopwatch');
const lapBtn = document.getElementById('lap-stopwatch');
const lapsContainer = document.getElementById('laps');

function formatStopwatch(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function startStopwatch() {
    if (isStopwatchRunning) return;
    
    playSound(sounds.stopwatch.start);
    isStopwatchRunning = true;
    
    const startTime = Date.now() - stopwatchTime;
    
    stopwatchInterval = setInterval(() => {
        stopwatchTime = Date.now() - startTime;
        swDisplay.textContent = formatStopwatch(stopwatchTime);
        
        const milestoneSec = parseInt(document.getElementById('milestone-interval').value) || 5;
        if (Math.floor(stopwatchTime / 1000) % milestoneSec === 0 && Math.floor(stopwatchTime / 1000) > 0) {
            playSound(sounds.stopwatch.milestone);
        }
    }, 10);
}

function stopStopwatch() {
    clearInterval(stopwatchInterval);
    isStopwatchRunning = false;
    playSound(sounds.stopwatch.stop);
}

function resetStopwatch() {
    clearInterval(stopwatchInterval);
    isStopwatchRunning = false;
    stopwatchTime = 0;
    swDisplay.textContent = '00:00:00';
    laps = [];
    lapsContainer.innerHTML = '';
}

function recordLap() {
    if (!isStopwatchRunning) return;
    laps.unshift(stopwatchTime);
    const lapEl = document.createElement('div');
    lapEl.className = 'lap-entry';
    lapEl.textContent = `Lap ${laps.length}: ${formatStopwatch(stopwatchTime)}`;
    lapsContainer.prepend(lapEl);
}

// ====================== CUSTOM UNIT STOPWATCH ======================
let customInterval = null;
let customCount = 0;
let isCustomRunning = false;
let customUnitSeconds = 5;

const customDisplay = document.getElementById('custom-time');

function startCustom() {
    if (isCustomRunning) return;
    
    customUnitSeconds = parseFloat(document.getElementById('unit-seconds').value) || 5;
    playSound(sounds.custom.start);
    isCustomRunning = true;
    
    let lastTick = Date.now();
    
    customInterval = setInterval(() => {
        const now = Date.now();
        const elapsed = (now - lastTick) / 1000;
        
        if (elapsed >= customUnitSeconds) {
            customCount++;
            customDisplay.textContent = customCount.toString().padStart(2, '0');
            lastTick = now;
        }
    }, 50);
}

function pauseCustom() {
    clearInterval(customInterval);
    isCustomRunning = false;
}

function resetCustom() {
    clearInterval(customInterval);
    isCustomRunning = false;
    customCount = 0;
    customDisplay.textContent = '00';
}

// Event listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

startSwBtn.addEventListener('click', startStopwatch);
stopSwBtn.addEventListener('click', stopStopwatch);
resetSwBtn.addEventListener('click', resetStopwatch);
lapBtn.addEventListener('click', recordLap);

document.getElementById('start-custom').addEventListener('click', startCustom);
document.getElementById('pause-custom').addEventListener('click', pauseCustom);
document.getElementById('reset-custom').addEventListener('click', resetCustom);

// Load sound inputs
loadSound('start-sound', 'timer', 'start');
loadSound('tick-sound', 'timer', 'tick');
loadSound('end-sound', 'timer', 'end');
loadSound('sw-start-sound', 'stopwatch', 'start');
loadSound('sw-stop-sound', 'stopwatch', 'stop');
loadSound('milestone-sound', 'stopwatch', 'milestone');
loadSound('custom-start-sound', 'custom', 'start');

// Initial display
timerDisplay.textContent = '00:00:00';
swDisplay.textContent = '00:00:00';
customDisplay.textContent = '00';

// ====================== THEME & LOCALSTORAGE & PWA ======================

// Theme toggle
const themeToggle = document.getElementById('theme-toggle');
let isDark = true;

function setTheme(dark) {
    if (dark) {
        document.documentElement.style.setProperty('--bg', '#1a1a2e');
        document.documentElement.style.setProperty('--accent', '#00ffcc');
        document.body.classList.remove('light');
        themeToggle.textContent = '☀️';
    } else {
        document.documentElement.style.setProperty('--bg', '#f0f0f0');
        document.documentElement.style.setProperty('--accent', '#0066cc');
        document.body.classList.add('light');
        themeToggle.textContent = '🌙';
    }
    isDark = dark;
    localStorage.setItem('theme', dark ? 'dark' : 'light');
}

themeToggle.addEventListener('click', () => {
    setTheme(!isDark);
});

// Load saved theme
if (localStorage.getItem('theme') === 'light') {
    setTheme(false);
} else {
    setTheme(true);
}

// Basic settings save (auto-restart, intervals, unit seconds)
function saveSettings() {
    const settings = {
        autoRestart: document.getElementById('auto-restart').checked,
        tickInterval: document.getElementById('tick-interval').value,
        milestoneInterval: document.getElementById('milestone-interval').value,
        unitSeconds: document.getElementById('unit-seconds').value,
        theme: isDark ? 'dark' : 'light'
    };
    localStorage.setItem('tickthing_settings', JSON.stringify(settings));
}

function loadSettings() {
    const saved = localStorage.getItem('tickthing_settings');
    if (saved) {
        const settings = JSON.parse(saved);
        document.getElementById('auto-restart').checked = settings.autoRestart || false;
        if (settings.tickInterval) document.getElementById('tick-interval').value = settings.tickInterval;
        if (settings.milestoneInterval) document.getElementById('milestone-interval').value = settings.milestoneInterval;
        if (settings.unitSeconds) document.getElementById('unit-seconds').value = settings.unitSeconds;
    }
}

// Save settings on change
document.getElementById('auto-restart').addEventListener('change', saveSettings);
document.getElementById('tick-interval').addEventListener('input', saveSettings);
document.getElementById('milestone-interval').addEventListener('input', saveSettings);
document.getElementById('unit-seconds').addEventListener('input', saveSettings);

// Load on start
loadSettings();

// PWA / Install prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    deferredPrompt = e;
    console.log('PWA install prompt ready');
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('Service Worker registered'))
        .catch(err => console.log('SW registration failed:', err));
}

// Show install hint if not installed
if (!window.matchMedia('(display-mode: standalone)').matches) {
    const installHint = document.createElement('div');
    installHint.style.cssText = 'position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#00ffcc; color:#1a1a2e; padding:12px 24px; border-radius:12px; font-weight:bold; z-index:100; box-shadow:0 10px 20px rgba(0,0,0,0.3);';
    installHint.innerHTML = '📱 Tap <strong>Add to Home Screen</strong> for full PWA experience!';
    document.body.appendChild(installHint);
    
    setTimeout(() => installHint.remove(), 8000);
}