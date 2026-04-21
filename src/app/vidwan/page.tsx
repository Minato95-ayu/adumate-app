import VidwanChat from "@/components/VidwanChat";

export const metadata = {
  title: "Vidwan AI | Adumate",
  description: "Chat with Vidwan AI, the scholarly mind of Adumate.",
};

export default function VidwanPage() {
  return (
    <main className="min-h-screen bg-[#0a0f1a]">
      <VidwanChat />
    </main>
  );
}
