
import React, { useState } from "react";
import { DataTable } from "@/components/DataTable/DataTable";
import { FormModal } from "@/components/DataTable/FormModal";
import { Allergen } from "@/types/models";
import { mockAllergens } from "@/lib/mockData";
import InputWithLabel from "@/components/ui/input-with-label";
import { toast } from "sonner";

const Allergens = () => {
  const [allergens, setAllergens] = useState<Allergen[]>(mockAllergens);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAllergen, setEditingAllergen] = useState<Allergen | null>(null);
  const [formData, setFormData] = useState<Partial<Allergen>>({
    name: "",
    description: "",
  });

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Description", accessor: "description" },
  ];

  const handleAddNew = () => {
    setEditingAllergen(null);
    setFormData({
      name: "",
      description: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (allergen: Allergen) => {
    setEditingAllergen(allergen);
    setFormData({
      name: allergen.name,
      description: allergen.description,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (allergen: Allergen) => {
    setAllergens(allergens.filter((a) => a.id !== allergen.id));
    toast.success(`Deleted ${allergen.name}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAllergen) {
      // Update existing allergen
      setAllergens(
        allergens.map((a) =>
          a.id === editingAllergen.id
            ? { ...a, ...formData }
            : a
        )
      );
      toast.success(`Updated ${formData.name}`);
    } else {
      // Create new allergen
      const newAllergen: Allergen = {
        id: `alg${allergens.length + 1}`,
        ...formData as Allergen
      };
      setAllergens([...allergens, newAllergen]);
      toast.success(`Added ${formData.name}`);
    }
    
    setIsModalOpen(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div>
      <DataTable
        data={allergens}
        columns={columns}
        title="Allergens"
        onAdd={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAllergen ? "Edit Allergen" : "Add New Allergen"}
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
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Description of the allergen"
            />
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default Allergens;
