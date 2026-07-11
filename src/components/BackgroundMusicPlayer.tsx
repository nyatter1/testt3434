import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, VolumeX } from 'lucide-react';

interface BackgroundMusicPlayerProps {
  musicUrl?: string;
  visualizerType?: string;
  soundsEnabled: boolean;
}

export default function BackgroundMusicPlayer({ musicUrl, visualizerType = 'bars', soundsEnabled }: BackgroundMusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number>();
  
  // Audio context refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    if (!musicUrl) {
      setIsPlaying(false);
      setAudioError(null);
      return;
    }

    setAudioError(null);

    const initAudio = () => {
      try {
        if (!audioRef.current) {
          audioRef.current = new Audio(musicUrl);
          audioRef.current.loop = true;
          audioRef.current.crossOrigin = "anonymous";
        } else if (audioRef.current.src !== musicUrl) {
          audioRef.current.src = musicUrl;
          setIsPlaying(false);
        }

        audioRef.current.onerror = (e) => {
          console.error("Audio element error event:", e);
          setAudioError("Playback failed: The element has no supported sources or is blocked by your browser.");
          setIsPlaying(false);
        };
      } catch (err) {
        console.error("Failed to initialize Audio:", err);
        setAudioError("Initialization failed: invalid audio format or blocked.");
      }
    };

    initAudio();
  }, [musicUrl]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = !soundsEnabled;
    if (!soundsEnabled && isPlaying) {
      // Pause if globally muted?
      // Optional, but setting muted is enough.
    }
  }, [soundsEnabled, isPlaying]);

  const initAudioContext = () => {
    if (!audioRef.current) return;
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const audioCtx = new AudioContextClass();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = visualizerType === 'bars' ? 256 : 512;
      
      const source = audioCtx.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
      
      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;
      sourceRef.current = source;
    } else {
      // Resume context if suspended (browser autoplay policy)
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    } else {
      setAudioError(null);
      initAudioContext();
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        drawVisualizer();
      }).catch(err => {
        console.error("Audio play failed:", err);
        setAudioError("Audio play failed: " + (err.message || "Interrupted or unsupported source."));
      });
    }
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(console.error);
      }
    };
  }, []);

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      if (!isPlaying) return;
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (visualizerType === 'bars') {
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          // Gradient
          const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
          gradient.addColorStop(0, '#8b5cf6'); // purple-500
          gradient.addColorStop(1, '#c084fc'); // purple-400
          
          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }
      } else if (visualizerType === 'wave') {
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#c084fc';
        ctx.beginPath();
        const sliceWidth = canvas.width * 1.0 / bufferLength;
        let x = 0;
        
        // Use time domain for wave
        const timeData = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(timeData);
        
        for (let i = 0; i < bufferLength; i++) {
          const v = timeData[i] / 128.0;
          const y = v * canvas.height / 2;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
      } else if (visualizerType === 'circle') {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        for (let i = 0; i < bufferLength; i++) {
          const rads = Math.PI * 2 / bufferLength;
          const barHeight = (dataArray[i] / 255) * radius * 0.8;
          const x = centerX + Math.cos(rads * i) * (radius);
          const y = centerY + Math.sin(rads * i) * (radius);
          const xEnd = centerX + Math.cos(rads * i) * (radius + barHeight);
          const yEnd = centerY + Math.sin(rads * i) * (radius + barHeight);
          
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(xEnd, yEnd);
          ctx.stroke();
        }
      }
    };
    draw();
  };

  // Re-trigger draw if we switched from paused to playing
  useEffect(() => {
    if (isPlaying) {
      drawVisualizer();
    }
  }, [isPlaying, visualizerType]);

  if (!musicUrl) return null;

  return (
    <div className="flex flex-col items-center justify-center w-full my-4 gap-2">
      <div className="relative w-full max-w-[240px] h-12 bg-purple-900/10 rounded-xl overflow-hidden border border-purple-900/30 flex items-center justify-center px-2">
        {/* Background Visualizer */}
        <canvas ref={canvasRef} width={240} height={48} className="absolute inset-0 w-full h-full opacity-60" />
        
        {/* Controls Overlay */}
        <div className="z-10 flex items-center justify-between w-full">
          <button
            onClick={togglePlay}
            className="p-1.5 bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 rounded-full transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          
          <div className="flex items-center gap-1.5 px-2 py-1 bg-black/40 rounded-full border border-purple-500/20">
            {!soundsEnabled ? (
              <VolumeX className="w-3 h-3 text-red-400" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
            <span className="text-[9px] font-black uppercase tracking-widest text-purple-200">
              {isPlaying ? 'Playing' : 'Paused'}
            </span>
          </div>
        </div>
      </div>
      {audioError && (
        <p className="text-[10px] text-red-400 font-bold text-center max-w-[240px] leading-relaxed break-words px-2 animate-pulse bg-red-950/20 py-1 rounded border border-red-900/30">
          {audioError}
        </p>
      )}
    </div>
  );
}
