import React, { useState, useEffect, useCallback } from "react";
import { MapPin, Clock, Phone, ExternalLink, X, Eye, ArrowLeft, Image as ImageIcon, Navigation } from "lucide-react";

interface Spot {
  id: string;
  name: string;
  description?: string;
  featured_image?: string;
  location?: string;
  opening_hours?: string;
  contact_details?: string;
  google_maps_link?: string;
  gallery_images?: string[];
  category?: string;
}

interface SpotsViewProps {
  data: Spot[];
}

export default function SpotsView({ data }: SpotsViewProps) {
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const spots = Array.isArray(data) ? data : [];

  // Extract available categories dynamically or provide defaults
  const categories = ["ALL", ...Array.from(new Set(spots.map(s => s.category).filter(Boolean) as string[]))];

  const filteredSpots = selectedCategory === "ALL" 
    ? spots 
    : spots.filter(s => s.category === selectedCategory);

  const handleClose = useCallback(() => {
    setSelectedSpot(null);
    setActiveImage(null);
  }, []);

  // Lock body scroll and listen for ESC key when modal is open
  useEffect(() => {
    if (!selectedSpot) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedSpot, handleClose]);

  // Set initial active image whenever a spot is selected
  useEffect(() => {
    if (selectedSpot) {
      setActiveImage(selectedSpot.featured_image || (selectedSpot.gallery_images && selectedSpot.gallery_images[0]) || null);
    }
  }, [selectedSpot]);

  return (
    <div className="space-y-8">
      {/* Category Filter Pills if categories exist */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20 scale-105"
                  : "bg-brand-surface text-brand-muted hover:text-brand-text hover:bg-white border border-brand-primary/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid of Tourist Spots */}
      {filteredSpots.length === 0 ? (
        <div className="civic-card p-12 text-center text-brand-muted font-medium">
          No tourist destinations available in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSpots.map((spot: Spot, idx: number) => (
            <div 
              key={`${spot.id}-${idx}`} 
              className="civic-card overflow-hidden group hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full border border-brand-primary/10"
            >
              <div className="aspect-[4/3] bg-brand-surface relative overflow-hidden">
                <img 
                  src={spot.featured_image || `https://picsum.photos/seed/${encodeURIComponent(spot.name)}/800/600`} 
                  alt={spot.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  referrerPolicy="no-referrer" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-80" />
                
                {spot.category && (
                  <span className="absolute top-4 left-4 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                    {spot.category}
                  </span>
                )}
              </div>

              <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
                <div>
                  <h3 className="text-xl font-black text-brand-text group-hover:text-brand-primary transition-colors font-display uppercase tracking-tight mb-2">
                    {String(spot.name)}
                  </h3>
                  
                  {spot.location && (
                    <div className="flex items-center gap-1.5 text-xs text-brand-muted font-bold mb-3">
                      <MapPin size={14} className="text-brand-primary shrink-0" />
                      <span className="truncate">{spot.location}</span>
                    </div>
                  )}

                  <p className="text-brand-muted text-sm font-medium leading-relaxed line-clamp-3">
                    {String(spot?.description || "Explore the scenic beauty and cultural charm of this municipal tourist landmark in Talibon, Bohol.")}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <button
                    onClick={() => setSelectedSpot(spot)}
                    className="flex items-center gap-2 text-xs font-black text-brand-primary uppercase tracking-wider hover:gap-3 transition-all cursor-pointer"
                  >
                    <Eye size={16} />
                    Explore Details
                  </button>

                  {spot.google_maps_link && (
                    <a
                      href={spot.google_maps_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-brand-muted hover:text-brand-primary hover:bg-brand-bg rounded-full transition-colors"
                      title="View on Google Maps"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* High-Priority Tourist Spot Detail Modal Overlay (z-[100]) */}
      {selectedSpot && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 md:p-8 overflow-y-auto animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="spot-detail-title"
        >
          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-white/20 relative my-auto">
            {/* Sticky Header with Back and Close Actions */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 shrink-0">
              <button
                onClick={handleClose}
                className="inline-flex items-center gap-2 text-xs font-black text-brand-muted hover:text-brand-primary uppercase tracking-widest transition-colors py-1 px-3 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <ArrowLeft size={16} />
                <span>Back to Tourist Spots</span>
              </button>

              <div className="flex items-center gap-2">
                {selectedSpot.category && (
                  <span className="hidden sm:inline-block px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] font-black uppercase tracking-widest">
                    {selectedSpot.category}
                  </span>
                )}
                <button
                  onClick={handleClose}
                  className="p-2.5 bg-slate-100 text-slate-600 hover:bg-brand-primary hover:text-white rounded-full transition-all cursor-pointer shrink-0"
                  aria-label="Close detail modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
              {/* Featured / Active Image Display */}
              <div className="aspect-video w-full rounded-2xl sm:rounded-[2rem] overflow-hidden bg-slate-100 relative shadow-inner group">
                <img
                  src={activeImage || selectedSpot.featured_image || `https://picsum.photos/seed/${encodeURIComponent(selectedSpot.name)}/1000/600`}
                  alt={selectedSpot.name}
                  className="w-full h-full object-cover transition-all duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60" />
                
                {selectedSpot.category && (
                  <span className="absolute top-4 left-4 sm:hidden bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                    {selectedSpot.category}
                  </span>
                )}
              </div>

              {/* Title & Address */}
              <div className="space-y-2">
                <h2 id="spot-detail-title" className="text-2xl sm:text-3xl font-black text-brand-text font-display uppercase tracking-tight leading-snug">
                  {selectedSpot.name}
                </h2>

                {selectedSpot.location && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-brand-primary font-bold">
                    <MapPin size={16} className="shrink-0" />
                    <span>{selectedSpot.location}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="prose max-w-none">
                <p className="text-brand-text text-sm sm:text-base leading-relaxed font-medium whitespace-pre-line">
                  {selectedSpot.description || "A premier tourist destination located in Talibon, Bohol, welcoming visitors with scenic views and Boholano hospitality."}
                </p>
              </div>

              {/* Operating Hours & Contact Info Grid */}
              {(selectedSpot.opening_hours || selectedSpot.contact_details) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {selectedSpot.opening_hours && (
                    <div className="flex items-center gap-3.5 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                      <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary shrink-0">
                        <Clock size={18} />
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-wider text-brand-muted">Operating Hours</div>
                        <div className="text-xs font-bold text-brand-text mt-0.5">{selectedSpot.opening_hours}</div>
                      </div>
                    </div>
                  )}

                  {selectedSpot.contact_details && (
                    <div className="flex items-center gap-3.5 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                      <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary shrink-0">
                        <Phone size={18} />
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-wider text-brand-muted">Contact Details</div>
                        <div className="text-xs font-bold text-brand-text mt-0.5">{selectedSpot.contact_details}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Gallery Images Section */}
              {selectedSpot.gallery_images && selectedSpot.gallery_images.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-muted">
                    <ImageIcon size={14} className="text-brand-primary" />
                    <span>Photo Gallery (Click to preview)</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {/* Include featured image as first thumbnail if available */}
                    {selectedSpot.featured_image && (
                      <button
                        onClick={() => setActiveImage(selectedSpot.featured_image!)}
                        className={`aspect-square rounded-xl overflow-hidden bg-slate-100 border-2 transition-all cursor-pointer relative group ${
                          activeImage === selectedSpot.featured_image ? "border-brand-primary ring-2 ring-brand-primary/20 scale-95" : "border-transparent opacity-80 hover:opacity-100"
                        }`}
                      >
                        <img src={selectedSpot.featured_image} alt="Featured" className="w-full h-full object-cover" />
                      </button>
                    )}
                    {selectedSpot.gallery_images.map((imgUrl, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(imgUrl)}
                        className={`aspect-square rounded-xl overflow-hidden bg-slate-100 border-2 transition-all cursor-pointer relative group ${
                          activeImage === imgUrl ? "border-brand-primary ring-2 ring-brand-primary/20 scale-95" : "border-transparent opacity-80 hover:opacity-100"
                        }`}
                      >
                        <img src={imgUrl} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Google Maps / Directions Action */}
              {selectedSpot.google_maps_link && (
                <div className="pt-4 border-t border-slate-100">
                  <a
                    href={selectedSpot.google_maps_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-brand-primary/20 hover:shadow-xl active:scale-[0.99]"
                  >
                    <Navigation size={18} />
                    <span>Get Directions on Google Maps</span>
                    <ExternalLink size={14} className="opacity-70" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

