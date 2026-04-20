export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  category: string;
  readTime: string;
  coverEmoji?: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "why-we-built-this",
    title: "Why We Built a Free Aurora Alert That Checks Cloud Cover for YOUR City",
    description:
      "Most aurora trackers show you the Kp index and call it a day. pingAurora does something different — it checks local cloud cover for your exact city before sending any alert. Here's why that matters.",
    date: "April 20, 2026",
    author: "pingAurora Team",
    category: "Behind the Product",
    readTime: "6 min read",
    coverEmoji: "🌌",
  },
  {
    slug: "kp-index-beginners-guide",
    title: "The Kp Index Explained: What Every Aurora Hunter Needs to Know",
    description:
      "The Kp index appears in every aurora forecast, but what does it actually mean for your chances of seeing the northern lights? This guide breaks it down from 0 to 9, with real-world visibility examples.",
    date: "April 18, 2026",
    author: "pingAurora Team",
    category: "Aurora Science",
    readTime: "5 min read",
    coverEmoji: "🔬",
  },
  {
    slug: "best-places-northern-lights-2026",
    title: "Top 10 Destinations for Northern Lights in 2026",
    description:
      "From the Norwegian fjords to the Scottish Highlands, here are the most reliable destinations for catching the aurora borealis this year — with tips on when to go and where to stay.",
    date: "April 15, 2026",
    author: "pingAurora Team",
    category: "Travel Guide",
    readTime: "8 min read",
    coverEmoji: "🌍",
  },
  {
    slug: "how-aurora-forecasting-works",
    title: "How Aurora Forecasting Works: Kp Index, Solar Wind, and Cloud Cover",
    description:
      "Behind every pingAurora alert is a chain of data stretching from the Sun's surface to your local weather station. Here's how the science translates into your notification.",
    date: "April 10, 2026",
    author: "pingAurora Team",
    category: "Aurora Science",
    readTime: "7 min read",
    coverEmoji: "☀️",
  },
  {
    slug: "aurora-photography-tips",
    title: "Photographing the Northern Lights: A Beginner's Guide",
    description:
      "You don't need a $5,000 camera to capture stunning aurora photos. This guide covers the settings, gear, and timing tricks that work with a basic DSLR or even a modern smartphone.",
    date: "April 5, 2026",
    author: "pingAurora Team",
    category: "Photography",
    readTime: "6 min read",
    coverEmoji: "📷",
  },
  {
    slug: "solar-cycle-2026",
    title: "Solar Cycle 2026: Why the Next Few Years Are the Best Time to Chase Auroras",
    description:
      "The Sun follows an 11-year activity cycle, and we're approaching peak activity. This means more frequent and more intense aurora displays through 2026 and beyond.",
    date: "March 28, 2026",
    author: "pingAurora Team",
    category: "Aurora Science",
    readTime: "5 min read",
    coverEmoji: "🕐",
  },
];

export function getAllPosts(): BlogPost[] {
  return blogPosts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}
