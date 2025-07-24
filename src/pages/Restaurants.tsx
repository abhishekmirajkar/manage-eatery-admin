
import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/DataTable/DataTable";
import { FormModal } from "@/components/DataTable/FormModal";
import { Restaurant, Address } from "@/types/models";
import { restaurantAPI, addressAPI, RestaurantCreateData, extractResponseData } from "@/lib/api/apiService";
import { Badge } from "@/components/ui/badge";
import InputWithLabel from "@/components/ui/input-with-label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<RestaurantCreateData>>({
    name: "",
    email: "",
    phone_number: "",
    address_id: "",
    is_closed: false,
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load both restaurants and addresses
      const [restaurantsResponse, addressesResponse] = await Promise.all([
        restaurantAPI.getAll(),
        addressAPI.getAll()
      ]);

      if (restaurantsResponse.success && restaurantsResponse.data) {
        // Handle nested data structure using utility function
        const restaurantData = extractResponseData<Restaurant[]>(restaurantsResponse.data);
        setRestaurants(restaurantData);
      } else {
        toast.error(restaurantsResponse.error || "Failed to load restaurants");
      }

      if (addressesResponse.success && addressesResponse.data) {
        // Handle potentially nested data structure using utility function
        const addressData = extractResponseData<Address[]>(addressesResponse.data);
        setAddresses(addressData);
      } else {
        toast.error(addressesResponse.error || "Failed to load addresses");
      }
    } catch (error) {
      toast.error("Failed to load data");
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { 
      header: "Restaurant Name", 
      accessor: "name",
      cell: (restaurant: Restaurant) => {
        try {
          return (
            <div className="font-medium">{restaurant.name || 'Unnamed Restaurant'}</div>
          );
        } catch (error) {
          console.error("Error rendering restaurant:", restaurant, error);
          return <span className="text-red-500">Restaurant error</span>;
        }
      }
    },
    { 
      header: "Email", 
      accessor: "email",
      cell: (restaurant: Restaurant) => {
        try {
          return restaurant.email ? (
            <div className="text-sm">
              <a 
                href={`mailto:${restaurant.email}`} 
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {restaurant.email}
              </a>
            </div>
          ) : (
            <span className="text-gray-400 text-sm">No email</span>
          );
        } catch (error) {
          console.error("Error rendering email:", restaurant, error);
          return <span className="text-red-500">Email error</span>;
        }
      }
    },
    { 
      header: "Phone Number", 
      accessor: "phone_number",
      cell: (restaurant: Restaurant) => {
        try {
          return restaurant.phone_number ? (
            <div className="text-sm">
              <a 
                href={`tel:${restaurant.phone_number}`} 
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {restaurant.phone_number}
              </a>
            </div>
          ) : (
            <span className="text-gray-400 text-sm">No phone</span>
          );
        } catch (error) {
          console.error("Error rendering phone:", restaurant, error);
          return <span className="text-red-500">Phone error</span>;
        }
      }
    },
    { 
      header: "Address", 
      accessor: (restaurant: Restaurant) => {
        try {
          // Find address by address_id since API returns reference, not populated object
          const address = safeAddresses.find(addr => addr.id === restaurant.address_id);
          
          if (!address) {
            return <span className="text-gray-500">No address found</span>;
          }
          
          return (
            <div className="text-sm">
              <div>{address.street || 'No street'}</div>
              <div className="text-gray-500">
                {address.city || 'Unknown City'}, {address.state || 'Unknown State'} {address.zip_code || ''}
              </div>
            </div>
          );
        } catch (error) {
          console.error("Error rendering address for restaurant:", restaurant, error);
          return <span className="text-red-500">Address error</span>;
        }
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

  const handleDelete = async (restaurant: Restaurant) => {
    try {
      const response = await restaurantAPI.delete(restaurant.id);
      if (response.success) {
        setRestaurants(restaurants.filter((r) => r.id !== restaurant.id));
        toast.success(`Deleted ${restaurant.name}`);
      } else {
        toast.error(response.error || "Failed to delete restaurant");
      }
    } catch (error) {
      toast.error("Failed to delete restaurant");
      console.error("Error deleting restaurant:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (editingRestaurant) {
        // Update existing restaurant
        const response = await restaurantAPI.update(editingRestaurant.id, formData);
        if (response.success && response.data) {
          setRestaurants(
            restaurants.map((r) =>
              r.id === editingRestaurant.id ? response.data! : r
            )
          );
          toast.success(`Updated ${formData.name}`);
          setIsModalOpen(false);
        } else {
          toast.error(response.error || "Failed to update restaurant");
        }
      } else {
        // Create new restaurant
        const createData: RestaurantCreateData = {
          name: formData.name!,
          address_id: formData.address_id!,
          is_closed: formData.is_closed!,
          phone_number: formData.phone_number,
          email: formData.email,
        };
        
        const response = await restaurantAPI.create(createData);
        if (response.success && response.data) {
          setRestaurants([...restaurants, response.data]);
          toast.success(`Added ${formData.name}`);
          setIsModalOpen(false);
        } else {
          toast.error(response.error || "Failed to create restaurant");
        }
      }
    } catch (error) {
      toast.error("An error occurred while saving the restaurant");
      console.error("Error saving restaurant:", error);
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
        <div className="text-lg">Loading restaurants...</div>
      </div>
    );
  }

  // Add defensive check for data
  const safeRestaurants = Array.isArray(restaurants) ? restaurants : [];
  const safeAddresses = Array.isArray(addresses) ? addresses : [];

  try {
    return (
      <div>
        <DataTable
          data={safeRestaurants}
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
        isLoading={submitting}
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
                {addresses.map((address) => (
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
  } catch (error) {
    console.error("Error rendering restaurants page:", error);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error loading restaurants. Please check console for details.</div>
      </div>
    );
  }
};

export default Restaurants;
