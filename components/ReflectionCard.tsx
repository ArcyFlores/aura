
import React, { useState } from 'react';

interface ReflectionCardProps {
  imageUrl: string | null;
  isLoading: boolean;
  onDownload: () => void;
}

const ReflectionCard: React.FC<ReflectionCardProps> = ({ imageUrl, isLoading, onDownload }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="relative group w-full max-w-sm mx-auto">
      <div className="bg-white p-3 rounded-[2rem] border border-blue-100 shadow-xl pixel-glow transition-all duration-700 hover:shadow-2xl hover:border-blue-200">
        <div className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-blue-50 flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-300 rounded-full animate-spin"></div>
              <p className="text-blue-300 text-sm animate-pulse tracking-wide font-medium">Whispering to the stars...</p>
            </div>
          ) : imageUrl ? (
            <div className={`relative w-full h-full transition-opacity duration-1000 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}>
              <img 
                src={imageUrl} 
                alt="Daily Reflection Landscape" 
                className={`w-full h-full object-cover transition-transform duration-1000 ${imageLoaded ? 'scale-100' : 'scale-110'}`}
                onLoad={() => setImageLoaded(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 to-transparent pointer-events-none"></div>
              <button 
                onClick={onDownload}
                className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg transition-all duration-300 hover:bg-white hover:scale-110 hover:shadow-blue-200/50 hover:shadow-2xl active:scale-95 group/btn"
                title="Save this moment"
              >
                <i className="fa-solid fa-download text-blue-400 group-hover/btn:text-blue-500 transition-colors"></i>
              </button>
            </div>
          ) : (
            <div className="text-blue-200 text-center px-6">
              <i className="fa-solid fa-cloud-moon text-4xl mb-2 animate-pulse"></i>
              <p className="text-sm">The canvas is waiting...</p>
            </div>
          )}
        </div>
        <div className="mt-4 text-center pb-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-blue-300 font-bold">
            Daily Reflection
          </p>
          <p className="text-sm text-blue-400/80 font-medium mt-1">
            {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReflectionCard;
