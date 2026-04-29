import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Clock, Tag, Calendar } from 'lucide-react';
import { blogPosts } from '../data/blogPosts';

// Simple markdown-ish renderer for the blog content
function renderContent(content) {
  const lines = content.trim().split('\n');
  const elements = [];
  let key = 0;
  let inTable = false;
  let tableRows = [];

  const flushTable = () => {
    if (tableRows.length > 0) {
      elements.push(
        <div key={key++} className="overflow-x-auto my-6">
          <table className="w-full text-sm border-collapse rounded-xl overflow-hidden shadow-sm">
            <thead>
              <tr className="bg-primary text-white">
                {tableRows[0].map((cell, i) => (
                  <th key={i} className="px-4 py-3 text-left font-semibold">{cell}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.slice(2).map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-3 text-slate-700 border-t border-slate-100">
                      <span dangerouslySetInnerHTML={{ __html: cell.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  lines.forEach((line) => {
    // Table rows
    if (line.startsWith('|')) {
      inTable = true;
      tableRows.push(line.split('|').filter(c => c.trim() !== '').map(c => c.trim()));
      return;
    } else if (inTable) {
      flushTable();
    }

    if (line.startsWith('## ')) {
      elements.push(<h2 key={key++} className="text-xl font-bold text-slate-800 mt-10 mb-4 pb-2 border-b border-slate-100">{line.replace('## ', '')}</h2>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={key++} className="text-base font-bold text-slate-700 mt-6 mb-2">{line.replace('### ', '')}</h3>);
    } else if (line.startsWith('> ')) {
      elements.push(<blockquote key={key++} className="border-l-4 border-primary/50 pl-4 my-4 py-2 bg-primary/5 rounded-r-xl text-slate-700 italic text-sm">{line.replace('> ', '')}</blockquote>);
    } else if (line.startsWith('---')) {
      elements.push(<hr key={key++} className="my-8 border-slate-200" />);
    } else if (line.startsWith('- ')) {
      elements.push(
        <li key={key++} className="ml-4 text-slate-600 text-sm leading-relaxed mb-1 flex gap-2">
          <span className="text-primary font-bold mt-0.5">•</span>
          <span dangerouslySetInnerHTML={{ __html: line.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        </li>
      );
    } else if (line.match(/^\d+\. /)) {
      elements.push(
        <li key={key++} className="ml-4 text-slate-600 text-sm leading-relaxed mb-1 list-decimal list-inside">
          <span dangerouslySetInnerHTML={{ __html: line.replace(/^\d+\. /, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        </li>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={key++} className="h-2" />);
    } else {
      elements.push(
        <p key={key++} className="text-slate-600 text-sm leading-relaxed mb-2">
          <span dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        </p>
      );
    }
  });

  if (inTable) flushTable();
  return elements;
}

export default function BlogPostPage() {
  const { id } = useParams();
  const post = blogPosts.find(p => p.id === id);

  if (!post) return <Navigate to="/blog" />;

  const relatedPosts = blogPosts.filter(p => p.id !== id).slice(0, 2);

  return (
    <>
      <Helmet>
        <title>{post.title} | BizCalc India Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:url" content={`https://bizcalcindia.netlify.app/blog/${post.id}`} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": post.title,
          "description": post.excerpt,
          "datePublished": post.date,
          "publisher": {
            "@type": "Organization",
            "name": "BizCalc India",
            "url": "https://bizcalcindia.netlify.app"
          }
        })}</script>
      </Helmet>

      <div className="min-h-screen">
        {/* Hero Banner */}
        <div className={`pt-24 pb-16 bg-gradient-to-br ${post.coverColor} relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative max-w-3xl mx-auto px-4 text-white">
            <Link to="/blog" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <Tag className="w-3 h-3" /> {post.category}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-white/70">
                <Calendar className="w-3 h-3" />
                {new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-white/70">
                <Clock className="w-3 h-3" /> {post.readTime}
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold leading-tight">{post.title}</h1>
            <p className="mt-4 text-white/80 text-base leading-relaxed max-w-2xl">{post.excerpt}</p>
          </div>
        </div>

        {/* Article Body */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="prose-slate"
          >
            {renderContent(post.content)}
          </motion.article>

          {/* CTA */}
          <div className="mt-12 p-6 rounded-3xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-center">
            <h3 className="font-bold text-slate-800 mb-1">Ready to try it yourself?</h3>
            <p className="text-slate-500 text-sm mb-4">Use our free tools — no sign-up, no cost, built for Indian businesses.</p>
            <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-md shadow-primary/20">
              Open Free Tools <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Related */}
          {relatedPosts.length > 0 && (
            <div className="mt-12">
              <h3 className="font-bold text-slate-700 mb-5 text-lg">More Articles</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedPosts.map(p => (
                  <Link key={p.id} to={`/blog/${p.id}`} className="group p-5 rounded-2xl bg-white/70 border border-white/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                    <span className="text-xs font-semibold text-primary">{p.category}</span>
                    <h4 className="text-sm font-bold text-slate-800 mt-1 group-hover:text-primary transition-colors line-clamp-2">{p.title}</h4>
                    <span className="text-xs text-slate-400 mt-2 inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {p.readTime}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
