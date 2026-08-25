// Blog index — list of local travel articles.

import { Link } from 'react-router-dom';
import { ARTICLES } from '../data/blogData';
import { useSeo } from '../services/seo';

export default function BlogList() {
  useSeo(
    'Travel Guide & Blog | MithilaVahan',
    'Travel guides and tips for Darbhanga, Muzaffarpur and Mithilanchal — outstation routes, places to visit, and booking advice.'
  );

  // newest first (copy, don't mutate the imported array)
  const posts = [...ARTICLES].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div>
      <section className="bg-gradient-to-br from-brand-500 to-brand-700 text-white">
        <div className="max-w-5xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold">Travel Guide & Blog</h1>
          <p className="text-brand-50 mt-2">Tips and guides for travelling around Mithilanchal</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {posts.map((p) => (
          <Link key={p.slug} to={`/blog/${p.slug}`} className="card overflow-hidden hover:shadow-md transition flex flex-col">
            <div className="h-40 bg-brand-100">
              {p.image && (
                <img src={p.image} alt={p.title} loading="lazy" className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              )}
            </div>
            <div className="p-4 flex flex-col flex-1">
              <div className="text-xs text-gray-400 mb-1">{p.readTime} read</div>
              <div className="font-semibold leading-snug">{p.title}</div>
              <p className="text-sm text-gray-600 mt-1 flex-1">{p.description}</p>
              <span className="text-brand-600 text-sm font-medium mt-3">Read more →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
