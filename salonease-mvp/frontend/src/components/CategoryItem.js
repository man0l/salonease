import React from 'react';
import { FaChevronRight, FaChevronDown } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const CategoryItem = ({ category, depth, search, isExpanded, toggleExpand, onSelect }) => {
  const { t } = useTranslation(['service']);
  const hasChildren = category.children && category.children.length > 0;
  const showChildren = isExpanded || !!search;
  const isLevel1 = depth === 0;

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
            aria-label={isExpanded ? t('service:category.collapse') : t('service:category.expand')}
          >
            {isExpanded ? <FaChevronDown className="h-4 w-4" /> : <FaChevronRight className="h-4 w-4" />}
          </button>
        )}
        <button
          type="button"
          className={`flex-grow text-left px-4 py-2 text-sm ${
            depth > 0 ? 'pl-' + (depth * 4 + 4) : ''
          } ${isLevel1 ? 'font-semibold text-gray-500 cursor-default' : 'hover:bg-gray-100'}`}
          onClick={() => !isLevel1 && onSelect(category.id)}
          disabled={isLevel1}
          aria-label={t('service:category.select')}
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
