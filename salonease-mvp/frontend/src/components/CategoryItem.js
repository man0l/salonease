import React from 'react';
import { FaChevronRight, FaChevronDown } from 'react-icons/fa';

const CategoryItem = ({ category, depth, search, isExpanded, toggleExpand, onSelect }) => {
  const hasChildren = category.children && category.children.length > 0;
  const showChildren = isExpanded || !!search;

  return (
    <div className="py-1">
      <div className="flex items-center" data-testid={`category-item-${category.id}`}>
        {hasChildren && !search && (
          <button
            type="button"
            className="mr-2 focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(category.id);
            }}
          >
            {isExpanded ? <FaChevronDown className="h-4 w-4" /> : <FaChevronRight className="h-4 w-4" />}
          </button>
        )}
        <button
          type="button"
          className={`flex-grow text-left px-4 py-2 text-sm ${depth > 0 ? 'pl-' + (depth * 4 + 4) : ''}`}
          onClick={() => onSelect(category.id)}
        >
          {category.name}
        </button>
      </div>
      {showChildren && hasChildren && (
        <div className="ml-4">
          {category.children.map(child => (
            <CategoryItem
              key={child.id}
              category={child}
              depth={depth + 1}
              search={search}
              isExpanded={isExpanded}
              toggleExpand={toggleExpand}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryItem;
