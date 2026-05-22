import { useState } from 'react';
import { JobCard } from './JobCard';
import { Job } from '../data/mockData';
import { X, Heart, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface JobSwiperProps {
  jobs: Job[];
  onApply: (job: Job) => void;
  onSkip: (job: Job) => void;
}

export function JobSwiper({ jobs, onApply, onSkip }: JobSwiperProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipedJobs, setSwipedJobs] = useState<{ job: Job; direction: 'left' | 'right' }[]>([]);
  const [likedCount, setLikedCount] = useState(0);
  const [passedCount, setPassedCount] = useState(0);

  const handleSwipe = (direction: 'left' | 'right') => {
    const currentJob = jobs[currentIndex];
    setSwipedJobs([...swipedJobs, { job: currentJob, direction }]);
    if (direction === 'right') {
      onApply(currentJob);
      setLikedCount(c => c + 1);
    } else {
      onSkip(currentJob);
      setPassedCount(c => c + 1);
    }
    setCurrentIndex(currentIndex + 1);
  };

  const handleUndo = () => {
    if (swipedJobs.length > 0) {
      const last = swipedJobs[swipedJobs.length - 1];
      if (last.direction === 'right') setLikedCount(c => Math.max(0, c - 1));
      else setPassedCount(c => Math.max(0, c - 1));
      setSwipedJobs(swipedJobs.slice(0, -1));
      setCurrentIndex(currentIndex - 1);
    }
  };

  const currentJob = jobs[currentIndex];
  const nextJob = jobs[currentIndex + 1];
  const nextNextJob = jobs[currentIndex + 2];

  if (!currentJob) {
    return (
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
          onClick={() => {
            setCurrentIndex(0);
            setSwipedJobs([]);
            setLikedCount(0);
            setPassedCount(0);
          }}
          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-semibold shadow-md hover:shadow-lg transition-shadow text-sm"
        >
          Xem lại từ đầu
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      {/* Stats row */}
      <div className="flex items-center gap-6 mb-4 text-sm">
        <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
          <Heart className="w-3.5 h-3.5" fill="currentColor" /> {likedCount}
        </span>
        <span className="text-gray-300 text-xs">{currentIndex + 1} / {jobs.length}</span>
        <span className="flex items-center gap-1.5 text-gray-400 font-semibold">
          <X className="w-3.5 h-3.5" /> {passedCount}
        </span>
      </div>

      {/* Card Stack */}
      <div className="relative w-full max-w-sm h-[520px] mb-6">
        {/* Third card (deepest) */}
        {nextNextJob && (
          <JobCard
            key={`bg2-${nextNextJob.id}`}
            job={nextNextJob}
            onSwipe={() => {}}
            isBackground
            style={{ zIndex: 1, transform: 'scale(0.88) translateY(12px)' }}
          />
        )}
        {/* Second card */}
        {nextJob && (
          <JobCard
            key={`bg1-${nextJob.id}`}
            job={nextJob}
            onSwipe={() => {}}
            isBackground
            style={{ zIndex: 2, transform: 'scale(0.94) translateY(6px)' }}
          />
        )}
        {/* Current card */}
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
      <div className="flex items-center gap-5">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => handleSwipe('left')}
          className="w-14 h-14 rounded-full bg-white shadow-lg border-2 border-red-100 flex items-center justify-center hover:border-red-300 hover:bg-red-50 transition-colors"
        >
          <X className="w-7 h-7 text-red-500" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          onClick={handleUndo}
          disabled={swipedJobs.length === 0}
          className="w-11 h-11 rounded-full bg-white shadow border-2 border-gray-100 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <RotateCcw className="w-5 h-5 text-gray-500" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => handleSwipe('right')}
          className="w-14 h-14 rounded-full bg-white shadow-lg border-2 border-emerald-100 flex items-center justify-center hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
        >
          <Heart className="w-7 h-7 text-emerald-500" fill="currentColor" />
        </motion.button>
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
    </div>
  );
}
