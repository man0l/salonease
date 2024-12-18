import React, { useRef, useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const CategoryNav = ({ categories, onCategorySelect }) => {
  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(
    categories.length > 0 ? categories[0].id : null
  );
  const [showNavButtons, setShowNavButtons] = useState(false);

  useEffect(() => {
    if (scrollContainerRef.current && categories.length > 0) {
      const selectedButton = scrollContainerRef.current.querySelector(
        `button[data-id="${selectedCategory}"]`
      );
      if (selectedButton) {
        const offset = selectedButton.offsetLeft - scrollContainerRef.current.offsetWidth / 2 + selectedButton.offsetWidth / 2;
        scrollContainerRef.current.scrollLeft = offset;
      }
    }
  }, [selectedCategory, categories]);

  useEffect(() => {
    const checkForOverflow = () => {
      if (scrollContainerRef.current) {
        const hasOverflow = scrollContainerRef.current.scrollWidth > scrollContainerRef.current.clientWidth;
        setShowNavButtons(hasOverflow);
      }
    };

    checkForOverflow();

    window.addEventListener('resize', checkForOverflow);
    return () => window.removeEventListener('resize', checkForOverflow);
  }, [categories]);

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll multiplier
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'next' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    onCategorySelect?.(categoryId);
  };

  return (
    <div className="relative flex items-center justify-start">
      <div 
        ref={scrollContainerRef}
        className="flex space-x-2 overflow-x-auto py-2 px-4 scrollbar-hide"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {categories.map((category) => (
          <button
            key={category.id}
            data-id={category.id}
            className={`${
              selectedCategory === category.id 
                ? 'bg-primary-600 text-white hover:bg-primary-700' 
                : 'bg-muted text-foreground hover:bg-muted/80'
            } rounded-lg py-3 px-6 transition duration-200 opacity-80 hover:opacity-100 text-sm whitespace-nowrap`}
            onClick={() => handleCategorySelect(category.id)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {category.name}
          </button>
        ))}
      </div>

      {showNavButtons && (
        <div className="flex items-center ml-auto">
          <button
            onClick={() => scroll('prev')}
            className="p-2 rounded-full bg-muted hover:bg-muted/80 transition duration-200 ml-2"
            aria-label="Previous categories"
          >
            <FaChevronLeft className="w-4 h-4 text-foreground" />
          </button>

          <button
            onClick={() => scroll('next')}
            className="p-2 rounded-full bg-muted hover:bg-muted/80 transition duration-200 ml-2"
            aria-label="Next categories"
          >
            <FaChevronRight className="w-4 h-4 text-foreground" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryNav;
