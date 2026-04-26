import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';

export const BackToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 480);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-5 right-5 z-[70] inline-flex items-center justify-center gap-2 rounded-full border border-host-canada/35 bg-host-canada/22 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-host-ice shadow-brand transition hover:-translate-y-0.5 hover:bg-host-canada/30 sm:bottom-7 sm:right-7"
      aria-label="Back to top"
    >
      <ChevronUp className="h-4 w-4" />
      Top
    </button>
  );
};
