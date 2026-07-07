/**
 * Procedural Rain & Metal Roof Audio Synthesizer
 * Synthesizes high-fidelity rain static, heavy storm gusts, and corrugated steel sheet
 * drop impacts using the Web Audio API without requiring any external audio assets.
 */

export class RainAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  
  // Static rain hiss (Pink noise)
  private pinkSource: AudioBufferSourceNode | null = null;
  private pinkGain: GainNode | null = null;
  private pinkFilter: BiquadFilterNode | null = null;
  
  // Deep rumbling & wind (Brown noise)
  private brownSource: AudioBufferSourceNode | null = null;
  private brownGain: GainNode | null = null;
  private brownFilter: BiquadFilterNode | null = null;

  // Sound buffers
  private pinkBuffer: AudioBuffer | null = null;
  private brownBuffer: AudioBuffer | null = null;
  private whiteBuffer: AudioBuffer | null = null;

  // Scheduling states
  private active: boolean = false;
  private weatherType: 'clear' | 'rain' | 'snow' | 'storm' = 'clear';
  private masterVolume: number = 0.5;
  private dropTimer: any = null;
  private windInterval: any = null;
  private isInside: boolean = false;

  constructor() {}

  /**
   * Initializes the AudioContext and pre-builds the noise buffers.
   * Safe to call repeatedly; only runs once.
   */
  private init() {
    if (this.ctx) return;

    // Create context safely across browsers
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();
    
    // Create master gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Build reusable noise buffers
    const sampleRate = this.ctx.sampleRate;
    const fourSecSize = sampleRate * 4;
    const twoSecSize = sampleRate * 2;

    // 1. Pink Noise Buffer (Paul Kellet's refined method)
    this.pinkBuffer = this.ctx.createBuffer(1, fourSecSize, sampleRate);
    const pinkOut = this.pinkBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < fourSecSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      pinkOut[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      pinkOut[i] *= 0.11; // normalise
      b6 = white * 0.115926;
    }

    // 2. Brown Noise Buffer
    this.brownBuffer = this.ctx.createBuffer(1, fourSecSize, sampleRate);
    const brownOut = this.brownBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < fourSecSize; i++) {
      const white = Math.random() * 2 - 1;
      brownOut[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = brownOut[i];
      brownOut[i] *= 3.5; // amplify
    }

    // 3. White Noise Buffer (for raindrop impacts)
    this.whiteBuffer = this.ctx.createBuffer(1, twoSecSize, sampleRate);
    const whiteOut = this.whiteBuffer.getChannelData(0);
    for (let i = 0; i < twoSecSize; i++) {
      whiteOut[i] = Math.random() * 2 - 1;
    }
  }

  /**
   * Starts playing the current weather soundscape.
   */
  public start(type: 'clear' | 'rain' | 'snow' | 'storm', volume?: number) {
    this.init();
    if (!this.ctx) return;

    if (volume !== undefined) {
      this.masterVolume = volume;
      if (this.masterGain) {
        this.masterGain.gain.setValueAtTime(volume, this.ctx.currentTime);
      }
    }

    // Resume context if suspended (autoplay restriction safety)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.weatherType = type;
    this.active = true;

    // Clear existing synthesis nodes
    this.stopNodes();

    if (type === 'clear' || type === 'snow') {
      // Snow is practically silent; no active rain synthesis needed
      return;
    }

    const now = this.ctx.currentTime;

    // --- Pink Noise Setup (Soothing constant rain) ---
    if (this.pinkBuffer) {
      this.pinkSource = this.ctx.createBufferSource();
      this.pinkSource.buffer = this.pinkBuffer;
      this.pinkSource.loop = true;

      this.pinkFilter = this.ctx.createBiquadFilter();
      this.pinkFilter.type = 'lowpass';
      // Storm rain is darker; normal rain is slightly crisper. Muffled if inside.
      const initialPinkFreq = this.isInside
        ? (type === 'storm' ? 450 : 600)
        : (type === 'storm' ? 1200 : 1800);
      this.pinkFilter.frequency.setValueAtTime(initialPinkFreq, now);

      this.pinkGain = this.ctx.createGain();
      // Smooth fade-in
      this.pinkGain.gain.setValueAtTime(0, now);
      const targetPinkGain = type === 'storm' ? 0.35 : 0.25;
      this.pinkGain.gain.linearRampToValueAtTime(targetPinkGain, now + 1.5);

      this.pinkSource.connect(this.pinkFilter);
      this.pinkFilter.connect(this.pinkGain);
      if (this.masterGain) this.pinkGain.connect(this.masterGain);

      this.pinkSource.start(now);
    }

    // --- Brown Noise Setup (Deep roar & wind gusts) ---
    if (this.brownBuffer) {
      this.brownSource = this.ctx.createBufferSource();
      this.brownSource.buffer = this.brownBuffer;
      this.brownSource.loop = true;

      this.brownFilter = this.ctx.createBiquadFilter();
      this.brownFilter.type = 'lowpass';
      const initialBrownFreq = this.isInside ? 90 : 120;
      this.brownFilter.frequency.setValueAtTime(initialBrownFreq, now);

      this.brownGain = this.ctx.createGain();
      this.brownGain.gain.setValueAtTime(0, now);
      const targetBrownGain = type === 'storm' ? 0.45 : 0.15;
      this.brownGain.gain.linearRampToValueAtTime(targetBrownGain, now + 2.0);

      this.brownSource.connect(this.brownFilter);
      this.brownFilter.connect(this.brownGain);
      if (this.masterGain) this.brownGain.connect(this.masterGain);

      this.brownSource.start(now);
    }

    // --- Dynamic Wind Gust Modulation (Storm only) ---
    if (type === 'storm') {
      this.startWindGustLoop();
    }

    // --- Corrugated Sheet Impact (Raindrops) Scheduler ---
    this.startRaindropsLoop();
  }

  /**
   * Periodically triggers metallic pitter-patter raindrop impacts.
   */
  private startRaindropsLoop() {
    if (this.dropTimer) clearInterval(this.dropTimer);

    // Weather specs determine density
    const msInterval = this.weatherType === 'storm' ? 15 : 45;

    this.dropTimer = setInterval(() => {
      if (!this.active || !this.ctx || !this.whiteBuffer || !this.masterGain) return;

      // Ensure we don't trigger drops if muted
      if (this.masterVolume <= 0.01) return;

      // Randomised probability of hits per tick to avoid mechanical rhythm
      const probability = this.weatherType === 'storm' ? 0.85 : 0.45;
      if (Math.random() > probability) return;

      const now = this.ctx.currentTime;
      const inside = this.isInside;
      
      // 1. The crisp high-frequency click (sheet impact)
      const clickSource = this.ctx.createBufferSource();
      clickSource.buffer = this.whiteBuffer;
      
      const clickFilter = this.ctx.createBiquadFilter();
      clickFilter.type = 'bandpass';
      // Muffle clicks slightly more when inside
      const clickPitch = inside ? (2000 + Math.random() * 1000) : (3200 + Math.random() * 1800);
      clickFilter.frequency.setValueAtTime(clickPitch, now);
      clickFilter.Q.setValueAtTime(inside ? 6 : 10, now);
      
      const clickGain = this.ctx.createGain();
      clickGain.gain.setValueAtTime(0, now);
      // Soft click volume scaling (softer inside as it's isolated by sheet metal thickness)
      const clickMult = inside ? 0.35 : 1.0;
      const hitStrength = 0.04 * (0.3 + Math.random() * 0.7) * (this.weatherType === 'storm' ? 1.4 : 1.0) * clickMult;
      clickGain.gain.linearRampToValueAtTime(hitStrength, now + 0.001);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, now + (inside ? 0.003 : 0.004) + Math.random() * 0.004);
      
      clickSource.connect(clickFilter);
      clickFilter.connect(clickGain);
      clickGain.connect(this.masterGain);
      
      // 2. The hollow metallic resonance of the building's sheeting
      const resoOsc = this.ctx.createOscillator();
      // Corrugated sheets resonate around 1300Hz - 2400Hz. Slightly deeper and more booming inside.
      const pitch = (inside ? (900 + Math.random() * 800) : (1200 + Math.random() * 1200));
      resoOsc.frequency.setValueAtTime(pitch, now);
      resoOsc.frequency.exponentialRampToValueAtTime(pitch * 0.75, now + (inside ? 0.09 : 0.06));
      
      const resoGain = this.ctx.createGain();
      resoGain.gain.setValueAtTime(0, now);
      // Resonance is amplified inside since the warehouse acts as an acoustic soundbox
      const resoMult = inside ? 2.5 : 1.0;
      const resoStrength = 0.016 * (0.4 + Math.random() * 0.6) * (this.weatherType === 'storm' ? 1.5 : 1.0) * resoMult;
      resoGain.gain.linearRampToValueAtTime(resoStrength, now + 0.002);
      resoGain.gain.exponentialRampToValueAtTime(0.0001, now + (inside ? 0.07 : 0.035) + Math.random() * (inside ? 0.08 : 0.05));
      
      resoOsc.connect(resoGain);
      resoGain.connect(this.masterGain);
      
      clickSource.start(now);
      clickSource.stop(now + 0.02);
      
      resoOsc.start(now);
      resoOsc.stop(now + (inside ? 0.22 : 0.1));
    }, msInterval);
  }

  /**
   * Slowly modulates filter cutoffs and volumes of the brown noise to create howling wind.
   */
  private startWindGustLoop() {
    if (this.windInterval) clearInterval(this.windInterval);

    this.windInterval = setInterval(() => {
      if (!this.active || !this.ctx || !this.brownFilter || !this.brownGain) return;

      const now = this.ctx.currentTime;
      // Synthesize a wind gust profile
      const isGust = Math.random() > 0.4;
      const targetFreq = isGust ? (150 + Math.random() * 250) : (80 + Math.random() * 50);
      const targetGain = isGust ? (0.5 + Math.random() * 0.3) : (0.2 + Math.random() * 0.15);
      const transitionSecs = 1.5 + Math.random() * 2.0;

      this.brownFilter.frequency.exponentialRampToValueAtTime(targetFreq, now + transitionSecs);
      this.brownGain.gain.linearRampToValueAtTime(targetGain, now + transitionSecs);
    }, 3000);
  }

  /**
   * Updates the volume smoothly.
   */
  public setVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(this.masterVolume, this.ctx.currentTime + 0.1);
    }
  }

  /**
   * Returns current master volume.
   */
  public getVolume(): number {
    return this.masterVolume;
  }

  /**
   * Safe termination of all running synth nodes and timers.
   */
  private stopNodes() {
    if (this.pinkSource) {
      try { this.pinkSource.stop(); } catch(e) {}
      this.pinkSource.disconnect();
      this.pinkSource = null;
    }
    if (this.pinkGain) {
      this.pinkGain.disconnect();
      this.pinkGain = null;
    }
    if (this.pinkFilter) {
      this.pinkFilter.disconnect();
      this.pinkFilter = null;
    }

    if (this.brownSource) {
      try { this.brownSource.stop(); } catch(e) {}
      this.brownSource.disconnect();
      this.brownSource = null;
    }
    if (this.brownGain) {
      this.brownGain.disconnect();
      this.brownGain = null;
    }
    if (this.brownFilter) {
      this.brownFilter.disconnect();
      this.brownFilter = null;
    }

    if (this.dropTimer) {
      clearInterval(this.dropTimer);
      this.dropTimer = null;
    }

    if (this.windInterval) {
      clearInterval(this.windInterval);
      this.windInterval = null;
    }
  }

  /**
   * Updates acoustic properties when transitioning inside or outside the building.
   */
  public setInside(inside: boolean) {
    this.isInside = inside;
    if (!this.ctx || !this.active) return;
    const now = this.ctx.currentTime;

    // Smoothly adjust lowpass filter cutoffs
    if (this.pinkFilter) {
      const targetFreq = inside 
        ? (this.weatherType === 'storm' ? 450 : 600) 
        : (this.weatherType === 'storm' ? 1200 : 1800);
      this.pinkFilter.frequency.exponentialRampToValueAtTime(targetFreq, now + 1.2);
    }

    if (this.brownFilter) {
      const targetFreq = inside ? 90 : 120;
      this.brownFilter.frequency.exponentialRampToValueAtTime(targetFreq, now + 1.2);
    }
  }

  /**
   * Dynamically synthesizes a deep, realistic, rolling thunder rumble.
   */
  public triggerThunder(delaySeconds: number) {
    if (!this.ctx || !this.active || this.weatherType !== 'storm' || !this.brownBuffer || !this.masterGain) return;
    if (this.masterVolume <= 0.05) return;

    const now = this.ctx.currentTime;
    const startTime = now + delaySeconds;

    const thunderSource = this.ctx.createBufferSource();
    thunderSource.buffer = this.brownBuffer;
    thunderSource.loop = true;

    const thunderFilter = this.ctx.createBiquadFilter();
    thunderFilter.type = 'lowpass';
    // Deep thunder rumble cut-off frequencies
    const initialCutoff = this.isInside ? 45 : 65;
    const peakCutoff = this.isInside ? 90 : 140;
    const tailCutoff = this.isInside ? 30 : 45;

    thunderFilter.frequency.setValueAtTime(initialCutoff, startTime);
    thunderFilter.frequency.linearRampToValueAtTime(peakCutoff, startTime + 0.25);
    thunderFilter.frequency.exponentialRampToValueAtTime(tailCutoff, startTime + 4.5);

    const thunderGain = this.ctx.createGain();
    thunderGain.gain.setValueAtTime(0, now);

    // Dynamic rolling multi-clap amplitude envelope
    const peakVolume = 0.45 * (0.6 + Math.random() * 0.4) * (this.isInside ? 1.2 : 0.8); // Deeper rumbling is more intense inside a hollow steel structure
    
    thunderGain.gain.setValueAtTime(0, startTime);
    // Primary sharp crack/clap
    thunderGain.gain.linearRampToValueAtTime(peakVolume, startTime + 0.15);
    // Dynamic tumbling echo roll
    thunderGain.gain.linearRampToValueAtTime(peakVolume * 0.35, startTime + 0.4);
    thunderGain.gain.linearRampToValueAtTime(peakVolume * 0.72, startTime + 0.75); // Secondary echo
    thunderGain.gain.linearRampToValueAtTime(peakVolume * 0.28, startTime + 1.3);
    thunderGain.gain.linearRampToValueAtTime(peakVolume * 0.52, startTime + 1.7); // Tertiary echo
    // Long fading rumbling tail
    thunderGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 6.0 + Math.random() * 2.5);

    thunderSource.connect(thunderFilter);
    thunderFilter.connect(thunderGain);
    thunderGain.connect(this.masterGain);

    thunderSource.start(startTime);
    thunderSource.stop(startTime + 9.0);
  }

  /**
   * Stops the synthesizer completely.
   */
  public stop() {
    this.active = false;
    this.stopNodes();
  }
}

// Singleton global instance so playing/toggling works across re-renders
export const rainSynthesizer = new RainAudioSynthesizer();
