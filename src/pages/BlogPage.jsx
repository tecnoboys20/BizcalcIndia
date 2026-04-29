import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Tag } from 'lucide-react';
import { blogPosts } from '../data/blogPosts';

export default function BlogPage() {
  const featuredPost = blogPosts[0];
  const remainingPosts = blogPosts.slice(1);

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

      {/* Blog Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        
        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-2">Latest Article</h2>
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="group bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 md:flex"
            >
              {/* Featured Cover */}
              <div className="md:w-1/2 lg:w-3/5 h-64 md:h-auto relative overflow-hidden">
                {featuredPost.coverImage ? (
                  <img 
                    src={featuredPost.coverImage} 
                    alt={featuredPost.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="eager"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${featuredPost.coverColor} flex items-end p-6`}>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-white/90 bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-sm">
                      <Tag className="w-4 h-4" /> {featuredPost.category}
                    </span>
                  </div>
                )}
                {featuredPost.coverImage && (
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
                      <Tag className="w-3 h-3" /> {featuredPost.category}
                    </span>
                  </div>
                )}
              </div>

              {/* Featured Content */}
              <div className="md:w-1/2 lg:w-2/5 p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-3 text-sm text-slate-400 mb-4">
                  <span>{new Date(featuredPost.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {featuredPost.readTime}</span>
                </div>
                <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-800 mb-4 leading-tight group-hover:text-primary transition-colors">
                  {featuredPost.title}
                </h3>
                <p className="text-base text-slate-500 leading-relaxed mb-8 line-clamp-4">
                  {featuredPost.excerpt}
                </p>
                <Link
                  to={`/blog/${featuredPost.id}`}
                  className="mt-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 hover:gap-4 transition-all duration-300 shadow-sm hover:shadow-md w-fit"
                >
                  Read Full Article <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.article>
          </div>
        )}

        {/* Remaining Posts Grid */}
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-2">More Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {remainingPosts.map((post, idx) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="group flex flex-col bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Cover */}
                {post.coverImage ? (
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={post.coverImage} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-white bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-md uppercase tracking-wide">
                        <Tag className="w-3 h-3" /> {post.category}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className={`h-48 bg-gradient-to-br ${post.coverColor} flex items-end p-5`}>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-white/90 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                      <Tag className="w-3 h-3" /> {post.category}
                    </span>
                  </div>
                )}

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-3 font-medium">
                    <span>{new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-3 leading-snug group-hover:text-primary transition-colors line-clamp-3">
                    {post.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-6 line-clamp-3">{post.excerpt}</p>
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
        </div>
      </section>
    </>
  );
}
