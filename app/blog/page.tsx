import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import BlogCard from "@/components/BlogCard";

export const metadata: Metadata = {
  title: "Aurora Blog — pingAurora",
  description:
    "Aurora science, travel guides, photography tips, and behind-the-product stories from the pingAurora team.",
  openGraph: {
    title: "Aurora Blog — pingAurora",
    description:
      "Aurora science, travel guides, photography tips, and behind-the-product stories.",
  },
};

export default function BlogPage() {
  const posts = getAllPosts();
  const [featuredPost, ...restPosts] = posts;

  return (
    <main className="min-h-screen bg-aurora-dark text-aurora-text">
      {/* Background effects */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 20% 10%, rgba(0,212,255,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 30%, rgba(138,43,226,0.04) 0%, transparent 50%)",
        }}
      />
      <div
        className="absolute top-20 right-1/4 w-80 h-48 rounded-full opacity-10 animate-aurora"
        style={{
          background: "radial-gradient(ellipse, rgba(0,212,255,0.4), transparent)",
          filter: "blur(80px)",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-aurora-soft/50 text-sm hover:text-aurora-accent transition-colors mb-8"
          >
            <span className="mr-1">←</span>
            <span>Back to pingAurora</span>
          </Link>
          <p className="text-aurora-accent text-xs font-mono mb-3 tracking-widest uppercase">
            Aurora Blog
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-aurora-text leading-snug mb-4">
            Stories from the Sky
          </h1>
          <p className="text-aurora-soft text-sm max-w-lg mx-auto leading-relaxed">
            Aurora science, travel guides, photography tips, and behind-the-product
            stories from the pingAurora team.
          </p>
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-8">
            <p className="text-aurora-accent/60 text-xs font-semibold tracking-widest uppercase mb-4">
              Latest Post
            </p>
            <BlogCard post={featuredPost} featured />
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <hr className="flex-1 border-aurora-glow/30" />
          <span className="text-aurora-soft/30 text-xs">More Stories</span>
          <hr className="flex-1 border-aurora-glow/30" />
        </div>

        {/* Post Grid */}
        {restPosts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {restPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-center text-aurora-soft/40 text-sm py-12">
            More posts coming soon...
          </p>
        )}

        {/* Back to Home */}
        <div className="mt-16 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-aurora-glow/40 text-aurora-soft text-sm hover:border-aurora-accent/50 hover:text-aurora-accent transition-all duration-200"
          >
            ← Subscribe for Aurora Alerts
          </Link>
        </div>
      </div>
    </main>
  );
}
