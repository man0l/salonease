import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaChevronRight, FaChevronDown as FaChevronExpanded, FaTimes } from 'react-icons/fa';
import useOutsideClick from '../hooks/useOutsideClick';

const CategorySelector = ({ categories, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const dropdownRef = useRef(null);

  useOutsideClick(dropdownRef, () => {
    if (isOpen) setIsOpen(false);
  });

  const toggleExpand = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const filterCategories = (categories, searchTerm) => {
    return categories.reduce((acc, category) => {
      const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
      const childMatches = category.children ? filterCategories(category.children, searchTerm) : [];
      
      if (matchesSearch || childMatches.length > 0) {
        const newCategory = { ...category };
        if (childMatches.length > 0) {
          newCategory.children = childMatches;
        }
        acc.push(newCategory);
      }
      
      return acc;
    }, []);
  };

  const renderCategory = (category, depth = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories[category.id] || !!search;
    const showChildren = isExpanded || !!search;

    return (
      <div key={category.id} className="py-1">
        <div className="flex items-center">
          {hasChildren && !search && (
            <button
              type="button"
              className="mr-2 focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(category.id);
              }}
            >
              {isExpanded ? <FaChevronExpanded className="h-4 w-4" /> : <FaChevronRight className="h-4 w-4" />}
            </button>
          )}
          <button
            type="button"
            className={`flex-grow text-left px-4 py-2 text-sm ${depth > 0 ? 'pl-' + (depth * 4 + 4) : ''}`}
            onClick={() => {
              onChange(category.id);
              setIsOpen(false);
            }}
          >
            {category.name}
          </button>
        </div>
        {showChildren && hasChildren && (
          <div className="ml-4">
            {category.children.map(child => renderCategory(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const filteredCategories = search ? filterCategories(categories, search) : categories;

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

  const clearSearch = () => {
    setSearch('');
    setExpandedCategories({});
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedCategory ? selectedCategory.name : 'Select a category'}
        <FaChevronDown className="h-5 w-5" />
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white rounded-md shadow-lg">
          <div className="relative">
            <input
              type="text"
              className="w-full px-3 py-2 pr-10 border-b border-gray-300 rounded-t-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={clearSearch}
              >
                <FaTimes className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="max-h-60 overflow-auto">
            {filteredCategories.map(category => renderCategory(category))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;
