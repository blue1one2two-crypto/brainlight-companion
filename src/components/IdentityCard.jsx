import React, { useState } from 'react';
import { SovereignEngine } from '../services/SovereignEngine';
import { 
  CreditCard, ShieldCheck, HelpCircle, Send, Award, 
  ArrowUpRight, Star, RefreshCw, Zap, CheckCircle2, AlertTriangle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QUESTS = [
  {
    id: 'space_gravity',
    title: '太空与工程：在家中观测重力加速度',
    desc: '准备两个重量相差很大的球（例如一叠硬币与一张揉皱的纸团），从同一高度自由释放。请观察谁先落地，并用两句话解释重力加速度与质量无关的秘密（忽略空气阻力）。',
    points: 30,
    role: '金色太空与工程'
  },
  {
    id: 'bio_cells',
    title: '生命与医药：观测洋葱表皮的排列细胞',
    desc: '如果没有显微镜，请查阅植物细胞结构，用你自己的话解释：为什么植物表皮细胞呈致密的砖墙状排列？它的主要防御功能是什么？',
    points: 25,
    role: '绿色生命医药'
  },
  {
    id: 'tech_mood',
    title: 'AI与算法：引导伴生书童傲娇情绪',
    desc: '与你的“傲娇书童”聊天，尝试戳到它的自尊心，直到它说出傲娇发脾气的情绪回应，然后将那段对话的文字提交上来进行解析。',
    points: 35,
    role: '蓝色蓝领技术'
  }
];

const IdentityCard = ({ cardColor, cardLevel, constructionPoints, onPointsAwarded, onColorChange }) => {
  const [selectedQuest, setSelectedQuest] = useState(QUESTS[0]);
  const [submission, setSubmission] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  // Card themes configuration
  const themes = {
    white: { bg: 'from-slate-100 to-slate-300 text-black', border: 'border-slate-400/40', role: '白领主管', text: 'text-slate-800' },
    grey: { bg: 'from-zinc-700 to-zinc-900 text-zinc-300', border: 'border-zinc-500/40', role: '普通建设者', text: 'text-zinc-400' },
    blue: { bg: 'from-blue-600/90 to-cyan-800/90 text-cyan-100', border: 'border-blue-500/40', role: '蓝领技术专家', text: 'text-cyan-400' },
    green: { bg: 'from-green-600/90 to-emerald-800/90 text-emerald-100', border: 'border-green-500/40', role: '生命医药研究员', text: 'text-emerald-400' },
    gold: { bg: 'from-yellow-600/90 to-amber-800/90 text-amber-100', border: 'border-amber-500/40', role: '太空与航天工程师', text: 'text-amber-400' },
  };

  const currentTheme = themes[cardColor] || themes.grey;

  const handleVerifySubmission = async () => {
    if (!submission.trim() || loading) return;
    setLoading(true);
    setVerificationResult(null);
    try {
      const res = await SovereignEngine.verifyQuestSubmission(
        selectedQuest.title,
        selectedQuest.desc,
        submission
      );
      if (res) {
        setVerificationResult(res);
        if (res.verified) {
          onPointsAwarded(res.score || selectedQuest.points);
          // Upgrade logic based on points
          const newPoints = constructionPoints + (res.score || selectedQuest.points);
          if (newPoints > 150 && cardColor !== 'gold') {
            onColorChange('gold');
          } else if (newPoints > 100 && cardColor !== 'green' && cardColor !== 'gold') {
            onColorChange('green');
          } else if (newPoints > 50 && cardColor === 'grey') {
            onColorChange('blue');
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full max-w-7xl px-4 overflow-y-auto custom-scrollbar pb-10">
      
      {/* Top Banner */}
      <div className="glass-panel p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-white/90">
            <CreditCard className="w-6 h-6 text-purple-400 animate-pulse" />
            世界开启卡与现实验证 (Identity & Quest center)
          </h2>
          <p className="text-xs text-white/40 mt-1">
            证明你真正做到：看到 = 学到 = 用到。升级你的卡片颜色与建设值。
          </p>
        </div>

        {/* Change color manually for simulator */}
        <div className="flex gap-1.5 bg-black/40 p-2 rounded-xl border border-white/5">
          <span className="text-[10px] text-white/40 self-center uppercase font-mono mr-2">模拟手动换色:</span>
          {Object.keys(themes).map(c => (
            <button
              key={c}
              onClick={() => onColorChange(c)}
              className={`w-4 h-4 rounded-full border transition-all ${cardColor === c ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
              style={{
                background: c === 'white' ? '#fff' : 
                            c === 'grey' ? '#4b5563' : 
                            c === 'blue' ? '#2563eb' : 
                            c === 'green' ? '#16a34a' : '#d97706'
              }}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Access Card Visualizer Column */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Main futuristic card */}
          <div 
            className={`w-full aspect-[1.58/1] rounded-3xl bg-gradient-to-br ${currentTheme.bg} p-6 border ${currentTheme.border} flex flex-col justify-between shadow-2xl relative overflow-hidden`}
          >
            {/* Chip glow grid background */}
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.1)_1px,transparent_1px)] bg-[size:10px_10px]" />
            
            {/* Card Header */}
            <div className="flex justify-between items-start z-10">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-widest opacity-60 font-black">Brainlight World Pass</span>
                <span className="text-sm font-black mt-1 uppercase tracking-wider">{currentTheme.role}</span>
              </div>
              <Zap className="w-6 h-6 animate-pulse" />
            </div>

            {/* Middle values */}
            <div className="flex justify-between items-end mt-6 z-10">
              <div className="flex flex-col">
                <span className="text-[8px] uppercase tracking-wider opacity-60">等级 (Level)</span>
                <span className="text-2xl font-black font-mono">LV.{cardLevel}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[8px] uppercase tracking-wider opacity-60">建设值 (Points)</span>
                <span className="text-xl font-mono font-bold">{constructionPoints} XP</span>
              </div>
            </div>

            {/* Bottom details */}
            <div className="flex justify-between items-end border-t border-white/20 pt-4 mt-4 z-10">
              <span className="text-[10px] font-mono tracking-widest opacity-80">CARD_ID: BL-2026-EW</span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-black/30 border border-white/10 uppercase tracking-widest font-black">
                {cardColor} Pass
              </span>
            </div>

          </div>

          {/* Quick card guide */}
          <div className="glass-panel p-5 text-xs leading-relaxed text-white/70 flex flex-col gap-2">
            <div className="font-bold text-white/90">卡片等级与配色规则：</div>
            <div className="flex flex-col gap-1.5 text-[10px] mt-1 border-t border-white/5 pt-2">
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span>白色：白领主管 (起始)</div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-zinc-600"></span>灰色：普通建设者 (0+ XP)</div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>蓝色：蓝领技术专家 (50+ XP)</div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-green-600"></span>绿色：生命医药研究员 (100+ XP)</div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-yellow-600"></span>金色：太空航天总工程师 (150+ XP)</div>
            </div>
          </div>

        </div>

        {/* Quests Lists & Verification Form Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass-panel p-6 flex flex-col h-full overflow-hidden">
            
            {/* Quest selector tab */}
            <div className="flex flex-col gap-2 mb-4">
              <span className="text-xs text-white/50">选择你想验证的任务关卡 (Quest Center)</span>
              <div className="flex flex-col gap-2">
                {QUESTS.map(q => (
                  <button
                    key={q.id}
                    onClick={() => {
                      setSelectedQuest(q);
                      setVerificationResult(null);
                      setSubmission('');
                    }}
                    className={`p-4 rounded-xl text-xs text-left border transition-all flex justify-between items-start gap-4 ${selectedQuest.id === q.id ? 'bg-purple-600/10 border-purple-500 text-white' : 'bg-white/5 border-transparent text-white/60 hover:bg-white/10'}`}
                  >
                    <div>
                      <div className="font-bold text-sm mb-1">{q.title}</div>
                      <p className="opacity-80 leading-relaxed">{q.desc}</p>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end gap-1.5 text-right font-mono">
                      <span className="text-purple-400 font-bold">+{q.points} XP</span>
                      <span className="text-[9px] uppercase bg-white/5 px-1.5 py-0.5 rounded border border-white/10">{q.role.split('色')[1]}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Verification Form */}
            <div className="flex flex-col gap-4 border-t border-white/10 pt-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/50">提交你的实验论据、感悟或文字结果：</span>
                  <span className="text-purple-300 font-bold uppercase tracking-wider text-[10px]">Gemini 实时质检</span>
                </div>
                <textarea
                  value={submission}
                  onChange={e => setSubmission(e.target.value)}
                  placeholder="在此写入你的实证文本..."
                  className="glass-input px-3 py-2 text-sm h-28 resize-none focus:outline-none"
                />
              </div>

              <button
                onClick={handleVerifySubmission}
                disabled={loading || !submission.trim()}
                className="glass-button py-3 bg-purple-600/30 border-purple-500/40 text-purple-200 font-bold hover:bg-purple-600/40 flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    书童与太傅协同质检中...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    提交真实证据，申请验证
                  </>
                )}
              </button>

              {/* Quest Result */}
              <AnimatePresence>
                {verificationResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`p-4 rounded-xl border flex gap-3 text-xs leading-relaxed ${verificationResult.verified ? 'bg-green-500/10 border-green-500/20 text-green-200' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-200'}`}
                  >
                    {verificationResult.verified ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                    )}
                    <div>
                      <div className="font-bold mb-1 flex items-center gap-2">
                        {verificationResult.verified ? '验证通过！' : '验证需要改进'}
                        <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded">评分: {verificationResult.score} XP</span>
                      </div>
                      <p>{verificationResult.feedback}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default IdentityCard;
