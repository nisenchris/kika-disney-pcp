import { Component, Input, OnDestroy, AfterViewInit, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'jhi-audio-visualizer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audio-visualizer.component.html',
  styleUrl: './audio-visualizer.component.scss',
})
export default class AudioVisualizerComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) audioUrl!: string;
  @ViewChild('audioElement', { static: false }) audioElementRef?: ElementRef<HTMLAudioElement>;

  isPlaying = signal(false);
  amplitude = signal(0);

  private audioContext?: AudioContext;
  private analyser?: AnalyserNode;
  private source?: MediaElementAudioSourceNode;
  private animationFrameId?: number;
  private dataArray?: Uint8Array<ArrayBuffer>;
  private audioInitialized = false;

  ngAfterViewInit(): void {
    // Audio element is now available
    console.log('AudioVisualizer initialized with URL:', this.audioUrl);
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  togglePlayback(): void {
    const audio = this.audioElementRef?.nativeElement;
    
    if (!audio) {
      console.error('Audio element not found');
      return;
    }

    console.log('Toggle playback - current state:', this.isPlaying());

    if (this.isPlaying()) {
      audio.pause();
      this.isPlaying.set(false);
      this.stopVisualization();
    } else {
      // Initialize audio context on first play (required by browsers)
      if (!this.audioInitialized) {
        console.log('Initializing audio context...');
        this.initializeAudioContext(audio);
        this.audioInitialized = true;
      }

      audio.play()
        .then(() => {
          console.log('Audio playing successfully');
          this.isPlaying.set(true);
          this.startVisualization();
        })
        .catch(error => {
          console.error('Error playing audio:', error);
        });
    }
  }

  private initializeAudioContext(audioElement: HTMLAudioElement): void {
    try {
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;

      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);

      this.source = this.audioContext.createMediaElementSource(audioElement);
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);

      // Handle audio ended event
      audioElement.addEventListener('ended', () => {
        this.isPlaying.set(false);
        this.amplitude.set(0);
        this.stopVisualization();
      });
    } catch (error) {
      console.error('Error initializing audio context:', error);
    }
  }

  private startVisualization(): void {
    const visualize = () => {
      if (!this.isPlaying() || !this.analyser || !this.dataArray) {
        return;
      }

      this.analyser.getByteFrequencyData(this.dataArray);

      // Calculate average amplitude from frequency data
      const sum = this.dataArray.reduce((acc, val) => acc + val, 0);
      const average = sum / this.dataArray.length;

      // Normalize to 0-1 range and apply some easing
      const normalized = Math.min(average / 128, 1);
      
      // Smooth the amplitude changes
      const currentAmplitude = this.amplitude();
      const smoothed = currentAmplitude * 0.7 + normalized * 0.3;
      
      this.amplitude.set(smoothed);

      this.animationFrameId = requestAnimationFrame(visualize);
    };

    visualize();
  }

  private stopVisualization(): void {
    if (this.animationFrameId !== undefined) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }
    this.amplitude.set(0);
  }

  private cleanup(): void {
    this.stopVisualization();

    if (this.source) {
      this.source.disconnect();
    }

    if (this.analyser) {
      this.analyser.disconnect();
    }

    if (this.audioContext) {
      this.audioContext.close();
    }
  }

  // Calculate scale for each pulse ring based on amplitude
  getRingScale(ringIndex: number): number {
    const baseScale = 1 + ringIndex * 0.15;
    const amplitudeBoost = this.amplitude() * (0.3 + ringIndex * 0.1);
    return baseScale + amplitudeBoost;
  }

  // Calculate opacity for each pulse ring based on amplitude
  getRingOpacity(ringIndex: number): number {
    const baseOpacity = 0.3 - ringIndex * 0.08;
    const amplitudeBoost = this.amplitude() * 0.4;
    return Math.min(baseOpacity + amplitudeBoost, 0.6);
  }
}

