import React from 'react';
import { FaTimes } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
const SearchInput = ({ search, setSearch }) => {
  const { t } = useTranslation('common');
  const clearSearch = () => {
    setSearch('');
  };

  return (
    <div className="relative">
      <input
        type="text"
        className="w-full px-3 py-2 pr-10 border-b border-gray-300 rounded-t-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        placeholder={t('action.search_categories')}
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
  );
};

export default SearchInput;
