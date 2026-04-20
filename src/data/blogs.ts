export interface BlogPost {
  id: string;
  title: string;
  description: string;
  content: string;
  date: string;
  author: string;
  category: string;
  image: string;
  slug: string;
}

export const blogs: BlogPost[] = [
  {
    id: "1",
    title: "How to Find the Perfect Study Library Near You",
    description: "Finding a quiet place to study is crucial for exam success. Here is how you can find the best library using Adumate.",
    content: "Content about finding libraries...",
    date: "April 20, 2026",
    author: "Ayush Kaushik",
    category: "Study Tips",
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=800&auto=format&fit=crop",
    slug: "perfect-study-library",
  },
  {
    id: "2",
    title: "Hostel vs PG: Which is Better for Students in 2026?",
    description: "Choosing between a hostel and a PG can be tough. We break down the costs, facilities, and social life to help you decide.",
    content: "Content about hostel vs pg...",
    date: "April 18, 2026",
    author: "Adumate Team",
    category: "Accommodation",
    image: "https://images.unsplash.com/photo-1555854817-5b2260d15027?q=80&w=800&auto=format&fit=crop",
    slug: "hostel-vs-pg-guide",
  },
  {
    id: "3",
    title: "5 Healthy Mess Habits for Every Student",
    description: "Eating healthy while living away from home is a challenge. Learn how to manage your mess meals effectively.",
    content: "Content about healthy eating...",
    date: "April 15, 2026",
    author: "Adumate Team",
    category: "Lifestyle",
    image: "https://images.unsplash.com/photo-1547573854-74d2a7ad4484?q=80&w=800&auto=format&fit=crop",
    slug: "healthy-mess-habits",
  }
];
