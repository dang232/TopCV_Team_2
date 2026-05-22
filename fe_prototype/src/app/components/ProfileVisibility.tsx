import { motion } from 'motion/react';
import { Search, FileText, Sparkles, UserCheck } from 'lucide-react';

interface ProfileVisibilityProps {
  seeking: boolean;
  onSeekingChange: (v: boolean) => void;
  discoverable: boolean;
  onDiscoverableChange: (v: boolean) => void;
  connectCount: number;
  cvName?: string;
}

export function ProfileVisibility({
  seeking,
  onSeekingChange,
  discoverable,
  onDiscoverableChange,
  connectCount,
  cvName = 'CV_Frontend_2026.pdf',
}: ProfileVisibilityProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <h3 className="font-bold text-gray-900">Trạng thái tìm việc</h3>
        </div>
        <Toggle checked={seeking} onChange={onSeekingChange} colorOn="bg-emerald-500" />
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Bật để xuất hiện trong kết quả tìm kiếm của Nhà tuyển dụng. Trạng thái sẽ tự
        động tắt sau <span className="font-semibold text-emerald-600">14 ngày</span>.
      </p>

      <div className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border ${seeking ? 'border-emerald-100 bg-emerald-50/40' : 'border-gray-100 bg-gray-50'}`}>
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-gray-500 shrink-0" />
          <span className="text-sm text-gray-700 truncate">{cvName}</span>
        </div>
        <button className="text-xs font-semibold text-gray-700 px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50">
          Thay đổi
        </button>
      </div>

      <div className="my-5 h-px bg-gray-100" />

      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Search className="w-4 h-4 text-violet-500" />
            <h4 className="font-bold text-gray-900">Cho phép NTD tìm kiếm hồ sơ</h4>
          </div>
          <p className="text-sm text-gray-500">
            Hồ sơ của bạn sẽ hiển thị cho HR đã xác minh khi họ tìm ứng viên phù hợp.
          </p>
        </div>
        <Toggle checked={discoverable} onChange={onDiscoverableChange} colorOn="bg-violet-500" />
      </div>

      <motion.div
        layout
        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
          <UserCheck className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">
            {discoverable
              ? `${connectCount} HR muốn kết nối với bạn`
              : 'Hồ sơ đang ẩn khỏi tìm kiếm'}
          </p>
          <p className="text-xs text-gray-500">
            {discoverable
              ? 'Bật thông báo để không bỏ lỡ cơ hội phù hợp'
              : 'Bật công tắc bên trên để HR có thể chủ động liên hệ'}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  colorOn,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  colorOn: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
        checked ? colorOn : 'bg-gray-300'
      }`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 700, damping: 30 }}
        className={`inline-block h-5 w-5 rounded-full bg-white shadow ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}
