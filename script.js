// ================= CANVAS SETUP =================
const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 400;

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");

// ================= AUDIO VARIABLES =================
let audioContext;
let analyser;
let dataArray;
let microphoneStream;
let animationId;

// ================= SPEECH TO TEXT =================
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = "en-IN";

// Text output
const textBox = document.createElement("div");
textBox.style.color = "#ffffff";
textBox.style.marginTop = "15px";
textBox.style.fontSize = "18px";
textBox.style.maxWidth = "400px";
textBox.style.textAlign = "center";
document.body.appendChild(textBox);

// ================= START MIC =================
startBtn.addEventListener("click", async () => {

  // Prevent multiple starts
  if (audioContext) return;

  audioContext = new AudioContext();

  microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true });

  const source = audioContext.createMediaStreamSource(microphoneStream);

  analyser = audioContext.createAnalyser();
  analyser.fftSize = 128;

  source.connect(analyser);
  dataArray = new Uint8Array(analyser.frequencyBinCount);

  recognition.start();
  animate();
});

// ================= STOP MIC =================
stopBtn.addEventListener("click", () => {

  // Stop animation
  cancelAnimationFrame(animationId);

  // Stop speech recognition
  recognition.stop();

  // Stop microphone tracks
  if (microphoneStream) {
    microphoneStream.getTracks().forEach(track => track.stop());
  }

  // Close audio context
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  textBox.innerText = "🎤 Microphone stopped";
});

// ================= SPEECH RESULT =================
recognition.onresult = (event) => {
  let transcript = "";

  for (let i = event.resultIndex; i < event.results.length; i++) {
    transcript += event.results[i][0].transcript;
  }

  textBox.innerText = transcript;
};

// ================= ANIMATION LOOP =================
function animate() {
  animationId = requestAnimationFrame(animate);

  analyser.getByteFrequencyData(dataArray);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius = 100;

  const bars = dataArray.length;
  const step = (Math.PI * 2) / bars;

  for (let i = 0; i < bars; i++) {
    const value = dataArray[i];
    const height = value * 0.6;
    const angle = i * step;

    const x1 = cx + Math.cos(angle) * radius;
    const y1 = cy + Math.sin(angle) * radius;

    const x2 = cx + Math.cos(angle) * (radius + height);
    const y2 = cy + Math.sin(angle) * (radius + height);

    ctx.strokeStyle = `hsl(${value + 30},100%,60%)`;
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}
