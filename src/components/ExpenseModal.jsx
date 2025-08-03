import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Modal from "./Modal";
import Input from "./Input";
import Select from "./Select";
import Button from "./Button";
import CategoryModal from "./CategoryModal";
import { addExpense, updateExpense } from "../utils/database";
import { getCategories } from "../utils/storage";
import { formatDate } from "../utils/dateHelpers";

const ExpenseModal = ({ isOpen, onClose, expense = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    description: expense?.description || "",
    amount: expense?.amount || "",
    categoryId: expense?.categoryId || "",
    date: expense?.date || new Date().toISOString().split("T")[0],
    notes: expense?.notes || "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  // Load categories when modal opens
  useEffect(() => {
    if (isOpen) {
      setCategories(getCategories());
    }
  }, [isOpen]);

  // Update form data when expense prop changes
  useEffect(() => {
    if (expense) {
      setFormData({
        description: expense.description || "",
        amount: expense.amount || "",
        categoryId: expense.categoryId || "",
        date: expense.date || new Date().toISOString().split("T")[0],
        notes: expense.notes || "",
      });
    } else {
      setFormData({
        description: "",
        amount: "",
        categoryId: "",
        date: new Date().toISOString().split("T")[0],
        notes: "",
      });
    }
  }, [expense]);

  const categoryOptions = categories
    .filter((cat) => cat.id !== "add_new") // Filter out the add new option for regular selection
    .map((cat) => ({
      value: cat.id,
      label: `${cat.icon} ${cat.name}`,
    }));

  // Add the "Add New Category" option at the end
  categoryOptions.push({
    value: "add_new",
    label: "➕ Add New Category",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Handle category selection
    if (name === "categoryId" && value === "add_new") {
      setIsCategoryModalOpen(true);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleCategoryCreated = (newCategory) => {
    // Refresh categories list
    setCategories(getCategories());
    // Set the newly created category as selected
    setFormData((prev) => ({
      ...prev,
      categoryId: newCategory.id,
    }));
    setIsCategoryModalOpen(false);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (
      !formData.amount ||
      isNaN(formData.amount) ||
      Number(formData.amount) <= 0
    ) {
      newErrors.amount = "Please enter a valid amount";
    }

    if (!formData.categoryId || formData.categoryId === "add_new") {
      newErrors.categoryId = "Please select a category";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
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
      const expenseData = {
        ...formData,
        amount: Number(formData.amount),
      };

      if (expense) {
        // Update existing expense
        await updateExpense(expense.id, expenseData);
      } else {
        // Add new expense
        const newExpense = await addExpense(expenseData);
        console.log("New expense added:", newExpense);
      }

      console.log("Calling onSuccess callback");
      onSuccess?.();
      onClose();

      // Reset form
      setFormData({
        description: "",
        amount: "",
        categoryId: "",
        date: new Date().toISOString().split("T")[0],
        notes: "",
      });
      setErrors({});
    } catch (error) {
      console.error("Error saving expense:", error);
      setErrors({ submit: "Failed to save expense. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setErrors({});
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={expense ? "Edit Expense" : "Add New Expense"}
        size="medium"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Product Name / Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            error={errors.description}
            placeholder="Enter product name or description"
            required
          />

          <Input
            label="Amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={handleInputChange}
            error={errors.amount}
            placeholder="0.00"
            required
          />

          <Select
            label="Category"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleInputChange}
            error={errors.categoryId}
            options={categoryOptions}
            placeholder="Select a category"
            required
          />

          <Input
            label="Date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleInputChange}
            error={errors.date}
            required
          />

          <Input
            label="Notes (optional)"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Add any additional notes..."
            rows={3}
          />

          {errors.submit && (
            <div className="text-red-600 text-sm">{errors.submit}</div>
          )}

          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={handleClose} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : expense
                ? "Update Expense"
                : "Add Expense"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Category Creation Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSuccess={handleCategoryCreated}
      />
    </>
  );
};

export default ExpenseModal;
