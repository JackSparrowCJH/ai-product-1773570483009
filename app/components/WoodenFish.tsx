"use client";

import { useRef, useCallback, useState } from "react";

interface FloatingText {
  id: number;
  x: number;
  y: number;
}

let nextId = 0;

export default function WoodenFish() {
  const [merit, setMerit] = useState(0);
  const [floats, setFloats] = useState<FloatingText[]>([]);
  const [scale, setScale] = useState(1);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  }, []);

  const playSound = useCallback(() => {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;

    // Oscillator for the "knock" tone
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);

    // Noise burst for attack
    const bufferSize = ctx.sampleRate * 0.05;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp((-i / ctx.sampleRate) * 80);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.05);
  }, [getAudioCtx]);

  const handleTap = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      let cx: number, cy: number;
      if ("touches" in e) {
        const t = e.touches[0];
        cx = t.clientX;
        cy = t.clientY;
      } else {
        cx = e.clientX;
        cy = e.clientY;
      }

      playSound();
      setMerit((m) => m + 1);

      const id = nextId++;
      const offsetX = (Math.random() - 0.5) * 60;
      setFloats((f) => [...f, { id, x: cx + offsetX, y: cy - 20 }]);
      setTimeout(() => setFloats((f) => f.filter((item) => item.id !== id)), 900);

      setScale(0.88);
      setTimeout(() => setScale(1), 100);
    },
    [playSound]
  );

  return (
    <div style={styles.container} onMouseDown={handleTap} onTouchStart={handleTap}>
      <style>{keyframes}</style>
      <div style={styles.meritDisplay}>功德：{merit}</div>
      <div
        style={{
          ...styles.fish,
          transform: `scale(${scale})`,
          transition: "transform 0.1s ease-out",
        }}
      >
        🪵
      </div>
      <div style={styles.hint}>点击敲木鱼</div>
      {floats.map((f) => (
        <div key={f.id} style={{ ...styles.floatText, left: f.x, top: f.y }}>
          功德+1
        </div>
      ))}
    </div>
  );
}

const keyframes = `
@keyframes floatUp {
  0% { opacity: 1; transform: translateY(0) translateX(-50%); }
  100% { opacity: 0; transform: translateY(-120px) translateX(-50%); }
}
`;

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    userSelect: "none",
    overflow: "hidden",
    position: "relative",
    cursor: "pointer",
    touchAction: "manipulation",
  },
  meritDisplay: {
    color: "#f5c842",
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "40px",
    textShadow: "0 0 10px rgba(245,200,66,0.5)",
  },
  fish: {
    fontSize: "120px",
    lineHeight: 1,
    filter: "drop-shadow(0 0 20px rgba(245,200,66,0.3))",
  },
  hint: {
    color: "rgba(255,255,255,0.4)",
    fontSize: "14px",
    marginTop: "30px",
  },
  floatText: {
    position: "fixed",
    color: "#f5c842",
    fontSize: "22px",
    fontWeight: "bold",
    pointerEvents: "none",
    animation: "floatUp 0.9s ease-out forwards",
    textShadow: "0 0 8px rgba(245,200,66,0.6)",
    zIndex: 999,
  },
};
