import { useEffect, useState } from 'react';
import { Navigation } from './components/Navigation';
import { JobSwiper } from './components/JobSwiper';
import { ApplicationTracker } from './components/ApplicationTracker';
import { GhostMode } from './components/GhostMode';
import { SalaryValuation } from './components/SalaryValuation';
import { AuthScreen, AuthUser } from './components/AuthScreen';
import { mockJobs, currentUser, Application } from './data/mockData';
import { toast } from 'sonner';
import { Toaster } from 'sonner';

const SESSION_KEY = 'topcv_demo_session';

export default function App() {
  const [activeTab, setActiveTab] = useState<'swipe' | 'tracking' | 'ghost' | 'valuation'>('swipe');
  const [applications, setApplications] = useState<Application[]>([]);
  const [ghostMode, setGhostMode] = useState(currentUser.ghostMode);
  const [blockedCompanies] = useState(currentUser.blockedCompanies);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) setAuthUser(JSON.parse(raw) as AuthUser);
    } catch {
      // ignore
    }
    setAuthLoaded(true);
  }, []);

  const handleAuth = (user: AuthUser) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    setAuthUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setAuthUser(null);
    setApplications([]);
    setActiveTab('swipe');
    toast('Đã đăng xuất');
  };

  const handleApply = (job: typeof mockJobs[0]) => {
    const newApplication: Application = {
      id: `app-${Date.now()}`,
      job,
      status: 'sent',
      appliedAt: new Date(),
      updatedAt: new Date()
    };

    setApplications([newApplication, ...applications]);
    toast.success(`Đã ứng tuyển ${job.title} tại ${job.company}!`);

    setTimeout(() => {
      setApplications(prev =>
        prev.map(app =>
          app.id === newApplication.id
            ? { ...app, status: 'viewed', viewedAt: new Date(), updatedAt: new Date() }
            : app
        )
      );
      toast.info(`HR của ${job.company} vừa xem CV của bạn!`, {
        icon: '👀'
      });
    }, 5000);
  };

  const handleSkip = (job: typeof mockJobs[0]) => {
    toast(`Đã bỏ qua ${job.title}`);
  };

  const handleGhostModeToggle = (enabled: boolean) => {
    setGhostMode(enabled);
    if (enabled) {
      toast.success('Ghost Mode đã bật - Bạn đã tàng hình khỏi công ty hiện tại!', {
        icon: '👻'
      });
    } else {
      toast('Ghost Mode đã tắt - Hồ sơ đang ở chế độ công khai');
    }
  };

  if (!authLoaded) {
    return <div className="min-h-screen bg-gray-50" />;
  }

  if (!authUser) {
    return (
      <>
        <Toaster position="top-center" richColors />
        <AuthScreen onAuth={handleAuth} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position="top-center" richColors />

      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        ghostMode={ghostMode}
        applicationCount={applications.length}
        userName={authUser.name}
        userEmail={authUser.email}
        onLogout={handleLogout}
      />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'swipe' && (
          <div className="flex justify-center">
            <JobSwiper
              jobs={mockJobs}
              onApply={handleApply}
              onSkip={handleSkip}
            />
          </div>
        )}

        {activeTab === 'tracking' && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Theo dõi đơn ứng tuyển
            </h2>
            <ApplicationTracker applications={applications} />
          </div>
        )}

        {activeTab === 'ghost' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Chế độ bảo mật
            </h2>
            <GhostMode
              enabled={ghostMode}
              onToggle={handleGhostModeToggle}
              blockedCompanies={blockedCompanies}
            />
            <div className="mt-6 bg-white rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Tại sao cần Ghost Mode?</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 text-lg">✓</span>
                  <span>Tránh bị sếp/HR công ty hiện tại phát hiện bạn đang tìm việc</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 text-lg">✓</span>
                  <span>AI tự động chặn hồ sơ khỏi các công ty liên kết</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 text-lg">✓</span>
                  <span>Tìm việc an toàn, không lo bị đánh dấu "không trung thành"</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'valuation' && (
          <div className="max-w-2xl mx-auto">
            <SalaryValuation
              currentSalary={currentUser.currentSalary}
              marketSalaryMin={45000000}
              marketSalaryMax={75000000}
              matchPercentage={92}
              missingSkills={['Stakeholder Management', 'OKR Framework', 'Advanced SQL']}
            />
          </div>
        )}
      </main>
    </div>
  );
}
