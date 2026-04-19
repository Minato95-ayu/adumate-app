import { NextRequest, NextResponse } from "next/server";

const EDU_TOPICS = [
  "Newton's Laws of Motion","JEE Maths","JEE Physics","JEE Chemistry",
  "NEET Biology","NEET Chemistry","Class 10 Science","Class 10 Maths",
  "Class 12 Physics","Class 12 Chemistry","Class 12 Biology","Class 12 Maths",
  "English Grammar Tenses","Indian History","Mughal Empire","Freedom Struggle",
  "Python Basics","JavaScript Arrays","React Hooks","Data Structures",
  "UPSC Indian Polity","UPSC Geography","UPSC History","SSC GK",
  "Logical Reasoning","Quantitative Aptitude","Percentage Problems",
  "Trigonometry","Calculus Derivatives","Algebra Equations",
  "Atoms and Molecules","Chemical Bonding","Organic Chemistry",
  "Electricity and Magnetism","Optics","Thermodynamics","Waves",
  "Cell Biology","Genetics","Human Anatomy","Photosynthesis",
  "World War 2","Ancient India","Medieval India","Indian Constitution",
  "Economics Micro","Economics Macro","Business Studies","Accountancy",
];

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get("q")?.toLowerCase() || "";
  if (!q || q.length < 2) return NextResponse.json({ suggestions: [] });

  const matches = EDU_TOPICS.filter(t => t.toLowerCase().includes(q)).slice(0, 6);

  // Also try DuckDuckGo for broader suggestions
  try {
    const r = await fetch(`https://duckduckgo.com/ac/?q=${encodeURIComponent(q)}&type=list`, {
      headers: { "User-Agent": "Adumate/1.0" }
    });
    const d = await r.json();
    const ddg: string[] = (Array.isArray(d) && d[1]) ? d[1].slice(0, 4) : [];
    const combined = [...new Set([...matches, ...ddg])].slice(0, 8);
    return NextResponse.json({ suggestions: combined });
  } catch {
    return NextResponse.json({ suggestions: matches });
  }
}
