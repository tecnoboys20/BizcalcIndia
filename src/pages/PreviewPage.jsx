import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Tag, Calendar, AlertTriangle } from 'lucide-react';
import { authors, defaultAuthor } from '../data/authors';

// Simple markdown-ish renderer (same as BlogPostPage)
function renderContent(content) {
  if (!content) return null;
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

export default function PreviewPage() {
  const [searchParams] = useSearchParams();
  const gistId = searchParams.get('gist');
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gistId) {
      setError("No draft ID provided.");
      setLoading(false);
      return;
    }

    async function fetchDraft() {
      try {
        const res = await fetch(`https://api.github.com/gists/${gistId}`);
        if (!res.ok) throw new Error("Draft not found or expired.");
        const data = await res.json();
        
        const draftFile = data.files['draft.json'];
        if (!draftFile) throw new Error("Invalid draft format.");
        
        const draftData = JSON.parse(draftFile.content);
        setPost(draftData);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDraft();
  }, [gistId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-red-100 max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Preview Unavailable</h2>
          <p className="text-slate-500">{error || "Could not load the draft."}</p>
          <Link to="/" className="mt-6 inline-block text-primary font-medium hover:underline">Return Home</Link>
        </div>
      </div>
    );
  }

  const author = authors[post.authorId] || defaultAuthor;

  return (
    <>
      <Helmet>
        <title>PREVIEW: {post.title} | BizCalc India</title>
      </Helmet>

      <div className="min-h-screen">
        {/* Preview Banner */}
        <div className="bg-amber-400 text-amber-900 font-bold text-center text-sm py-2 px-4 shadow-sm relative z-50">
          🚧 THIS IS A DRAFT PREVIEW 🚧<br/>
          <span className="font-normal text-xs opacity-80">This page is not visible to the public. Approve it in Telegram to publish.</span>
        </div>

        {/* Hero Banner */}
        <div className={`pt-16 pb-16 relative overflow-hidden ${post.coverImage ? '' : 'bg-gradient-to-br from-slate-800 to-slate-900'}`}>
          {post.coverImage && (
            <div className="absolute inset-0">
              <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/55" />
            </div>
          )}
          {!post.coverImage && <div className="absolute inset-0 bg-black/20" />}
          <div className="relative max-w-3xl mx-auto px-4 text-white">
            <div className="flex flex-wrap items-center gap-3 mb-4 mt-8">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-green-500 text-white px-2 py-0.5 rounded uppercase tracking-wider">
                Expert Verified
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <Tag className="w-3 h-3" /> {post.category || "Uncategorized"}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-white/70">
                <Calendar className="w-3 h-3" />
                {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-white/70">
                <Clock className="w-3 h-3" /> {post.readTime || "5 min read"}
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

          {/* Author Section */}
          <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col sm:flex-row gap-6 items-start">
            <img src={author.avatar} alt={author.name} className="w-16 h-16 rounded-2xl object-cover shadow-sm border-2 border-white" />
            <div>
              <h4 className="font-bold text-slate-800 text-lg mb-1">{author.name}</h4>
              <p className="text-primary text-xs font-semibold mb-2">{author.role}</p>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">{author.bio}</p>
              <div className="flex gap-3">
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold uppercase tracking-tight">Financial Contributor</span>
                <span className="text-[10px] bg-blue-50 text-blue-500 px-2 py-0.5 rounded font-bold uppercase tracking-tight italic tracking-widest">Verified Expert</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
