import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaChevronDown, FaChevronRight, FaChevronDown as FaChevronExpanded } from 'react-icons/fa';
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

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

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
        className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-md text-gray-100 
                 focus:outline-none focus:ring-2 focus:ring-primary-400 
                 hover:bg-gray-800 transition-colors duration-200
                 flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">
          {selectedCategory ? selectedCategory.name : 'Select a category'}
        </span>
        <FaChevronDown className="h-5 w-5 text-gray-400" />
      </button>

      {isOpen && (
        <div className="max-h-60 overflow-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
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
