import { Link } from 'react-router-dom';

const COLS = [
  {
    title: 'Book',
    links: [
      ['Book a ride', '/book'],
      ['Places to explore', '/destinations'],
      ['Travel blog', '/blog'],
      ['Get the app', '/install'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['About us', '/about'],
      ['Become a driver', '/register'],
      ['Refer & earn', '/refer'],
      ['Support & Grievance', '/support'],
    ],
  },
  {
    title: 'Legal',
    links: [
      ['Terms & Conditions', '/terms'],
      ['Privacy Policy', '/privacy'],
      ['Cancellation & Refund', '/cancellation-refund'],
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pb-24 md:pb-8 pt-10 mt-auto">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="text-xl font-bold text-white">MithilaVahan</div>
            <p className="text-sm text-gray-400 mt-2 leading-relaxed">
              Local rides & vehicle rentals for Mithilanchal. Darbhanga · Muzaffarpur.
            </p>
            <a href="mailto:support@mithilavahan.in" className="text-sm text-gray-400 hover:text-white mt-2 inline-block">
              support@mithilavahan.in
            </a>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <div className="text-white font-semibold mb-3 text-sm">{col.title}</div>
              <ul className="space-y-2 text-sm">
                {col.links.map(([label, to]) => (
                  <li key={to}>
                    <Link to={to} className="text-gray-400 hover:text-white">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-xs text-gray-500 flex flex-col sm:flex-row justify-between gap-2">
          <div>© {new Date().getFullYear()} MithilaVahan. All rights reserved.</div>
          <div>Made for Mithilanchal 🧡</div>
        </div>
      </div>
    </footer>
  );
}
