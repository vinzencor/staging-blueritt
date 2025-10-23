import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { getRootCategories, getSubcategories } from '@/utils/amazonCategories';

interface CategorySelectorProps {
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
  onDone?: () => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ selectedCategory, onCategorySelect, onDone }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [hoveredSubcategory, setHoveredSubcategory] = useState<string | null>(null);
  const [tempSelectedCategory, setTempSelectedCategory] = useState<string>(selectedCategory);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const rootCategories = getRootCategories();

  // Get selected category name for display
  const getSelectedCategoryName = () => {
    const category = rootCategories.find(cat => cat.id === tempSelectedCategory);
    if (category) return category.name;

    // Check if it's a subcategory
    for (const root of rootCategories) {
      const subcat = getSubcategories(root.id).find(sub => sub.id === tempSelectedCategory);
      if (subcat) return subcat.name;
    }
    return 'Select Category (Optional)';
  };

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Handle category selection (temporary, don't close dropdown)
  const handleSelect = (categoryId: string) => {
    setTempSelectedCategory(categoryId);
  };

  // Handle Done button click
  const handleDone = () => {
    onCategorySelect(tempSelectedCategory);
    setIsOpen(false);
    onDone?.();
  };

  // Sync tempSelectedCategory when selectedCategory changes
  useEffect(() => {
    setTempSelectedCategory(selectedCategory);
  }, [selectedCategory]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full relative" ref={dropdownRef}>
      {/* Dropdown Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-left flex items-center justify-between hover:border-purple-400 dark:hover:border-purple-500 transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      >
        <span className="text-sm">{getSelectedCategoryName()}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* All Categories Option */}
          <button
            onClick={() => handleSelect('')}
            className={`w-full px-4 py-3 text-left text-sm border-b border-gray-200 dark:border-gray-700 transition-colors ${
              tempSelectedCategory === ''
                ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 font-medium'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
            }`}
          >
            All Categories
          </button>

          {/* Root Categories with Subcategories */}
          {rootCategories.map((category) => {
            const subcategories = getSubcategories(category.id);
            const isExpanded = expandedCategories.has(category.id);
            const isSelected = tempSelectedCategory === category.id;

            return (
              <div key={category.id}>
                {/* Root Category */}
                <div className="flex items-center">
                  {subcategories.length > 0 && (
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="px-2 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                  )}
                  <button
                    onClick={() => handleSelect(category.id)}
                    className={`flex-1 px-4 py-3 text-left text-sm transition-colors ${
                      isSelected
                        ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 font-medium'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    {category.name}
                  </button>
                </div>

                {/* Subcategories */}
                {subcategories.length > 0 && isExpanded && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 border-l-2 border-purple-200 dark:border-purple-700">
                    {subcategories.map((subcat) => (
                      <button
                        key={subcat.id}
                        onClick={() => handleSelect(subcat.id)}
                        className={`w-full px-8 py-2 text-left text-sm transition-colors ${
                          tempSelectedCategory === subcat.id
                            ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-900 dark:text-purple-100 font-medium'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        └─ {subcat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Done Button */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3">
            <button
              onClick={handleDone}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;

