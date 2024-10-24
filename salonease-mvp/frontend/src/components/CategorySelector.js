import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaChevronDown, FaChevronRight, FaChevronDown as FaChevronExpanded, FaTimes } from 'react-icons/fa';
import useOutsideClick from '../hooks/useOutsideClick';
import CategoryList from './CategoryList';
import SearchInput from './SearchInput';

const CategorySelector = ({ categories, value, onChange, id }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const dropdownRef = useRef(null);

  useOutsideClick(dropdownRef, () => {
    if (isOpen) setIsOpen(false);
  });

  // New: Handle Escape key press
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

  // New: Add event listener for keydown
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const toggleExpand = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleSelect = (categoryId) => {
    onChange(categoryId);
    setIsOpen(false);
  };

  const findCategoryById = (categories, id) => {
    for (let category of categories) {
      if (category.id === id) {
        return category;
      }
      if (category.children) {
        const found = findCategoryById(category.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedCategory = findCategoryById(categories, value);

  useEffect(() => {
    if (search) {
      setExpandedCategories({});
    }
  }, [search]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id={id}
        type="button"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {selectedCategory ? selectedCategory.name : 'Select a category'}
        <FaChevronDown className="h-5 w-5" />
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white rounded-md shadow-lg">
          <SearchInput search={search} setSearch={setSearch} />
          <CategoryList
            categories={categories}
            search={search}
            expandedCategories={expandedCategories}
            toggleExpand={toggleExpand}
            onSelect={handleSelect}
          />
        </div>
      )}
    </div>
  );
};

export default CategorySelector;
