import React, { useState, useRef, useEffect } from 'react';

const BeforeAfterSlider = () => {
  const [isResizing, setIsResizing] = useState(false);
  const [position, setPosition] = useState(50);
  const containerRef = useRef(null);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    
    setPosition(Math.max(0, Math.min(percentage, 100)));
  };

  // Mouse event handlers
  const handleMouseDown = () => setIsResizing(true);
  const handleMouseUp = () => setIsResizing(false);
  const handleMouseMove = (e) => {
    if (!isResizing) return;
    handleMove(e.clientX);
  };

  // Touch event handlers
  const handleTouchStart = () => setIsResizing(true);
  const handleTouchEnd = () => setIsResizing(false);
  const handleTouchMove = (e) => {
    if (!isResizing) return;
    handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    // Add global mouse/touch event listeners
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isResizing]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-square select-none touch-none"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Before Image */}
      <div className="absolute inset-0">
        <img
          src="/images/before.png"
          alt="Before scheduling"
          className="w-full h-full object-cover"
        />
      </div>

      {/* After Image (clipped) */}
      <div 
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <img
          src="/images/after.png"
          alt="After scheduling"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize select-none touch-none"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h8M8 12h8M8 17h8" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterSlider; 