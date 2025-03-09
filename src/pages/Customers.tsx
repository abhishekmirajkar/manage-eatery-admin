
import React, { useState } from "react";
import { DataTable } from "@/components/DataTable/DataTable";
import { FormModal } from "@/components/DataTable/FormModal";
import { Customer } from "@/types/models";
import { mockCustomers } from "@/lib/mockData";
import InputWithLabel from "@/components/ui/input-with-label";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<Partial<Customer>>({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    surecart_id: "",
  });

  const columns = [
    { 
      header: "Name", 
      accessor: (customer: Customer) => {
        const initials = `${customer.first_name.charAt(0)}${customer.last_name.charAt(0)}`;
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
    { header: "SureCart ID", accessor: "surecart_id" },
  ];

  const handleAddNew = () => {
    setEditingCustomer(null);
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      surecart_id: "",
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
      surecart_id: customer.surecart_id,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (customer: Customer) => {
    setCustomers(customers.filter((c) => c.id !== customer.id));
    toast.success(`Deleted ${customer.first_name} ${customer.last_name}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCustomer) {
      // Update existing customer
      setCustomers(
        customers.map((c) =>
          c.id === editingCustomer.id
            ? { ...c, ...formData }
            : c
        )
      );
      toast.success(`Updated ${formData.first_name} ${formData.last_name}`);
    } else {
      // Create new customer
      const newCustomer: Customer = {
        id: `cust${customers.length + 1}`,
        ...formData as Customer
      };
      setCustomers([...customers, newCustomer]);
      toast.success(`Added ${formData.first_name} ${formData.last_name}`);
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
          
          <InputWithLabel
            label="SureCart ID"
            id="surecart_id"
            name="surecart_id"
            value={formData.surecart_id}
            onChange={handleInputChange}
            required
          />
        </div>
      </FormModal>
    </div>
  );
};

export default Customers;
