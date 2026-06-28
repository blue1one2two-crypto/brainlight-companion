import React, { useState } from 'react';
import { Telescope, Globe, Flame, ShieldAlert, CheckCircle, ArrowRight, Star, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DISCOVERIES = [
  {
    id: 'archimedes',
    year: '公元前 250年',
    title: '阿基米德浮力定律',
    scientist: '阿基米德 (Archimedes)',
    weight: 9.2,
    truthWeightDesc: '奠定了物理静力学与流体力学根基。将日常体验提升为严格的几何数学证明。',
    cultureCompare: '中国战国时期《墨经》记载了部分关于浮体与平衡的观察，但阿基米德首次推导出完美的定量公式 F=ρgV。',
    scene: '西西里叙拉古公共浴池',
    simulation: {
      intro: '你正站在叙拉古浴池旁边。国王命令阿基米德在不破坏金冠的前提下验证金匠是否掺假。阿基米德迈入盛满水的浴盆时，水漫溢了出来。',
      choices: [
        { text: '大喊 Eureka，捧起金冠称重溢出的水体积进行密度换算', correct: true, score: 25, feedback: '正确！物体排开的水体积等于其浸入的体积。金的密度比银大，同质量的金冠体积会小于纯金块，因此溢出水量不同。' },
        { text: '直接用火熔化皇冠称重', correct: false, score: 0, feedback: '错误！国王严令禁止破坏皇冠。' },
        { text: '拿一模一样的泥土做皇冠对比', correct: false, score: 5, feedback: '错误！泥土的密度与金银风马牛不相及。' }
      ]
    }
  },
  {
    id: 'galileo',
    year: '1604年',
    title: '伽利略斜坡实验与自由落体',
    scientist: '伽利略 (Galileo Galilei)',
    weight: 9.5,
    truthWeightDesc: '科学史上首次引入精密实验与定量观测，粉碎了亚里士多德两千年的机械直觉。',
    cultureCompare: '古代中国偏向实用工程（如水力风鼓），极少将时间和加速度进行微秒级定量几何实验。',
    scene: '比萨斜塔与光滑斜坡木板',
    simulation: {
      intro: '伽利略在光滑斜板上刻上等距凹槽，释放青铜球，使用水漏滴水计时。他想知道距离与时间的关系。',
      choices: [
        { text: '青铜球滚下的距离与滚下时间的平方成正比', correct: true, score: 25, feedback: '正确！伽利略推导出了 s = 1/2 at²，证明了恒定加速度的存在，是运动学的划时代突破！' },
        { text: '青铜球滚下的速度与重力大小成反比', correct: false, score: 0, feedback: '错误！这回退到了亚里士多德的错误结论中。' },
        { text: '重球一定比轻球滚得快很多', correct: false, score: 5, feedback: '错误！重力加速度在忽略空气阻力时是等同的。' }
      ]
    }
  },
  {
    id: 'newton',
    year: '1666年',
    title: '牛顿光的色散实验',
    scientist: '艾萨克·牛顿 (Isaac Newton)',
    weight: 9.8,
    truthWeightDesc: '证明白光是多种单色光的混合。揭示了色散真相，彻底重塑了人类对宇宙色谱的认知。',
    cultureCompare: '中国古代注重工艺染色，而西方由此发展出光谱学与现代天文学物理。',
    scene: '林肯郡伍尔索普庄园暗室',
    simulation: {
      intro: '在黑暗的书房中，牛顿只在大豆般的窗帘缝隙留下一束太阳光，让它穿过三棱镜，白光折射成了彩虹色。牛顿想证明到底是棱镜染了色，还是白光本就包含颜色。',
      choices: [
        { text: '将折射后的单色红光，再次穿过第二个三棱镜，观察是否再次分解', correct: true, score: 25, feedback: '正确！牛顿的“双棱镜实验”证明单色红光穿过第二个棱镜后依然是红光，没有发生进一步色散。这证明棱镜只是起到了分光滤镜的作用！' },
        { text: '用放大镜聚焦彩虹光束把纸点燃', correct: false, score: 5, feedback: '无助于色散属性证明。这只能证明光的能量汇聚。' },
        { text: '拿彩虹色颜料把三棱镜画成红色', correct: false, score: 0, feedback: '这只是手工涂鸦，与光的折射原理相悖。' }
      ]
    }
  },
  {
    id: 'faraday',
    year: '1831年',
    title: '法拉第电磁感应',
    scientist: '迈克尔·法拉第 (Michael Faraday)',
    weight: 9.9,
    truthWeightDesc: '磁生电的发现，揭示了电与磁的本质统一，推动人类社会全面进入第二次工业电气革命。',
    cultureCompare: '四大发明中的指南针（司南）止步于磁偏角和静态指向应用，法拉第将磁与动能耦合，首次提取出源源不断的电力。',
    scene: '伦敦皇家研究院地下实验室',
    simulation: {
      intro: '法拉第将一根永久磁铁迅速插进铜线圈的内部。连接在线圈两端的检流计指针发生剧烈抖动。',
      choices: [
        { text: '线圈中产生电流的根本原因是因为磁通量的变化，必须让磁铁与线圈产生相对运动', correct: true, score: 25, feedback: '正确！法拉第电磁感应定律：只要穿过线圈的磁通量发生改变，就会产生感应电动势。静止不动将不会有电流！' },
        { text: '把磁铁塞进去放着不动，让它静置吸附', correct: false, score: 5, feedback: '错误！静止状态下磁通量变化率为零，检流计指针归零。' },
        { text: '用木棍代替磁铁插入线圈', correct: false, score: 0, feedback: '错误！木棍无磁场，无论如何运动均无法产生感应。' }
      ]
    }
  }
];

const CivilizationTunnel = ({ onPointsAwarded }) => {
  const [activeItem, setActiveItem] = useState(null);
  const [transitState, setTransitState] = useState(null); // 'intro', 'choices', 'result'
  const [selectedChoice, setSelectedChoice] = useState(null);

  const startTransit = (item) => {
    setActiveItem(item);
    setTransitState('intro');
    setSelectedChoice(null);
  };

  const selectAnswer = (choice) => {
    setSelectedChoice(choice);
    setTransitState('result');
    if (choice.correct && onPointsAwarded) {
      onPointsAwarded(choice.score);
    }
  };

  return (
    <div className="w-full h-full max-w-7xl px-4 overflow-y-auto custom-scrollbar pb-10">
      
      {/* Top Banner */}
      <div className="glass-panel p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-white/90">
            <Telescope className="w-6 h-6 text-purple-400" />
            人类智慧闪耀时 (Civilization Time Tunnel)
          </h2>
          <p className="text-xs text-white/40 mt-1">
            还原文明发现现场，用体验和经历代替死记硬背。
          </p>
        </div>
        <div className="flex gap-2">
          <span className="text-[10px] bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 px-3 py-1.5 rounded-full uppercase tracking-wider font-bold">
            文明真理权重模式已开启
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Timeline Line */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {DISCOVERIES.map((item, idx) => (
            <div 
              key={item.id}
              className="glass-panel p-6 flex flex-col gap-4 relative overflow-hidden border-l-4 border-l-purple-500 hover:border-l-cyan-400 transition-all"
            >
              {/* Year Stamp */}
              <div className="flex items-center gap-2 text-[10px] font-mono text-purple-300 font-bold uppercase tracking-widest">
                <Clock className="w-3.5 h-3.5" />
                {item.year}
              </div>

              {/* Title & Scientist */}
              <div>
                <h3 className="text-base font-bold text-white/90">{item.title}</h3>
                <span className="text-xs text-white/40 italic">发现者: {item.scientist}</span>
              </div>

              {/* Truth weight visual rating */}
              <div className="flex flex-col gap-1.5 bg-black/30 p-3 rounded-lg border border-white/5">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-white/40 uppercase tracking-wider font-bold">文明发现真相权重</span>
                  <span className="text-purple-300 font-mono font-bold">{item.weight} / 10</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
                    style={{ width: `${item.weight * 10}%` }}
                  />
                </div>
                <p className="text-[11px] text-white/60 leading-relaxed mt-1">{item.truthWeightDesc}</p>
              </div>

              {/* Cultural Context Weights */}
              <div className="text-xs bg-cyan-950/20 border border-cyan-500/10 p-3 rounded-lg text-cyan-200/80 leading-relaxed">
                <span className="font-bold text-cyan-300">🔎 发现的权重对比：</span>
                {item.cultureCompare}
              </div>

              <div className="flex justify-between items-center mt-2">
                <div className="text-[10px] text-white/30 uppercase tracking-widest font-mono">
                  发现场景: {item.scene}
                </div>
                <button
                  onClick={() => startTransit(item)}
                  className="glass-button px-4 py-2 text-xs text-purple-400 hover:text-white flex items-center gap-1.5"
                >
                  现场穿越
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Right Transit Simulation Window */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {activeItem ? (
              <motion.div
                key={activeItem.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel p-6 flex flex-col gap-5 border border-purple-500/30 shadow-purple-950/20 sticky top-4"
              >
                {/* Header */}
                <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-purple-300">
                  <Globe className="w-5 h-5 animate-spin-slow" />
                  <span className="text-xs font-bold uppercase tracking-widest">时空穿越舱 · 已抵达</span>
                </div>

                <div className="text-sm font-bold text-white/90">
                  📍 {activeItem.scene}
                </div>

                {/* Transition Stages */}
                {transitState === 'intro' && (
                  <div className="flex flex-col gap-4">
                    <p className="text-xs text-white/70 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                      {activeItem.simulation.intro}
                    </p>
                    <button
                      onClick={() => setTransitState('choices')}
                      className="glass-button py-2.5 bg-purple-600/30 text-purple-200 border-purple-500/40 text-xs font-bold hover:bg-purple-600/40"
                    >
                      陪同主角探索
                    </button>
                  </div>
                )}

                {transitState === 'choices' && (
                  <div className="flex flex-col gap-3">
                    <span className="text-[10px] text-white/40 uppercase font-mono">你需要做出选择以继续发现：</span>
                    {activeItem.simulation.choices.map((choice, i) => (
                      <button
                        key={i}
                        onClick={() => selectAnswer(choice)}
                        className="glass-button p-4 text-xs text-left leading-relaxed hover:border-purple-500/50 hover:bg-white/5 transition-all"
                      >
                        {choice.text}
                      </button>
                    ))}
                  </div>
                )}

                {transitState === 'result' && selectedChoice && (
                  <div className="flex flex-col gap-4">
                    <div className={`p-4 rounded-xl border flex gap-3 text-xs leading-relaxed ${selectedChoice.correct ? 'bg-green-500/10 border-green-500/20 text-green-200' : 'bg-red-500/10 border-red-500/20 text-red-200'}`}>
                      {selectedChoice.correct ? (
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      ) : (
                        <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0" />
                      )}
                      <div>
                        <div className="font-bold mb-1">{selectedChoice.correct ? '真理火花被点燃！' : '探索遭遇瓶颈'}</div>
                        {selectedChoice.feedback}
                      </div>
                    </div>

                    {selectedChoice.correct && (
                      <div className="bg-purple-500/5 border border-purple-500/20 p-3 rounded-lg flex items-center justify-between">
                        <span className="text-[10px] text-purple-300 font-bold uppercase">梦想种子已被播下</span>
                        <span className="text-xs font-mono font-bold text-white flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                          +{selectedChoice.score} XP 建设值
                        </span>
                      </div>
                    )}

                    <div className="flex gap-2 mt-2">
                      {!selectedChoice.correct && (
                        <button
                          onClick={() => setTransitState('choices')}
                          className="flex-1 glass-button py-2 text-xs"
                        >
                          重新思考
                        </button>
                      )}
                      <button
                        onClick={() => setActiveItem(null)}
                        className="flex-1 glass-button py-2 text-xs text-white/50"
                      >
                        离开现场
                      </button>
                    </div>

                  </div>
                )}

              </motion.div>
            ) : (
              <div className="glass-panel p-10 flex flex-col items-center justify-center text-center text-white/20 text-xs">
                <Globe className="w-12 h-12 mb-4 text-white/5" />
                <p>点击左侧发现事件的“现场穿越”按钮</p>
                <p className="mt-1 text-[10px] text-white/10">进入科学发现的关键历史情境中去体验</p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
};

export default CivilizationTunnel;
