import Image from "next/image";
import { MapPin, Users, IndianRupee } from "lucide-react";

interface ServiceCardProps {
  type: string;
  name: string;
  description: string;
  price: number;
  location: string;
  image?: string;
  seats?: number;
  onJoin?: () => void;
}

export default function ServiceCard({
  type,
  name,
  description,
  price,
  location,
  image = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
  seats,
  onJoin
}: ServiceCardProps) {
  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-lg border border-white/5 hover:border-primary/30 transition-all duration-300 group flex flex-col hover:-translate-y-1 hover:shadow-primary/10">
      <div className="relative h-48 w-full overflow-hidden">
        <Image 
          src={image} 
          alt={name} 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-md">
          {type}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-1">{name}</h3>
        <p className="text-muted text-sm line-clamp-2 mb-4">{description}</p>
        
        <div className="flex items-center gap-2 text-sm text-muted mb-2">
          <MapPin size={16} className="text-primary/70" />
          <span className="truncate">{location}</span>
        </div>
        
        {seats !== undefined && (
          <div className="flex items-center gap-2 text-sm text-muted mb-4">
            <Users size={16} className="text-primary/70" />
            <span>{seats} Seats Available</span>
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center text-lg font-bold text-foreground">
              <IndianRupee size={16} />
              <span>{price}</span>
              <span className="text-xs text-muted ml-1 font-normal">/mo</span>
            </div>
            <span className="text-[10px] text-muted-foreground">+ ₹19 platform fee</span>
          </div>
          <button 
            onClick={onJoin}
            className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            Join Now
          </button>
        </div>
      </div>
    </div>
  );
}
