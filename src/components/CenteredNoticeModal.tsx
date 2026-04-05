import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';

type CenteredNoticeModalProps = {
  open: boolean;
  title: string;
  message: string;
  eyebrow?: string;
  icon?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
};

export default function CenteredNoticeModal({
  open,
  title,
  message,
  eyebrow = 'Thong bao',
  icon,
  confirmLabel = 'Dong',
  cancelLabel,
  loading = false,
  onConfirm,
  onCancel,
}: CenteredNoticeModalProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/72 px-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-gold/35 bg-[#15120d] shadow-[0_20px_90px_rgba(217,179,58,0.22)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(217,179,58,0.22),_transparent_62%)] pointer-events-none" />

            <div className="relative z-10 p-7 text-center">
              {onCancel ? (
                <button
                  type="button"
                  onClick={loading ? undefined : onCancel}
                  disabled={loading}
                  className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/60 transition hover:border-gold/30 hover:text-gold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold/30 bg-gold/12 text-gold shadow-[0_0_28px_rgba(217,179,58,0.18)]">
                {icon}
              </div>

              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.35em] text-gold/80">{eyebrow}</p>
              <h3 className="mt-3 text-2xl font-bold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/65">{message}</p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
                {cancelLabel && onCancel ? (
                  <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white/75 transition hover:border-gold/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {cancelLabel}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={loading}
                  className="btn-gold inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Dang xu ly...' : confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
