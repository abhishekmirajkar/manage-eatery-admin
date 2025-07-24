
import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/DataTable/DataTable";
import { FormModal } from "@/components/DataTable/FormModal";
import { Address } from "@/types/models";
import { addressAPI, AddressCreateData, extractResponseData } from "@/lib/api/apiService";
import InputWithLabel from "@/components/ui/input-with-label";
import { toast } from "sonner";

const Addresses = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<AddressCreateData>>({
    street: "",
    city: "",
    state: "",
    country: "",
    zip_code: "",
    latitude: "",
    longitude: "",
    additional_info: "",
    phone: "",
  });

  // Load addresses on component mount
  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const response = await addressAPI.getAll();
      if (response.success && response.data) {
        const addressData = extractResponseData<Address[]>(response.data);
        setAddresses(addressData);
      } else {
        toast.error(response.error || "Failed to load addresses");
      }
    } catch (error) {
      toast.error("Failed to load addresses");
      console.error("Error loading addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: "Street", accessor: "street" },
    { header: "City", accessor: "city" },
    { header: "State", accessor: "state" },
    { header: "Country", accessor: "county" },
    { header: "Zip Code", accessor: "zip_code" },
    { 
      header: "Coordinates", 
      accessor: (address: Address) => address.latitude && address.longitude ? 
        `${address.latitude}, ${address.longitude}` : "Not set"
    },
    { header: "Additional Info", accessor: "additional_info" },
  ];

  const handleAddNew = () => {
    setEditingAddress(null);
    setFormData({
      street: "",
      city: "",
      state: "",
      country: "",
      zip_code: "",
      latitude: "",
      longitude: "",
      additional_info: "",
      phone: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      street: address.street,
      city: address.city,
      state: address.state,
      country: address.county, // Using county as country for now
      zip_code: address.zip_code,
      latitude: address.latitude,
      longitude: address.longitude,
      additional_info: address.additional_info,
      phone: "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (address: Address) => {
    try {
      const response = await addressAPI.delete(address.id);
      if (response.success) {
        setAddresses(addresses.filter((a) => a.id !== address.id));
        toast.success(`Deleted address: ${address.street}`);
      } else {
        toast.error(response.error || "Failed to delete address");
      }
    } catch (error) {
      toast.error("Failed to delete address");
      console.error("Error deleting address:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (editingAddress) {
        // Update existing address
        const response = await addressAPI.update(editingAddress.id, formData);
        if (response.success && response.data) {
          setAddresses(
            addresses.map((a) =>
              a.id === editingAddress.id ? response.data! : a
            )
          );
          toast.success(`Updated address: ${formData.street}`);
          setIsModalOpen(false);
        } else {
          toast.error(response.error || "Failed to update address");
        }
      } else {
        // Create new address
        const createData: AddressCreateData = {
          street: formData.street!,
          city: formData.city!,
          state: formData.state!,
          country: formData.country!,
          zip_code: formData.zip_code!,
          latitude: formData.latitude!,
          longitude: formData.longitude!,
          additional_info: formData.additional_info,
          phone: formData.phone,
        };
        
        const response = await addressAPI.create(createData);
        if (response.success && response.data) {
          setAddresses([...addresses, response.data]);
          toast.success(`Added address: ${formData.street}`);
          setIsModalOpen(false);
        } else {
          toast.error(response.error || "Failed to create address");
        }
      }
    } catch (error) {
      toast.error("An error occurred while saving the address");
      console.error("Error saving address:", error);
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
        <div className="text-lg">Loading addresses...</div>
      </div>
    );
  }

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
        isLoading={submitting}
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
            label="Country"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            required
          />
          
          <InputWithLabel
            label="Phone"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Optional phone number"
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
            required
          />
          
          <InputWithLabel
            label="Longitude"
            id="longitude"
            name="longitude"
            value={formData.longitude}
            onChange={handleInputChange}
            required
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
