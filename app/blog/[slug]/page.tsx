import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, getPostBySlug } from "@/lib/blog";

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
    },
  };
}

export default function BlogPostPage({ params }: PageProps) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <main className="min-h-screen bg-aurora-dark text-aurora-text">
      {/* Aurora background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 20% 10%, rgba(0,212,255,0.05) 0%, transparent 50%), radial-gradient(ellipse at 80% 30%, rgba(138,43,226,0.03) 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-16">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center text-aurora-soft/50 text-sm hover:text-aurora-accent transition-colors mb-8"
        >
          <span className="mr-1">←</span>
          <span>All Posts</span>
        </Link>

        {/* Category */}
        <p className="text-aurora-accent text-xs font-mono mb-4 tracking-widest uppercase">
          {post.category}
        </p>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-aurora-text leading-snug mb-4">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-aurora-soft/60 text-sm mb-8">
          <span>{post.author}</span>
          <span className="opacity-40">·</span>
          <span>{post.date}</span>
          <span className="opacity-40">·</span>
          <span>{post.readTime}</span>
        </div>

        <hr className="border-aurora-glow/30 mb-12" />

        {/* Description / Lead */}
        <p className="text-aurora-text text-lg leading-relaxed mb-8 font-medium">
          {post.description}
        </p>

        {/* CTA */}
        <div className="bg-aurora-deep border border-aurora-accent/30 rounded-2xl p-6 mb-10">
          <p className="text-aurora-text text-base leading-relaxed">
            Want to know when aurora conditions are right for <span className="text-aurora-accent">your</span> city?{" "}
            <Link
              href="/"
              className="text-aurora-accent underline underline-offset-2 hover:text-aurora-soft transition-colors"
            >
              Subscribe to pingAurora
            </Link>{" "}
            — free alerts with Kp index and cloud cover for your exact location.
          </p>
        </div>

        {/* Placeholder for full article content */}
        <div className="text-aurora-soft/50 text-sm text-center py-16 border border-dashed border-aurora-glow/30 rounded-xl">
          <p>Full article content coming soon.</p>
          <p className="mt-1 text-xs">Slug: <code className="text-aurora-accent/60">{post.slug}</code></p>
        </div>

        {/* Navigation */}
        <div className="mt-16 flex items-center justify-between border-t border-aurora-glow/30 pt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-aurora-soft/60 text-sm hover:text-aurora-accent transition-colors"
          >
            <span>← All Posts</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-aurora-soft/60 text-sm hover:text-aurora-accent transition-colors"
          >
            <span>Get Alerts →</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
