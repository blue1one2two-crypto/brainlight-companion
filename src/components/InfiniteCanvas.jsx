import React, { useState, useEffect } from 'react';
import { SovereignEngine } from '../services/SovereignEngine';
import { 
  Sparkles, Sliders, Play, Code, Printer, Layout, Award, Rocket, Check, Eye 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InfiniteCanvas = ({ talentPoints, onUpdatePoints }) => {
  const [activeTab, setActiveTab] = useState('radar'); // radar, script, matrix, printing
  const [loading, setLoading] = useState(false);

  // Script director states
  const [scriptPrompt, setScriptPrompt] = useState('一个自以为绝顶聪明的机器人，在菜市场跟大妈为了两毛钱葱钱斗智斗勇');
  const [scriptResult, setScriptResult] = useState(null);

  // Matrix cascade states
  const [showMatrix, setShowMatrix] = useState(false);
  const [matrixLines, setMatrixLines] = useState([]);

  // 3D printing state
  const [printVolume, setPrintVolume] = useState(60);
  const [selectedVoice, setSelectedVoice] = useState('buzzy-toy');
  const [printingProgress, setPrintingProgress] = useState(0);
  const [isPrinting, setIsPrinting] = useState(false);

  // Radar math helper
  const getRadarPath = (points) => {
    // 6 axes: space, bio, tech, art, craft, social
    // Radius of circle is 100. Center is (150, 150)
    const axes = [
      { angle: 0, val: points.space },
      { angle: Math.PI / 3, val: points.bio },
      { angle: (2 * Math.PI) / 3, val: points.tech },
      { angle: Math.PI, val: points.art },
      { angle: (4 * Math.PI) / 3, val: points.craft },
      { angle: (5 * Math.PI) / 3, val: points.social },
    ];
    return axes.map(ax => {
      const r = (ax.val / 100) * 100; // max radius is 100
      const x = 150 + r * Math.sin(ax.angle);
      const y = 150 - r * Math.cos(ax.angle);
      return `${x},${y}`;
    }).join(' ');
  };

  // Generate matrix code waterfall
  useEffect(() => {
    if (!showMatrix) return;
    const interval = setInterval(() => {
      const chars = "01010101ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%^&*()_+";
      const newLines = Array.from({ length: 25 }, () => {
        return Array.from({ length: 40 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      });
      setMatrixLines(newLines);
    }, 100);
    return () => clearInterval(interval);
  }, [showMatrix]);

  // Script Generator
  const generateScript = async () => {
    if (loading) return;
    setLoading(true);
    setScriptResult(null);
    try {
      // Re-use prototype generator with funny context
      const res = await SovereignEngine.generatePrototype(`笑点爆棚爆笑剧本, 场景: ${scriptPrompt}`);
      if (res) {
        setScriptResult({
          title: '硅基大戏：《智械危机与大妈的葱》',
          actors: ['演员A (小机器人) - 芯片搭载: Qwen1.5', '演员B (卖菜大妈) - 掌握绝活: 心理压迫感'],
          script: `【场景：菜市场，雨后】
机器人：“根据我的计算，这捆葱重50g，折合0.18元。您收我0.2元，溢价11.1%。”
大妈：“算你的头！称就是这么称的！多拿两个蒜，赶紧走人！”
机器人：“错误！大妈，这违反了数值守恒...”
【结局】机器人被大妈用塑料袋套住头部，强行拖走。`,
          visual: '赛博朋克风大排档，冷色灯光与蒸汽。'
        });
        if (onUpdatePoints) {
          onUpdatePoints('art', 15);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 3D printing simulation
  const startPrinting = () => {
    if (isPrinting) return;
    setIsPrinting(true);
    setPrintingProgress(0);
    const interval = setInterval(() => {
      setPrintingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsPrinting(false);
          if (onUpdatePoints) {
            onUpdatePoints('craft', 20);
          }
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  return (
    <div className="w-full h-full max-w-7xl px-4 overflow-y-auto custom-scrollbar pb-10">
      
      {/* Top Banner */}
      <div className="glass-panel p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-white/90">
            <Layout className="w-6 h-6 text-pink-400" />
            无限创造画布 (Creator Canvas & Sandbox)
          </h2>
          <p className="text-xs text-white/40 mt-1">
            释放孩子的天性与热爱，创造数字资产与互动手办。
          </p>
        </div>

        <div className="flex gap-2">
          {['radar', 'script', 'matrix', 'printing'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${activeTab === tab ? 'bg-pink-600/20 border-pink-500 text-pink-300' : 'bg-white/5 border-transparent text-white/50 hover:bg-white/10'}`}
            >
              {tab === 'radar' && '天赋雷达'}
              {tab === 'script' && '笑料剧本'}
              {tab === 'matrix' && '黑客瀑布'}
              {tab === 'printing' && '3D 打印'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Workspace Column */}
        <div className="lg:col-span-2 flex flex-col h-[65vh]">
          <AnimatePresence mode="wait">
            
            {/* Radar Slider View */}
            {activeTab === 'radar' && (
              <motion.div
                key="radar-view"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                className="glass-panel p-6 flex flex-col h-full overflow-hidden"
              >
                <div className="text-sm font-bold text-white/80 border-b border-white/10 pb-3 mb-4 flex justify-between items-center">
                  <span>天赋雷达调校舱 (Talent Analyzer)</span>
                  <Sliders className="w-4 h-4 text-pink-400" />
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  
                  {/* Radar Polygon Visual */}
                  <div className="flex flex-col items-center justify-center p-4 bg-black/30 rounded-2xl border border-white/5">
                    <svg className="w-full max-w-[280px]" viewBox="0 0 300 300">
                      {/* Nested background rings */}
                      <circle cx="150" cy="150" r="100" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                      <circle cx="150" cy="150" r="75" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                      <circle cx="150" cy="150" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                      <circle cx="150" cy="150" r="25" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                      
                      {/* Web axes lines */}
                      {[0, Math.PI/3, 2*Math.PI/3, Math.PI, 4*Math.PI/3, 5*Math.PI/3].map((angle, i) => (
                        <line
                          key={i}
                          x1="150"
                          y1="150"
                          x2={150 + 100 * Math.sin(angle)}
                          y2={150 - 100 * Math.cos(angle)}
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="1"
                        />
                      ))}

                      {/* Radar Polygon */}
                      <polygon
                        points={getRadarPath(talentPoints)}
                        fill="rgba(236,72,153,0.25)"
                        stroke="#ec4899"
                        strokeWidth="2.5"
                      />

                      {/* Axis Labels */}
                      <text x="150" y="32" fill="gold" fontSize="9" textAnchor="middle" fontWeight="bold">太空/工程 (Space)</text>
                      <text x="250" y="90" fill="#22c55e" fontSize="9" textAnchor="start" fontWeight="bold">生命医药 (Bio)</text>
                      <text x="250" y="215" fill="#3b82f6" fontSize="9" textAnchor="start" fontWeight="bold">AI/算法 (Tech)</text>
                      <text x="150" y="275" fill="#ec4899" fontSize="9" textAnchor="middle" fontWeight="bold">艺术/音乐 (Art)</text>
                      <text x="50" y="215" fill="#a855f7" fontSize="9" textAnchor="end" fontWeight="bold">蓝领/实操 (Craft)</text>
                      <text x="50" y="90" fill="#ef4444" fontSize="9" textAnchor="end" fontWeight="bold">情绪/社交 (Social)</text>
                    </svg>
                  </div>

                  {/* Manual adjusting sliders for MVP simulation */}
                  <div className="flex flex-col gap-4">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">模拟行为，查看雷达动态变化</span>
                    {[
                      { key: 'space', label: '研究火箭推进器', color: 'bg-yellow-500' },
                      { key: 'bio', label: '做细胞离心微型实验', color: 'bg-green-500' },
                      { key: 'tech', label: '写 Python 脚本控制书童', color: 'bg-blue-500' },
                      { key: 'art', label: '为微电影谱写电子音轨', color: 'bg-pink-500' },
                      { key: 'craft', label: '组装机器人实体外壳', color: 'bg-purple-500' },
                      { key: 'social', label: '与邻座小主人分享秘密', color: 'bg-red-500' }
                    ].map(sld => (
                      <div key={sld.key} className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-white/70">{sld.label}</span>
                          <span className="font-mono text-white/50">{talentPoints[sld.key]} XP</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={talentPoints[sld.key]}
                          onChange={(e) => {
                            if (onUpdatePoints) {
                              onUpdatePoints(sld.key, parseInt(e.target.value) - talentPoints[sld.key]);
                            }
                          }}
                          className="w-full accent-pink-500 bg-white/5 rounded-lg appearance-none h-1.5 cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>

                </div>
              </motion.div>
            )}

            {/* Humor Script Director */}
            {activeTab === 'script' && (
              <motion.div
                key="script-view"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                className="glass-panel p-6 flex flex-col h-full overflow-hidden"
              >
                <div className="text-sm font-bold text-white/80 border-b border-white/10 pb-3 mb-4">
                  笑点爆棚剧本导演 (Humorous Theater Sandbox)
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto custom-scrollbar">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-white/50">输入搞笑情节构思</label>
                      <textarea
                        value={scriptPrompt}
                        onChange={e => setScriptPrompt(e.target.value)}
                        className="glass-input px-3 py-2 text-xs h-24 resize-none focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={generateScript}
                      disabled={loading}
                      className="glass-button w-full py-3 bg-pink-600/20 border-pink-500/40 text-pink-300 font-bold hover:bg-pink-600/30 flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      {loading ? 'AI 导演正在编排段子...' : '生成爆笑剧本 & 组织数字人排练'}
                    </button>
                  </div>

                  <div className="glass-panel bg-black/40 p-4 overflow-y-auto custom-scrollbar text-xs leading-relaxed max-h-[300px]">
                    {scriptResult ? (
                      <div className="flex flex-col gap-4">
                        <div className="font-bold text-pink-300 border-b border-white/5 pb-2 text-sm">
                          🎭 {scriptResult.title}
                        </div>
                        
                        <div>
                          <div className="font-bold text-white/40 mb-1">【演员数字资产配置】</div>
                          {scriptResult.actors.map((act, i) => (
                            <div key={i} className="text-[10px] text-white/70 italic bg-white/5 px-2 py-1 rounded mb-1 border border-white/5">
                              {act}
                            </div>
                          ))}
                        </div>

                        <div>
                          <div className="font-bold text-white/40 mb-1">【剧本正文】</div>
                          <p className="whitespace-pre-line text-yellow-100 bg-white/5 p-3 rounded-lg border border-white/5">
                            {scriptResult.script}
                          </p>
                        </div>

                        <div className="text-[10px] text-white/30 border-t border-white/5 pt-2">
                          建议合成视觉风格: {scriptResult.visual}
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center text-white/20 py-20">
                        还未编排戏剧。在左侧输入大纲大笑构想并点击生成。
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Hacker Matrix overlay */}
            {activeTab === 'matrix' && (
              <motion.div
                key="matrix-view"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                className="glass-panel p-6 flex flex-col h-full overflow-hidden relative"
              >
                <div className="text-sm font-bold text-white/80 border-b border-white/10 pb-3 mb-4 flex justify-between items-center z-10">
                  <span>满屏代码瀑布黑客软件 (Matrix Cascade Simulator)</span>
                  <button
                    onClick={() => {
                      setShowMatrix(prev => !prev);
                      if (onUpdatePoints) {
                        onUpdatePoints('tech', 10);
                      }
                    }}
                    className={`px-3 py-1 rounded text-xs font-bold border ${showMatrix ? 'bg-green-600/30 border-green-500 text-green-300 animate-pulse' : 'bg-white/5 border-white/10 text-white/60'}`}
                  >
                    {showMatrix ? '正在爆降' : '启动瀑布'}
                  </button>
                </div>

                <div className="flex-1 rounded-xl bg-black/90 p-4 border border-white/5 flex flex-col font-mono text-[9px] text-green-400 overflow-y-auto custom-scrollbar relative">
                  {showMatrix ? (
                    <div className="matrix-cascade flex flex-col gap-1 w-full h-full select-all">
                      {matrixLines.map((ln, i) => (
                        <div key={i} className="whitespace-nowrap overflow-hidden">
                          {ln}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-white/20 py-20 font-sans text-xs">
                      <Code className="w-12 h-12 mb-4 text-white/5" />
                      点击右上角“启动瀑布”来触发全屏黑客数字码雨流。
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* 3D Printable Assembly custom design */}
            {activeTab === 'printing' && (
              <motion.div
                key="printing-view"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                className="glass-panel p-6 flex flex-col h-full overflow-hidden"
              >
                <div className="text-sm font-bold text-white/80 border-b border-white/10 pb-3 mb-4">
                  智能手办 3D 打印室 (3D Print & Customization)
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto custom-scrollbar">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-white/50">手办比例与尺寸</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="30"
                          max="150"
                          value={printVolume}
                          onChange={e => setPrintVolume(parseInt(e.target.value))}
                          className="flex-1 accent-pink-500"
                        />
                        <span className="text-xs font-mono text-white/60">{printVolume} mm</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-white/50">合成声音与人设音色</label>
                      <div className="flex gap-2">
                        {['buzzy-toy', 'royal-butler', 'cyber-tsundere'].map(v => (
                          <button
                            key={v}
                            onClick={() => setSelectedVoice(v)}
                            className={`flex-1 py-2 text-xs border rounded-lg transition-all ${selectedVoice === v ? 'bg-pink-600/30 border-pink-500 text-white' : 'bg-white/5 border-transparent text-white/60'}`}
                          >
                            {v === 'buzzy-toy' && '玩具哔哔声'}
                            {v === 'royal-butler' && '宫廷太傅'}
                            {v === 'cyber-tsundere' && '傲娇音色'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={startPrinting}
                      disabled={isPrinting}
                      className="glass-button w-full py-3 bg-pink-600/20 border-pink-500/40 text-pink-300 font-bold hover:bg-pink-600/30 flex items-center justify-center gap-2"
                    >
                      <Printer className="w-4 h-4 animate-bounce" />
                      {isPrinting ? `正在打印中 ${printingProgress}%` : '发送至本地 3D 打印机'}
                    </button>
                  </div>

                  {/* Preview printable 3D widget */}
                  <div className="glass-panel bg-black/40 flex flex-col justify-center items-center p-6 relative">
                    {isPrinting && (
                      <div className="absolute inset-0 bg-pink-600/5 animate-pulse flex items-center justify-center text-xs text-pink-400 font-bold">
                        正在烧结层积中...
                      </div>
                    )}
                    
                    <div className="w-24 h-24 rounded-full border-2 border-pink-500/30 border-dashed flex items-center justify-center animate-spin-slow">
                      <Rocket className="w-10 h-10 text-pink-400 animate-pulse" />
                    </div>

                    <div className="mt-4 text-xs font-mono text-center">
                      <div className="text-white/80 font-bold">模型: Space_Ranger_V1.stl</div>
                      <div className="text-white/30 text-[10px] mt-1">烧结体积: {printVolume * 2} 颗粒 · 音色: {selectedVoice}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Talent Radar Suggestions Column */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="glass-panel p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <Award className="w-5 h-5 text-yellow-400" />
              <h3 className="text-sm uppercase font-bold tracking-widest text-white/80">天性天赋雷达建议</h3>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-[10px] text-white/40 uppercase tracking-widest">基于你最近三个月的打卡聚焦领域：</span>

              <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-yellow-400 flex items-center gap-1.5">
                    🚀 首选方向: 太空与航天工程师
                  </span>
                  <span className="text-[9px] bg-yellow-500 text-black px-1.5 py-0.5 rounded font-black">心流匹配率 94%</span>
                </div>
                <p className="text-[11px] text-white/70 leading-relaxed">
                  小主人最近在物理经典力学、斜坡时间等模拟任务中深度专注达6小时。我们建议你：
                </p>
                <div className="text-[10px] text-white/50 flex flex-col gap-1 mt-1 border-t border-white/5 pt-2">
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-green-400" /> 借阅《量子物理概论》并在打卡中提交</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-green-400" /> 尝试在无限画布中，设计一个太空飞行控制算法</div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-white/5 bg-white/5 flex flex-col gap-2 opacity-60">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white/80">
                    🎨 备选方向: 赛博朋克声音制作人
                  </span>
                  <span className="text-[9px] bg-white/10 text-white/60 px-1.5 py-0.5 rounded font-bold">心流匹配率 50%</span>
                </div>
                <p className="text-[11px] text-white/60">
                  小主人在幽默剧本排演和配音中积累了100分。继续加油发掘创造力！
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default InfiniteCanvas;
