import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Upload, Trash2, Check, ExternalLink, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { ApiCv, cvsApi } from '../lib/api';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  userId: string;
  activeCvId?: string | null;
  onSelect: (cv: ApiCv) => void;
}

const MAX_BYTES = 500 * 1024;
const ACCEPTED = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('vi-VN');
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

export function CvManagerDialog({ open, onOpenChange, userId, activeCvId, onSelect }: Props) {
  const [cvs, setCvs] = useState<ApiCv[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    cvsApi
      .listByUser(userId)
      .then((list) => {
        if (!cancelled) setCvs(list);
      })
      .catch(() => {
        if (!cancelled) toast.error('Không tải được danh sách CV');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, userId]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.size > MAX_BYTES) {
      toast.error('File quá lớn (tối đa 500KB cho bản deploy)');
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await readAsDataUrl(file);
      const created = await cvsApi.create({
        userId,
        name: file.name,
        size: file.size,
        dataUrl,
      });
      setCvs((prev) => [created, ...prev]);
      onSelect(created);
      toast.success(`Đã tải lên ${file.name}`);
    } catch {
      toast.error('Tải lên thất bại');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDelete = async (cv: ApiCv) => {
    try {
      await cvsApi.remove(cv.id);
      setCvs((prev) => prev.filter((c) => c.id !== cv.id));
      toast('Đã xoá CV');
    } catch {
      toast.error('Xoá thất bại');
    }
  };

  const handleView = (cv: ApiCv) => {
    const win = window.open();
    if (!win) {
      toast.error('Trình duyệt chặn cửa sổ pop-up');
      return;
    }
    win.document.write(
      `<title>${cv.name}</title><iframe src="${cv.dataUrl}" style="border:0;width:100vw;height:100vh"></iframe>`
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Quản lý CV</DialogTitle>
          <DialogDescription>
            Tải lên CV mới hoặc chọn CV để gửi cho nhà tuyển dụng. Hỗ trợ PDF, DOC, DOCX (tối đa 500KB).
          </DialogDescription>
        </DialogHeader>

        <div>
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPTED}
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full flex flex-col items-center justify-center gap-2 py-6 px-4 border-2 border-dashed border-emerald-200 bg-emerald-50/40 rounded-xl text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition-colors disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
            <span className="text-sm font-semibold">
              {uploading ? 'Đang tải lên...' : 'Tải lên CV mới'}
            </span>
            <span className="text-[11px] text-emerald-600/80">PDF · DOC · DOCX · ≤ 500KB</span>
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto space-y-2">
          {loading ? (
            <div className="flex justify-center py-6 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : cvs.length === 0 ? (
            <div className="text-center text-sm text-gray-500 py-6">
              Bạn chưa có CV nào. Tải lên để bắt đầu.
            </div>
          ) : (
            cvs.map((cv) => {
              const isActive = cv.id === activeCvId;
              return (
                <motion.div
                  key={cv.id}
                  layout
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    isActive
                      ? 'border-emerald-300 bg-emerald-50/60'
                      : 'border-gray-100 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`w-10 h-12 rounded-md flex items-center justify-center shadow-sm ${
                      isActive ? 'bg-emerald-100 border border-emerald-200' : 'bg-white border border-gray-200'
                    }`}
                  >
                    <FileText className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-gray-500'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{cv.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatSize(cv.size)} · {formatDate(cv.uploadedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleView(cv)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100"
                      title="Xem CV"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cv)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-600"
                      title="Xoá"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {isActive ? (
                      <span className="ml-1 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500 text-white text-[11px] font-bold">
                        <Check className="w-3 h-3" /> Đang dùng
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          onSelect(cv);
                          toast.success(`Đã chọn ${cv.name}`);
                        }}
                        className="ml-1 px-2.5 py-1 rounded-md bg-gray-900 text-white text-[11px] font-semibold hover:bg-gray-800"
                      >
                        Dùng
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
