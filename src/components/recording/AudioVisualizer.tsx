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

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyzer = audioContext.createAnalyser();
    
    analyzer.fftSize = 64;
    analyzer.smoothingTimeConstant = 0.8;
    source.connect(analyzer);
    analyzerRef.current = analyzer;

    const dataArray = new Uint8Array(analyzer.frequencyBinCount);

    const updateLevels = () => {
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

    return () => {
      cancelAnimationFrame(animationRef.current);
      audioContext.close();
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

