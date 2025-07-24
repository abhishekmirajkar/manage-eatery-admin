
import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/DataTable/DataTable";
import { FormModal } from "@/components/DataTable/FormModal";
import { Cuisine } from "@/types/models";
import { cuisineAPI, CuisineCreateData, extractResponseData } from "@/lib/api/apiService";
import InputWithLabel from "@/components/ui/input-with-label";
import { toast } from "sonner";

const Cuisines = () => {
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCuisine, setEditingCuisine] = useState<Cuisine | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<CuisineCreateData>>({
    name: "",
  });

  // Load cuisines on component mount
  useEffect(() => {
    loadCuisines();
  }, []);

  const loadCuisines = async () => {
    setLoading(true);
    try {
      const response = await cuisineAPI.getAll();
      if (response.success && response.data) {
        const cuisineData = extractResponseData<Cuisine[]>(response.data);
        setCuisines(cuisineData);
      } else {
        toast.error(response.error || "Failed to load cuisines");
      }
    } catch (error) {
      toast.error("Failed to load cuisines");
      console.error("Error loading cuisines:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: "Name", accessor: "name" },
  ];

  const handleAddNew = () => {
    setEditingCuisine(null);
    setFormData({
      name: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (cuisine: Cuisine) => {
    setEditingCuisine(cuisine);
    setFormData({
      name: cuisine.name,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (cuisine: Cuisine) => {
    try {
      const response = await cuisineAPI.delete(cuisine.id);
      if (response.success) {
        setCuisines(cuisines.filter((c) => c.id !== cuisine.id));
        toast.success(`Deleted ${cuisine.name}`);
      } else {
        toast.error(response.error || "Failed to delete cuisine");
      }
    } catch (error) {
      toast.error("Failed to delete cuisine");
      console.error("Error deleting cuisine:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (editingCuisine) {
        // Update existing cuisine
        const response = await cuisineAPI.update(editingCuisine.id, formData);
        if (response.success && response.data) {
          setCuisines(
            cuisines.map((c) =>
              c.id === editingCuisine.id ? response.data! : c
            )
          );
          toast.success(`Updated ${formData.name}`);
          setIsModalOpen(false);
        } else {
          toast.error(response.error || "Failed to update cuisine");
        }
      } else {
        // Create new cuisine
        const createData: CuisineCreateData = {
          name: formData.name!,
        };
        
        const response = await cuisineAPI.create(createData);
        if (response.success && response.data) {
          setCuisines([...cuisines, response.data]);
          toast.success(`Added ${formData.name}`);
          setIsModalOpen(false);
        } else {
          toast.error(response.error || "Failed to create cuisine");
        }
      }
    } catch (error) {
      toast.error("An error occurred while saving the cuisine");
      console.error("Error saving cuisine:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading cuisines...</div>
      </div>
    );
  }

  return (
    <div>
      <DataTable
        data={cuisines}
        columns={columns}
        title="Cuisines"
        onAdd={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCuisine ? "Edit Cuisine" : "Add New Cuisine"}
        onSubmit={handleSubmit}
        isLoading={submitting}
      >
        <div className="grid grid-cols-1 gap-4 py-4">
          <InputWithLabel
            label="Cuisine Name"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
      </FormModal>
    </div>
  );
};

export default Cuisines;
