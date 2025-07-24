
import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/DataTable/DataTable";
import { FormModal } from "@/components/DataTable/FormModal";
import { Customer } from "@/types/models";
import { customerService, CustomerCreateData, CustomerUpdateData } from "@/lib/api/customerService";
import InputWithLabel from "@/components/ui/input-with-label";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<Customer & { password: string; role: string }>>({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    role: "user",
  });

  // Load customers on component mount
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const response = await customerService.getAllCustomers();
      if (response.success && response.data) {
        setCustomers(response.data);
      } else {
        toast.error(response.error || "Failed to load customers");
      }
    } catch (error) {
      toast.error("Failed to load customers");
      console.error("Error loading customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { 
      header: "Name", 
      accessor: (customer: Customer) => {
        const firstInitial = customer.first_name ? customer.first_name.charAt(0) : '';
        const lastInitial = customer.last_name ? customer.last_name.charAt(0) : '';
        const initials = `${firstInitial}${lastInitial}`;
        return (
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span>{customer.first_name} {customer.last_name}</span>
          </div>
        );
      }
    },
    { header: "Email", accessor: "email" },
    { header: "Phone", accessor: "phone_number" },
  ];

  const handleAddNew = () => {
    setEditingCustomer(null);
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      password: "",
      role: "user",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      first_name: customer.first_name,
      last_name: customer.last_name,
      email: customer.email,
      phone_number: customer.phone_number,
      password: "", // Don't show existing password
      role: (customer as any).role || "user",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (customer: Customer) => {
    try {
      const response = await customerService.deleteCustomer(customer.id);
      if (response.success) {
        setCustomers(customers.filter((c) => c.id !== customer.id));
        toast.success(`Deleted ${customer.first_name} ${customer.last_name}`);
      } else {
        toast.error(response.error || "Failed to delete customer");
      }
    } catch (error) {
      toast.error("Failed to delete customer");
      console.error("Error deleting customer:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (editingCustomer) {
        // Update existing customer
        const updateData: CustomerUpdateData = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone_number: formData.phone_number,
          role: formData.role as 'user' | 'admin',
        };
        
        const response = await customerService.updateCustomer(editingCustomer.id, updateData);
        
        if (response.success && response.data) {
          setCustomers(
            customers.map((c) =>
              c.id === editingCustomer.id ? response.data! : c
            )
          );
          toast.success(`Updated ${formData.first_name} ${formData.last_name}`);
          setIsModalOpen(false);
        } else {
          toast.error(response.error || "Failed to update customer");
        }
      } else {
        // Create new customer using auth/signup
        if (!formData.password) {
          toast.error("Password is required for new customers");
          return;
        }

        const createData: CustomerCreateData = {
          first_name: formData.first_name!,
          last_name: formData.last_name!,
          email: formData.email!,
          password: formData.password,
          phone_number: formData.phone_number,
          role: formData.role as 'user' | 'admin',
        };
        
        const response = await customerService.createCustomer(createData);
        
        if (response.success && response.data) {
          setCustomers([...customers, response.data]);
          toast.success(`Added ${formData.first_name} ${formData.last_name}`);
          setIsModalOpen(false);
        } else {
          toast.error(response.error || "Failed to create customer");
        }
      }
    } catch (error) {
      toast.error("An error occurred while saving the customer");
      console.error("Error saving customer:", error);
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

  const handleRoleChange = (value: string) => {
    setFormData({ ...formData, role: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading customers...</div>
      </div>
    );
  }

  return (
    <div>
      <DataTable
        data={customers}
        columns={columns}
        title="Customers"
        onAdd={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? "Edit Customer" : "Add New Customer"}
        onSubmit={handleSubmit}
        isLoading={submitting}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <InputWithLabel
            label="First Name"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            required
          />
          
          <InputWithLabel
            label="Last Name"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            required
          />
          
          <div className="md:col-span-2">
            <InputWithLabel
              label="Email"
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <InputWithLabel
            label="Phone Number"
            id="phone_number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleInputChange}
            required
          />

          {!editingCustomer && (
            <div className="md:col-span-2">
              <InputWithLabel
                label="Password"
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Enter a secure password"
              />
            </div>
          )}

          <div className="md:col-span-2">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <Select value={formData.role} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default Customers;
