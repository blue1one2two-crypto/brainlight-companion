import React, { useState } from 'react';
import { 
  Printer, Cpu, Battery, Volume2, Mic, Settings, Play, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { motion } from 'framer-motion';

const COMPONENTS = [
  { id: 'shell', name: '3D 打印外壳 (定制 STL 结构)', type: 'Structure', icon: Printer, desc: '可用PLA材质打印，定制主人专属色调与音响声学腔体结构。' },
  { id: 'esp32', name: 'ESP32-S3 双核主控板', type: 'Core', icon: Cpu, desc: '华强北核心板，支持 Wi-Fi 与蓝牙，负责音频采集与模型分发。' },
  { id: 'battery', name: '18650 锂电池及充放电一体模块', type: 'Power', icon: Battery, desc: '提供 5000mAh 电力驱动，保证书童 24 小时离线待机。' },
  { id: 'speaker', name: '2.0 磁腔体高保真小喇叭 (3W)', type: 'Audio Out', icon: Volume2, desc: '输出伴生书童的温和音色或傲娇小情绪脾气声音。' },
  { id: 'mic', name: 'I2S 硅麦克风采集模块', type: 'Audio In', icon: Mic, desc: '高感度硅麦，用于小主人的小秘密倾诉与日常打破砂锅追问。' },
];

const STEPS = [
  { title: 'Step 1: 3D 打印主体外壳', detail: '选用可再生PLA线材，导入 Space_Ranger_V1.stl 文件进行3D层积打印，打印时间约 4.5 小时。' },
  { title: 'Step 2: 焊接主控与音频通路', detail: '将 I2S 麦克风与 3W 功放喇叭连接至 ESP32-S3 开发板，引出 3.3V 与 GND 线束，确保通路无短路。' },
  { title: 'Step 3: 封装电池与电源管理', detail: '接入 18650 锂电与充放电主控板，外接 USB-C 充电插座，完成腔体内散热片与绝缘胶布隔离。' },
  { title: 'Step 4: 刷写固件与离线大模型', detail: '通过 ESP-IDF 烧写语音流网关固件，配置 Wi-Fi 密钥，使本地主控能快速路由并握手国内大模型接口。' },
];

const RobotAssembly = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [checkedParts, setCheckedParts] = useState({});
  const [diagnostics, setDiagnostics] = useState(null); // null, 'testing', 'success', 'error'

  const togglePart = (id) => {
    setCheckedParts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const runDiagnosticTest = () => {
    setDiagnostics('testing');
    setTimeout(() => {
      // If ESP32 is checked, pass. Otherwise fail.
      if (checkedParts['esp32'] && checkedParts['mic'] && checkedParts['speaker']) {
        setDiagnostics('success');
      } else {
        setDiagnostics('error');
      }
    }, 1500);
  };

  return (
    <div className="w-full h-full max-w-7xl px-4 overflow-y-auto custom-scrollbar pb-10">
      
      {/* Top Banner */}
      <div className="glass-panel p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-white/90">
            <Cpu className="w-6 h-6 text-purple-400" />
            物理伴生机器人装配室 (Hardware Assembly Lab)
          </h2>
          <p className="text-xs text-white/40 mt-1">
            自己动手 3D 打印定制外壳，加载华强北小原器件，打造你一生的硬件数字生命。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Inventory Column */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="glass-panel p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <Settings className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm uppercase font-bold tracking-widest text-white/80">核心原配件核对清单</h3>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-[10px] text-white/40 uppercase tracking-widest">请勾选已备齐的硬件（华强北可淘）：</span>
              {COMPONENTS.map(comp => (
                <div 
                  key={comp.id}
                  onClick={() => togglePart(comp.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex gap-3.5 items-start ${checkedParts[comp.id] ? 'bg-purple-600/10 border-purple-500 text-white' : 'bg-white/5 border-transparent text-white/60 hover:bg-white/10'}`}
                >
                  <div className={`p-2 rounded-lg ${checkedParts[comp.id] ? 'bg-purple-500/20 text-purple-300' : 'bg-white/5 text-white/40'}`}>
                    <comp.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      {comp.name}
                      {checkedParts[comp.id] && <span className="text-[9px] bg-green-500 text-black px-1.5 py-0.2 rounded font-black">已备妥</span>}
                    </div>
                    <p className="text-[10px] text-white/50 leading-relaxed mt-1">{comp.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Assembly Blueprint & Diagnostic Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Assembly Step by step */}
          <div className="glass-panel p-6 flex flex-col gap-4">
            <div className="text-sm font-bold text-white/80 border-b border-white/10 pb-3 flex justify-between items-center">
              <span>装配顺序与工艺指导书 (Blueprint Instructions)</span>
              <span className="text-purple-300 font-mono text-xs">进度 {activeStep + 1} / 4</span>
            </div>

            <div className="flex flex-col gap-4 bg-black/40 p-5 rounded-2xl border border-white/5">
              <h3 className="text-base font-bold text-purple-300">
                {STEPS[activeStep].title}
              </h3>
              <p className="text-xs text-white/70 leading-relaxed">
                {STEPS[activeStep].detail}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                disabled={activeStep === 0}
                className="glass-button flex-1 py-2 text-xs disabled:opacity-40"
              >
                上一步
              </button>
              <button
                onClick={() => setActiveStep(prev => Math.min(3, prev + 1))}
                disabled={activeStep === 3}
                className="glass-button flex-1 py-2 text-xs disabled:opacity-40"
              >
                下一步
              </button>
            </div>
          </div>

          {/* Diagnostic simulator */}
          <div className="glass-panel p-6 flex flex-col gap-4">
            <div className="text-sm font-bold text-white/80 border-b border-white/10 pb-3 flex justify-between items-center">
              <span>智能手办主板通道诊断器 (Hardware Diagnostic Terminal)</span>
              <button
                onClick={runDiagnosticTest}
                disabled={diagnostics === 'testing'}
                className="glass-button px-4 py-1.5 text-xs text-purple-400 hover:text-white flex items-center gap-1.5"
              >
                <Play className="w-3 h-3" />
                运行硬件探针测试
              </button>
            </div>

            <div className="min-h-[100px] bg-black/75 rounded-2xl border border-white/5 p-4 font-mono text-[10px] text-green-400 flex flex-col gap-1 select-all">
              <div>[SYSTEM] Initiating Antigravity companion diagnostics sequence...</div>
              <div>[INFO] Device profile: Qwythos-ESP32-S3</div>
              
              {diagnostics === 'testing' && (
                <div className="text-yellow-400 animate-pulse mt-2">
                  [DIAG] Ping controller Wi-Fi node... [CONNECTING]
                  <br />[DIAG] Triggering I2S DAC loopback... [CALIBRATING]
                </div>
              )}

              {diagnostics === 'success' && (
                <div className="text-green-400 mt-2">
                  [OK] Wi-Fi connection established. Signal: -45dBm.
                  <br />[OK] Microphone I2S clock verified. Decibels reading: 22dB.
                  <br />[OK] Speaker DAC wave generated successfully (44.1kHz).
                  <br />[SUCCESS] 伴生机器人通路全部畅通！你已将魂魄结晶绑定到这个硅基身体中！
                  <div className="flex items-center gap-1.5 mt-2 bg-green-500/10 border border-green-500/20 p-2 rounded text-green-300">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span><b>硬件绑定成功</b>：小主人！伴生机器人已能通过局域网读取你的终身知识库！</span>
                  </div>
                </div>
              )}

              {diagnostics === 'error' && (
                <div className="text-red-400 mt-2">
                  [ERROR] Wi-Fi controller connection timeout.
                  <br />[ERROR] Mic / Speaker core channels not prepared!
                  <br />[FAIL] 诊断失败。原因：必须在左侧备件核对清单中，至少勾选并备齐 “ESP32 开发板”、“麦克风”与“扬声器小喇叭”，才能建立基本音频主板。
                  <div className="flex items-center gap-1.5 mt-2 bg-red-500/10 border border-red-500/20 p-2 rounded text-red-300">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>诊断异常：请在左侧清单中完成零件装配，然后再试。</span>
                  </div>
                </div>
              )}

              {!diagnostics && (
                <div className="text-white/40 mt-2">
                  [IDLE] Waiting for diagnostic trigger...
                </div>
              )}

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default RobotAssembly;
