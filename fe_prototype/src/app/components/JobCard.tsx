import { motion, useMotionValue, useTransform, PanInfo } from 'motion/react';
import { MapPin, TrendingUp, Briefcase, CheckCircle2 } from 'lucide-react';
import { Job } from '../data/mockData';

interface JobCardProps {
  job: Job;
  onSwipe: (direction: 'left' | 'right') => void;
  style?: React.CSSProperties;
  isBackground?: boolean;
}

const TAG_STYLES: Record<string, string> = {
  'Remote': 'bg-sky-100 text-sky-700 border border-sky-200',
  'Hybrid': 'bg-violet-100 text-violet-700 border border-violet-200',
  'Tech': 'bg-indigo-100 text-indigo-700 border border-indigo-200',
  'Fintech': 'bg-blue-100 text-blue-700 border border-blue-200',
  'Data': 'bg-cyan-100 text-cyan-700 border border-cyan-200',
  'E-commerce': 'bg-orange-100 text-orange-700 border border-orange-200',
  'Insurance': 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  'RSU': 'bg-amber-100 text-amber-700 border border-amber-200',
  'Stock Options': 'bg-amber-100 text-amber-700 border border-amber-200',
  '13th month': 'bg-green-100 text-green-700 border border-green-200',
  'Premium Health': 'bg-rose-100 text-rose-700 border border-rose-200',
};
const DEFAULT_TAG = 'bg-gray-100 text-gray-600 border border-gray-200';

export function JobCard({ job, onSwipe, style, isBackground }: JobCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-16, 16]);
  const opacity = useTransform(x, [-200, -80, 0, 80, 200], [0, 1, 1, 1, 0]);
  const applyOpacity = useTransform(x, [20, 100], [0, 1]);
  const skipOpacity = useTransform(x, [-100, -20], [1, 0]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 100) onSwipe('right');
    else if (info.offset.x < -100) onSwipe('left');
  };

  if (isBackground) {
    return <div className="absolute inset-0 bg-white rounded-3xl border border-gray-100 shadow-md" style={style} />;
  }

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.65}
      onDragEnd={handleDragEnd}
      style={{ x, rotate, opacity, ...style }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
    >
      <div className="relative w-full h-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col">
        {/* Apply overlay */}
        <motion.div style={{ opacity: applyOpacity }} className="absolute inset-0 bg-emerald-500/10 z-10 rounded-3xl pointer-events-none" />
        <motion.div style={{ opacity: applyOpacity }} className="absolute top-5 right-4 z-20 bg-emerald-500 text-white px-4 py-2 rounded-2xl font-bold rotate-12 shadow-lg pointer-events-none text-sm">
          ỨNG TUYỂN ✓
        </motion.div>

        {/* Skip overlay */}
        <motion.div style={{ opacity: skipOpacity }} className="absolute inset-0 bg-red-500/10 z-10 rounded-3xl pointer-events-none" />
        <motion.div style={{ opacity: skipOpacity }} className="absolute top-5 left-4 z-20 bg-red-500 text-white px-4 py-2 rounded-2xl font-bold -rotate-12 shadow-lg pointer-events-none text-sm">
          BỎ QUA ✗
        </motion.div>

        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-start gap-3 flex-shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
            {job.logo}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide leading-none mb-1">{job.company}</p>
                <h2 className="font-bold text-gray-900 leading-snug">{job.title}</h2>
              </div>
              <div className="flex-shrink-0 flex items-center gap-1 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span className="text-[11px] font-bold text-emerald-700">92%</span>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-1.5">
              <MapPin className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">{job.location}</span>
            </div>
          </div>
        </div>

        {/* Salary */}
        <div className="mx-5 mb-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 flex-shrink-0">
          <div className="flex items-center gap-1.5 mb-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-100" />
            <span className="text-[11px] font-bold text-emerald-100 uppercase tracking-wide">Mức lương</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="font-black text-white text-lg leading-none">{job.salaryGross}</div>
              <div className="text-emerald-100 text-xs mt-1">Gross · Net: <span className="font-semibold text-white">{job.salaryNet}</span></div>
            </div>
            <div className="text-2xl opacity-80">💰</div>
          </div>
        </div>

        {/* Tags */}
        <div className="px-5 mb-3 flex flex-wrap gap-1.5 flex-shrink-0">
          {job.tags.map((tag) => (
            <span key={tag} className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${TAG_STYLES[tag] ?? DEFAULT_TAG}`}>
              {tag}
            </span>
          ))}
        </div>

        <div className="mx-5 h-px bg-gray-100 flex-shrink-0" />

        {/* Body */}
        <div className="px-5 py-3 flex-1 overflow-y-auto min-h-0">
          <p className="text-sm text-gray-600 mb-3 leading-relaxed">{job.description}</p>
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Briefcase className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Yêu cầu</span>
            </div>
            <ul className="space-y-1.5">
              {job.requirements.map((req, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 flex-shrink-0" />
                  {req}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Swipe hint bar */}
        <div className="px-5 pb-4 pt-2 flex-shrink-0 flex items-center justify-between border-t border-gray-50">
          <span className="text-[11px] text-gray-300 font-medium">← Bỏ qua</span>
          <div className="flex gap-1">
            {[0, 1, 2].map(i => <span key={i} className="w-1 h-1 bg-gray-200 rounded-full" />)}
          </div>
          <span className="text-[11px] text-gray-300 font-medium">Ứng tuyển →</span>
        </div>
      </div>
    </motion.div>
  );
}
