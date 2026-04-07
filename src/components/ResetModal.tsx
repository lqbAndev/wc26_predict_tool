import { AlertTriangle } from 'lucide-react';

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ResetModal = ({ isOpen, onClose, onConfirm }: ResetModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="brand-shell relative w-full max-w-md overflow-hidden p-6 sm:p-8">
        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-host-canada via-host-usa to-host-mexico" />

        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-host-canada/15">
            <AlertTriangle className="h-6 w-6 text-host-canada" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Xác nhận Reset</h3>
          </div>
        </div>

        <p className="mt-5 text-sm leading-6 text-white/70">
          Bạn có chắc chắn muốn reset toàn bộ mô phỏng hiện tại? Mọi kết quả vòng bảng, giải đấu
          knock-out và vua phá lưới đều sẽ bị xóa bỏ và làm lại từ đầu.
        </p>

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-2xl border border-host-canada/25 bg-host-canada/16 px-4 py-3 text-sm font-semibold text-host-ice transition hover:bg-host-canada/22"
          >
            Đồng ý Reset
          </button>
        </div>
      </div>
    </div>
  );
};
