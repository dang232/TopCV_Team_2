import { Heart, BarChart3, Ghost, TrendingUp, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

interface NavigationProps {
  activeTab: 'swipe' | 'tracking' | 'ghost' | 'valuation';
  onTabChange: (tab: 'swipe' | 'tracking' | 'ghost' | 'valuation') => void;
  ghostMode?: boolean;
  applicationCount?: number;
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
}

function getInitials(name?: string) {
  if (!name) return 'NVA';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Navigation({
  activeTab,
  onTabChange,
  ghostMode,
  applicationCount,
  userName,
  userEmail,
  onLogout,
}: NavigationProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const tabs = [
    { id: 'swipe' as const, label: 'Tìm việc', icon: Heart },
    { id: 'tracking' as const, label: 'Theo dõi', icon: BarChart3, badge: applicationCount && applicationCount > 0 ? applicationCount : undefined },
    { id: 'ghost' as const, label: 'Ghost Mode', icon: Ghost, dot: ghostMode },
    { id: 'valuation' as const, label: 'Định giá AI', icon: TrendingUp }
  ];

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-sm font-black text-white">T</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-gray-900 leading-none">TopCV</span>
                  <span className="px-1.5 py-0.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded text-[10px] font-bold leading-none">AI</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-none mt-0.5">Smart Job Search</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {ghostMode && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 rounded-full"
                >
                  <Ghost className="w-3 h-3 text-emerald-400" />
                  <span className="text-[11px] font-semibold text-emerald-400">Tàng hình</span>
                </motion.div>
              )}

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm hover:shadow-md transition-shadow"
                  aria-label="Tài khoản"
                >
                  {getInitials(userName)}
                </button>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 mt-2 w-60 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">{userName ?? 'Người dùng'}</p>
                      {userEmail && (
                        <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onLogout?.();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Tab Bar */}
        <div className="hidden md:block border-t border-gray-50">
          <div className="max-w-2xl mx-auto px-4">
            <div className="flex gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                      isActive ? 'text-emerald-700' : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {'badge' in tab && tab.badge !== undefined && (
                      <span className="w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                        {tab.badge}
                      </span>
                    )}
                    {'dot' in tab && tab.dot && (
                      <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="desktop-tab-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="flex-1 flex flex-col items-center justify-center py-2 relative"
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-tab-bg"
                    className="absolute inset-x-2 inset-y-1 bg-emerald-50 rounded-xl"
                  />
                )}
                <div className="relative flex flex-col items-center gap-0.5">
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                  {'badge' in tab && tab.badge !== undefined && (
                    <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                      {tab.badge}
                    </span>
                  )}
                  {'dot' in tab && tab.dot && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                  )}
                  <span className={`text-[10px] font-semibold transition-colors ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {tab.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
