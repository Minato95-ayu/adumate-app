"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import LibraryDashboard from "@/components/partner/LibraryDashboard";
import HostelDashboard from "@/components/partner/HostelDashboard";
import MessDashboard from "@/components/partner/MessDashboard";
import RoomDashboard from "@/components/partner/RoomDashboard";
import TutorDashboard from "@/components/partner/TutorDashboard";
import JobsDashboard from "@/components/partner/JobsDashboard";

function DashboardInner() {
  const params = useSearchParams();
  const type = params.get("type") || "library";
  const map: Record<string, React.ReactNode> = {
    library: <LibraryDashboard />,
    hostel:  <HostelDashboard />,
    mess:    <MessDashboard />,
    room:    <RoomDashboard />,
    tutor:   <TutorDashboard />,
    jobs:    <JobsDashboard />,
  };
  return <>{map[type] ?? <LibraryDashboard />}</>;
}

export default function PartnerDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050a14] flex items-center justify-center text-white text-sm">Loading dashboard...</div>}>
      <DashboardInner />
    </Suspense>
  );
}
