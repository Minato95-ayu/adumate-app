export interface Provider {
  id: string;
  name: string;
  type: "library" | "hostel" | "mess" | "tutor" | "job" | "room";
  lat: number;
  lng: number;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  address: string;
  amenities: string[];
  images: string[];
  phone?: string;
  seats?: number;
}

export interface AIResponse {
  text: string;
  provider: string;
  error?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: "student" | "partner" | "admin";
  examTarget?: string;
  createdAt: string;
}
