"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon, ExternalLink, ArrowLeft, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SearchImage } from "@/types";

interface ImagesViewProps {
  images: SearchImage[];
  onBack: () => void;
}

export function ImagesView({ images, onBack }: ImagesViewProps) {
  const [selectedImage, setSelectedImage] = useState<SearchImage | null>(null);

  if (images.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
        <ImageIcon className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-medium mb-2">No images found</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Try searching for something to see images here
        </p>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
            <ImageIcon className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Images</h2>
            <p className="text-sm text-muted-foreground">
              {images.length} images found
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((image, index) => (
          <ImageCard
            key={index}
            image={image}
            onClick={() => setSelectedImage(image)}
          />
        ))}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          onNext={() => {
            const currentIndex = images.findIndex((img) => img.url === selectedImage.url);
            const nextIndex = (currentIndex + 1) % images.length;
            setSelectedImage(images[nextIndex]);
          }}
          onPrev={() => {
            const currentIndex = images.findIndex((img) => img.url === selectedImage.url);
            const prevIndex = (currentIndex - 1 + images.length) % images.length;
            setSelectedImage(images[prevIndex]);
          }}
        />
      )}
    </div>
  );
}

interface ImageCardProps {
  image: SearchImage;
  onClick: () => void;
}

function ImageCard({ image, onClick }: ImageCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <button
      onClick={onClick}
      className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-muted border hover:border-primary/50 transition-all duration-200 hover:shadow-lg"
    >
      {!hasError ? (
        <>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
          <Image
            src={image.thumbnail || image.url}
            alt={image.title}
            fill
            className={cn(
              "object-cover transition-all duration-300",
              "group-hover:scale-105",
              isLoading && "opacity-0"
            )}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            unoptimized
          />
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <ImageIcon className="h-8 w-8" />
        </div>
      )}

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      {/* Image Info on Hover */}
      <div className="absolute bottom-0 left-0 right-0 p-3 text-white translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200">
        <p className="text-sm font-medium line-clamp-2">{image.title}</p>
        <p className="text-xs text-white/70 mt-1 line-clamp-1">{image.source}</p>
      </div>
    </button>
  );
}

interface ImageModalProps {
  image: SearchImage;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

function ImageModal({ image, onClose, onNext, onPrev }: ImageModalProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") onNext();
    if (e.key === "ArrowLeft") onPrev();
    if (e.key === "Escape") onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Navigation Arrows */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        <ArrowLeft className="h-6 w-6" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors rotate-180"
      >
        <ArrowLeft className="h-6 w-6" />
      </button>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Image Container */}
      <div
        className="relative max-w-5xl max-h-[85vh] w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-video bg-black/50 rounded-xl overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </div>
          )}
          <Image
            src={image.url}
            alt={image.title}
            fill
            className={cn(
              "object-contain transition-opacity",
              isLoading && "opacity-0"
            )}
            onLoad={() => setIsLoading(false)}
            unoptimized
          />
        </div>

        {/* Image Info Bar */}
        <div className="mt-4 flex items-center justify-between text-white">
          <div className="flex-1 min-w-0 mr-4">
            <h3 className="font-medium text-lg line-clamp-1">{image.title}</h3>
            <p className="text-sm text-white/60">{image.source}</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={image.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm"
            >
              <ExternalLink className="h-4 w-4" />
              Open Original
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

