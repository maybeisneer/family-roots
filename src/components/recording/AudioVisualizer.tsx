'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface AudioVisualizerProps {
  stream: MediaStream | null;
  isRecording: boolean;
}

export function AudioVisualizer({ stream, isRecording }: AudioVisualizerProps) {
  const [levels, setLevels] = useState<number[]>(Array(20).fill(0.1));
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (!stream || !isRecording) {
      setLevels(Array(20).fill(0.1));
      return;
    }

    // Check if stream has active audio tracks
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0 || !audioTracks[0].enabled) {
      console.warn('AudioVisualizer: No active audio tracks in stream');
      return;
    }

    let audioContext: AudioContext | null = null;
    let isCleanedUp = false;

    const setupAudio = async () => {
      try {
        audioContext = new AudioContext();

        // Resume AudioContext if suspended (required by browsers after user interaction)
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }

        if (isCleanedUp) return;

        const source = audioContext.createMediaStreamSource(stream);
        const analyzer = audioContext.createAnalyser();

        analyzer.fftSize = 64;
        analyzer.smoothingTimeConstant = 0.8;
        source.connect(analyzer);
        analyzerRef.current = analyzer;

        const dataArray = new Uint8Array(analyzer.frequencyBinCount);

        const updateLevels = () => {
          if (isCleanedUp) return;

          analyzer.getByteFrequencyData(dataArray);

          const newLevels = [];
          const segmentSize = Math.floor(dataArray.length / 20);

          for (let i = 0; i < 20; i++) {
            let sum = 0;
            for (let j = 0; j < segmentSize; j++) {
              sum += dataArray[i * segmentSize + j];
            }
            const avg = sum / segmentSize / 255;
            newLevels.push(Math.max(0.1, avg));
          }

          setLevels(newLevels);
          animationRef.current = requestAnimationFrame(updateLevels);
        };

        updateLevels();
      } catch (err) {
        console.error('AudioVisualizer: Failed to setup audio context', err);
      }
    };

    setupAudio();

    return () => {
      isCleanedUp = true;
      cancelAnimationFrame(animationRef.current);
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [stream, isRecording]);

  return (
    <div className="flex items-center justify-center gap-1 h-16 px-4">
      {levels.map((level, i) => (
        <motion.div
          key={i}
          animate={{
            height: `${level * 100}%`,
            backgroundColor: isRecording 
              ? `rgba(251, 191, 36, ${0.5 + level * 0.5})` 
              : 'rgba(120, 113, 108, 0.5)',
          }}
          transition={{
            height: { duration: 0.1 },
            backgroundColor: { duration: 0.3 },
          }}
          className="w-1.5 rounded-full"
          style={{ minHeight: '4px' }}
        />
      ))}
    </div>
  );
}

