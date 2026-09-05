import { useEffect, useRef } from 'react';
import type { RecordingState } from './useVoiceRecorder';

export const useVoiceVisualizer = (recordingState: RecordingState) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (recordingState !== 'recording') {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const setupVisualizer = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioCtx = new AudioContext();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;

        const draw = () => {
          if (!canvasRef.current || !analyserRef.current) return;

          const canvas = canvasRef.current;
          const context = canvas.getContext('2d');
          if (!context) return;

          const bufferLength = analyserRef.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyserRef.current.getByteFrequencyData(dataArray);

          const width = canvas.width;
          const height = canvas.height;

          context.clearRect(0, 0, width, height);

          const barWidth = (width / bufferLength) * 2.5;
          let x = 0;

          for (let index = 0; index < bufferLength; index += 1) {
            const barHeight = (dataArray[index] / 255) * height * 0.8;
            const gradient = context.createLinearGradient(0, height - barHeight, 0, height);
            gradient.addColorStop(0, 'rgba(99, 102, 241, 0.9)');
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0.6)');
            context.fillStyle = gradient;

            const radius = Math.min(barWidth / 2, 3);
            const barX = x;
            const barY = height - barHeight;

            context.beginPath();
            context.moveTo(barX + radius, barY);
            context.lineTo(barX + barWidth - radius, barY);
            context.quadraticCurveTo(barX + barWidth, barY, barX + barWidth, barY + radius);
            context.lineTo(barX + barWidth, height - radius);
            context.quadraticCurveTo(barX + barWidth, height, barX + barWidth - radius, height);
            context.lineTo(barX + radius, height);
            context.quadraticCurveTo(barX, height, barX, height - radius);
            context.lineTo(barX, barY + radius);
            context.quadraticCurveTo(barX, barY, barX + radius, barY);
            context.fill();

            x += barWidth + 1;
          }

          animationFrameRef.current = requestAnimationFrame(draw);
        };

        draw();
      } catch {
        return;
      }
    };

    void setupVisualizer();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        void audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [recordingState]);

  return {
    canvasRef,
  };
};
