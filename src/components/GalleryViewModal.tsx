import React, { useState } from "react";
import { X, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { UserProfile } from "../types";

interface GalleryViewModalProps {
  user: UserProfile;
  onClose: () => void;
}

export default function GalleryViewModal({ user, onClose }: GalleryViewModalProps) {
  const images = user.gallery || [];
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-4xl h-full max-h-[90vh] flex flex-col relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-10 p-3 bg-black/50 text-white hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {images.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <ImageIcon className="w-16 h-16 text-purple-900/40 mb-4" />
            <p className="text-xl font-bold text-white mb-2">Empty Gallery</p>
            <p className="text-purple-300/50 text-sm">This user hasn't uploaded any photos yet.</p>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center relative">
            {images.length > 1 && (
              <button 
                onClick={handlePrev}
                className="absolute left-4 z-10 p-3 bg-black/50 text-white hover:bg-white/20 rounded-full transition-colors"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}

            <img 
              src={images[currentIndex]} 
              alt={`Gallery image ${currentIndex + 1}`} 
              className="max-w-full max-h-full object-contain drop-shadow-2xl"
            />

            {images.length > 1 && (
              <button 
                onClick={handleNext}
                className="absolute right-4 z-10 p-3 bg-black/50 text-white hover:bg-white/20 rounded-full transition-colors"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 rounded-full text-white text-xs font-bold tracking-widest uppercase">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
