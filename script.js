const drums = document.querySelectorAll(".drum");
const statusMessage = document.querySelector(".status");
const keySounds = new Map(
  [...drums].map((drum) => [drum.querySelector(".drum__key").textContent.toLowerCase(), drum]),
);

let audioContext;

function getAudioContext() {
  audioContext ??= new (window.AudioContext || window.webkitAudioContext)();
  return audioContext;
}

function playTone(frequency, endFrequency, duration, type = "sine", volume = 0.8) {
  const context = getAudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const now = context.currentTime;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(endFrequency, 1), now + duration);
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + duration);
}

function playNoise(duration, volume = 0.5, filterFrequency = 8000) {
  const context = getAudioContext();
  const sampleCount = Math.floor(context.sampleRate * duration);
  const buffer = context.createBuffer(1, sampleCount, context.sampleRate);
  const data = buffer.getChannelData(0);

  for (let index = 0; index < sampleCount; index += 1) {
    data[index] = Math.random() * 2 - 1;
  }

  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  const now = context.currentTime;

  source.buffer = buffer;
  filter.type = "highpass";
  filter.frequency.value = filterFrequency;
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  source.start(now);
}

function playSound(sound) {
  switch (sound) {
    case "kick":
      playTone(150, 38, 0.32, "sine", 1);
      break;
    case "snare":
      playTone(180, 80, 0.12, "triangle", 0.5);
      playNoise(0.2, 0.65, 1000);
      break;
    case "closed-hat":
      playNoise(0.07, 0.35, 7000);
      break;
    case "open-hat":
      playNoise(0.42, 0.32, 6500);
      break;
    case "tom":
      playTone(210, 75, 0.28, "sine", 0.8);
      break;
    case "clap":
      playNoise(0.16, 0.55, 1400);
      break;
    case "cymbal":
      playNoise(0.75, 0.4, 5000);
      break;
    default:
      return;
  }
}

function triggerDrum(drum) {
  if (!drum) return;

  playSound(drum.dataset.sound);
  drum.classList.add("is-playing");
  window.setTimeout(() => drum.classList.remove("is-playing"), 120);
  statusMessage.textContent = `${drum.querySelector(".drum__name").textContent} played`;
}

drums.forEach((drum) => {
  drum.addEventListener("click", () => triggerDrum(drum));
});

document.addEventListener("keydown", (event) => {
  if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.target instanceof HTMLElement && event.target.closest("button, input, textarea, select")) return;

  triggerDrum(keySounds.get(event.key.toLowerCase()));
});
