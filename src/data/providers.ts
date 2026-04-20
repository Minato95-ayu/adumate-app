export interface Provider {
  id: string;
  name: string;
  subject: string;
  lat: number;
  lng: number;
  photo: string;
  rating: number;
  social: {
    youtube?: string;
    instagram?: string;
    whatsapp: string;
  };
  fees: string;
  address?: string;
}

export const providers: Provider[] = [
  {
    id: "1",
    name: "Rahul Sharma",
    subject: "Physics",
    lat: 28.6139,
    lng: 77.2090,
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
    rating: 4.8,
    social: {
      youtube: "https://youtube.com/@rahulsir",
      instagram: "rahulsir",
      whatsapp: "919876543210"
    },
    fees: "500/hour",
    address: "Connaught Place, Delhi"
  },
  {
    id: "2",
    name: "Priya Verma",
    subject: "Mathematics",
    lat: 28.6250,
    lng: 77.2100,
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    rating: 4.9,
    social: {
      youtube: "https://youtube.com/@priyamaths",
      instagram: "priya_verma",
      whatsapp: "919876543211"
    },
    fees: "600/hour",
    address: "New Delhi"
  },
  {
    id: "3",
    name: "Amit Singh",
    subject: "Chemistry",
    lat: 28.6100,
    lng: 77.2300,
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit",
    rating: 4.5,
    social: {
      youtube: "https://youtube.com/@amitchem",
      instagram: "amit_singh",
      whatsapp: "919876543212"
    },
    fees: "450/hour",
    address: "Janpath, Delhi"
  }
];
