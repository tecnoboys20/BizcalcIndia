import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Tag } from 'lucide-react';
import { blogPosts } from '../data/blogPosts';

export default function BlogPage() {
  return (
    <>
      <Helmet>
        <title>Blog — Business Tools, GST & Finance Tips | BizCalc India</title>
        <meta name="description" content="Read expert articles about GST calculation, profit margins, invoicing, and free business tools for Indian entrepreneurs and small business owners." />
        <meta property="og:title" content="Blog — Business Tools, GST & Finance Tips | BizCalc India" />
        <meta property="og:description" content="Expert articles about GST, profit margins, invoicing, and free business tools for Indian businesses." />
        <meta property="og:url" content="https://bizcalcindia.netlify.app/blog" />
      </Helmet>

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary tracking-wider uppercase">Knowledge Hub</span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-800 mb-4">
            Business & Finance<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Articles for India</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Practical guides on GST, invoicing, profit margins, and free tools — written specifically for Indian entrepreneurs and small business owners.
          </p>
        </motion.div>
      </section>

      {/* Blog Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post, idx) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="group bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Cover */}
              {post.coverImage ? (
                <div className="h-36 overflow-hidden">
                  <img 
                    src={post.coverImage} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className={`h-36 bg-gradient-to-br ${post.coverColor} flex items-end p-5`}>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-white/90 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                    <Tag className="w-3 h-3" /> {post.category}
                  </span>
                </div>
              )}

              {/* Content */}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                  <span>{new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                </div>
                <h2 className="text-base font-bold text-slate-800 mb-2 leading-snug group-hover:text-primary transition-colors line-clamp-3">
                  {post.title}
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed mb-5 line-clamp-3">{post.excerpt}</p>
                <Link
                  to={`/blog/${post.id}`}
                  className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-3 transition-all duration-200"
                >
                  Read Article <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </>
  );
}
