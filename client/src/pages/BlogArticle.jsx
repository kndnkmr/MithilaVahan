// Single blog article page.

import { Link, useParams } from 'react-router-dom';
import { getArticle, ARTICLES } from '../data/blogData';
import { useSeo } from '../services/seo';

export default function BlogArticle() {
  const { slug } = useParams();
  const article = getArticle(slug);

  useSeo(
    article ? `${article.title} | MithilaVahan` : 'Article | MithilaVahan',
    article?.description
  );

  if (!article) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center text-gray-500">
        Article not found. <Link to="/blog" className="text-brand-600">Back to blog</Link>
      </div>
    );
  }

  const related = ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <article className="max-w-3xl mx-auto px-4 py-10">
      <Link to="/blog" className="text-brand-600 text-sm">← Back to blog</Link>
      <h1 className="text-3xl font-bold mt-3 leading-tight">{article.title}</h1>
      <div className="text-sm text-gray-400 mt-2">
        {new Date(article.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        {' · '}{article.readTime} read
      </div>

      {article.image && (
        <img src={article.image} alt={article.title}
          className="w-full rounded-2xl mt-5 object-cover max-h-72" />
      )}

      <div className="mt-6 space-y-4">
        {article.body.map((block, i) =>
          block.type === 'h' ? (
            <h2 key={i} className="text-xl font-bold text-gray-900 mt-6">{block.text}</h2>
          ) : (
            <p key={i} className="text-gray-700 leading-relaxed">{block.text}</p>
          )
        )}
      </div>

      {/* CTA */}
      {article.cta && (
        <div className="mt-8 card p-5 text-center bg-brand-50 border-brand-100">
          <Link to={article.cta.to} className="btn-primary inline-block">{article.cta.label}</Link>
        </div>
      )}

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-10">
          <h3 className="font-bold mb-3">More travel reads</h3>
          <div className="space-y-2">
            {related.map((r) => (
              <Link key={r.slug} to={`/blog/${r.slug}`} className="block text-brand-600 hover:underline text-sm">
                {r.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
