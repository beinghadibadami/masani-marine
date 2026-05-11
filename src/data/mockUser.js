// Mock user data — replace with Supabase auth when ready
export const mockCustomerUser = {
  id: 'user-001',
  email: 'captain@seafarer.com',
  full_name: 'James Hartwell',
  role: 'customer',
  phone: '+1 (555) 234-5678',
  created_at: '2024-01-15T10:00:00Z',
  addresses: [
    {
      id: 'addr-1',
      label: 'Home Port',
      line1: '47 Harbor View Drive',
      line2: 'Suite 12',
      city: 'Portsmouth',
      state: 'NH',
      zip: '03801',
      country: 'United States',
      isDefault: true,
    },
  ],
}

export const mockAdminUser = {
  id: 'admin-001',
  email: 'admin@masanimarine.com',
  full_name: 'Rahul Masani',
  role: 'admin',
  phone: '+971 50 123 4567',
  created_at: '2023-06-01T08:00:00Z',
}
