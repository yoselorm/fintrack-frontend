import React, { useState } from 'react';
import { X, DollarSign, Calendar, Tag, FileText, Plus, Minus, CheckCircle, AlertCircle } from 'lucide-react';

const AddTransactionForm = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    type: 'expense', 
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0], 
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const categories = {
    expense: [
      'Food & Dining',
      'Shopping',
      'Transport',
      'Bills & Utilities',
      'Entertainment',
      'Healthcare',
      'Education',
      'Travel',
      'Home & Garden',
      'Personal Care',
      'Subscriptions',
      'Other'
    ],
    income: [
      'Salary',
      'Freelance',
      'Business',
      'Investment',
      'Rental',
      'Gift',
      'Refund',
      'Other'
    ]
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Please enter a description';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.date) {
      newErrors.date = 'Please select a date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Format the transaction data
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        amount: formData.type === 'expense' ? Math.abs(parseFloat(formData.amount)) : Math.abs(parseFloat(formData.amount)),
        id: Date.now(),
        date: formData.date
      };

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await onSubmit(transactionData);
      
      setSubmitSuccess(true);
      
      setTimeout(() => {
        handleClose();
      }, 1500);
      
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to add transaction' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      type: 'expense',
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setErrors({});
    setIsSubmitting(false);
    setSubmitSuccess(false);
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg mr-3">
              <Plus className="h-6 w-6 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Add Transaction</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Transaction Type
            </label>
            <div className="flex rounded-xl border border-gray-300 p-1 bg-gray-50">
              <button
                type="button"
                onClick={() => handleInputChange('type', 'expense')}
                className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg font-medium transition-all ${
                  formData.type === 'expense'
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Minus className="h-4 w-4 mr-2" />
                Expense
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('type', 'income')}
                className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg font-medium transition-all ${
                  formData.type === 'income'
                    ? 'bg-green-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Plus className="h-4 w-4 mr-2" />
                Income
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                min="0"
                required
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white ${
                  errors.amount ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
                }`}
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                required
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white ${
                  errors.description ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
                }`}
                placeholder={formData.type === 'expense' ? 'Coffee at Starbucks' : 'Freelance project payment'}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <select
                required
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white ${
                  errors.category ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
                }`}
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                <option value="">Select a category</option>
                {categories[formData.type].map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="date"
                required
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white ${
                  errors.date ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
                }`}
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
              />
            </div>
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes <span className="text-gray-500">(Optional)</span>
            </label>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
              placeholder="Add any additional notes..."
              rows="3"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
            />
          </div>

          {submitSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-700 font-medium">
                Transaction added successfully! Updating your dashboard...
              </p>
            </div>
          )}

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{errors.submit}</p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || submitSuccess}
              className={`flex-1 px-6 py-3 font-medium rounded-xl focus:ring-2 transition-all ${
                formData.type === 'expense'
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white'
                  : 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white'
              } disabled:opacity-50 flex items-center justify-center`}
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : submitSuccess ? (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Added!
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2" />
                  Add {formData.type === 'expense' ? 'Expense' : 'Income'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionForm;