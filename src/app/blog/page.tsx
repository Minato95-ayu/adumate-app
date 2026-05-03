import { blogs } from "@/data/blogs";
import Link from "next/link";
import { Calendar, User, ArrowRight, Clock, Tag } from "lucide-react";
import { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Adumate Blog | Student Life Tips, Guides & News India",
  description: "Read expert guides on finding hostels, libraries, mess, part-time jobs, and using AI for exam prep. India's best student life blog by Adumate.",
  keywords: "student life India blog, college tips India, hostel guide students, library near me, JEE NEET study tips, Adumate blog, Indian student resources 2026",
  alternates: { canonical: "https://www.adumate.in/blog" },
  openGraph: {
    title: "Adumate Blog | Student Life Tips & Guides India",
    description: "India's best student life blog — hostels, libraries, mess, jobs, AI study tools. By Adumate.",
    url: "https://www.adumate.in/blog",
    siteName: "Adumate",
    images: [{ url: "https://www.adumate.in/og-blog.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Adumate Blog | Student Life Tips India",
    description: "Expert guides for Indian students — libraries, hostels, AI tools & more.",
    creator: "@AdumateIn",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "Adumate Blog",
  url: "https://www.adumate.in/blog",
  description: "India's best student life blog — tips, guides, and resources for college students.",
  publisher: { "@type": "Organization", name: "Adumate", url: "https://www.adumate.in" },
  blogPost: blogs.map(b => ({
    "@type": "BlogPosting",
    headline: b.title,
    description: b.description,
    url: `https://www.adumate.in/blog/${b.slug}`,
    datePublished: b.date,
    author: { "@type": "Person", name: b.author },
  })),
};

const ALL_TAGS = ["All", "Study Tips", "Accommodation", "Lifestyle", "AI & Education", "Career"];

export default function BlogPage() {
  const featured = blogs[3]; // AI article as featured
  const rest = blogs.filter(b => b.id !== featured.id);

  return (
    <div className="min-h-screen bg-[#0a0f1a] py-20 px-6">
      <Script id="blog-list-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-400 mb-4">Student Life • Tips • Guides</p>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-5 leading-none">
            Adumate <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">Blog</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-base leading-relaxed">
            Real guides for real Indian students — libraries, hostels, mess, AI tools, part-time jobs, and more.
          </p>
        </div>

        {/* Category filter tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {ALL_TAGS.map(tag => (
            <span key={tag} className={`px-4 py-2 rounded-xl text-xs font-black border cursor-pointer transition-all ${tag === "All" ? "bg-orange-500/20 text-orange-300 border-orange-500/30" : "bg-white/5 text-slate-400 border-white/10 hover:text-white hover:border-white/20"}`}>
              {tag}
            </span>
          ))}
        </div>

        {/* Featured Post */}
        <Link href={`/blog/${featured.slug}`} className="group block mb-12">
          <div className="relative rounded-3xl overflow-hidden border border-white/10 hover:border-orange-500/30 transition-all">
            <div className="relative h-72 md:h-96">
              <img src={featured.image} alt={featured.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-[#0a0f1a]/50 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex flex-wrap gap-3 mb-4">
                <span className="px-3 py-1 rounded-full bg-orange-500/90 text-white text-[10px] font-black uppercase tracking-widest">⭐ Featured</span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-slate-300 text-[10px] font-black uppercase">{featured.category}</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-white group-hover:text-orange-400 transition-colors mb-3 leading-tight">{featured.title}</h2>
              <p className="text-slate-400 text-sm line-clamp-2 mb-4 max-w-2xl">{featured.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Calendar size={12} />{featured.date}</span>
                <span className="flex items-center gap-1"><User size={12} />{featured.author}</span>
                <span className="flex items-center gap-1"><Clock size={12} />{featured.readTime}</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {rest.map((post) => (
            <div key={post.id} className="group bg-slate-900/50 border border-white/10 rounded-3xl overflow-hidden hover:border-orange-500/30 hover:-translate-y-1 transition-all duration-300 flex flex-col shadow-xl">
              <div className="relative h-48 overflow-hidden">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute top-4 left-4 bg-orange-500/90 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  {post.category}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-3 text-[10px] text-slate-500 mb-3 font-bold">
                  <span className="flex items-center gap-1"><Calendar size={10} />{post.date}</span>
                  <span className="flex items-center gap-1"><Clock size={10} />{post.readTime}</span>
                </div>

                <h3 className="text-lg font-black text-white mb-3 group-hover:text-orange-400 transition-colors leading-tight line-clamp-2">{post.title}</h3>
                <p className="text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed flex-1">{post.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {post.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-300 text-[9px] font-bold">{tag}</span>
                  ))}
                </div>

                <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-2 text-orange-400 font-black text-sm hover:gap-3 transition-all mt-auto">
                  Read More <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Trending hashtags section */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
          <p className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center justify-center gap-2"><Tag size={14} /> Trending on Adumate</p>
          <div className="flex flex-wrap justify-center gap-3">
            {["#StudentLife","#JEEPrep2026","#NEETPrep","#HostelLife","#IndiaStudents","#CollegeLife","#AIEducation","#StudyTips","#PartTimeJobs","#LibraryLife","#Adumate","#MessFood","#VidwanAI"].map(tag => (
              <span key={tag} className="px-4 py-2 rounded-xl bg-gradient-to-br from-orange-500/10 to-purple-500/10 border border-white/10 text-sm font-bold text-slate-300 hover:text-orange-400 hover:border-orange-500/30 transition-all cursor-pointer">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
