// Subtle Web Audio API synthesizer for industrial conveyor, sensor scan, and pneumatic sorting gate cues.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  // Conveyor loop nodes
  private conveyorOsc1: OscillatorNode | null = null;
  private conveyorOsc2: OscillatorNode | null = null;
  private conveyorNoise: AudioBufferSourceNode | null = null;
  private conveyorGain: GainNode | null = null;
  private isConveyorPlaying = false;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.7;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlock(): void {
    this.ensureContext();
  }

  public startConveyor(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.isConveyorPlaying) return;

    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.032, now + 0.16);
    gain.connect(this.masterGain);

    // Subtle electric drive motor hum (66 Hz fundamental + 132 Hz soft harmonic)
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 210;
    filter.connect(gain);

    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(66, now);
    osc1.connect(filter);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(132, now);
    const osc2Gain = ctx.createGain();
    osc2Gain.gain.value = 0.35;
    osc2.connect(osc2Gain);
    osc2Gain.connect(filter);

    // Subtle roller track rumble via filtered noise buffer
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 180;
    noiseFilter.Q.value = 1.2;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.4;

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(gain);

    osc1.start(now);
    osc2.start(now);
    noise.start(now);

    this.conveyorOsc1 = osc1;
    this.conveyorOsc2 = osc2;
    this.conveyorNoise = noise;
    this.conveyorGain = gain;
    this.isConveyorPlaying = true;
  }

  public stopConveyor(): void {
    if (!this.isConveyorPlaying || !this.ctx) return;

    const now = this.ctx.currentTime;
    const gain = this.conveyorGain;
    const osc1 = this.conveyorOsc1;
    const osc2 = this.conveyorOsc2;
    const noise = this.conveyorNoise;

    this.isConveyorPlaying = false;
    this.conveyorGain = null;
    this.conveyorOsc1 = null;
    this.conveyorOsc2 = null;
    this.conveyorNoise = null;

    if (gain) {
      try {
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      } catch {
        // Ignore ramp errors if context closed
      }
    }

    window.setTimeout(() => {
      try {
        osc1?.stop();
        osc2?.stop();
        noise?.stop();
        osc1?.disconnect();
        osc2?.disconnect();
        noise?.disconnect();
        gain?.disconnect();
      } catch {
        // Ignore cleanup errors
      }
    }, 150);
  }

  // Subtle optical/laser sensor scan sweep
  public playSensorScan(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(760, now);
    osc.frequency.exponentialRampToValueAtTime(1280, now + 0.14);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.055, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.2);

    // Secondary crisp lock confirmation ping
    const ping = ctx.createOscillator();
    const pingGain = ctx.createGain();
    ping.type = 'triangle';
    ping.frequency.setValueAtTime(1480, now + 0.19);

    pingGain.gain.setValueAtTime(0.0001, now + 0.19);
    pingGain.gain.exponentialRampToValueAtTime(0.04, now + 0.205);
    pingGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.29);

    ping.connect(pingGain);
    pingGain.connect(this.masterGain);

    ping.start(now + 0.19);
    ping.stop(now + 0.31);
  }

  // Subtle pneumatic solenoid + air valve release for sorting gate activation
  public playSortingGate(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;

    // 1. Mechanical actuator thud
    const thudOsc = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thudOsc.type = 'triangle';
    thudOsc.frequency.setValueAtTime(175, now);
    thudOsc.frequency.exponentialRampToValueAtTime(68, now + 0.11);

    thudGain.gain.setValueAtTime(0.0001, now);
    thudGain.gain.exponentialRampToValueAtTime(0.09, now + 0.012);
    thudGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);

    thudOsc.connect(thudGain);
    thudGain.connect(this.masterGain);
    thudOsc.start(now);
    thudOsc.stop(now + 0.14);

    // 2. Crisp pneumatic air hiss
    const bufferSize = Math.floor(ctx.sampleRate * 0.12);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(2400, now);
    bandpass.Q.value = 1.6;

    const airGain = ctx.createGain();
    airGain.gain.setValueAtTime(0.0001, now);
    airGain.gain.exponentialRampToValueAtTime(0.045, now + 0.015);
    airGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.115);

    noise.connect(bandpass);
    bandpass.connect(airGain);
    airGain.connect(this.masterGain);
    noise.start(now);
    noise.stop(now + 0.12);
  }

  public playCycleComplete(isCorrect: boolean): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const notes = isCorrect ? [587.33, 880] : [330, 261.63];

    notes.forEach((freq, idx) => {
      const start = now + idx * 0.085;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.045, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.14);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(start);
      osc.stop(start + 0.16);
    });
  }

  public playFaultAlert(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    [0, 0.14].forEach((offset) => {
      const start = now + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, start);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 600;

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.045, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.11);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(start);
      osc.stop(start + 0.12);
    });
  }
}

export const soundEngine = new SoundEngine();
