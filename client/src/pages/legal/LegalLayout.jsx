// Shared layout for legal/info pages — consistent header + readable prose.

import { useSeo } from '../../services/seo';

export default function LegalLayout({ title, subtitle, updated, children }) {
  useSeo(`${title} | MithilaVahan`, subtitle);
  return (
    <div>
      <section className="bg-gradient-to-br from-brand-500 to-brand-700 text-white">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold">{title}</h1>
          {subtitle && <p className="text-brand-50 mt-2">{subtitle}</p>}
          {updated && <p className="text-brand-100 text-sm mt-3">Last updated: {updated}</p>}
        </div>
      </section>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="prose-mv space-y-5 text-gray-700 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

// Small helpers for consistent section styling.
export function H2({ children }) {
  return <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">{children}</h2>;
}
export function P({ children }) {
  return <p className="text-gray-700">{children}</p>;
}
export function UL({ items }) {
  return (
    <ul className="list-disc pl-5 space-y-1 text-gray-700">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}
