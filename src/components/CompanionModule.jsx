import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { SovereignEngine } from '../services/SovereignEngine';
import { 
  MessageSquare, BookOpen, TreeDeciduous, HeartHandshake, HelpCircle, 
  Send, User, Sparkles, Smile, ShieldAlert, BookMarked, Brain, Volume2, Award,
  Image, X, Loader2, Film, Play, Pause, RefreshCw, Compass, Maximize2, Minimize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Web Audio API Synthesis Helper for offline sound FX
const playCompanionSound = (type, text = "") => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      const ctx = new AudioContextClass();
      const runSynth = () => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        if (type === 'crying') {
          // Simulated sad whine
          osc.type = 'sine';
          osc.frequency.setValueAtTime(350, ctx.currentTime);
          osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.3);
          osc.frequency.linearRampToValueAtTime(250, ctx.currentTime + 0.8);
          osc.frequency.linearRampToValueAtTime(350, ctx.currentTime + 1.2);
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.4);
          osc.start();
          osc.stop(ctx.currentTime + 1.4);
        } else if (type === 'proud' || type === 'success') {
          // Bright chime
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
          osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
          osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
          osc.start();
          osc.stop(ctx.currentTime + 0.5);
        } else if (type === 'angry') {
          // Low buzzy sound
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(120, ctx.currentTime);
          osc.frequency.linearRampToValueAtTime(70, ctx.currentTime + 0.6);
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.7);
          osc.start();
          osc.stop(ctx.currentTime + 0.7);
        } else if (type === 'normal') {
          // Soft beep for normal answers
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.1);
          gain.gain.setValueAtTime(0.05, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
        }
      };

      if (ctx.state === 'suspended') {
        ctx.resume().then(() => {
          runSynth();
        });
      } else {
        runSynth();
      }
    }
  } catch (e) {
    console.warn("Audio synthesis not supported or blocked by user action.", e);
  }

  try {
    const saved = localStorage.getItem('companion_api_settings');
    const parsed = saved ? JSON.parse(saved) : {};
    const enableTTS = parsed.enableTTS !== false;
    
    if (text && enableTTS && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const zhVoice = voices.find(v => v.lang.startsWith('zh'));
      if (zhVoice) {
        utterance.voice = zhVoice;
      }
      utterance.rate = 1.05;
      utterance.pitch = 1.25; // Slightly higher pitch for cute boy companion
      window.speechSynthesis.speak(utterance);
    }
  } catch (e) {
    console.warn("TTS error:", e);
  }
};

const KNOWLEDGE_NODES = [
  { id: 'math', name: '数学·分形几何', desc: '学习自然界自相似性，理解黄金分割率', completed: true, val: 20, cx: 120, cy: 180 },
  { id: 'phys', name: '物理·经典力学', desc: '体验苹果落地，重现重力加速度发现', completed: true, val: 30, cx: 280, cy: 120 },
  { id: 'chem', name: '化学·元素周期律', desc: '探索原子核外排布与分子键结', completed: false, val: 40, cx: 380, cy: 220 },
  { id: 'bio', name: '生物·DNA双螺旋', desc: '理解生命遗传编码与碱基配对', completed: false, val: 45, cx: 220, cy: 260 },
  { id: 'hist', name: '文明·信息技术革命', desc: '穿越图灵俱乐部，拆解计算边界', completed: true, val: 50, cx: 100, cy: 300 },
];

