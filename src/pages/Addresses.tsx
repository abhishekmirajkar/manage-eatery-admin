
import React, { useState } from "react";
import { DataTable } from "@/components/DataTable/DataTable";
import { FormModal } from "@/components/DataTable/FormModal";
import { Address } from "@/types/models";
import { mockAddresses } from "@/lib/mockData";
import InputWithLabel from "@/components/ui/input-with-label";
import { toast } from "sonner";

const Addresses = () => {
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<Partial<Address>>({
    street: "",
    city: "",
    state: "",
    county: "",
    zip_code: "",
    latitude: "",
    longitude: "",
    additional_info: "",
  });

  const columns = [
    { header: "Street", accessor: "street" },
    { 
      header: "Location", 
      accessor: (address: Address) => `${address.city}, ${address.state}` 
    },
    { header: "Zip Code", accessor: "zip_code" },
    { header: "County", accessor: "county" },
  ];

  const handleAddNew = () => {
    setEditingAddress(null);
    setFormData({
      street: "",
      city: "",
      state: "",
      county: "",
      zip_code: "",
      latitude: "",
      longitude: "",
      additional_info: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      street: address.street,
      city: address.city,
      state: address.state,
      county: address.county,
      zip_code: address.zip_code,
      latitude: address.latitude,
      longitude: address.longitude,
      additional_info: address.additional_info,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (address: Address) => {
    setAddresses(addresses.filter((a) => a.id !== address.id));
    toast.success(`Deleted address: ${address.street}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAddress) {
      // Update existing address
      setAddresses(
        addresses.map((a) =>
          a.id === editingAddress.id
            ? { ...a, ...formData }
            : a
        )
      );
      toast.success(`Updated address: ${formData.street}`);
    } else {
      // Create new address
      const newAddress: Address = {
        id: `addr${addresses.length + 1}`,
        ...formData as Address
      };
      setAddresses([...addresses, newAddress]);
      toast.success(`Added address: ${formData.street}`);
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
        data={addresses}
        columns={columns}
        title="Addresses"
        onAdd={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAddress ? "Edit Address" : "Add New Address"}
        onSubmit={handleSubmit}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="md:col-span-2">
            <InputWithLabel
              label="Street"
              id="street"
              name="street"
              value={formData.street}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <InputWithLabel
            label="City"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            required
          />
          
          <InputWithLabel
            label="State"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            required
          />
          
          <InputWithLabel
            label="County"
            id="county"
            name="county"
            value={formData.county}
            onChange={handleInputChange}
            required
          />
          
          <InputWithLabel
            label="Zip Code"
            id="zip_code"
            name="zip_code"
            value={formData.zip_code}
            onChange={handleInputChange}
            required
          />
          
          <InputWithLabel
            label="Latitude"
            id="latitude"
            name="latitude"
            value={formData.latitude}
            onChange={handleInputChange}
          />
          
          <InputWithLabel
            label="Longitude"
            id="longitude"
            name="longitude"
            value={formData.longitude}
            onChange={handleInputChange}
          />
          
          <div className="md:col-span-2">
            <label htmlFor="additional_info" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Additional Information
            </label>
            <textarea
              id="additional_info"
              name="additional_info"
              value={formData.additional_info}
              onChange={handleInputChange}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Any additional details about this address"
            />
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default Addresses;
