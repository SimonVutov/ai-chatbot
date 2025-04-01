'use client';

import { useState, useRef, ReactNode } from 'react';

interface HoverPreviewProps {
  children: ReactNode;
  content: string;
}

export default function HoverPreview({ children, content }: HoverPreviewProps) {
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }
    previewTimeoutRef.current = setTimeout(() => {
      setShowPreview(true);
    }, 500); // Delay before showing preview
  };

  const handleMouseLeave = () => {
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }
    previewTimeoutRef.current = setTimeout(() => {
      setShowPreview(false);
    }, 300); // Slight delay before hiding preview
  };

  return (
    <div 
      className="relative inline-block w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {showPreview && content && (
        <div 
          ref={previewRef}
          className="absolute z-50 bg-white dark:bg-gray-800 shadow-lg border rounded-md p-3 max-w-md w-full max-h-56 overflow-y-auto"
          style={{ top: 'calc(100% + 5px)', left: '50%', transform: 'translateX(-50%)' }}
        >
          <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-6">
            {content}
          </div>
        </div>
      )}
    </div>
  );
} 