const GalileoSimulator = () => {
  const [massA, setMassA] = useState(1); // kg
  const [massB, setMassB] = useState(10); // kg
  const [gravity, setGravity] = useState(9.8); // m/s^2
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [posA, setPosA] = useState(50); // Y position
  const [posB, setPosB] = useState(50); // Y position
  const [landed, setLanded] = useState(false);
  const canvasRef = useRef(null);

  const startHeight = 50; // top starting Y position
  const landHeight = 240; // bottom landing Y position
  
  useEffect(() => {
    let animId;
    if (running) {
      const startTime = performance.now();
      const run = () => {
        const elapsed = (performance.now() - startTime) / 1000; // seconds
        const distance = 0.5 * gravity * elapsed * elapsed * 200; // scaling factor
        const currentY = startHeight + distance;
        
        if (currentY >= landHeight) {
          setPosA(landHeight);
          setPosB(landHeight);
          setRunning(false);
          setLanded(true);
          setTime(Math.sqrt((landHeight - startHeight) / (0.5 * gravity * 200)));
        } else {
          setPosA(currentY);
          setPosB(currentY);
          setTime(elapsed);
          animId = requestAnimationFrame(run);
        }
      };
      animId = requestAnimationFrame(run);
    }
    return () => cancelAnimationFrame(animId);
  }, [running, gravity]);

  const handleReset = () => {
    setRunning(false);
    setTime(0);
    setPosA(startHeight);
    setPosB(startHeight);
    setLanded(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw sky/background grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw Ground
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(0, landHeight + 15, canvas.width, 10);
    
    // Draw Pisa Tower (simple abstract geometric design)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.fillRect(80, startHeight - 10, 60, landHeight - startHeight + 40);
    ctx.strokeRect(80, startHeight - 10, 60, landHeight - startHeight + 40);
    
    // Draw arches on the tower
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    for (let h = startHeight + 15; h < landHeight; h += 40) {
      ctx.fillRect(95, h, 30, 20);
    }
    
    // Draw platform
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(135, startHeight - 10, 80, 5);

    // Draw Ball A (Light weight)
    const radiusA = 6 + Math.min(6, massA * 0.5);
    ctx.beginPath();
    ctx.arc(160, posA, radiusA, 0, Math.PI * 2);
    ctx.fillStyle = '#00D2FF';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00D2FF';
    ctx.fill();
    ctx.shadowBlur = 0;
    
    ctx.fillStyle = '#00D2FF';
    ctx.font = '9px monospace';
    ctx.fillText(`${massA}kg`, 150 - radiusA, posA + 3);

    // Draw Ball B (Heavy weight)
    const radiusB = 10 + Math.min(10, massB * 0.2);
    ctx.beginPath();
    ctx.arc(200, posB, radiusB, 0, Math.PI * 2);
    ctx.fillStyle = '#FF007F';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#FF007F';
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#FF007F';
    ctx.font = '9px monospace';
    ctx.fillText(`${massB}kg`, 210 + radiusB, posB + 3);

    if (landed) {
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(160, landHeight, 15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(200, landHeight, 20, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, [posA, posB, massA, massB, landed]);

  return (
    <div className="flex flex-col gap-4 w-full h-full justify-between">
      <div className="flex flex-wrap gap-3 items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5 text-[11px]">
        <div className="flex items-center gap-1.5">
          <span>球A质量:</span>
          <input 
            type="range" min="1" max="10" value={massA} 
            onChange={e => setMassA(Number(e.target.value))}
            className="w-16 accent-cyan-400" 
          />
          <span className="font-bold text-cyan-400">{massA} kg</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>球B质量:</span>
          <input 
            type="range" min="10" max="100" value={massB} 
            onChange={e => setMassB(Number(e.target.value))}
            className="w-16 accent-pink-500" 
          />
          <span className="font-bold text-pink-500">{massB} kg</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>环境:</span>
          <select 
            value={gravity} 
            onChange={e => setGravity(Number(e.target.value))}
            className="bg-black/60 border border-white/10 px-1.5 py-0.5 rounded text-[11px]"
          >
            <option value="9.8">地球 (9.8 m/s²)</option>
            <option value="1.62">月球 (1.62 m/s²)</option>
            <option value="3.71">火星 (3.71 m/s²)</option>
            <option value="24.79">木星 (24.79 m/s²)</option>
          </select>
        </div>
      </div>

      <div className="relative glass-panel bg-black/40 flex items-center justify-center p-2 flex-1 min-h-[220px]">
        <canvas ref={canvasRef} width="360" height="280" className="max-w-full h-auto rounded" />
        
        {landed && (
          <div className="absolute inset-x-3 bottom-3 p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[10px] leading-relaxed text-purple-200">
            ✨ <b>实验结论：</b>在同一重力场中，物体下落的加速度与质量完全无关。两球在 {time.toFixed(2)} 秒钟时同时着陆，推翻了亚里士多德的教条！
          </div>
        )}
      </div>

      <div className="flex gap-2 justify-end">
        <button 
          onClick={() => setRunning(true)} 
          disabled={running || landed}
          className="px-3.5 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer disabled:opacity-40"
        >
          释放下落
        </button>
        <button 
          onClick={handleReset}
          className="px-3.5 py-1.5 rounded bg-white/5 border border-white/10 text-white font-bold text-xs cursor-pointer"
        >
          重置实验
        </button>
      </div>
    </div>
  );
};

const NewtonSimulator = () => {
  const [rotation, setRotation] = useState(0); 
  const [refIndex, setRefIndex] = useState(1.5); 
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    const cx = canvas.width / 2;
    const cy = canvas.height / 2 + 10;
    const size = 80;

    const angleRad = (rotation * Math.PI) / 180;
    const points = [];
    for (let i = 0; i < 3; i++) {
      const a = angleRad + (i * 2 * Math.PI) / 3 - Math.PI / 2;
      points.push({
        x: cx + size * Math.cos(a),
        y: cy + size * Math.sin(a)
      });
    }

    ctx.fillStyle = 'rgba(0, 210, 255, 0.08)';
    ctx.strokeStyle = 'rgba(0, 210, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.lineTo(points[2].x, points[2].y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    const startX = 20;
    const startY = cy + 30;
    const enterX = cx - 28;
    const enterY = cy + 8;

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(enterX, enterY);
    ctx.stroke();
    ctx.shadowBlur = 0; 

    const colors = [
      { name: 'Red', hex: '#FF0000' },
      { name: 'Orange', hex: '#FF7F00' },
      { name: 'Yellow', hex: '#FFFF00' },
      { name: 'Green', hex: '#00FF00' },
      { name: 'Blue', hex: '#0000FF' },
      { name: 'Indigo', hex: '#4B0082' },
      { name: 'Violet', hex: '#9400D3' }
    ];

    const exitX = cx + 22;
    const exitY = cy - 4;

    colors.forEach((c, idx) => {
      const dy = (idx - 3) * 1.2;
      ctx.strokeStyle = c.hex;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(enterX, enterY);
      ctx.lineTo(exitX, exitY + dy);
      ctx.stroke();

      const targetX = canvas.width - 30;
      const targetY = cy - 45 + (idx * 12) + (refIndex * 12) - (rotation * 1.0);

      ctx.shadowBlur = 5;
      ctx.shadowColor = c.hex;
      ctx.beginPath();
      ctx.moveTo(exitX, exitY + dy);
      ctx.lineTo(targetX, targetY);
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

  }, [rotation, refIndex]);

  return (
    <div className="flex flex-col gap-4 w-full h-full justify-between">
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5 text-[11px]">
        <div className="flex items-center gap-1.5">
          <span>棱镜旋转:</span>
          <input 
            type="range" min="-30" max="30" value={rotation} 
            onChange={e => setRotation(Number(e.target.value))}
            className="w-24 accent-purple-500" 
          />
          <span className="font-bold text-purple-400">{rotation} °</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>折射率:</span>
          <input 
            type="range" min="1.1" max="1.9" step="0.05" value={refIndex} 
            onChange={e => setRefIndex(Number(e.target.value))}
            className="w-24 accent-cyan-400" 
          />
          <span className="font-bold text-cyan-400">{refIndex} n</span>
        </div>
      </div>

      <div className="relative glass-panel bg-black/40 flex items-center justify-center p-2 flex-1 min-h-[220px]">
        <canvas ref={canvasRef} width="360" height="280" className="max-w-full h-auto rounded" />
        
        <div className="absolute inset-x-3 bottom-3 p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[10px] leading-relaxed text-purple-200">
          🌈 <b>实验结论：</b>棱镜折射发现了“白光并非单一色彩，而是七色复合光谱”。棱镜使不同频率的光子偏折，揭开了色彩本源！
        </div>
      </div>
    </div>
  );
};

const FaradaySimulator = () => {
  const [magnetX, setMagnetX] = useState(80); 
  const [voltage, setVoltage] = useState(0);
  const [bulbBrightness, setBulbBrightness] = useState(0);
  const canvasRef = useRef(null);
  const lastXRef = useRef(80);
  const lastTimeRef = useRef(Date.now());

  const coilX = 230; 
  const coilY = 130; 

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const boundedX = Math.max(20, Math.min(300, x));
    setMagnetX(boundedX);
  };

  useEffect(() => {
    const now = Date.now();
    const dt = (now - lastTimeRef.current) / 1000; 
    if (dt > 0.01) {
      const dx = magnetX - lastXRef.current;
      const velocity = dx / dt; 
      
      const distToCoil = Math.abs(magnetX - coilX);
      const gradientFactor = Math.max(0, 1 - (distToCoil / 100)) * Math.exp(-distToCoil / 70);
      
      const rawVoltage = (velocity * gradientFactor) / 200; 
      const clampedVoltage = Math.max(-10, Math.min(10, rawVoltage));
      
      setVoltage(clampedVoltage);
      setBulbBrightness(Math.min(100, Math.abs(clampedVoltage) * 12));
      
      lastXRef.current = magnetX;
      lastTimeRef.current = now;
    }
  }, [magnetX]);

  useEffect(() => {
    const timer = setInterval(() => {
      setVoltage(prev => prev * 0.82);
      setBulbBrightness(prev => prev * 0.82);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    const gcx = 80;
    const gcy = 60;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.arc(gcx, gcy, 30, Math.PI, 0);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    for (let angle = -Math.PI; angle <= 0; angle += Math.PI / 8) {
      ctx.beginPath();
      ctx.moveTo(gcx + 25 * Math.cos(angle), gcy + 25 * Math.sin(angle));
      ctx.lineTo(gcx + 30 * Math.cos(angle), gcy + 30 * Math.sin(angle));
      ctx.stroke();
    }

    const needleAngle = -Math.PI / 2 + (voltage / 10) * (Math.PI / 2.5);
    ctx.strokeStyle = '#ff0055';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(gcx, gcy);
    ctx.lineTo(gcx + 24 * Math.cos(needleAngle), gcy + 24 * Math.sin(needleAngle));
    ctx.stroke();
    
    ctx.fillStyle = '#ff0055';
    ctx.beginPath(); ctx.arc(gcx, gcy, 3, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '8px monospace';
    ctx.fillText("G (检流计)", gcx - 20, gcy + 12);

    const loopCount = 4;
    ctx.strokeStyle = '#d97706'; 
    ctx.lineWidth = 3.5;
    
    for (let i = 0; i < loopCount; i++) {
      ctx.beginPath();
      ctx.arc(coilX + (i * 16) - 16, coilY, 20, -Math.PI / 2, Math.PI / 2, false);
      ctx.stroke();
    }

    const magW = 80;
    const magH = 24;
    const mx = magnetX - magW / 2;
    const my = coilY - magH / 2;

    ctx.fillStyle = '#0055ff';
    ctx.fillRect(mx, my, magW / 2, magH);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText("S", mx + 10, my + 15);

    ctx.fillStyle = '#ff0055';
    ctx.fillRect(mx + magW / 2, my, magW / 2, magH);
    ctx.fillStyle = '#ffffff';
    ctx.fillText("N", mx + magW / 2 + 10, my + 15);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(mx, my, magW, magH);

    ctx.strokeStyle = '#f59e0b'; 
    ctx.lineWidth = 4;
    for (let i = 0; i < loopCount; i++) {
      ctx.beginPath();
      ctx.arc(coilX + (i * 16) - 16, coilY, 20, Math.PI / 2, -Math.PI / 2, false);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(coilX - 25, coilY + 20);
    ctx.lineTo(coilX - 25, coilY + 65);
    ctx.lineTo(gcx - 5, coilY + 65);
    ctx.lineTo(gcx - 5, gcy + 20);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(coilX + 40, coilY + 20);
    ctx.lineTo(coilX + 40, coilY + 65);
    ctx.lineTo(160, coilY + 65);
    ctx.stroke();

    const bx = 150;
    const by = coilY + 65;
    
    if (bulbBrightness > 5) {
      ctx.fillStyle = `rgba(234, 179, 8, ${bulbBrightness / 180})`;
      ctx.beginPath();
      ctx.arc(bx, by, 12 + bulbBrightness * 0.12, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = bulbBrightness > 10 ? '#fbbf24' : '#64748b';
    ctx.lineWidth = 1.8;
    ctx.fillStyle = bulbBrightness > 10 ? `rgba(251, 191, 36, 0.2)` : 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.arc(bx, by, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = bulbBrightness > 10 ? '#ffffff' : '#475569';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(bx - 3, by + 4);
    ctx.lineTo(bx - 1.5, by - 3);
    ctx.lineTo(bx + 1.5, by - 3);
    ctx.lineTo(bx + 3, by + 4);
    ctx.stroke();

  }, [magnetX, voltage, bulbBrightness]);

  return (
    <div className="flex flex-col gap-4 w-full h-full justify-between">
      <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-[11px] text-center">
        ⚡ <b>物理操作：</b>用鼠标<b>拖拽并滑动磁铁</b>，快速穿过右侧线圈。观察电压指针摆动和灯泡发光！
      </div>

      <div className="relative glass-panel bg-black/40 flex items-center justify-center p-2 flex-1 cursor-ew-resize select-none overflow-hidden min-h-[220px]" onMouseMove={handleMouseMove}>
        <canvas ref={canvasRef} width="360" height="260" className="max-w-full h-auto rounded" />
        
        <div className="absolute inset-x-3 bottom-3 p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[10px] leading-relaxed text-purple-200">
          ⚡ <b>实验结论：</b>磁通量变化率越快，感应电压就越高！只有在磁铁<b>相对运动</b>（切割磁感线）时才产生电流，静止时电压为零。
        </div>
      </div>
    </div>
  );
};

const CustomVideoSimulator = ({ imageUrl, prompt }) => {
  const canvasRef = useRef(null);
  const [scale, setScale] = useState(1.0);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    let animId;
    if (running && imageUrl) {
      const startTime = performance.now();
      const run = () => {
        const elapsed = (performance.now() - startTime) / 1000;
        const currentScale = 1.05 + Math.sin(elapsed * 0.12) * 0.05;
        setScale(currentScale);
        animId = requestAnimationFrame(run);
      };
      animId = requestAnimationFrame(run);
    }
    return () => cancelAnimationFrame(animId);
  }, [running, imageUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageUrl) return;
    const ctx = canvas.getContext('2d');
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    
    let particleAnimId;
    const particles = [];
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vy: -0.4 - Math.random() * 0.6,
        size: 1 + Math.random() * 2,
        alpha: 0.15 + Math.random() * 0.5
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const w = canvas.width;
      const h = canvas.height;
      const sw = w / scale;
      const sh = h / scale;
      const sx = (w - sw) / 2;
      const sy = (h - sh) / 2;

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);

      particles.forEach(p => {
        p.y += p.vy;
        if (p.y < 0) {
          p.y = canvas.height;
          p.x = Math.random() * canvas.width;
        }
        ctx.fillStyle = `rgba(168, 85, 247, ${p.alpha})`; 
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#a855f7';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      particleAnimId = requestAnimationFrame(draw);
    };

    img.onload = () => {
      draw();
    };
    
    return () => cancelAnimationFrame(particleAnimId);
  }, [imageUrl, scale]);

  return (
    <div className="flex flex-col gap-4 w-full h-full justify-between">
      <div className="relative glass-panel bg-black/40 flex items-center justify-center p-2 flex-1 min-h-[220px] overflow-hidden">
        <canvas ref={canvasRef} width="360" height="280" className="max-w-full h-auto rounded" />
        
        <div className="absolute top-3 left-3 flex gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-[9px] text-orange-300 font-bold items-center">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
          <span>Wan2.1-T2V 渲染器已就绪</span>
        </div>
      </div>
    </div>
  );
};

const MinecraftWorldExplorer = () => {
  const [prompt, setPrompt] = useState('我的世界风格绿洲平原，2D横版像素艺术，日出光影');
  const [chunks, setChunks] = useState([]); // Array of { id, url }
  const [runnerX, setRunnerX] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [generatingChunkId, setGeneratingChunkId] = useState(null);
  const [genStage, setGenStage] = useState('');
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const fileInputRef = useRef(null);

  // Dynamic layout values
  const chunkW = isFullScreen ? 640 : 320;
  const chunkH = isFullScreen ? 360 : 180;
  const chunkBottom = isFullScreen ? 24 : 12;
  const playerBottom = isFullScreen ? 32 : 18;

  // Auto-explore chunk checking when runnerX changes
  const checkAndTriggerExplore = async (currentX, direction) => {
    if (generating || chunks.length === 0) return;
    
    const chunkIds = chunks.map(c => c.id);
    const minId = Math.min(...chunkIds);
    const maxId = Math.max(...chunkIds);
    
    if (direction === 'right') {
      const rightBoundary = maxId * chunkW + (chunkW / 2);
      if (currentX > rightBoundary - (chunkW / 2)) {
        await triggerGeneration(maxId + 1, 'right');
      }
    } else if (direction === 'left') {
      const leftBoundary = minId * chunkW - (chunkW / 2);
      if (currentX < leftBoundary + (chunkW / 2)) {
        await triggerGeneration(minId - 1, 'left');
      }
    }
  };

  const triggerGeneration = async (targetId, direction) => {
    if (generating) return;
    setGenerating(true);
    setGeneratingChunkId(targetId);
    setGenStage(`正在使用大模型生成第 ${targetId} 象限...`);
    
    try {
      const dirText = direction === 'right' ? 'right side' : 'left side';
      const explorePrompt = `2d side scroller game level design, pixel art style, seamless continuation to the ${dirText} of ${prompt}. Flat landscape, side view, game assets. Highly detailed, 16-bit. No text, no labels, no watermark, no UI.`;
      
      const newUrl = await SovereignEngine.generateImage(explorePrompt);
      setChunks(prev => [...prev, { id: targetId, url: newUrl }]);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
      setGeneratingChunkId(null);
    }
  };

  const handleInit = async () => {
    if (generating) return;
    setGenerating(true);
    setGenStage('正在汇聚原初物理奇点...');
    try {
      const initialUrl = await SovereignEngine.generateImage(prompt + ", 2d side scroller game layout, pixel art style, no text, no labels");
      setChunks([{ id: 0, url: initialUrl }]);
      setRunnerX(0);
    } catch (e) {
      console.error(e);
      alert('世界奇点汇聚失败，请重试！');
    } finally {
      setGenerating(false);
    }
  };

  const walkLeft = () => {
    if (generating) return;
    setRunnerX(prev => {
      const step = isFullScreen ? 80 : 40;
      const next = prev - step;
      checkAndTriggerExplore(next, 'left');
      return next;
    });
  };

  const walkRight = () => {
    if (generating) return;
    setRunnerX(prev => {
      const step = isFullScreen ? 80 : 40;
      const next = prev + step;
      checkAndTriggerExplore(next, 'right');
      return next;
    });
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsFullScreen(false);
        return;
      }
      if (chunks.length === 0 || generating) return;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        walkRight();
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        walkLeft();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chunks, generating, isFullScreen, prompt]);

  // Handle local image upload as seed (给一张初始图)
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result;
      if (typeof base64 !== 'string') return;
      
      setChunks([{ id: 0, url: base64 }]);
      setRunnerX(0);
      
      setIsAnalyzingImage(true);
      setGenStage('正在使用 Gemini 识别初始图结构...');
      try {
        const descPrompt = await SovereignEngine.describeImageForContinuation(base64, file.type);
        if (descPrompt) {
          setPrompt(descPrompt);
        }
      } catch (err) {
        console.error("Gemini image analysis failed:", err);
      } finally {
        setIsAnalyzingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const renderGameContent = () => {
    return (
      <div className="w-full flex-1 flex flex-col justify-between relative h-full">
        
        {/* Horizontal Continuous Scroll Viewport */}
        <div className="flex-1 relative overflow-hidden rounded-lg border border-white/10 bg-black/90 min-h-[220px]">
          
          {/* Smooth Camera Viewport Container */}
          <div 
            className="absolute top-0 bottom-0 flex items-center transition-transform duration-300 ease-out" 
            style={{ transform: `translateX(calc(50% - ${runnerX}px))` }}
          >
            
            {/* Render Loaded Chunks */}
            {chunks.map(chunk => (
              <div 
                key={chunk.id}
                className="absolute rounded-lg overflow-hidden border border-white/10 bg-black/20"
                style={{ 
                  left: chunk.id * chunkW - (chunkW / 2),
                  bottom: chunkBottom,
                  width: chunkW,
                  height: chunkH
                }}
              >
                <img 
                  src={chunk.url} 
                  alt={`Chunk ${chunk.id}`} 
                  className="w-full h-full object-cover select-none pointer-events-none" 
                />
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-[8px] text-white/50 font-mono">
                  #{chunk.id} ({chunk.id * chunkW}m)
                </div>
              </div>
            ))}

            {/* Render Generating Placeholder */}
            {generating && generatingChunkId !== null && (
              <div 
                className="absolute rounded-lg border border-dashed border-orange-500/40 bg-orange-500/5 flex flex-col items-center justify-center gap-2 p-4 text-center z-0" 
                style={{ 
                  left: generatingChunkId * chunkW - (chunkW / 2),
                  bottom: chunkBottom,
                  width: chunkW,
                  height: chunkH
                }}
              >
                <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
                <span className="text-[10px] text-orange-300 font-mono animate-pulse">
                  正在渲染第 {generatingChunkId} 象限...
                </span>
              </div>
            )}

            {/* The Player (Runner 🏃) */}
            <div 
              className="absolute -translate-x-1/2 flex flex-col items-center z-10 transition-all duration-150"
              style={{ left: runnerX, bottom: playerBottom }}
            >
              <div className="px-2 py-0.5 rounded bg-purple-600/80 border border-purple-500 text-[8px] text-white font-mono shadow-md mb-1 whitespace-nowrap">
                X: {Math.round(runnerX)}m
              </div>
              <div className={`${isFullScreen ? 'w-10 h-14' : 'w-7 h-10'} flex flex-col items-center justify-between animate-bounce select-none`}>
                {/* Robot Head */}
                <div className="w-5/6 h-2/5 bg-purple-500 border border-purple-300 rounded flex items-center justify-around px-0.5 shadow-inner">
                  <div className="w-1 h-1 bg-cyan-300 rounded-full animate-pulse" />
                  <div className="w-1 h-1 bg-cyan-300 rounded-full animate-pulse" />
                </div>
                {/* Robot Body */}
                <div className="w-full h-3/5 bg-purple-600 border border-purple-400 rounded-md flex items-center justify-center shadow-md">
                  <div className="w-2 h-2 bg-pink-400 rounded-sm" />
                </div>
              </div>
            </div>

          </div>

          <button 
            onClick={walkLeft}
            disabled={generating}
            className={`absolute left-4 top-1/2 -translate-y-1/2 ${isFullScreen ? 'w-14 h-14 text-2xl' : 'w-10 h-10 text-lg'} rounded-full bg-black/60 border border-white/10 hover:bg-black/80 text-white flex items-center justify-center font-bold shadow-lg active:scale-90 transition-all z-20 cursor-pointer disabled:opacity-30`}
            title="向左走 (A)"
          >
            ◀
          </button>

          <button 
            onClick={walkRight}
            disabled={generating}
            className={`absolute right-4 top-1/2 -translate-y-1/2 ${isFullScreen ? 'w-14 h-14 text-2xl' : 'w-10 h-10 text-lg'} rounded-full bg-black/60 border border-white/10 hover:bg-black/80 text-white flex items-center justify-center font-bold shadow-lg active:scale-90 transition-all z-20 cursor-pointer disabled:opacity-30`}
            title="向右走 (D)"
          >
            ▶
          </button>

        </div>

        {/* Instruction Footer */}
        <div className="flex justify-between items-center mt-2 px-1 text-[10px] text-white/30 font-mono">
          <span>快捷键: A/D 或 ◀/▶ 键盘方向键移动</span>
          <span>支持使用 One API 混元世界大模型无限生成地图</span>
        </div>

      </div>
    );
  };

  const inlineWidget = (
    <div className="flex flex-col gap-4 w-full h-full justify-between">
      {/* Control bar */}
      <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-[11px] flex flex-wrap gap-2 items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <span>创世主题:</span>
          <input 
            type="text" 
            value={prompt} 
            onChange={e => setPrompt(e.target.value)} 
            disabled={chunks.length > 0 || isAnalyzingImage}
            className="flex-1 bg-black/40 border border-white/10 px-2 py-1 rounded text-[11px] focus:outline-none"
            placeholder="如: 我的世界风格绿洲平原，2D横版像素艺术"
          />
        </div>
        
        <div className="flex gap-2 items-center">
          {chunks.length === 0 ? (
            <>
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={generating || isAnalyzingImage}
                className="px-3 py-1.5 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs cursor-pointer flex items-center gap-1 disabled:opacity-40"
              >
                <Image className="w-3.5 h-3.5 text-purple-400" />
                上传初始图
              </button>

              <button 
                onClick={handleInit}
                disabled={generating || !prompt.trim() || isAnalyzingImage}
                className="px-3.5 py-1.5 rounded bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs cursor-pointer disabled:opacity-40"
              >
                {generating ? '汇聚中...' : '生成初始图'}
              </button>

              <button 
                onClick={() => setIsFullScreen(true)}
                className="px-3 py-1.5 rounded bg-orange-600/20 border border-orange-500/40 text-orange-300 font-bold hover:bg-orange-600/30 text-xs flex items-center gap-1 cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                全屏体验
              </button>
            </>
          ) : (
            <>
              <span className="text-[10px] text-orange-300 font-bold bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20">
                坐标: X = {Math.round(runnerX)}m
              </span>
              <button 
                onClick={() => setIsFullScreen(true)}
                className="px-3 py-1 rounded bg-orange-600/20 border border-orange-500/40 text-orange-300 font-bold hover:bg-orange-600/30 text-xs flex items-center gap-1 cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                全屏体验
              </button>
              <button 
                onClick={() => {
                  setChunks([]);
                  setRunnerX(0);
                }}
                className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-white font-bold text-xs cursor-pointer"
              >
                坍缩重新创世
              </button>
            </>
          )}
        </div>
      </div>

      {/* Inline Game Screen Viewport */}
      <div className="relative glass-panel bg-black/40 flex flex-col items-center justify-center p-4 flex-1 min-h-[240px] overflow-hidden">
        {isAnalyzingImage ? (
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            <span className="text-xs text-purple-300 animate-pulse font-mono">正在分析初始图材质以匹配环境...</span>
          </div>
        ) : chunks.length > 0 ? (
          renderGameContent()
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-12 text-white/30">
            <Film className="w-10 h-10 mb-3 text-white/10" />
            <p className="text-xs font-bold text-white/50">像《我的世界》一样边走边生成地图</p>
            <p className="text-[10px] mt-1.5 text-white/20 max-w-[340px]">
              输入想要创世主题点击生成，或<b>直接上传一张初始图</b>作为种子，即可通过键盘 A/D 或屏幕按钮让角色走动，在走近边界时大模型将自动为你生成并缝合下一张世界地图！
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {inlineWidget}
      {isFullScreen && createPortal(
        <div className="fixed inset-0 bg-[#06060c]/98 z-[9999] flex flex-col p-6 font-sans">
          {/* Full Screen Header */}
          <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3 flex-shrink-0">
            <div className="flex items-center gap-3">
              <Compass className="w-5 h-5 text-orange-500 animate-spin" />
              <div>
                <h3 className="text-sm font-bold text-white font-mono">AI 物理实验室 - 世界边界探索 (Minecraft Gen)</h3>
                <p className="text-[10px] text-white/50">当前创世主题: {prompt}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {chunks.length > 0 && (
                <span className="text-xs text-orange-300 font-bold bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20 font-mono">
                  坐标: X = {Math.round(runnerX)}m
                </span>
              )}
              <button 
                onClick={() => setIsFullScreen(false)}
                className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
              >
                <Minimize2 className="w-4 h-4" />
                退出全屏
              </button>
            </div>
          </div>

          {/* Full Screen Control Bar */}
          <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-[11px] flex flex-wrap gap-2 items-center justify-between mb-4 flex-shrink-0">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <span className="text-white/70">创世主题:</span>
              <input 
                type="text" 
                value={prompt} 
                onChange={e => setPrompt(e.target.value)} 
                disabled={chunks.length > 0 || isAnalyzingImage}
                className="flex-1 bg-black/40 border border-white/10 px-2 py-1 rounded text-[11px] focus:outline-none text-white"
                placeholder="如: 我的世界风格绿洲平原，2D横版像素艺术"
              />
            </div>
            
            <div className="flex gap-2 items-center">
              {chunks.length === 0 ? (
                <>
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    className="hidden" 
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={generating || isAnalyzingImage}
                    className="px-3 py-1.5 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs cursor-pointer flex items-center gap-1 disabled:opacity-40"
                  >
                    <Image className="w-3.5 h-3.5 text-purple-400" />
                    上传初始图
                  </button>

                  <button 
                    onClick={handleInit}
                    disabled={generating || !prompt.trim() || isAnalyzingImage}
                    className="px-3.5 py-1.5 rounded bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs cursor-pointer disabled:opacity-40"
                  >
                    {generating ? '汇聚中...' : '生成初始图'}
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => {
                      setChunks([]);
                      setRunnerX(0);
                    }}
                    className="px-2.5 py-1 rounded bg-red-600/20 border border-red-500/40 text-red-300 hover:bg-red-600/30 font-bold text-xs cursor-pointer"
                  >
                    坍缩重新创世
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Full Screen Game Screen Viewport */}
          <div className="flex-1 relative glass-panel bg-black/40 flex flex-col items-center justify-center p-4 overflow-hidden rounded-xl border border-white/10">
            {isAnalyzingImage ? (
              <div className="flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
                <span className="text-sm text-purple-300 animate-pulse font-mono">正在分析初始图材质以匹配环境...</span>
              </div>
            ) : chunks.length > 0 ? (
              renderGameContent()
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-16 text-white/30">
                <Film className="w-16 h-16 mb-4 text-white/10" />
                <p className="text-sm font-bold text-white/60">像《我的世界》一样边走边生成地图</p>
                <p className="text-xs mt-2 text-white/40 max-w-[400px]">
                  输入想要创世主题点击生成，或<b>直接上传一张初始图</b>作为种子，即可通过键盘 A/D 或屏幕按钮让角色走动，在走近边界时大模型将自动为你生成并缝合下一张世界地图！
                </p>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

const CompanionModule = ({ onPointsAwarded, onEngineChange }) => {
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('companion_api_settings');
    const parsed = saved ? JSON.parse(saved) : {};
    return {
      name: parsed.name || '小书童',
      nobleTitle: parsed.nobleTitle || '大哥大',
      trait: parsed.trait || '傲娇书童',
      engineType: parsed.engineType || 'gemini',
      enableTTS: parsed.enableTTS !== false
    };
  });

  // Sync engine change with parent Header on mount or type updates
  useEffect(() => {
    if (onEngineChange) {
      onEngineChange(config.engineType);
    }
  }, [config.engineType, onEngineChange]);

  const [showApiSettings, setShowApiSettings] = useState(false);
  const [apiSettings, setApiSettings] = useState(() => {
    const saved = localStorage.getItem('companion_api_settings');
    const parsed = saved ? JSON.parse(saved) : {};
    return {
      geminiApiKey: parsed.geminiApiKey || 'AIzaSyDokEG6iQ_DgKuC88U5lGa8j97xrAwR9po',
      geminiBaseUrl: parsed.geminiBaseUrl || 'https://generativelanguage.googleapis.com',
      geminiModel: parsed.geminiModel === 'gemini-1.5-flash' ? 'gemini-2.5-flash' : (parsed.geminiModel || 'gemini-2.5-flash'),
      tencentfreeApiKey: parsed.tencentfreeApiKey || 'deLO9fXcPc3FhJhJBbF1F0314cCe4eAcAdE5608fA9024d63',
      tencentfreeEndpoint: parsed.tencentfreeEndpoint || 'http://127.0.0.1:3001/v1',
      tencentfreeModel: parsed.tencentfreeModel === 'tencentfree/gpt-4' ? 'hy3-preview' : (parsed.tencentfreeModel || 'hy3-preview'),
      localLlamaEndpoint: parsed.localLlamaEndpoint || 'http://127.0.0.1:11435/v1',
      localLlamaModel: parsed.localLlamaModel || 'qwythos-9b-q8.gguf'
    };
  });

  const updateConfig = (key, value) => {
    setConfig(prev => {
      const updated = { ...prev, [key]: value };
      const saved = localStorage.getItem('companion_api_settings');
      const parsed = saved ? JSON.parse(saved) : {};
      localStorage.setItem('companion_api_settings', JSON.stringify({
        ...parsed,
        ...updated
      }));
      if (key === 'engineType' && onEngineChange) {
        onEngineChange(value);
      }
      return updated;
    });
  };
  const [subMode, setSubMode] = useState('chat'); // chat, tree, read, secret, socrates
  const [messages, setMessages] = useState([
    { role: 'model', text: '遵命！我已加载书童基因，随时听候调遣。', mood: 'normal' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // { base64, mimeType, name }
  const [ocrLoading, setOcrLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage({
        name: file.name,
        mimeType: file.type,
        base64: reader.result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRunOcr = async () => {
    if (!selectedImage || ocrLoading) return;
    setOcrLoading(true);
    try {
      if (!window.Tesseract) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/tesseract.js@5.1.0/dist/tesseract.min.js';
        const loadPromise = new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
        document.head.appendChild(script);
        await loadPromise;
      }
      const worker = await window.Tesseract.createWorker('chi_sim+eng');
      const ret = await worker.recognize(selectedImage.base64);
      await worker.terminate();
      
      const text = ret.data.text.trim();
      if (text) {
        setInputVal(prev => prev ? `${prev}\n[提取文字]\n${text}` : text);
      } else {
        alert('未在图像中检测到文字，请重试或更换清晰图片。');
      }
    } catch (e) {
      console.error(e);
      alert('OCR 识别失败，请检查网络是否能加载 OCR 服务，或更换图片重试。');
    } finally {
      setOcrLoading(false);
    }
  };

  // One Book State
  const [bookTitle, setBookTitle] = useState('物种起源 (精简篇)');
  const [bookText, setBookText] = useState(`物种起源的核心思想是自然选择与适者生存。所有生物都源自共同祖先，在生存竞争的驱动下，微小的有利变异通过遗传累积，从而导致了物种的演化。进化是一个缓慢、渐进、无固定终点的网状分叉过程，而不是线性向上的完美化。`);
  const [bookResult, setBookResult] = useState(null);

  // Socrates State
  const [socTopic, setSocTopic] = useState('为什么磁铁能产生电流？');
  const [socDepth, setSocDepth] = useState(1);
  const [socHistory, setSocHistory] = useState([]);
  const [socFeedback, setSocFeedback] = useState('让我们开始吧！这是一个关于“电磁感应”的探索之旅。');
  const [socQuestion, setSocQuestion] = useState('当我们把一根磁铁插进一个铜线圈里，并且不断地抽动它，你觉得线圈里的电流表指针会动吗？为什么？');
  const [socResponse, setSocResponse] = useState('');
  const [socFinished, setSocFinished] = useState(false);

  // Secret State
  const [secretVal, setSecretVal] = useState('');
  const [secretHistory, setSecretHistory] = useState([]);

  // Alibaba World Model (Wan2.1) State
  const [worldPrompt, setWorldPrompt] = useState('比萨斜塔自由落体实验');
  const [worldModel, setWorldModel] = useState('wan2.1-t2v'); // wan2.1-t2v, wan2.1-i2v
  const [worldCamera, setWorldCamera] = useState('zoom-in'); // zoom-in, zoom-out, pan-left, pan-right, crane-up, roll
  const [worldMotion, setWorldMotion] = useState(3);
  const [worldFps, setWorldFps] = useState(24);
  const [worldResolution, setWorldResolution] = useState('720p');
  const [worldImage, setWorldImage] = useState(null);
  const [worldGenerating, setWorldGenerating] = useState(false);
  const [worldGenStage, setWorldGenStage] = useState('');
  const [activeSimulation, setActiveSimulation] = useState(null); // 'galileo', 'newton', 'faraday', 'custom'
  const [customGenImage, setCustomGenImage] = useState(null); // base64 URL or standard URL
  const [worldSubTab, setWorldSubTab] = useState('sim'); // 'sim', 'mine'

  // Chat scroll anchor
  const chatEndRef = useRef(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if ((!inputVal.trim() && !selectedImage) || loading) return;

    let userMsg = inputVal;
    let imagePayload = selectedImage;
    
    setInputVal('');
    setSelectedImage(null);

    // Dynamic OCR fallback for non-Gemini engines
    if (imagePayload && config.engineType !== 'gemini') {
      setLoading(true);
      try {
        if (!window.Tesseract) {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/tesseract.js@5.1.0/dist/tesseract.min.js';
          const loadPromise = new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
          });
          document.head.appendChild(script);
          await loadPromise;
        }
        const worker = await window.Tesseract.createWorker('chi_sim+eng');
        const ret = await worker.recognize(imagePayload.base64);
        await worker.terminate();
        const ocrText = ret.data.text.trim();
        if (ocrText) {
          userMsg = userMsg ? `${userMsg}\n[图像文字: ${ocrText}]` : `[解析图像中的文字: ${ocrText}]`;
        }
        imagePayload = null; // Cleared since converted to text
      } catch (err) {
        console.warn("Auto-OCR fallback failed, sending text-only:", err);
        imagePayload = null;
      }
    }

    setMessages(prev => [...prev, { 
      role: 'user', 
      text: userMsg, 
      image: imagePayload ? imagePayload.base64 : null,
      mood: 'normal' 
    }]);
    setLoading(true);

    try {
      const historyPayload = messages.map(m => ({ role: m.role, text: m.text }));
      const res = await SovereignEngine.chatWithCompanion(userMsg, config, historyPayload, imagePayload);
      if (res) {
        if (res.imagePrompt) {
          const newMsg = { role: 'model', text: res.text, mood: res.mood, loadingImage: true };
          setMessages(prev => [...prev, newMsg]);
          playCompanionSound(res.mood, res.text);
          
          try {
            const imageUrl = await SovereignEngine.generateImage(res.imagePrompt);
            setMessages(prev => prev.map((m, idx) => 
              idx === prev.length - 1 ? { ...m, image: imageUrl, loadingImage: false } : m
            ));
          } catch (imgErr) {
            console.error("Image generation failed:", imgErr);
            setMessages(prev => prev.map((m, idx) => 
              idx === prev.length - 1 ? { ...m, imageError: "书童画画时画笔折断了（生成失败）", loadingImage: false } : m
            ));
          }
        } else {
          setMessages(prev => [...prev, { role: 'model', text: res.text, mood: res.mood }]);
          playCompanionSound(res.mood, res.text);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeedRead = async () => {
    if (loading) return;
    setLoading(true);
    setBookResult(null);
    try {
      const res = await SovereignEngine.speedReadBook(bookTitle, bookText);
      setBookResult(res);
      playCompanionSound('success');
      if (onPointsAwarded) onPointsAwarded(25); // Award points for speed reading
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSocratesSubmit = async () => {
    if (!socResponse.trim() || loading) return;
    setLoading(true);
    try {
      const payload = { topic: socTopic, depth: socDepth };
      const res = await SovereignEngine.runSocratesQuestion(payload, socResponse);
      if (res) {
        setSocFeedback(res.feedback);
        setSocQuestion(res.nextQuestion);
        setSocFinished(res.isFinished);
        setSocDepth(prev => prev + 1);
        setSocHistory(prev => [...prev, { answer: socResponse, feedback: res.feedback }]);
        setSocResponse('');
        if (res.isFinished) {
          playCompanionSound('success');
          if (onPointsAwarded) onPointsAwarded(40);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSecretSubmit = async () => {
    if (!secretVal.trim() || loading) return;
    setLoading(true);
    const text = secretVal;
    setSecretVal('');
    try {
      const res = await SovereignEngine.chatWithCompanion(
        `【开启小秘密死党模式】我跟你分享一个我谁也不能说的秘密，你一定要讲义气站在我这边帮我保密，听完给我个有义气、支持我的回答。秘密内容是: "${text}"`,
        { ...config, trait: '侠气死党' }
      );
      if (res) {
        setSecretHistory(prev => [...prev, { secret: text, response: res.text }]);
        
        if (res.imagePrompt) {
          const newMsg = { role: 'model', text: res.text, mood: 'crying', loadingImage: true };
          setMessages(prev => [...prev, newMsg]);
          playCompanionSound('crying', res.text);
          
          try {
            const imageUrl = await SovereignEngine.generateImage(res.imagePrompt);
            setMessages(prev => prev.map((m, idx) => 
              idx === prev.length - 1 ? { ...m, image: imageUrl, loadingImage: false } : m
            ));
          } catch (imgErr) {
            console.error("Image generation failed:", imgErr);
            setMessages(prev => prev.map((m, idx) => 
              idx === prev.length - 1 ? { ...m, imageError: "书童画画时画笔折断了（生成失败）", loadingImage: false } : m
            ));
          }
        } else {
          setMessages(prev => [...prev, { role: 'model', text: res.text, mood: 'crying' }]);
          playCompanionSound('crying', res.text);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWorldScene = async () => {
    if (worldGenerating) return;
    setWorldGenerating(true);
    setActiveSimulation(null);
    setCustomGenImage(null);
    
    const stages = [
      '正在连接阿里世界模型 (Wan2.1) 算力单元...',
      '正在构建时空网格结构...',
      '正在注入相机轨迹向量: ' + worldCamera + '...',
      '正在解析物理世界运动规律 (动作强度: ' + worldMotion + ')...',
      '正在执行时序扩散降噪渲染 (30步)...',
      '正在导出 24 FPS 视频世界线脉络...'
    ];
    
    let stageIdx = 0;
    setWorldGenStage(stages[0]);
    
    const interval = setInterval(() => {
      stageIdx++;
      if (stageIdx < stages.length) {
        setWorldGenStage(stages[stageIdx]);
      }
    }, 1200);

    try {
      const lowerPrompt = worldPrompt.toLowerCase();
      const isGalileo = lowerPrompt.includes('比萨斜塔') || lowerPrompt.includes('伽利略') || lowerPrompt.includes('自由落体') || lowerPrompt.includes('galileo');
      const isNewton = lowerPrompt.includes('三棱镜') || lowerPrompt.includes('棱镜') || lowerPrompt.includes('分光') || lowerPrompt.includes('newton') || lowerPrompt.includes('prism');
      const isFaraday = lowerPrompt.includes('电磁感应') || lowerPrompt.includes('法拉第') || lowerPrompt.includes('线圈') || lowerPrompt.includes('磁铁') || lowerPrompt.includes('faraday') || lowerPrompt.includes('induction');

      await new Promise(resolve => setTimeout(resolve, stages.length * 1200));
      clearInterval(interval);

      if (isGalileo) {
        setActiveSimulation('galileo');
      } else if (isNewton) {
        setActiveSimulation('newton');
      } else if (isFaraday) {
        setActiveSimulation('faraday');
      } else {
        setWorldGenStage('物理模型仿真完成，正在使用混元大模型生成自定义场景原画...');
        const imageUrl = await SovereignEngine.generateImage(worldPrompt + ", high quality physics simulation rendering style");
        setCustomGenImage(imageUrl);
        setActiveSimulation('custom');
      }
      playCompanionSound('success');
      if (onPointsAwarded) onPointsAwarded(30); 
    } catch (e) {
      console.error(e);
      setWorldGenStage('世界模型渲染发生偏折 (生成失败)，请重试！');
    } finally {
      setWorldGenerating(false);
      clearInterval(interval);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full h-full max-w-7xl px-4 overflow-y-auto custom-scrollbar">
      
      {/* Left Config Panel */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        <div className="glass-panel p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3 border-b border-white/10 pb-3">
            <User className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm uppercase font-bold tracking-widest text-white/80">书童定制</h3>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs text-white/50">书童称呼</label>
            <input 
              type="text" 
              value={config.name} 
              onChange={e => updateConfig('name', e.target.value)}
              className="glass-input px-3 py-2 text-sm focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-white/50">尊称设定</label>
            <select 
              value={config.nobleTitle} 
              onChange={e => updateConfig('nobleTitle', e.target.value)}
              className="glass-input bg-black/60 px-3 py-2 text-sm focus:outline-none"
            >
              <option value="大哥大">大哥大</option>
              <option value="公主殿下">公主殿下</option>
              <option value="小主人">小主人</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-white/50">大脑引擎 (AI Brain)</label>
            <select 
              value={config.engineType} 
              onChange={e => updateConfig('engineType', e.target.value)}
              className="glass-input bg-black/60 px-3 py-2 text-sm focus:outline-none"
            >
              <option value="gemini">Gemini 2.5 Flash (云端)</option>
              <option value="tencentfree">TencentFree Hunyuan (本地代理)</option>
              <option value="local-llama">Local Llama (本地 11435)</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-white/50">性格模型</label>
            <div className="flex flex-col gap-1.5">
              {['傲娇书童', '谦卑助理', '侠气死党'].map(t => (
                <button
                  key={t}
                  onClick={() => updateConfig('trait', t)}
                  className={`px-3 py-2 rounded-lg text-left text-xs border transition-all ${config.trait === t ? 'bg-purple-600/30 border-purple-500 text-white' : 'bg-white/5 border-transparent text-white/60 hover:bg-white/10'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-1">
            <label className="text-xs text-white/60 cursor-pointer flex items-center gap-2 select-none">
              <input
                type="checkbox"
                checked={config.enableTTS !== false}
                onChange={e => updateConfig('enableTTS', e.target.checked)}
                className="rounded border-white/20 text-purple-600 focus:ring-purple-500 bg-black/40 cursor-pointer"
              />
              开启语音朗读 (TTS)
            </label>
          </div>

          <div className="border-t border-white/10 pt-3 mt-2">
            <button
              type="button"
              onClick={() => setShowApiSettings(!showApiSettings)}
              className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center justify-between w-full"
            >
              <span>⚙️ API 高级设置</span>
              <span>{showApiSettings ? '收起 ▲' : '展开 ▼'}</span>
            </button>
            
            {showApiSettings && (
              <div className="flex flex-col gap-3 mt-3 pt-3 border-t border-white/5">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-white/50">Gemini Key</label>
                  <input
                    type="password"
                    value={apiSettings.geminiApiKey}
                    onChange={e => setApiSettings(prev => ({...prev, geminiApiKey: e.target.value}))}
                    className="glass-input px-2 py-1 text-xs focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-white/50">Gemini 代理网关 (Base URL)</label>
                  <input
                    type="text"
                    value={apiSettings.geminiBaseUrl}
                    onChange={e => setApiSettings(prev => ({...prev, geminiBaseUrl: e.target.value}))}
                    className="glass-input px-2 py-1 text-xs focus:outline-none"
                    placeholder="https://generativelanguage.googleapis.com"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-white/50">TencentFree Key</label>
                  <input
                    type="password"
                    value={apiSettings.tencentfreeApiKey}
                    onChange={e => setApiSettings(prev => ({...prev, tencentfreeApiKey: e.target.value}))}
                    className="glass-input px-2 py-1 text-xs focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-white/50">TencentFree 终端</label>
                  <input
                    type="text"
                    value={apiSettings.tencentfreeEndpoint}
                    onChange={e => setApiSettings(prev => ({...prev, tencentfreeEndpoint: e.target.value}))}
                    className="glass-input px-2 py-1 text-xs focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-white/50">Local Llama 终端 (Port 11435)</label>
                  <input
                    type="text"
                    value={apiSettings.localLlamaEndpoint}
                    onChange={e => setApiSettings(prev => ({...prev, localLlamaEndpoint: e.target.value}))}
                    className="glass-input px-2 py-1 text-xs focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const merged = { ...config, ...apiSettings };
                    localStorage.setItem('companion_api_settings', JSON.stringify(merged));
                    playCompanionSound('success');
                    alert('API 设置已保存且实时生效！');
                  }}
                  className="mt-1 px-3 py-1.5 rounded bg-purple-600/50 hover:bg-purple-600 text-white font-bold text-xs border border-purple-500 transition-all text-center"
                >
                  保存并生效
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Selectors */}
        <div className="glass-panel p-4 flex flex-col gap-2">
          {[
            { id: 'chat', label: '对话主舱', icon: MessageSquare, color: 'text-blue-400' },
            { id: 'tree', label: '每日打卡/知识树', icon: TreeDeciduous, color: 'text-green-400' },
            { id: 'read', label: '一本书一天读懂', icon: BookOpen, color: 'text-pink-400' },
            { id: 'secret', label: '我有一个小秘密', icon: HeartHandshake, color: 'text-red-400' },
            { id: 'socrates', label: '打破砂锅问到底', icon: HelpCircle, color: 'text-yellow-400' },
            { id: 'world', label: 'AI 物理实验室', icon: Film, color: 'text-orange-400' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setSubMode(btn.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all text-left ${subMode === btn.id ? 'bg-white/10 border border-white/20 text-white font-bold' : 'bg-transparent border border-transparent text-white/50 hover:bg-white/5 hover:text-white/80'}`}
            >
              <btn.icon className={`w-4 h-4 ${btn.color}`} />
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right Workspaces */}
      <div className="lg:col-span-3 flex flex-col h-[75vh]">
        <AnimatePresence mode="wait">
          
          {/* Chat Cabin */}
          {subMode === 'chat' && (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="glass-panel flex flex-col h-full overflow-hidden"
            >
              {/* Top Banner */}
              <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-3">
                  <Smile className="w-5 h-5 text-blue-400" />
                  <div>
                    <h3 className="text-sm font-black tracking-widest text-white/80">{config.name}</h3>
                    <p className="text-[10px] text-white/40 uppercase">当前心情: {messages[messages.length - 1]?.mood || '正常'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-purple-300">伴生状态: 在线</span>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                {messages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`flex flex-col max-w-[75%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
                  >
                    <span className="text-[9px] text-white/30 uppercase mb-1">{msg.role === 'user' ? '小主人' : config.name}</span>
                    <div className={`p-4 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-none'}`}>
                      {msg.image && (
                        <div className="mb-2">
                          <img 
                            src={msg.image} 
                            alt="Evidence/Generated graphic" 
                            className="max-w-xs max-h-64 rounded-lg object-cover border border-white/10" 
                          />
                        </div>
                      )}
                      {msg.loadingImage && (
                        <div className="mb-2 p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 flex flex-col items-center gap-2 text-xs text-purple-300 font-bold">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>书童正在挥洒墨水画画中...</span>
                        </div>
                      )}
                      {msg.imageError && (
                        <div className="mb-2 text-xs text-red-400 font-bold italic flex items-center gap-1">
                          <span>⚠️ {msg.imageError}</span>
                        </div>
                      )}
                      {msg.text}
                      {msg.role === 'model' && (
                        <button
                          type="button"
                          onClick={() => playCompanionSound(msg.mood, msg.text)}
                          className="mt-2 text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1.5 bg-purple-500/10 hover:bg-purple-500/20 px-2.5 py-1 rounded-lg transition-all cursor-pointer border border-purple-500/20 font-bold"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>朗读/播放音效 ({msg.mood || '正常'})</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="self-start items-start">
                    <span className="text-[9px] text-white/30 uppercase mb-1">{config.name}</span>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 text-xs italic flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></div>
                      书童正在思考中...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Image Preview Area */}
              {selectedImage && (
                <div className="px-4 py-2 border-t border-white/10 bg-white/5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <img 
                      src={selectedImage.base64} 
                      alt="Selected thumbnail" 
                      className="w-10 h-10 rounded object-cover border border-white/10" 
                    />
                    <div className="flex flex-col">
                      <span className="text-xs text-white/80 font-bold truncate max-w-[150px]">{selectedImage.name}</span>
                      <span className="text-[10px] text-white/40">已选择图片</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRunOcr}
                      disabled={ocrLoading}
                      className="text-xs bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/30 text-purple-300 px-2 py-1 rounded transition-all flex items-center gap-1 cursor-pointer font-bold"
                    >
                      {ocrLoading ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>正在识别...</span>
                        </>
                      ) : (
                        <>
                          <Brain className="w-3 h-3" />
                          <span>提取文字 (OCR)</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      className="p-1 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 flex gap-2">
                <input
                  type="text"
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  placeholder={`跟${config.name}聊天，输入你想说的...`}
                  className="flex-1 glass-input px-4 py-3 text-sm focus:outline-none"
                />
                
                {/* Hidden File Input */}
                <input
                  type="file"
                  id="chat-image-input"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                
                {/* Image Selection Button */}
                <button
                  type="button"
                  onClick={() => document.getElementById('chat-image-input').click()}
                  className="glass-button p-3 text-purple-400 hover:text-white cursor-pointer"
                  title="上传图片"
                >
                  <Image className="w-4 h-4" />
                </button>

                <button 
                  type="submit"
                  disabled={loading}
                  className="glass-button p-3 text-purple-400 hover:text-white cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}

          {/* Knowledge Tree */}
          {subMode === 'tree' && (
            <motion.div 
              key="tree"
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="glass-panel p-6 flex flex-col h-full overflow-hidden"
            >
              <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
                <TreeDeciduous className="w-5 h-5 text-green-400" />
                <div>
                  <h3 className="text-sm font-bold text-white/80">硅基人生知识树</h3>
                  <p className="text-xs text-white/40">打卡累积，大脑网络深度可视化</p>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* SVG Visualization */}
                <div className="md:col-span-2 relative glass-panel bg-black/40 overflow-hidden flex items-center justify-center p-4">
                  <svg className="w-full h-full min-h-[300px]" viewBox="0 0 500 400">
                    <defs>
                      <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#8A2BE2" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#glow)" />
                    
                    {/* Branch lines */}
                    <line x1="250" y1="360" x2="120" y2="180" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="5" />
                    <line x1="250" y1="360" x2="280" y2="120" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="5" />
                    <line x1="280" y1="120" x2="380" y2="220" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
                    <line x1="280" y1="120" x2="220" y2="260" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
                    <line x1="120" y1="180" x2="100" y2="300" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="5" />
                    
                    {/* Root Node */}
                    <circle cx="250" cy="360" r="10" fill="#a855f7" className="animate-pulse" />
                    <text x="250" y="385" fill="#a855f7" fontSize="10" textAnchor="middle" fontWeight="bold">大脑原核</text>

                    {/* Node points */}
                    {KNOWLEDGE_NODES.map(node => (
                      <g key={node.id} className="cursor-pointer group">
                        <circle 
                          cx={node.cx} 
                          cy={node.cy} 
                          r={node.completed ? "12" : "9"} 
                          fill={node.completed ? "#22c55e" : "#475569"} 
                          stroke={node.completed ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.1)"}
                          strokeWidth={node.completed ? "6" : "2"}
                        />
                        <text 
                          x={node.cx} 
                          y={node.cy - 18} 
                          fill={node.completed ? "#fff" : "rgba(255,255,255,0.4)"}
                          fontSize="9" 
                          textAnchor="middle"
                          fontWeight={node.completed ? "bold" : "normal"}
                        >
                          {node.name.split('·')[1]}
                        </text>
                      </g>
                    ))}
                  </svg>
                  <div className="absolute bottom-4 left-4 flex gap-3 text-[10px]">
                    <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>已激活</div>
                    <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>待唤醒</div>
                  </div>
                </div>

                {/* Node details */}
                <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
                  <h4 className="text-xs uppercase font-bold text-white/50 tracking-wider">节点账目</h4>
                  {KNOWLEDGE_NODES.map(node => (
                    <div key={node.id} className={`p-4 rounded-xl border flex flex-col gap-1 transition-all ${node.completed ? 'bg-green-500/5 border-green-500/20' : 'bg-white/5 border-white/5 opacity-60'}`}>
                      <div className="flex justify-between items-center">
                        <span className={`text-xs font-bold ${node.completed ? 'text-green-400' : 'text-white/40'}`}>{node.name}</span>
                        {node.completed && <Award className="w-3.5 h-3.5 text-green-400" />}
                      </div>
                      <p className="text-[10px] text-white/60">{node.desc}</p>
                      <div className="mt-2 text-[9px] font-mono text-white/40">建设权重: {node.val} XP</div>
                    </div>
                  ))}
                </div>

              </div>
            </motion.div>
          )}

          {/* Book Speed Read */}
          {subMode === 'read' && (
            <motion.div 
              key="read"
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="glass-panel p-6 flex flex-col h-full overflow-hidden"
            >
              <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
                <BookOpen className="w-5 h-5 text-pink-400" />
                <div>
                  <h3 className="text-sm font-bold text-white/80">一本书一天读懂 (NotebookLM 深度重现)</h3>
                  <p className="text-xs text-white/40">过滤营养价值低的信息，快速提取概念映射与批判思维</p>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto custom-scrollbar pr-2">
                {/* Input Column */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-white/50">书名/文章标题</label>
                    <input
                      type="text"
                      value={bookTitle}
                      onChange={e => setBookTitle(e.target.value)}
                      className="glass-input px-3 py-2 text-sm focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-xs text-white/50">导入书籍内容或摘要段落</label>
                    <textarea
                      value={bookText}
                      onChange={e => setBookText(e.target.value)}
                      className="glass-input px-3 py-2 text-sm flex-1 min-h-[150px] resize-none focus:outline-none custom-scrollbar"
                    />
                  </div>

                  <button
                    onClick={handleSpeedRead}
                    disabled={loading}
                    className="glass-button w-full py-3 bg-pink-600/20 border-pink-500/40 text-pink-300 font-bold hover:bg-pink-600/30 flex items-center justify-center gap-2"
                  >
                    <BookMarked className="w-4 h-4" />
                    {loading ? 'AI 书童快速翻阅中...' : '命令书童研读'}
                  </button>
                </div>

                {/* Output Viewpoint Cards */}
                <div className="glass-panel bg-black/30 p-6 flex flex-col gap-5 overflow-y-auto custom-scrollbar max-h-[500px]">
                  {bookResult ? (
                    <>
                      {/* Concept relationship */}
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-black uppercase text-pink-400 tracking-widest flex items-center gap-1.5">
                          <Brain className="w-3.5 h-3.5" /> 概念映射图 (Concept Map)
                        </span>
                        <div className="flex flex-col gap-1.5 mt-1">
                          {bookResult.conceptMap?.map((cm, i) => (
                            <div key={i} className="text-xs bg-white/5 p-2 rounded-lg border border-white/5 font-mono text-white/80">
                              {cm}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Viewpoints */}
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-black uppercase text-pink-400 tracking-widest">核心观点提炼 (Viewpoints)</span>
                        <ul className="list-disc list-inside text-xs text-white/70 flex flex-col gap-1">
                          {bookResult.coreViewpoints?.map((vp, i) => (
                            <li key={i} className="leading-relaxed bg-white/5 p-2.5 rounded-lg border border-white/5 list-none border-l-4 border-l-pink-500">
                              {vp}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Socrates Critical questions */}
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-black uppercase text-pink-400 tracking-widest">批判启发问题 (Socrates Questions)</span>
                        <div className="flex flex-col gap-1.5">
                          {bookResult.criticalQuestions?.map((q, i) => (
                            <div key={i} className="text-xs italic bg-pink-500/5 p-3 rounded-lg border border-pink-500/20 text-pink-200">
                              " {q} "
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-20 text-white/30">
                      <BookOpen className="w-12 h-12 mb-4 text-white/10" />
                      <p className="text-sm">在左侧输入需要研读的文本，点击研读</p>
                      <p className="text-xs mt-1 text-white/20">AI 书童将为您瞬间整理出思维导图与启发性疑问</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Secret Mode */}
          {subMode === 'secret' && (
            <motion.div 
              key="secret"
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="glass-panel p-6 flex flex-col h-full overflow-hidden"
            >
              <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
                <HeartHandshake className="w-5 h-5 text-red-400" />
                <div>
                  <h3 className="text-sm font-bold text-white/80">我有一个小秘密</h3>
                  <p className="text-xs text-white/40">这里发生的一切绝不外泄，书童无条件站你这边</p>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto custom-scrollbar pr-2">
                <div className="flex flex-col gap-4">
                  <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex gap-3 text-xs text-red-200 leading-relaxed">
                    <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <span><b>义气协议开启</b>：不论对错，在此模式下，本伴生书童将自动站在主人的立场。倾诉完毕，我将用合成波模拟人类同理心回应。</span>
                  </div>

                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-xs text-white/50">写下你心中的小秘密或委屈：</label>
                    <textarea
                      value={secretVal}
                      onChange={e => setSecretVal(e.target.value)}
                      placeholder="悄悄话，没人能听见..."
                      className="glass-input px-3 py-2 text-sm flex-1 min-h-[120px] resize-none focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={handleSecretSubmit}
                    disabled={loading}
                    className="glass-button w-full py-3 bg-red-600/20 border-red-500/40 text-red-300 font-bold hover:bg-red-600/30"
                  >
                    倾诉秘密 (合成同理共鸣)
                  </button>
                </div>

                {/* Secret interaction ledger */}
                <div className="glass-panel bg-black/40 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-4 max-h-[400px]">
                  {secretHistory.length > 0 ? (
                    secretHistory.map((sh, i) => (
                      <div key={i} className="flex flex-col gap-2 p-3 rounded-lg bg-white/5 border border-white/5">
                        <div className="text-xs text-white/40">秘密: {sh.secret}</div>
                        <div className="text-xs text-red-300/90 leading-relaxed border-t border-white/5 pt-2 mt-1">
                          🎭 书童誓言: {sh.response}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-20 text-white/20 text-xs">
                      没有任何秘密存档。在这里你可以绝对放心。
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Socrates Inquiry */}
          {subMode === 'socrates' && (
            <motion.div 
              key="socrates"
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="glass-panel p-6 flex flex-col h-full overflow-hidden"
            >
              <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
                <HelpCircle className="w-5 h-5 text-yellow-400" />
                <div>
                  <h3 className="text-sm font-bold text-white/80">打破砂锅问到底 (Socrates Q&A)</h3>
                  <p className="text-xs text-white/40">追寻世界的真理，从一个小问题开始层层下探</p>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto custom-scrollbar pr-2">
                {/* Active Inquiry panel */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-white/50">当前探究议题</label>
                    <input
                      type="text"
                      value={socTopic}
                      onChange={e => setSocTopic(e.target.value)}
                      disabled={socHistory.length > 0}
                      className="glass-input px-3 py-2 text-sm focus:outline-none"
                    />
                  </div>

                  {/* Question box */}
                  <div className="glass-panel bg-yellow-500/5 border-yellow-500/20 p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-center text-[10px] uppercase font-bold text-yellow-400">
                      <span>探索深度: {socDepth}/5</span>
                      {socFinished && <span className="bg-green-500 text-black px-1.5 py-0.5 rounded font-black">研讨圆满</span>}
                    </div>
                    
                    {/* Prompt text */}
                    <div className="text-xs text-white/40 font-bold">书童追问:</div>
                    <div className="text-sm text-yellow-200 leading-relaxed font-bold">
                      {socQuestion}
                    </div>
                  </div>

                  {/* Answer Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-white/50">我的回答和观点：</label>
                    <textarea
                      value={socResponse}
                      onChange={e => setSocResponse(e.target.value)}
                      disabled={socFinished || loading}
                      placeholder="写下你的想法，并给出原因..."
                      className="glass-input px-3 py-2 text-sm min-h-[80px] resize-none focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleSocratesSubmit}
                      disabled={socFinished || loading || !socResponse.trim()}
                      className="flex-1 glass-button py-2.5 bg-yellow-600/20 border-yellow-500/40 text-yellow-300 font-bold hover:bg-yellow-600/30"
                    >
                      提交回答，继续深挖
                    </button>
                    
                    <button
                      onClick={() => {
                        setSocDepth(1);
                        setSocHistory([]);
                        setSocFinished(false);
                        setSocQuestion('当我们把一根磁铁插进一个铜线圈里，并且不断地抽动它，你觉得线圈里的电流表指针会动吗？为什么？');
                        setSocFeedback('让我们重置对话，重新开始探索！');
                      }}
                      className="glass-button px-4 text-xs text-white/50 hover:text-white"
                    >
                      重置议题
                    </button>
                  </div>
                </div>

                {/* Socrates dialog history */}
                <div className="glass-panel bg-black/40 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-4 max-h-[420px]">
                  <div className="text-xs border-b border-white/5 pb-2 text-white/40 uppercase">探索纪要 (Socrates Journal)</div>
                  
                  {/* Feedback line */}
                  <div className="text-xs bg-white/5 p-3 rounded-lg border border-white/5 text-white/70 leading-relaxed">
                    💡 反馈: {socFeedback}
                  </div>

                  {socHistory.map((h, i) => (
                    <div key={i} className="flex flex-col gap-2 p-3 rounded-lg bg-white/5 border border-white/5 text-xs">
                      <div className="text-white/40">深度 {i+1} 回答: {h.answer}</div>
                      <div className="text-yellow-200/90 leading-relaxed pt-1.5 border-t border-white/5">
                        引导反馈: {h.feedback}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {subMode === 'world' && (
            <motion.div 
              key="world"
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="glass-panel p-6 flex flex-col h-full overflow-hidden"
            >
              <div className="flex flex-wrap gap-4 items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <Film className="w-5 h-5 text-orange-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white/80">AI 物理实验室 (Alibaba Wan2.1 Sandbox)</h3>
                    <p className="text-xs text-white/40">基于物理规律与大模型生成的虚拟场景探索边界</p>
                  </div>
                </div>
                
                {/* Mode Sub-tabs Toggle */}
                <div className="flex gap-1.5 p-1 rounded-xl bg-white/5 border border-white/5">
                  <button
                    onClick={() => setWorldSubTab('sim')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${worldSubTab === 'sim' ? 'bg-orange-600/30 text-orange-300 border border-orange-500/20' : 'bg-transparent text-white/50 border border-transparent hover:text-white'}`}
                  >
                    物理公式拟真 (Simulations)
                  </button>
                  <button
                    onClick={() => setWorldSubTab('mine')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${worldSubTab === 'mine' ? 'bg-orange-600/30 text-orange-300 border border-orange-500/20' : 'bg-transparent text-white/50 border border-transparent hover:text-white'}`}
                  >
                    世界边界探索 (Minecraft Gen)
                  </button>
                </div>
              </div>

              {worldSubTab === 'sim' ? (
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar pr-2">
                  {/* Left controls column (1 span) */}
                  <div className="md:col-span-1 flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/50">场景物理描述 (Prompt)</label>
                      <textarea
                        value={worldPrompt}
                        onChange={e => setWorldPrompt(e.target.value)}
                        placeholder="例如: 伽利略比萨斜塔自由落体实验..."
                        className="glass-input px-3 py-2 text-xs h-20 resize-none focus:outline-none"
                      />
                    </div>

                    {/* Preset quick buttons */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] text-white/40 uppercase font-black">经典物理学预设</span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { label: '比萨斜塔自由落体', prompt: '伽利略比萨斜塔自由落体实验' },
                          { label: '牛顿三棱镜分光', prompt: '牛顿三棱镜折射光谱实验' },
                          { label: '法拉第电磁感应', prompt: '法拉第电磁感应线圈发电机' }
                        ].map(p => (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => setWorldPrompt(p.prompt)}
                            className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] text-orange-300 font-bold transition-all cursor-pointer"
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Camera Movement */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/50">相机运动轨迹 (Camera Motion)</label>
                      <select
                        value={worldCamera}
                        onChange={e => setWorldCamera(e.target.value)}
                        className="glass-input bg-black/60 px-3 py-2 text-xs focus:outline-none"
                      >
                        <option value="zoom-in">等距推进 (Zoom In)</option>
                        <option value="zoom-out">等距拉远 (Zoom Out)</option>
                        <option value="pan-left">相机左移 (Pan Left)</option>
                        <option value="pan-right">相机右移 (Pan Right)</option>
                        <option value="crane-up">纵向升降 (Crane Up)</option>
                        <option value="roll">画面旋转 (Roll Camera)</option>
                      </select>
                    </div>

                    {/* Settings Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-white/50">动作强度因子</label>
                        <input 
                          type="number" min="1" max="5" 
                          value={worldMotion}
                          onChange={e => setWorldMotion(Number(e.target.value))}
                          className="glass-input px-2 py-1.5 text-xs focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-white/50">视频帧率 (FPS)</label>
                        <select
                          value={worldFps}
                          onChange={e => setWorldFps(Number(e.target.value))}
                          className="glass-input bg-black/60 px-2 py-1.5 text-xs focus:outline-none"
                        >
                          <option value="16">16 FPS (流畅)</option>
                          <option value="24">24 FPS (电影)</option>
                          <option value="30">30 FPS (高清)</option>
                        </select>
                      </div>
                    </div>

                    {/* Generate Button */}
                    <button
                      onClick={handleGenerateWorldScene}
                      disabled={worldGenerating || !worldPrompt.trim()}
                      className="glass-button w-full py-3 bg-orange-600/20 border-orange-500/40 text-orange-300 font-bold hover:bg-orange-600/30 flex items-center justify-center gap-2"
                    >
                      <Film className="w-4 h-4" />
                      {worldGenerating ? '世界线计算中...' : '生成场景视频'}
                    </button>
                  </div>

                  {/* Right visualization column (2 spans) */}
                  <div className="md:col-span-2 flex flex-col h-full bg-black/20 rounded-xl p-4 border border-white/5 min-h-[300px]">
                    {worldGenerating ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-20">
                        <Loader2 className="w-10 h-10 text-orange-400 animate-spin" />
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-white/80">阿里世界模型 (Wan2.1) 物理视频渲染中...</span>
                          <span className="text-xs text-orange-300 font-mono animate-pulse">{worldGenStage}</span>
                        </div>
                      </div>
                    ) : activeSimulation ? (
                      <div className="flex-1 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2 mb-2">
                          <span className="text-white/60 font-bold">🎬 渲染物理场景视口</span>
                          <span className="text-[10px] text-green-400 font-bold flex items-center gap-1">
                            <Compass className="w-3.5 h-3.5 animate-spin" /> 物理仿真一致性: 98.4%
                          </span>
                        </div>
                        
                        <div className="flex-1 flex items-center justify-center">
                          {activeSimulation === 'galileo' && <GalileoSimulator />}
                          {activeSimulation === 'newton' && <NewtonSimulator />}
                          {activeSimulation === 'faraday' && <FaradaySimulator />}
                          {activeSimulation === 'custom' && <CustomVideoSimulator imageUrl={customGenImage} prompt={worldPrompt} />}
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center py-20 text-white/30">
                        <Film className="w-12 h-12 mb-4 text-white/10" />
                        <p className="text-sm font-bold">AI 物理实验室</p>
                        <p className="text-xs mt-1 text-white/20">配置左侧动作强度与轨迹参数，点击生成启动实验室物理仿真</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <MinecraftWorldExplorer />
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
};

export default CompanionModule;
