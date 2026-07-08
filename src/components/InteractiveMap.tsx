import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'motion/react';
import { MapPin, Navigation, Info, ExternalLink } from 'lucide-react';

// Fix for default marker icons in Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const customIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconRetinaUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

interface Location {
  id: number;
  name: string;
  lat: number;
  lng: number;
  description: string;
  category: 'Tourism' | 'Government' | 'Health' | 'Safety';
  image?: string;
}

const TALIBON_LOCATIONS: Location[] = [
  {
    id: 1,
    name: "Talibon Municipal Hall",
    lat: 10.1506,
    lng: 124.3323,
    description: "The seat of government for the Municipality of Talibon.",
    category: 'Government',
    image: "https://picsum.photos/seed/hall/400/250"
  },
  {
    id: 2,
    name: "Blessed Trinity Cathedral",
    lat: 10.1512,
    lng: 124.3315,
    description: "A historic and beautiful cathedral in the heart of Talibon.",
    category: 'Tourism',
    image: "https://picsum.photos/seed/cathedral/400/250"
  },
  {
    id: 3,
    name: "Pres. Carlos P. Garcia Memorial Hospital",
    lat: 10.148,
    lng: 124.335,
    description: "The primary government hospital serving the municipality.",
    category: 'Health',
    image: "https://picsum.photos/seed/hospital/400/250"
  },
  {
    id: 4,
    name: "Talibon Port",
    lat: 10.154,
    lng: 124.330,
    description: "Gate way to the nearby islands and mainland Cebu.",
    category: 'Government',
    image: "https://picsum.photos/seed/port/400/250"
  },
  {
    id: 5,
    name: "Danajon Bank (Central)",
    lat: 10.200,
    lng: 124.350,
    description: "One of the only 6 double barrier reefs in the world.",
    category: 'Tourism',
    image: "https://picsum.photos/seed/reef/400/250"
  }
];

const InteractiveMap: React.FC = () => {
  const center: [number, number] = [10.1506, 124.3323];

  return (
    <div className="w-full h-[600px] rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl relative z-10 group">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {TALIBON_LOCATIONS.map((loc) => (
          <Marker 
            key={loc.id} 
            position={[loc.lat, loc.lng]}
            icon={customIcon}
          >
            <Popup className="custom-popup">
              <div className="p-2 min-w-[200px]">
                {loc.image && (
                  <img 
                    src={loc.image} 
                    alt={loc.name} 
                    className="w-full h-32 object-cover rounded-xl mb-3"
                    referrerPolicy="no-referrer"
                  />
                )}
                <span className="text-[8px] font-black text-brand-primary uppercase tracking-widest mb-1 block">
                  {loc.category}
                </span>
                <h3 className="text-sm font-black text-brand-text uppercase tracking-tight mb-2 leading-none">
                  {loc.name}
                </h3>
                <p className="text-[10px] text-brand-muted leading-relaxed mb-4">
                  {loc.description}
                </p>
                <div className="flex gap-2">
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-brand-primary text-white text-[8px] font-black rounded-lg text-center flex items-center justify-center gap-1 uppercase tracking-widest"
                  >
                    <Navigation size={10} /> Directions
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-6 left-6 z-[1000] bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-gray-100 shadow-xl pointer-events-auto">
        <h4 className="text-[10px] font-black text-brand-text uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
          <MapPin size={14} className="text-brand-primary" /> Key Locations
        </h4>
        <div className="space-y-3">
          {['Tourism', 'Government', 'Health'].map((cat) => (
            <div key={cat} className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                cat === 'Tourism' ? 'bg-brand-primary' : 
                cat === 'Government' ? 'bg-brand-secondary' : 'bg-red-500'
              }`} />
              <span className="text-[9px] font-bold text-brand-muted uppercase tracking-widest">{cat}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;
