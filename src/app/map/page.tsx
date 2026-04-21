import { Metadata } from "next";
import MapClient from "./MapClient";

export const metadata: Metadata = {
  title: "Find Libraries, Hostels & PGs Near You | Adumate Map",
  description: "Use the Adumate Map to find verified student services near you. Search for libraries, mess facilities, hostels, PGs, and tutors across India.",
  keywords: [
    "student map india",
    "find library near me",
    "hostel map",
    "PG locator",
    "student services map",
    "adumate map"
  ],
};

export default function Page() {
  return <MapClient />;
}
