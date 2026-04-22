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
    content: "Maintaining a healthy diet while living in a hostel or PG is one of the biggest challenges for students. Most mess food is either too oily or lacks variety. However, with a few smart habits, you can ensure you get the nutrition you need.\n\nFirst, always carry fresh fruits. They are the easiest way to add fiber and vitamins to your diet. Second, stay hydrated. Drink at least 3-4 liters of water daily. Third, avoid excessive late-night snacking on junk food. Instead, keep nuts or makhana handy.\n\nAt Adumate, we partner with verified mess providers who prioritize hygiene and nutrition. Check out our Mess Finder to find the best food options near you.",
    date: "April 15, 2026",
    author: "Adumate Team",
    category: "Lifestyle",
    image: "https://images.unsplash.com/photo-1547573854-74d2a7ad4484?q=80&w=800&auto=format&fit=crop",
    slug: "healthy-mess-habits",
  },
  {
    id: "4",
    title: "Mastering Your Exams with AI: A Modern Student's Guide",
    description: "Discover how AI tools like Vidwan can transform your study routine and help you score better in competitive exams like JEE and NEET.",
    content: "The era of traditional rote learning is over. Today, smart students are using AI to gain a competitive edge. Tools like Vidwan AI are not just chatbots; they are personalized mentors that understand your strengths and weaknesses.\n\nOne of the best ways to use AI is for active recall. Instead of just reading notes, ask the AI to quiz you. Another technique is the 'Feynman Technique'—explain a complex concept to the AI and ask it to find gaps in your explanation.\n\nOur platform's Vidwan AI is trained on thousands of educational resources to provide you with the most accurate and helpful guidance. Whether you are stuck on a physics problem or need a summary of a history chapter, Vidwan is here to help.",
    date: "April 22, 2026",
    author: "Ayush Kaushik",
    category: "AI & Education",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop",
    slug: "mastering-exams-with-ai",
  }
];
