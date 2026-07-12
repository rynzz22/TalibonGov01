import React from "react";

interface HymnData {
  title?: string;
  author?: string;
  imageUrl?: string;
  lyrics?: string;
}

interface HymnViewProps {
  data: HymnData;
}

export default function HymnView({ data }: HymnViewProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black text-brand-text font-display uppercase tracking-tight">
          {data.title || "Talibon Hymn"}
        </h2>
        <p className="text-sm font-black text-brand-primary uppercase tracking-[0.3em]">
          BY: {data.author || "Norman Ingking"}
        </p>
      </div>
      
      {data.imageUrl ? (
        <div className="bg-white rounded-3xl border-4 border-white shadow-2xl p-8 overflow-hidden">
          <img 
            src={data.imageUrl} 
            alt="Talibon Hymn Lyrics" 
            className="w-full h-auto rounded-xl"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : (
        <div className="civic-card p-12 bg-white text-center">
          <div className="prose prose-blue max-w-none mx-auto">
            {data.lyrics?.split('\n\n').map((paragraph: string, idx: number) => (
              <div key={idx} className="mb-8 last:mb-0">
                {paragraph.split('\n').map((line: string, lIdx: number) => (
                  <p key={lIdx} className="text-xl text-brand-text font-bold leading-tight mb-1">
                    {line}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
