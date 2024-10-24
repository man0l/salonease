import React from 'react';
import CategoryItem from './CategoryItem';

const CategoryList = ({ categories, search, expandedCategories, toggleExpand, onSelect }) => {
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

  const filteredCategories = search ? filterCategories(categories, search) : categories;

  return (
    <div className="max-h-60 overflow-auto">
      {filteredCategories.map(category => (
        <CategoryItem
          key={category.id}
          category={category}
          depth={0}
          search={search}
          isExpanded={expandedCategories[category.id]}
          toggleExpand={toggleExpand}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};

export default CategoryList;
