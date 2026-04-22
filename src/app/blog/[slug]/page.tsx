import { blogs } from "@/data/blogs";
import { notFound } from "next/navigation";
import { Calendar, User, ArrowLeft, Clock, Share2, Bookmark } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = blogs.find((b) => b.slug === params.slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      images: [{ url: post.image }],
    },
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = blogs.find((b) => b.slug === params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      {/* Hero Section */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <img 
          src={post.image} 
          alt={post.title} 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-transparent to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 max-w-7xl mx-auto w-full">
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-primary font-bold mb-8 hover:-translate-x-2 transition-transform"
          >
            <ArrowLeft size={20}/> Back to Blog
          </Link>
          
          <div className="flex flex-wrap items-center gap-4 text-xs font-black uppercase tracking-widest text-slate-400 mb-6">
            <span className="bg-primary/20 text-primary px-3 py-1 rounded-full border border-primary/30">
              {post.category}
            </span>
            <span className="flex items-center gap-2"><Calendar size={14}/> {post.date}</span>
            <span className="flex items-center gap-2"><User size={14}/> {post.author}</span>
            <span className="flex items-center gap-2"><Clock size={14}/> 5 min read</span>
          </div>
          
          <h1 className="text-4xl md:text-7xl font-black mb-8 leading-tight max-w-4xl">
            {post.title}
          </h1>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-8 md:px-16 py-16 grid grid-cols-1 lg:grid-cols-4 gap-16">
        <div className="lg:col-span-3">
          <div className="prose prose-invert prose-lg max-w-none">
            <p className="text-xl text-slate-300 font-medium leading-relaxed mb-8 italic border-l-4 border-primary pl-6">
              {post.description}
            </p>
            
            <div className="text-slate-300 leading-loose space-y-6 text-lg">
              {/* Splitting content by newlines to render paragraphs */}
              {post.content.split('\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
              
              <p>
                Student life in India is evolving rapidly. Whether you are a JEE aspirant in Kota, a DU student in Delhi, or a techie in Bangalore, the challenges remain similar: finding the right environment to grow. At Adumate, we are committed to making this journey smoother for you.
              </p>

              <h2 className="text-2xl font-black text-white mt-12 mb-6 uppercase tracking-tight">
                Why this matters?
              </h2>
              <p>
                Access to quality resources shouldn't be a luxury. From affordable mess meals to quiet libraries and safe hostels, every detail contributes to your academic success. Our platform ensures you spend less time searching and more time achieving.
              </p>

              <blockquote className="bg-slate-900/50 border border-white/10 p-8 rounded-3xl my-12">
                <p className="text-xl font-bold text-white italic mb-4">
                  "Education is the most powerful weapon which you can use to change the world."
                </p>
                <cite className="text-primary font-black">— Nelson Mandela</cite>
              </blockquote>

              <p>
                Stay tuned for more updates, guides, and tips specifically curated for the Indian student community. Don't forget to check out our AI-powered study tools to boost your preparation.
              </p>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 bg-slate-900 border border-white/10 px-4 py-2 rounded-xl hover:border-primary/50 transition-colors">
                <Share2 size={18}/> Share
              </button>
              <button className="flex items-center gap-2 bg-slate-900 border border-white/10 px-4 py-2 rounded-xl hover:border-primary/50 transition-colors">
                <Bookmark size={18}/> Save
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-12">
          <div className="bg-slate-900/30 border border-white/10 p-8 rounded-[2rem]">
            <h4 className="text-lg font-black text-white mb-6">Recent Posts</h4>
            <div className="space-y-6">
              {blogs.filter(b => b.slug !== post.slug).slice(0, 3).map(b => (
                <Link key={b.id} href={`/blog/${b.slug}`} className="group block">
                  <p className="text-[10px] font-black text-primary uppercase mb-1">{b.category}</p>
                  <p className="text-sm font-bold text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {b.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary to-orange-600 p-8 rounded-[2rem] text-white">
            <h4 className="text-xl font-black mb-4">Join Adumate</h4>
            <p className="text-sm opacity-90 mb-6">
              Get the latest updates and student resources directly in your inbox.
            </p>
            <input 
              type="email" 
              placeholder="your@email.com" 
              className="w-full bg-white/20 border border-white/20 rounded-xl px-4 py-3 text-sm placeholder:text-white/60 focus:outline-none focus:ring-2 ring-white/50 mb-4"
            />
            <button className="w-full bg-white text-primary font-black py-3 rounded-xl hover:bg-slate-100 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
