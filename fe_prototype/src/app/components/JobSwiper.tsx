import { useState } from 'react';
import { JobCard } from './JobCard';
import { Job } from '../data/mockData';
import { X, Heart, Star, CheckCircle2, FileText, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface JobSwiperProps {
  jobs: Job[];
  onApply: (job: Job) => void;
  onSkip: (job: Job) => void;
  onFavorite?: (job: Job) => void;
  cvName?: string;
  cvUpdatedAt?: string;
}

export function JobSwiper({
  jobs,
  onApply,
  onSkip,
  onFavorite,
  cvName = 'CV_Frontend_2026.pdf',
  cvUpdatedAt = '15/05/2026',
}: JobSwiperProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipedJobs, setSwipedJobs] = useState<{ job: Job; direction: 'left' | 'right' | 'fav' }[]>([]);
  const [likedCount, setLikedCount] = useState(0);
  const [passedCount, setPassedCount] = useState(0);
  const [favCount, setFavCount] = useState(0);
  const [confirmJob, setConfirmJob] = useState<Job | null>(null);
  const [successJob, setSuccessJob] = useState<Job | null>(null);

  const handleSwipe = (direction: 'left' | 'right') => {
    const currentJob = jobs[currentIndex];
    if (!currentJob) return;
    if (direction === 'right') {
      setConfirmJob(currentJob);
      return;
    }
    setSwipedJobs([...swipedJobs, { job: currentJob, direction }]);
    onSkip(currentJob);
    setPassedCount((c) => c + 1);
    setCurrentIndex(currentIndex + 1);
  };

  const handleFavorite = () => {
    const currentJob = jobs[currentIndex];
    if (!currentJob) return;
    setSwipedJobs([...swipedJobs, { job: currentJob, direction: 'fav' }]);
    setFavCount((c) => c + 1);
    onFavorite?.(currentJob);
    toast.success(`Đã thêm ${currentJob.title} vào danh sách yêu thích`, { icon: '⭐' });
    setCurrentIndex(currentIndex + 1);
  };

  const confirmApply = () => {
    if (!confirmJob) return;
    setSwipedJobs([...swipedJobs, { job: confirmJob, direction: 'right' }]);
    onApply(confirmJob);
    setLikedCount((c) => c + 1);
    setCurrentIndex(currentIndex + 1);
    setSuccessJob(confirmJob);
    setConfirmJob(null);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSwipedJobs([]);
    setLikedCount(0);
    setPassedCount(0);
    setFavCount(0);
  };

  const currentJob = jobs[currentIndex];
  const nextJob = jobs[currentIndex + 1];
  const nextNextJob = jobs[currentIndex + 2];

  const renderDialogs = () => (
    <>
      {/* CV review / confirm proposal */}
      <Dialog open={!!confirmJob} onOpenChange={(o) => !o && setConfirmJob(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận ứng tuyển</DialogTitle>
            <DialogDescription>
              Kiểm tra lại CV trước khi gửi tới nhà tuyển dụng.
            </DialogDescription>
          </DialogHeader>

          {confirmJob && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-xl">
                  {confirmJob.logo}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide truncate">
                    {confirmJob.company}
                  </p>
                  <p className="font-bold text-gray-900 leading-tight truncate">
                    {confirmJob.title}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                    CV gửi kèm
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-14 rounded-md bg-white border border-emerald-200 flex items-center justify-center shadow-sm">
                    <FileText className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{cvName}</p>
                    <p className="text-xs text-gray-500">Cập nhật: {cvUpdatedAt}</p>
                  </div>
                  <button className="text-xs font-semibold text-emerald-700 px-3 py-1.5 rounded-lg bg-white border border-emerald-200 hover:bg-emerald-50">
                    Đổi CV
                  </button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmJob(null)}>
              Huỷ
            </Button>
            <Button
              onClick={confirmApply}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
            >
              Gửi ứng tuyển
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success popup */}
      <Dialog open={!!successJob} onOpenChange={(o) => !o && setSuccessJob(null)}>
        <DialogContent className="text-center">
          <DialogHeader>
            <div className="mx-auto mb-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center"
              >
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </motion.div>
            </div>
            <DialogTitle className="text-center">Ứng tuyển thành công!</DialogTitle>
            <DialogDescription className="text-center">
              {successJob && (
                <>
                  Đã gửi CV tới{' '}
                  <span className="font-semibold text-gray-800">{successJob.company}</span> cho vị
                  trí <span className="font-semibold text-gray-800">{successJob.title}</span>.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={() => setSuccessJob(null)}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white w-full sm:w-auto"
            >
              Tiếp tục tìm việc
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );

  if (!currentJob) {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="text-6xl mb-4"
          >
            🎉
          </motion.div>
          <h2 className="font-bold text-gray-800 mb-2">Hết việc rồi!</h2>
          <p className="text-gray-500 mb-2 text-sm">Bạn đã xem hết {jobs.length} công việc phù hợp</p>
          <div className="flex items-center gap-4 mb-6 text-sm">
            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <Heart className="w-4 h-4" fill="currentColor" /> {likedCount} ứng tuyển
            </span>
            <span className="flex items-center gap-1.5 text-gray-400 font-semibold">
              <X className="w-4 h-4" /> {passedCount} bỏ qua
            </span>
          </div>
          <button
            onClick={handleRestart}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-semibold shadow-md hover:shadow-lg transition-shadow text-sm"
          >
            Bắt đầu lại
          </button>
        </div>
        {renderDialogs()}
      </>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      {/* Stats row */}
      <div className="flex items-center gap-5 mb-4 text-sm">
        <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
          <Heart className="w-3.5 h-3.5" fill="currentColor" /> {likedCount}
        </span>
        <span className="flex items-center gap-1.5 text-amber-500 font-semibold">
          <Star className="w-3.5 h-3.5" fill="currentColor" /> {favCount}
        </span>
        <span className="text-gray-300 text-xs">{currentIndex + 1} / {jobs.length}</span>
        <span className="flex items-center gap-1.5 text-gray-400 font-semibold">
          <X className="w-3.5 h-3.5" /> {passedCount}
        </span>
      </div>

      {/* Card Stack */}
      <div className="relative w-full max-w-sm h-[520px] mb-6">
        {nextNextJob && (
          <JobCard
            key={`bg2-${nextNextJob.id}`}
            job={nextNextJob}
            onSwipe={() => {}}
            isBackground
            style={{ zIndex: 1, transform: 'scale(0.88) translateY(12px)' }}
          />
        )}
        {nextJob && (
          <JobCard
            key={`bg1-${nextJob.id}`}
            job={nextJob}
            onSwipe={() => {}}
            isBackground
            style={{ zIndex: 2, transform: 'scale(0.94) translateY(6px)' }}
          />
        )}
        <AnimatePresence>
          <JobCard
            key={currentJob.id}
            job={currentJob}
            onSwipe={handleSwipe}
            style={{ zIndex: 3 }}
          />
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex items-start gap-6">
        <div className="flex flex-col items-center gap-1.5">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => handleSwipe('left')}
            className="w-14 h-14 rounded-full bg-white shadow-lg border-2 border-red-100 flex items-center justify-center hover:border-red-300 hover:bg-red-50 transition-colors"
            aria-label="Bỏ qua"
          >
            <X className="w-7 h-7 text-red-500" />
          </motion.button>
          <span className="text-[11px] font-semibold text-gray-500">Bỏ qua</span>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.94 }}
            onClick={handleFavorite}
            className="w-14 h-14 rounded-full bg-white shadow-lg border-2 border-amber-200 flex items-center justify-center hover:border-amber-400 hover:bg-amber-50 transition-colors"
            aria-label="Yêu thích"
          >
            <Star className="w-7 h-7 text-amber-500" fill="currentColor" />
          </motion.button>
          <span className="text-[11px] font-semibold text-amber-600">Siêu thích</span>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => handleSwipe('right')}
            className="w-14 h-14 rounded-full bg-white shadow-lg border-2 border-emerald-100 flex items-center justify-center hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
            aria-label="Ứng tuyển"
          >
            <Heart className="w-7 h-7 text-emerald-500" fill="currentColor" />
          </motion.button>
          <span className="text-[11px] font-semibold text-emerald-600">Apply</span>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 mt-5">
        {jobs.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all ${
              i < currentIndex ? 'bg-emerald-400 w-3' : i === currentIndex ? 'bg-emerald-500 w-5' : 'bg-gray-200 w-3'
            }`}
          />
        ))}
      </div>

      {renderDialogs()}
    </div>
  );
}
