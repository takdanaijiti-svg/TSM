// Offline-friendly Web Audio API Synthesizer Sound Engine for high quality UI clicks & notifications
// Since this runs in the browser, sound will only trigger upon user interaction

let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  // Resume context if suspended (browser security autoplays)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playBeep(type: 'click' | 'success' | 'warning' | 'error' | 'bell') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'click') {
      // Gentle soft short pop click
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);

      gainNode.gain.setValueAtTime(0.08, now);
      gainNode.gain.linearRampToValueAtTime(0.001, now + 0.08);

      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'success') {
      // Pleasant bright therapeutic medical chime (3 notes upward)
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const subOsc = ctx.createOscillator();
        const subGain = ctx.createGain();

        subOsc.connect(subGain);
        subGain.connect(ctx.destination);

        subOsc.type = 'triangle';
        subOsc.frequency.value = freq;

        const start = now + idx * 0.07;
        subGain.gain.setValueAtTime(0, now);
        subGain.gain.linearRampToValueAtTime(0.1, start + 0.02);
        subGain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);

        subOsc.start(start);
        subOsc.stop(start + 0.3);
      });
    } else if (type === 'warning') {
      // Cautious 2-tone alarm chime (high-low)
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(330, now + 0.12);

      gainNode.gain.setValueAtTime(0.05, now);
      gainNode.gain.setValueAtTime(0.05, now + 0.12);
      gainNode.gain.linearRampToValueAtTime(0.001, now + 0.25);

      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'error') {
      // Heavy low clinical flat fail buzzer
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.25);

      gainNode.gain.setValueAtTime(0.12, now);
      gainNode.gain.linearRampToValueAtTime(0.001, now + 0.25);

      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'bell') {
      // High frequency clear notification ring
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.4);

      gainNode.gain.setValueAtTime(0.08, now);
      gainNode.gain.linearRampToValueAtTime(0.001, now + 0.45);

      osc.start(now);
      osc.stop(now + 0.45);
    }
  } catch (err) {
    // Sound block bypassed safely if unsupported
    console.warn("Audio Context unable to initiate: ", err);
  }
}
