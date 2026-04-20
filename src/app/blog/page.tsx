import { blogs } from "@/data/blogs";
import Link from "next/link";
import { Calendar, User, ArrowRight } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Adumate Blog - Student Life Tips & Guides",
  description: "Read the latest tips on finding hostels, libraries, and managing student life in India. Built for students, by students.",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1a] py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
            Adumate <span className="text-primary">Blog</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Insights, guides, and tips to help you navigate student life with ease.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((post) => (
            <div key={post.id} className="group bg-slate-900/50 border border-white/10 rounded-[2rem] overflow-hidden hover:border-primary/50 transition-all flex flex-col shadow-2xl">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  {post.category}
                </div>
              </div>
              
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-4 text-[10px] text-slate-500 mb-4 font-bold uppercase tracking-tighter">
                  <span className="flex items-center gap-1"><Calendar size={12}/> {post.date}</span>
                  <span className="flex items-center gap-1"><User size={12}/> {post.author}</span>
                </div>
                
                <h3 className="text-xl font-black text-white mb-4 group-hover:text-primary transition-colors leading-tight">
                  {post.title}
                </h3>
                
                <p className="text-slate-400 text-sm mb-8 line-clamp-3 leading-relaxed">
                  {post.description}
                </p>
                
                <div className="mt-auto">
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-2 text-primary font-black text-sm hover:gap-3 transition-all"
                  >
                    Read More <ArrowRight size={16}/>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
