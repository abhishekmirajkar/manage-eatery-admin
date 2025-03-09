
import React, { useState } from "react";
import { DataTable } from "@/components/DataTable/DataTable";
import { FormModal } from "@/components/DataTable/FormModal";
import { Cuisine } from "@/types/models";
import { mockCuisines } from "@/lib/mockData";
import InputWithLabel from "@/components/ui/input-with-label";
import { toast } from "sonner";

const Cuisines = () => {
  const [cuisines, setCuisines] = useState<Cuisine[]>(mockCuisines);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCuisine, setEditingCuisine] = useState<Cuisine | null>(null);
  const [formData, setFormData] = useState<Partial<Cuisine>>({
    name: "",
  });

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

  const handleDelete = (cuisine: Cuisine) => {
    setCuisines(cuisines.filter((c) => c.id !== cuisine.id));
    toast.success(`Deleted ${cuisine.name}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCuisine) {
      // Update existing cuisine
      setCuisines(
        cuisines.map((c) =>
          c.id === editingCuisine.id
            ? { ...c, ...formData }
            : c
        )
      );
      toast.success(`Updated ${formData.name}`);
    } else {
      // Create new cuisine
      const newCuisine: Cuisine = {
        id: `cus${cuisines.length + 1}`,
        ...formData as Cuisine
      };
      setCuisines([...cuisines, newCuisine]);
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
