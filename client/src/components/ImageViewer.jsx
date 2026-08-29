// In-app image viewer modal (lightbox). Opens uploaded documents/photos in an
// overlay INSIDE the app instead of a new browser tab — new tabs can close /
// replace an installed PWA, which is the bug this fixes.
//
// Usage:
//   const [viewer, setViewer] = useState(null); // { url, title }
//   <img onClick={() => setViewer({ url, title: 'Driving licence' })} ... />
//   <ImageViewer item={viewer} onClose={() => setViewer(null)} />

import { useEffect } from 'react';

export default function ImageViewer({ item, onClose }) {
  useEffect(() => {
    if (!item) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    // Prevent the page behind from scrolling while open.
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop — click to close */}
      <div className="absolute inset-0 bg-black/80" onClick={onClose} aria-hidden="true" />

      <div className="relative max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between text-white mb-2">
          <span className="font-medium truncate">{item.title || 'Document'}</span>
          <div className="flex items-center gap-3">
            {/* Open the raw file directly if they really want the browser view */}
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="text-white/80 text-sm hover:text-white"
              onClick={(e) => e.stopPropagation()}
            >
              Open ↗
            </a>
            <button onClick={onClose} aria-label="Close" className="text-white text-2xl leading-none">×</button>
          </div>
        </div>

        {/* Image */}
        <div className="bg-white rounded-lg overflow-auto flex items-center justify-center">
          <img
            src={item.url}
            alt={item.title || 'Document'}
            className="max-w-full max-h-[80vh] object-contain"
          />
        </div>
      </div>
    </div>
  );
}
