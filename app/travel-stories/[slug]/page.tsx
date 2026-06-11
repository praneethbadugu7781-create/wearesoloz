import { stories as defaultStories } from "@/lib/data";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/Reveal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getBlogData(slug: string) {
  try {
    const res = await fetch(`${API_URL}/blogs/${slug}`, { cache: "no-store" });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error("API error fetching story details:", error);
  }

  // Fallback
  const staticBlog = defaultStories.find(
    (s) => s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug
  );

  if (staticBlog) {
    return {
      title: staticBlog.title,
      slug: slug,
      category: staticBlog.category,
      image: staticBlog.image,
      readTime: staticBlog.readTime,
      excerpt: `A guide about our adventure to ${staticBlog.title.replace("Journey", "").replace("Trek", "")}. Packing lists, trails details and cultural highlights.`,
      content: `We started our journey with high spirits and clear skies. Exploring these gorgeous landscapes teaches you more than any book ever could.\n\nTraveling solo makes you independent, but traveling in a community connects you with the heartbeat of the place. We shared stories by the bonfire, woke up at 4 AM to catch the sunrise behind the peaks, and walked miles together.`,
      author: "Akhil",
      createdAt: new Date().toISOString()
    };
  }

  return null;
}

export default async function TravelStoryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const story = await getBlogData(slug);

  if (!story) {
    return (
      <main className="min-h-screen bg-white text-[#1c1917] flex flex-col items-center justify-center gap-6 p-4">
        <h1 className="font-display text-4xl font-light text-stone-900">Story Not Found</h1>
        <p className="text-soloz-textSecondary">The travel blog article you seek could not be found.</p>
        <Button asChild className="gradient-orange text-white rounded-full">
          <Link href="/travel-stories">Go Back to Stories</Link>
        </Button>
      </main>
    );
  }

  const hasHtml = /<[a-z][\s\S]*>/i.test(story.content);

  return (
    <div data-testid="story-detail-page" className="bg-white min-h-screen text-[#1c1917] pt-20">
      <section className="relative h-[60vh] min-h-[440px] overflow-hidden">
        <img
          src={story.image || "https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=1200&q=85"}
          alt={story.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/15 to-transparent" />
        <div className="absolute bottom-12 left-0 right-0 max-w-3xl mx-auto px-6">
          <SectionLabel>{story.category}</SectionLabel>
          <h1 className="font-display text-4xl md:text-6xl font-light tracking-tighter mt-3 text-stone-900">
            {story.title}
          </h1>
          <div className="text-stone-700 text-sm mt-3 font-body">By {story.author || "Akhil"}</div>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-6 py-20">
        {hasHtml ? (
          <div
            className="prose prose-stone prose-orange max-w-none text-lg text-soloz-textSecondary leading-relaxed font-body whitespace-normal"
            dangerouslySetInnerHTML={{ __html: story.content }}
          />
        ) : (
          <p className="text-lg text-soloz-textSecondary whitespace-pre-line leading-relaxed font-body">
            {story.content}
          </p>
        )}

        <div className="mt-12">
          <Link
            href="/travel-stories"
            className="inline-flex items-center gap-2 text-soloz-primary hover:text-stone-900 transition-colors font-medium border-b border-soloz-primary pb-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back to stories
          </Link>
        </div>
      </article>
    </div>
  );
}
