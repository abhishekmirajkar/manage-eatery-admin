
import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/DataTable/DataTable";
import { FormModal } from "@/components/DataTable/FormModal";
import { Allergen } from "@/types/models";
import { allergenAPI, AllergenCreateData, extractResponseData } from "@/lib/api/apiService";
import InputWithLabel from "@/components/ui/input-with-label";
import { toast } from "sonner";

const Allergens = () => {
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAllergen, setEditingAllergen] = useState<Allergen | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<AllergenCreateData>>({
    name: "",
    description: "",
  });

  // Load allergens on component mount
  useEffect(() => {
    loadAllergens();
  }, []);

  const loadAllergens = async () => {
    setLoading(true);
    try {
      const response = await allergenAPI.getAll();
      
      if (response.success && response.data) {
        const allergenData = extractResponseData<Allergen[]>(response.data);
        setAllergens(allergenData);
      } else {
        // Handle specific authentication errors
        if (response.error?.includes('Authentication failed')) {
          toast.error("Session expired. Please log in again.");
          return; // Don't show additional error toast
        }
        toast.error(response.error || "Failed to load allergens");
      }
    } catch (error) {
      toast.error("Failed to load allergens");
      console.error("Error loading allergens:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleDelete = async (allergen: Allergen) => {
    try {
      const response = await allergenAPI.delete(allergen.id);
      if (response.success) {
        setAllergens(allergens.filter((a) => a.id !== allergen.id));
        toast.success(`Deleted ${allergen.name}`);
      } else {
        toast.error(response.error || "Failed to delete allergen");
      }
    } catch (error) {
      toast.error("Failed to delete allergen");
      console.error("Error deleting allergen:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (editingAllergen) {
        // Update existing allergen
        const response = await allergenAPI.update(editingAllergen.id, formData);
        if (response.success && response.data) {
          setAllergens(
            allergens.map((a) =>
              a.id === editingAllergen.id ? response.data! : a
            )
          );
          toast.success(`Updated ${formData.name}`);
          setIsModalOpen(false);
        } else {
          toast.error(response.error || "Failed to update allergen");
        }
      } else {
        // Create new allergen
        const createData: AllergenCreateData = {
          name: formData.name!,
          description: formData.description,
        };
        
        const response = await allergenAPI.create(createData);
        if (response.success && response.data) {
          setAllergens([...allergens, response.data]);
          toast.success(`Added ${formData.name}`);
          setIsModalOpen(false);
        } else {
          toast.error(response.error || "Failed to create allergen");
        }
      }
    } catch (error) {
      toast.error("An error occurred while saving the allergen");
      console.error("Error saving allergen:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading allergens...</div>
      </div>
    );
  }

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
