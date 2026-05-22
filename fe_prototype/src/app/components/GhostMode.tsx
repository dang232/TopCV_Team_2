import { useState } from 'react';
import { Shield, AlertCircle, Lock, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GhostModeProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  blockedCompanies: string[];
}

export function GhostMode({ enabled, onToggle, blockedCompanies }: GhostModeProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="space-y-4">
      {/* Main Toggle Card */}
      <div className={`relative rounded-3xl overflow-hidden transition-all duration-500 ${enabled ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gradient-to-br from-slate-800 to-slate-700'}`}>
        {/* Animated background particles when enabled */}
        {enabled && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-emerald-400/40"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 0.6, 0],
                  scale: [0, 1, 0],
                  x: [0, (i % 2 === 0 ? 1 : -1) * (20 + i * 15)],
                  y: [0, -(30 + i * 10)]
                }}
                transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                style={{ left: `${15 + i * 14}%`, bottom: '30%' }}
              />
            ))}
          </div>
        )}

        <div className="relative p-6">
          {/* Header row */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: enabled ? [0, -10, 10, -5, 5, 0] : 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${enabled ? 'bg-emerald-500/20' : 'bg-slate-600/50'}`}
              >
                👻
              </motion.div>
              <div>
                <h3 className="font-bold text-white">Ghost Mode</h3>
                <p className="text-xs text-slate-400">Chế độ tàng hình</p>
              </div>
            </div>

            {/* Custom Toggle */}
            <button
              onClick={() => onToggle(!enabled)}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none ${enabled ? 'bg-emerald-500' : 'bg-slate-600'}`}
            >
              <motion.div
                animate={{ x: enabled ? 28 : 4 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md"
              />
            </button>
          </div>

          {/* Status pill */}
          <motion.div
            animate={{ opacity: 1 }}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl mb-4 ${
              enabled ? 'bg-emerald-500/15 border border-emerald-500/25' : 'bg-slate-700/40 border border-slate-600/30'
            }`}
          >
            <div className={`relative flex-shrink-0 ${enabled ? 'block' : 'hidden'}`}>
              <div className="w-2 h-2 bg-emerald-400 rounded-full" />
              <div className="absolute inset-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            </div>
            {!enabled && <Eye className="w-4 h-4 text-slate-400" />}
            <span className={`text-sm font-medium ${enabled ? 'text-emerald-300' : 'text-slate-400'}`}>
              {enabled ? 'Đang ẩn khỏi công ty hiện tại' : 'Hồ sơ đang ở chế độ công khai'}
            </span>
          </motion.div>

          {/* Stats row */}
          {enabled && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-3 gap-2 mb-4"
            >
              {[
                { value: blockedCompanies.length + 3, label: 'Công ty bị chặn', icon: '🛡️' },
                { value: '100%', label: 'Bảo mật', icon: '🔒' },
                { value: 'AI', label: 'Tự động quét', icon: '🤖' },
              ].map(stat => (
                <div key={stat.label} className="bg-slate-700/50 rounded-xl p-2.5 text-center">
                  <div className="text-base mb-0.5">{stat.icon}</div>
                  <div className="font-bold text-white text-sm leading-none mb-0.5">{stat.value}</div>
                  <div className="text-[10px] text-slate-400 leading-tight">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Details toggle */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5" />
            {showDetails ? 'Ẩn chi tiết bảo vệ' : 'Xem chi tiết bảo vệ'}
          </button>

          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-3">
                  <div className="flex items-start gap-2 text-sm text-slate-300">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
                    <p>Khi bật Ghost Mode, hồ sơ của bạn sẽ tự động bị chặn khỏi:</p>
                  </div>
                  <ul className="space-y-2 pl-4">
                    {blockedCompanies.map((company) => (
                      <li key={company} className="flex items-center gap-2.5 text-sm text-slate-300">
                        <div className="w-6 h-6 rounded-lg bg-slate-600 flex items-center justify-center flex-shrink-0">
                          <Lock className="w-3 h-3 text-emerald-400" />
                        </div>
                        {company}
                      </li>
                    ))}
                    <li className="flex items-center gap-2.5 text-sm text-slate-500">
                      <div className="w-6 h-6 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px]">+</span>
                      </div>
                      Các công ty liên kết (AI tự phát hiện)
                    </li>
                  </ul>
                  <div className="bg-slate-700/50 rounded-xl p-3 text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">🤖 AI đã quét LinkedIn</span> của bạn và tự động chặn HR/Recruiter từ công ty hiện tại cùng các công ty con/liên kết.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Why Ghost Mode card */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span>💡</span> Tại sao cần Ghost Mode?
        </h4>
        <ul className="space-y-2.5">
          {[
            'Tránh bị sếp/HR công ty hiện tại phát hiện bạn đang tìm việc',
            'AI tự động chặn hồ sơ khỏi các công ty liên kết',
            'Tìm việc an toàn, không lo bị đánh dấu "không trung thành"',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
              <span className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
