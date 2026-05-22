import { useEffect, useState } from 'react';
import { Navigation } from './components/Navigation';
import { JobSwiper } from './components/JobSwiper';
import { ApplicationTracker } from './components/ApplicationTracker';
import { GhostMode } from './components/GhostMode';
import { SalaryValuation } from './components/SalaryValuation';
import { AuthScreen, AuthUser } from './components/AuthScreen';
import { ProfileVisibility } from './components/ProfileVisibility';
import { Application, Job } from './data/mockData';
import {
  jobsApi,
  applicationsApi,
  profilesApi,
  favoritesApi,
  ApiApplication,
  ApiProfile,
} from './lib/api';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from 'sonner';

const SESSION_KEY = 'topcv_demo_session';

const DEFAULT_PROFILE: Omit<ApiProfile, 'userId'> = {
  ghostMode: false,
  seeking: true,
  discoverable: true,
  blockedCompanies: ['FPT Software'],
  currentSalary: 35000000,
  cvName: 'CV_Frontend_2026.pdf',
  cvUpdatedAt: '15/05/2026',
};

function toApplication(api: ApiApplication): Application {
  return {
    id: api.id,
    job: api.job,
    status: api.status,
    appliedAt: new Date(api.appliedAt),
    viewedAt: api.viewedAt ? new Date(api.viewedAt) : undefined,
    updatedAt: new Date(api.updatedAt),
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'swipe' | 'tracking' | 'ghost' | 'valuation'>('swipe');
  const [applications, setApplications] = useState<Application[]>([]);
  const [profile, setProfile] = useState<ApiProfile | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) setAuthUser(JSON.parse(raw) as AuthUser);
    } catch {
      // ignore
    }
    setAuthLoaded(true);
  }, []);

  useEffect(() => {
    if (!authUser) return;
    let cancelled = false;
    setDataLoading(true);
    setDataError(null);

    (async () => {
      try {
        const [jobList, appList, existingProfile] = await Promise.all([
          jobsApi.list(),
          applicationsApi.listByUser(authUser.id),
          profilesApi.getByUser(authUser.id),
        ]);
        if (cancelled) return;
        setJobs(jobList);
        setApplications(appList.map(toApplication));
        if (existingProfile) {
          setProfile(existingProfile);
        } else {
          const created = await profilesApi.create({
            ...DEFAULT_PROFILE,
            userId: authUser.id,
          });
          if (!cancelled) setProfile(created);
        }
      } catch {
        if (!cancelled) {
          setDataError('Không kết nối được tới máy chủ. Đảm bảo json-server đang chạy.');
        }
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authUser]);

  const handleAuth = (user: AuthUser) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    setAuthUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setAuthUser(null);
    setApplications([]);
    setProfile(null);
    setJobs([]);
    setActiveTab('swipe');
    toast('Đã đăng xuất');
  };

  const updateProfile = async (partial: Partial<ApiProfile>) => {
    if (!profile?.id) return;
    setProfile({ ...profile, ...partial });
    try {
      const updated = await profilesApi.patch(profile.id, partial);
      setProfile(updated);
    } catch {
      toast.error('Không lưu được thay đổi, thử lại.');
    }
  };

  const handleApply = async (job: Job) => {
    if (!authUser) return;
    const now = new Date().toISOString();
    try {
      const created = await applicationsApi.create({
        userId: authUser.id,
        job,
        status: 'sent',
        appliedAt: now,
        updatedAt: now,
      });
      setApplications((prev) => [toApplication(created), ...prev]);
      toast.success(`Đã ứng tuyển ${job.title} tại ${job.company}!`);

      setTimeout(async () => {
        const viewedAt = new Date().toISOString();
        try {
          const patched = await applicationsApi.patch(created.id, {
            status: 'viewed',
            viewedAt,
            updatedAt: viewedAt,
          });
          setApplications((prev) =>
            prev.map((a) => (a.id === patched.id ? toApplication(patched) : a))
          );
          toast.info(`HR của ${job.company} vừa xem CV của bạn!`, { icon: '👀' });
        } catch {
          // silent — auto-update is non-critical
        }
      }, 5000);
    } catch {
      toast.error('Gửi ứng tuyển thất bại, thử lại.');
    }
  };

  const handleSkip = (job: Job) => {
    toast(`Đã bỏ qua ${job.title}`);
  };

  const handleFavorite = async (job: Job) => {
    if (!authUser) return;
    try {
      await favoritesApi.add({ userId: authUser.id, jobId: job.id });
    } catch {
      toast.error('Không lưu được vào yêu thích, thử lại.');
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
        ghostMode={profile?.ghostMode ?? false}
        applicationCount={applications.length}
        userName={authUser.name}
        userEmail={authUser.email}
        onLogout={handleLogout}
      />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {dataLoading ? (
          <div className="flex flex-col items-center gap-3 py-20 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            <span className="text-sm">Đang tải dữ liệu...</span>
          </div>
        ) : dataError ? (
          <div className="max-w-sm mx-auto text-center py-16 px-6">
            <p className="text-sm text-red-600 mb-2">{dataError}</p>
            <p className="text-xs text-gray-500">
              Chạy <code className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">pnpm dev</code> để khởi động cả frontend và json-server.
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'swipe' && (
              <div className="flex justify-center">
                <JobSwiper
                  jobs={jobs}
                  onApply={handleApply}
                  onSkip={handleSkip}
                  onFavorite={handleFavorite}
                  cvName={profile?.cvName}
                  cvUpdatedAt={profile?.cvUpdatedAt}
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

            {activeTab === 'ghost' && profile && (
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Chế độ bảo mật
                </h2>
                <ProfileVisibility
                  seeking={profile.seeking}
                  onSeekingChange={(v) => {
                    updateProfile({ seeking: v });
                    toast(v ? 'Đã bật trạng thái tìm việc' : 'Đã tắt trạng thái tìm việc');
                  }}
                  discoverable={profile.discoverable}
                  onDiscoverableChange={(v) => {
                    updateProfile({ discoverable: v });
                    toast.success(
                      v
                        ? 'HR đã có thể tìm thấy hồ sơ của bạn'
                        : 'Đã ẩn hồ sơ khỏi tìm kiếm của HR'
                    );
                  }}
                  connectCount={12}
                  cvName={profile.cvName}
                />
                <div className="mt-6">
                  <GhostMode
                    enabled={profile.ghostMode}
                    onToggle={(v) => {
                      updateProfile({ ghostMode: v });
                      if (v) {
                        toast.success('Ghost Mode đã bật - Bạn đã tàng hình khỏi công ty hiện tại!', {
                          icon: '👻',
                        });
                      } else {
                        toast('Ghost Mode đã tắt - Hồ sơ đang ở chế độ công khai');
                      }
                    }}
                    blockedCompanies={profile.blockedCompanies}
                  />
                </div>
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

            {activeTab === 'valuation' && profile && (
              <div className="max-w-2xl mx-auto">
                <SalaryValuation
                  currentSalary={profile.currentSalary}
                  marketSalaryMin={45000000}
                  marketSalaryMax={75000000}
                  matchPercentage={92}
                  missingSkills={['Stakeholder Management', 'OKR Framework', 'Advanced SQL']}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
