import { blogs } from "@/data/blogs";
import { notFound } from "next/navigation";
import { Calendar, User, ArrowLeft, Clock, Share2, Bookmark, Tag } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import Script from "next/script";

// ── Required for Next.js 15 static generation ──────────────────────────────
export async function generateStaticParams() {
  return blogs.map((post) => ({ slug: post.slug }));
}

// ── SEO Metadata per post ───────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const post = blogs.find((b) => b.slug === slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: `${post.title} | Adumate Blog`,
    description: post.description,
    keywords: post.keywords,
    authors: [{ name: post.author }],
    alternates: { canonical: `https://www.adumate.in/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://www.adumate.in/blog/${post.slug}`,
      siteName: "Adumate",
      images: [{ url: post.image, width: 1200, height: 630, alt: post.title }],
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [post.image],
      creator: "@AdumateIn",
    },
  };
}

// ── Page Component ──────────────────────────────────────────────────────────
export default async function BlogPostPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = blogs.find((b) => b.slug === slug);
  if (!post) notFound();

  // JSON-LD structured data for Google
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: post.image,
    datePublished: post.date,
    author: { "@type": "Person", name: post.author },
    publisher: {
      "@type": "Organization",
      name: "Adumate",
      url: "https://www.adumate.in",
      logo: { "@type": "ImageObject", url: "https://www.adumate.in/logo.png" },
    },
    url: `https://www.adumate.in/blog/${post.slug}`,
    keywords: post.keywords,
    mainEntityOfPage: `https://www.adumate.in/blog/${post.slug}`,
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      {/* JSON-LD */}
      <Script
        id="blog-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <img src={post.image} alt={post.title} className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-[#0a0f1a]/40 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 max-w-5xl mx-auto w-full">
          <Link href="/blog" className="inline-flex items-center gap-2 text-orange-400 font-bold mb-6 hover:-translate-x-1 transition-transform text-sm">
            <ArrowLeft size={16} /> Back to Blog
          </Link>

          <div className="flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-400 mb-5">
            <span className="bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full border border-orange-500/30">{post.category}</span>
            <span className="flex items-center gap-1.5"><Calendar size={12} /> {post.date}</span>
            <span className="flex items-center gap-1.5"><User size={12} /> {post.author}</span>
            <span className="flex items-center gap-1.5"><Clock size={12} /> {post.readTime}</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight max-w-3xl">{post.title}</h1>
        </div>
      </div>

      {/* Content + Sidebar */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-14 grid grid-cols-1 lg:grid-cols-4 gap-12">

        {/* Article */}
        <article className="lg:col-span-3">
          {/* Description quote */}
          <p className="text-lg text-slate-300 font-medium leading-relaxed mb-10 italic border-l-4 border-orange-500 pl-6">
            {post.description}
          </p>

          {/* Render content with markdown-like parsing */}
          <div className="text-slate-300 leading-loose space-y-5 text-base">
            {post.content.split("\n").map((line, i) => {
              if (line.startsWith("## ")) return (
                <h2 key={i} className="text-2xl font-black text-white mt-10 mb-4">{line.replace("## ", "")}</h2>
              );
              if (line.startsWith("**") && line.endsWith("**")) return (
                <p key={i} className="font-bold text-white">{line.replace(/\*\*/g, "")}</p>
              );
              if (line.startsWith("✅") || line.startsWith("❌")) return (
                <p key={i} className="pl-2">{line}</p>
              );
              if (line.startsWith("| ")) return (
                <div key={i} className="overflow-x-auto">
                  <p className="font-mono text-sm bg-white/5 border border-white/10 px-3 py-1 rounded text-slate-400">{line}</p>
                </div>
              );
              if (line.startsWith("- ")) return (
                <li key={i} className="ml-4 list-disc text-slate-300">{line.replace("- ", "")}</li>
              );
              if (line.trim() === "") return <div key={i} className="h-2" />;
              return <p key={i} className="leading-relaxed">{line}</p>;
            })}
          </div>

          {/* Hashtags */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Tag size={14} className="text-orange-400" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">Tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span key={tag} className="px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-bold hover:bg-orange-500/20 transition-all cursor-pointer">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Share row */}
          <div className="mt-8 flex items-center gap-3 flex-wrap">
            <button className="flex items-center gap-2 bg-slate-900 border border-white/10 px-4 py-2.5 rounded-xl hover:border-orange-500/40 text-sm font-bold transition-all">
              <Share2 size={16} /> Share Article
            </button>
            <button className="flex items-center gap-2 bg-slate-900 border border-white/10 px-4 py-2.5 rounded-xl hover:border-orange-500/40 text-sm font-bold transition-all">
              <Bookmark size={16} /> Save for Later
            </button>
          </div>

          {/* Author card */}
          <div className="mt-12 p-6 rounded-3xl border border-white/10 bg-white/5 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center font-black text-2xl text-white shrink-0">
              {post.author[0]}
            </div>
            <div>
              <p className="font-black text-white">{post.author}</p>
              <p className="text-xs text-slate-400 mt-1">Founder @ Adumate | Building India's #1 Student Ecosystem</p>
            </div>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-8">
          {/* Related posts */}
          <div className="bg-slate-900/40 border border-white/10 p-6 rounded-3xl">
            <h4 className="text-base font-black text-white mb-5">More Articles</h4>
            <div className="space-y-5">
              {blogs.filter(b => b.slug !== post.slug).slice(0, 4).map(b => (
                <Link key={b.id} href={`/blog/${b.slug}`} className="group block">
                  <p className="text-[10px] font-black text-orange-400 uppercase mb-1">{b.category}</p>
                  <p className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-2 leading-snug">{b.title}</p>
                  <p className="text-[10px] text-slate-600 mt-1">{b.readTime}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-6 rounded-3xl text-white">
            <h4 className="text-lg font-black mb-3">Join Adumate 🚀</h4>
            <p className="text-sm opacity-90 mb-5 leading-relaxed">
              Find libraries, hostels, mess & more near your college — free!
            </p>
            <Link href="/map" className="block w-full bg-white text-orange-500 font-black py-3 rounded-2xl text-sm text-center hover:bg-slate-100 transition-colors">
              Explore Map →
            </Link>
          </div>

          {/* Tags cloud */}
          <div className="bg-slate-900/40 border border-white/10 p-6 rounded-3xl">
            <h4 className="text-base font-black text-white mb-4 flex items-center gap-2"><Tag size={14} /> Trending Tags</h4>
            <div className="flex flex-wrap gap-2">
              {["#StudentLife","#JEEPrep","#NEETPrep","#HostelLife","#Adumate","#IndiaStudents","#CollegeLife","#StudyTips","#AIEducation"].map(t => (
                <span key={t} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400 hover:text-orange-400 hover:border-orange-500/30 transition-all cursor-pointer">{t}</span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
