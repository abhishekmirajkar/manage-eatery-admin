
import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/DataTable/DataTable";
import { FormModal } from "@/components/DataTable/FormModal";
import { MealType } from "@/types/models";
import { mealTypeAPI, MealTypeCreateData, extractResponseData } from "@/lib/api/apiService";
import InputWithLabel from "@/components/ui/input-with-label";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MealTypes = () => {
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMealType, setEditingMealType] = useState<MealType | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<MealTypeCreateData>>({
    name: "",
    image: "",
  });

  // Load meal types on component mount
  useEffect(() => {
    loadMealTypes();
  }, []);

  const loadMealTypes = async () => {
    setLoading(true);
    try {
      const response = await mealTypeAPI.getAll();
      if (response.success && response.data) {
        const mealTypeData = extractResponseData<MealType[]>(response.data);
        setMealTypes(mealTypeData);
      } else {
        toast.error(response.error || "Failed to load meal types");
      }
    } catch (error) {
      toast.error("Failed to load meal types");
      console.error("Error loading meal types:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { 
      header: "Image", 
      accessor: "image",
      cell: (mealType: MealType) => (
        <Avatar className="h-10 w-10">
          <AvatarImage src={mealType.image} alt={mealType.name} />
          <AvatarFallback>{mealType.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      )
    },
    { header: "Name", accessor: "name" },
  ];

  const handleAddNew = () => {
    setEditingMealType(null);
    setFormData({
      name: "",
      image: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (mealType: MealType) => {
    setEditingMealType(mealType);
    setFormData({
      name: mealType.name,
      image: mealType.image,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (mealType: MealType) => {
    try {
      const response = await mealTypeAPI.delete(mealType.id);
      if (response.success) {
        setMealTypes(mealTypes.filter((mt) => mt.id !== mealType.id));
        toast.success(`Deleted ${mealType.name}`);
      } else {
        toast.error(response.error || "Failed to delete meal type");
      }
    } catch (error) {
      toast.error("Failed to delete meal type");
      console.error("Error deleting meal type:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (editingMealType) {
        // Update existing meal type
        const response = await mealTypeAPI.update(editingMealType.id, formData);
        if (response.success && response.data) {
          setMealTypes(
            mealTypes.map((mt) =>
              mt.id === editingMealType.id ? response.data! : mt
            )
          );
          toast.success(`Updated ${formData.name}`);
          setIsModalOpen(false);
        } else {
          toast.error(response.error || "Failed to update meal type");
        }
      } else {
        // Create new meal type
        const createData: MealTypeCreateData = {
          name: formData.name!,
          image: formData.image,
        };
        
        const response = await mealTypeAPI.create(createData);
        if (response.success && response.data) {
          setMealTypes([...mealTypes, response.data]);
          toast.success(`Added ${formData.name}`);
          setIsModalOpen(false);
        } else {
          toast.error(response.error || "Failed to create meal type");
        }
      }
    } catch (error) {
      toast.error("An error occurred while saving the meal type");
      console.error("Error saving meal type:", error);
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
        <div className="text-lg">Loading meal types...</div>
      </div>
    );
  }

  return (
    <div>
      <DataTable
        data={mealTypes}
        columns={columns}
        title="Meal Types"
        onAdd={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMealType ? "Edit Meal Type" : "Add New Meal Type"}
        onSubmit={handleSubmit}
        isLoading={submitting}
      >
        <div className="grid grid-cols-1 gap-4 py-4">
          <InputWithLabel
            label="Name"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          
          <InputWithLabel
            label="Image URL"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleInputChange}
            placeholder="https://example.com/image.jpg"
          />
          
          {formData.image && (
            <div className="mt-2">
              <p className="text-sm mb-2">Preview:</p>
              <Avatar className="h-16 w-16">
                <AvatarImage src={formData.image} alt="Preview" />
                <AvatarFallback>{formData.name?.substring(0, 2).toUpperCase() || "IMG"}</AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      </FormModal>
    </div>
  );
};

export default MealTypes;
