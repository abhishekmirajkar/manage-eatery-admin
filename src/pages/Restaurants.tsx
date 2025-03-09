
import React, { useState } from "react";
import { DataTable } from "@/components/DataTable/DataTable";
import { FormModal } from "@/components/DataTable/FormModal";
import { Restaurant } from "@/types/models";
import { getRestaurantsWithAddresses, mockAddresses } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import InputWithLabel from "@/components/ui/input-with-label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(getRestaurantsWithAddresses());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [formData, setFormData] = useState<Partial<Restaurant>>({
    name: "",
    email: "",
    phone_number: "",
    address_id: "",
    is_closed: false,
  });

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Phone", accessor: "phone_number" },
    { 
      header: "Address", 
      accessor: (restaurant: Restaurant) => {
        const address = restaurant.address;
        return address ? `${address.street}, ${address.city}, ${address.state}` : "No address";
      }
    },
    { 
      header: "Status", 
      accessor: (restaurant: Restaurant) => 
        restaurant.is_closed ? (
          <Badge variant="destructive">Closed</Badge>
        ) : (
          <Badge variant="success" className="bg-green-500">Open</Badge>
        )
    },
  ];

  const handleAddNew = () => {
    setEditingRestaurant(null);
    setFormData({
      name: "",
      email: "",
      phone_number: "",
      address_id: "",
      is_closed: false,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setFormData({
      name: restaurant.name,
      email: restaurant.email,
      phone_number: restaurant.phone_number,
      address_id: restaurant.address_id,
      is_closed: restaurant.is_closed,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (restaurant: Restaurant) => {
    // In a real app, this would be an API call
    setRestaurants(restaurants.filter((r) => r.id !== restaurant.id));
    toast.success(`Deleted ${restaurant.name}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingRestaurant) {
      // Update existing restaurant
      setRestaurants(
        restaurants.map((r) =>
          r.id === editingRestaurant.id
            ? { ...r, ...formData }
            : r
        )
      );
      toast.success(`Updated ${formData.name}`);
    } else {
      // Create new restaurant
      const newRestaurant: Restaurant = {
        id: `res${restaurants.length + 1}`,
        ...formData as Restaurant
      };
      setRestaurants([...restaurants, newRestaurant]);
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
        data={restaurants}
        columns={columns}
        title="Restaurants"
        onAdd={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRestaurant ? "Edit Restaurant" : "Add New Restaurant"}
        onSubmit={handleSubmit}
      >
        <div className="grid grid-cols-1 gap-4 py-4">
          <InputWithLabel
            label="Restaurant Name"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          
          <InputWithLabel
            label="Email"
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          
          <InputWithLabel
            label="Phone Number"
            id="phone_number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleInputChange}
            required
          />
          
          <div className="space-y-2">
            <Label htmlFor="address_id">Address</Label>
            <Select
              value={formData.address_id}
              onValueChange={(value) => setFormData({ ...formData, address_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select address" />
              </SelectTrigger>
              <SelectContent>
                {mockAddresses.map((address) => (
                  <SelectItem key={address.id} value={address.id}>
                    {address.street}, {address.city}, {address.state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="is_closed"
              checked={formData.is_closed}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_closed: checked })
              }
            />
            <Label htmlFor="is_closed">Restaurant is closed</Label>
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default Restaurants;
