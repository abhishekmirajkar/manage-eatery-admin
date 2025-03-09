
import React, { useState } from "react";
import { DataTable } from "@/components/DataTable/DataTable";
import { FormModal } from "@/components/DataTable/FormModal";
import { MealType } from "@/types/models";
import { mockMealTypes } from "@/lib/mockData";
import InputWithLabel from "@/components/ui/input-with-label";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MealTypes = () => {
  const [mealTypes, setMealTypes] = useState<MealType[]>(mockMealTypes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMealType, setEditingMealType] = useState<MealType | null>(null);
  const [formData, setFormData] = useState<Partial<MealType>>({
    name: "",
    image: "",
  });

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

  const handleDelete = (mealType: MealType) => {
    setMealTypes(mealTypes.filter((mt) => mt.id !== mealType.id));
    toast.success(`Deleted ${mealType.name}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingMealType) {
      // Update existing meal type
      setMealTypes(
        mealTypes.map((mt) =>
          mt.id === editingMealType.id
            ? { ...mt, ...formData }
            : mt
        )
      );
      toast.success(`Updated ${formData.name}`);
    } else {
      // Create new meal type
      const newMealType: MealType = {
        id: `mt${mealTypes.length + 1}`,
        ...formData as MealType
      };
      setMealTypes([...mealTypes, newMealType]);
      toast.success(`Added ${formData.name}`);
    }
    
    setIsModalOpen(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

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
            required
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
