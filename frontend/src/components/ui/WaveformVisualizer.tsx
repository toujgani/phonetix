import React, { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  isRecording: boolean;
  isPlaying?: boolean;
  audioStream?: MediaStream | null;
  className?: string;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  isRecording,
  isPlaying = false,
  audioStream = null,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let analyser: AnalyserNode | null = null;
    let dataArray: any = null;
    let audioCtx: AudioContext | null = null;

    if (isRecording && audioStream) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtx = new AudioCtx();
        const source = audioCtx.createMediaStreamSource(audioStream);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
      } catch {
        // Fallback to simulated waveform
      }
    }

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      const numBars = 36;
      const barWidth = 3;
      const gap = (width - numBars * barWidth) / (numBars - 1);

      if (isRecording || isPlaying) {
        if (analyser && dataArray) {
          analyser.getByteFrequencyData(dataArray);
        }

        for (let i = 0; i < numBars; i++) {
          let magnitude = 0;
          if (dataArray && dataArray.length > 0) {
            const index = Math.floor((i / numBars) * dataArray.length);
            magnitude = (dataArray[index] / 255) * (height * 0.85);
          } else {
            // Harmonic wave simulation
            magnitude =
              Math.sin(phase + (i * 0.35)) * 14 +
              Math.cos(phase * 1.5 + (i * 0.2)) * 10 +
              18;
          }

          const barHeight = Math.max(4, magnitude);
          const x = i * (barWidth + gap);
          const y = centerY - barHeight / 2;

          // Gradient color: Royal Blue to Refined Violet
          const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
          gradient.addColorStop(0, '#2563EB');
          gradient.addColorStop(1, '#7657E8');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 2);
          ctx.fill();
        }
        phase += 0.12;
      } else {
        // Flatline idle state
        for (let i = 0; i < numBars; i++) {
          const x = i * (barWidth + gap);
          ctx.fillStyle = '#94A3B8';
          ctx.beginPath();
          ctx.roundRect(x, centerY - 2, barWidth, 4, 2);
          ctx.fill();
        }
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (audioCtx) {
        audioCtx.close().catch(() => {});
      }
    };
  }, [isRecording, isPlaying, audioStream]);

  return (
    <div className={`relative flex items-center justify-center p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-brand-border dark:border-brand-border-dark ${className}`}>
      <canvas
        ref={canvasRef}
        width={320}
        height={60}
        className="w-full h-14"
      />
    </div>
  );
};
