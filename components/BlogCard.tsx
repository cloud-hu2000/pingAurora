import Link from "next/link";
import type { BlogPost } from "@/lib/blog";

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
}

export default function BlogCard({ post, featured = false }: BlogCardProps) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article
        className={`
          relative rounded-2xl border border-aurora-glow/40
          bg-aurora-deep/60 overflow-hidden
          transition-all duration-300 ease-out
          hover:border-aurora-accent/50 hover:shadow-[0_0_30px_rgba(0,212,255,0.15)]
          hover:-translate-y-1
          ${featured ? "p-7" : "p-5"}
        `}
      >
        {/* Aurora glow on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(0,212,255,0.06) 0%, transparent 70%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Category + Read time */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-aurora-accent text-xs font-semibold tracking-widest uppercase">
              {post.category}
            </span>
            <span className="text-aurora-soft/40 text-xs">·</span>
            <span className="text-aurora-soft/50 text-xs">{post.readTime}</span>
          </div>

          {/* Title */}
          <h3
            className={`
              font-bold text-aurora-text leading-snug mb-3
              group-hover:text-aurora-accent transition-colors duration-200
              ${featured ? "text-xl" : "text-base"}
            `}
          >
            {post.title}
          </h3>

          {/* Description */}
          <p className="text-aurora-soft/70 text-sm leading-relaxed line-clamp-2 mb-4">
            {post.description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {post.coverEmoji && (
                <span className="text-lg opacity-60">{post.coverEmoji}</span>
              )}
              <span className="text-aurora-soft/50 text-xs">{post.author}</span>
            </div>
            <div className="flex items-center gap-1 text-aurora-accent/60 group-hover:text-aurora-accent transition-colors text-xs font-medium">
              <span>Read more</span>
              <span className="transition-transform group-hover:translate-x-1 duration-200">→</span>
            </div>
          </div>

          {/* Date */}
          <p className="text-aurora-soft/40 text-xs mt-2">{post.date}</p>
        </div>
      </article>
    </Link>
  );
}
