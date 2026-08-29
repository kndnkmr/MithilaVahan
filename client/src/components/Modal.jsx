// Reusable in-app modals — replaces window.confirm and window.prompt with
// styled overlays (adapted from the ProMedicoz Modal pattern).
//
// Usage:
//   <ConfirmModal open={show} title="Cancel trip?" message="Are you sure?"
//     variant="danger" onConfirm={fn} onCancel={() => setShow(false)} />
//
//   <PromptModal open={show} title="Rate your driver"
//     fields={[{ name:'rating', label:'Stars (1-5)', type:'number', min:1, max:5, required:true },
//              { name:'review', label:'Comment', type:'textarea' }]}
//     onSubmit={(values) => {...}} onCancel={() => setShow(false)} />

import { useEffect, useState } from 'react';

// Shared backdrop + container.
function ModalWrapper({ open, children, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

// ConfirmModal — replaces window.confirm
export function ConfirmModal({
  open,
  title = 'Confirm',
  message = 'Are you sure?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary', // 'primary' | 'danger'
  onConfirm,
  onCancel,
}) {
  const confirmClass =
    variant === 'danger'
      ? 'bg-red-600 hover:bg-red-700'
      : 'bg-brand-500 hover:bg-brand-600';
  return (
    <ModalWrapper open={open} onClose={onCancel}>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
            {cancelText}
          </button>
          <button onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition ${confirmClass}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}

// PromptModal — replaces window.prompt (supports multiple fields)
export function PromptModal({
  open,
  title = 'Input',
  description = '',
  fields = [],
  submitText = 'Submit',
  cancelText = 'Cancel',
  onSubmit,
  onCancel,
}) {
  const [values, setValues] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      const initial = {};
      fields.forEach((f) => { initial[f.name] = f.defaultValue ?? ''; });
      setValues(initial);
      setError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const change = (name, value) => setValues((v) => ({ ...v, [name]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // Required validation — show a visible message instead of silently doing
    // nothing (a silent return made buttons feel "broken").
    const missing = fields.find(
      (f) => f.required && !String(values[f.name] ?? '').trim()
    );
    if (missing) {
      setError(`${missing.label} is required.`);
      return;
    }
    setError('');
    onSubmit(values);
  };

  return (
    <ModalWrapper open={open} onClose={onCancel}>
      <form onSubmit={handleSubmit} className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
        {description && <p className="text-gray-500 text-sm mb-4">{description}</p>}
        <div className="space-y-4 mb-6">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}{field.required && ' *'}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  value={values[field.name] ?? ''}
                  onChange={(e) => change(field.name, e.target.value)}
                  placeholder={field.placeholder || ''}
                  rows={field.rows || 3}
                  className="input resize-none"
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  value={values[field.name] ?? ''}
                  onChange={(e) => change(field.name, e.target.value)}
                  placeholder={field.placeholder || ''}
                  min={field.min}
                  max={field.max}
                  className="input"
                />
              )}
            </div>
          ))}
        </div>
        {error && <p className="text-sm text-red-600 mb-3 -mt-2">{error}</p>}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
            {cancelText}
          </button>
          <button type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition">
            {submitText}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
