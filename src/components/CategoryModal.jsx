import { useState } from 'react';
import { motion } from 'framer-motion';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import { addCategory } from '../utils/storage';

const CategoryModal = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    icon: '📝',
    color: '#64748b',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const commonIcons = [
    '🍕', '🛍️', '🎬', '💊', '⚡', '✈️', '🛒', '📈', 
    '🎁', '🏡', '🧹', '🏦', '🚗', '🎮', '📚', '⚽',
    '🎵', '💻', '🏥', '🔧', '🎨', '📱', '☕', '🌮',
    '💄', '👕', '🏠', '🌱', '🎪', '🏃', '📖', '💳'
  ];

  const commonColors = [
    '#f97316', '#3b82f6', '#8b5cf6', '#f59e0b', '#22c55e', '#6b7280',
    '#d946ef', '#06b6d4', '#16a34a', '#dc2626', '#7c3aed', '#059669',
    '#ec4899', '#84cc16', '#6366f1', '#ef4444', '#f97316', '#14b8a6'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleIconSelect = (icon) => {
    setFormData(prev => ({
      ...prev,
      icon,
    }));
  };

  const handleColorSelect = (color) => {
    setFormData(prev => ({
      ...prev,
      color,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }

    if (formData.name.trim().length < 2) {
      newErrors.name = 'Category name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const categoryData = {
        name: formData.name.trim(),
        icon: formData.icon,
        color: formData.color,
      };

      const newCategory = addCategory(categoryData);
      
      if (newCategory) {
        onSuccess?.(newCategory);
        onClose();
        
        // Reset form
        setFormData({
          name: '',
          icon: '📝',
          color: '#64748b',
        });
        setErrors({});
      } else {
        setErrors({ submit: 'Failed to create category. Please try again.' });
      }
    } catch (error) {
      console.error('Error creating category:', error);
      setErrors({ submit: 'Failed to create category. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setErrors({});
    setFormData({
      name: '',
      icon: '📝',
      color: '#64748b',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Category"
      size="medium"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Category Name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          error={errors.name}
          placeholder="Enter category name"
          required
        />

        {/* Icon Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Select Icon
          </label>
          <div className="grid grid-cols-8 gap-2">
            {commonIcons.map((icon) => (
              <motion.button
                key={icon}
                type="button"
                onClick={() => handleIconSelect(icon)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`p-2 rounded-lg border-2 transition-all duration-200 ${
                  formData.icon === icon
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span className="text-lg">{icon}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Color Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Select Color
          </label>
          <div className="grid grid-cols-6 gap-2">
            {commonColors.map((color) => (
              <motion.button
                key={color}
                type="button"
                onClick={() => handleColorSelect(color)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`w-10 h-10 rounded-lg border-2 transition-all duration-200 ${
                  formData.color === color
                    ? 'border-gray-400 scale-110'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Preview
          </label>
          <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: formData.color }}
            >
              {formData.icon}
            </div>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {formData.name || 'Category Name'}
            </span>
          </div>
        </div>

        {errors.submit && (
          <div className="text-red-600 text-sm">{errors.submit}</div>
        )}

        <div className="flex justify-end space-x-3">
          <Button variant="secondary" onClick={handleClose} type="button">
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            disabled={loading || !formData.name.trim()}
          >
            {loading ? 'Creating...' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryModal; 