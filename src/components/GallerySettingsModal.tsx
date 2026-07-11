import React, { useState, useRef } from "react";
import { X, Upload, Trash2, Image as ImageIcon } from "lucide-react";
import { UserProfile } from "../types";
import { supabase } from "../lib/supabase";

interface GallerySettingsModalProps {
  user: UserProfile;
  onUpdateUser: (updates: Partial<UserProfile>) => void;
  onClose: () => void;
}

export default function GallerySettingsModal({ user, onUpdateUser, onClose }: GallerySettingsModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const galleryImages = user.gallery || [];
  const maxImages = 10;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed.");
      return;
    }

    if (galleryImages.length >= maxImages) {
      alert(`You can only upload up to ${maxImages} images.`);
      return;
    }

    setIsUploading(true);
    try {
      // Direct base64 conversion instead of using storage bucket
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            if (file.type === 'image/gif') {
              resolve(reader.result);
              return;
            }
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 600;
              const MAX_HEIGHT = 600;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
                }
              }
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.5));
            };
            img.onerror = () => reject(new Error("Failed to load image"));
            img.src = reader.result;
          } else {
            reject(new Error("Failed to read file"));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });

      const updatedGallery = [...galleryImages, base64Data];

      const { error } = await supabase
        .from("profiles")
        .update({ gallery: updatedGallery })
        .eq("id", user.id);

      if (error) throw error;
      onUpdateUser({ gallery: updatedGallery });
    } catch (err) {
      console.error("Gallery upload error:", err);
      alert("Failed to upload image.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (indexToDelete: number) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;
    
    const updatedGallery = galleryImages.filter((_, i) => i !== indexToDelete);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ gallery: updatedGallery })
        .eq("id", user.id);

      if (error) throw error;
      onUpdateUser({ gallery: updatedGallery });
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete image.");
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-[#0d0a1c] border border-purple-900/40 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-[#16122a] border-b border-purple-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <ImageIcon className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-widest">My Gallery</h2>
              <p className="text-[10px] text-purple-400/60 font-bold">{galleryImages.length} / {maxImages} Photos</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto custom-scrollbar flex-1 bg-[#090714]">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {galleryImages.map((imgUrl, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden group bg-[#16122a] border border-purple-900/20">
                <img src={imgUrl} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handleDelete(i)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-full transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}

            {galleryImages.length < maxImages && (
              <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-purple-900/40 hover:border-purple-500/60 bg-[#16122a]/50 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-[#16122a]"
              >
                {isUploading ? (
                  <span className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-purple-400 mb-2" />
                    <span className="text-[10px] font-bold text-purple-300 uppercase">Upload</span>
                  </>
                )}
              </div>
            )}
          </div>
          
          {galleryImages.length === 0 && (
            <div className="text-center py-8">
              <ImageIcon className="w-12 h-12 text-purple-900/40 mx-auto mb-3" />
              <p className="text-sm text-purple-300/50 font-medium">Your gallery is empty.</p>
              <p className="text-xs text-purple-400/40 mt-1">Upload some photos or GIFs to show on your profile!</p>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
