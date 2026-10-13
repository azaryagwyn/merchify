import { useState, useEffect } from 'react';
import { User } from '../../shared/types';

export function useAuth() {
  const [customerUser, setCustomerUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('univ_merch_customer');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [adminUser, setAdminUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('univ_merch_admin');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  useEffect(() => {
    if (customerUser) {
      localStorage.setItem('univ_merch_customer', JSON.stringify(customerUser));
    } else {
      localStorage.removeItem('univ_merch_customer');
    }
  }, [customerUser]);

  useEffect(() => {
    if (adminUser) {
      localStorage.setItem('univ_merch_admin', JSON.stringify(adminUser));
    } else {
      localStorage.removeItem('univ_merch_admin');
    }
  }, [adminUser]);

  useEffect(() => {
    fetch('/api/auth/users')
      .then((res) => res.json() as Promise<any>)
      .then((data) => {
        if (data?.success) {
          setAvailableUsers(data.data);
        }
      })
      .catch((err) => console.error('Failed to load users:', err));
  }, []);

  const loginCustomer = async (identifier: string, password?: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/auth/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json() as any;
      if (data.success) {
        setCustomerUser(data.data);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Gagal login customer' };
    } catch {
      return { success: false, message: 'Terjadi kesalahan koneksi' };
    }
  };

  const registerCustomer = async (formData: {
    name: string;
    email: string;
    studentId?: string;
    phone?: string;
    password?: string;
  }): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/auth/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json() as any;
      if (data.success) {
        setCustomerUser(data.data);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Gagal mendaftar' };
    } catch {
      return { success: false, message: 'Terjadi kesalahan koneksi' };
    }
  };

  const logoutCustomer = () => {
    setCustomerUser(null);
  };

  const loginAdmin = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json() as any;
      if (data.success) {
        setAdminUser(data.data);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Gagal login admin' };
    } catch {
      return { success: false, message: 'Terjadi kesalahan koneksi' };
    }
  };

  const logoutAdmin = () => {
    setAdminUser(null);
  };

  return {
    customerUser,
    adminUser,
    isCustomerLoggedIn: Boolean(customerUser),
    isAdminLoggedIn: Boolean(adminUser && adminUser.role === 'ADMIN'),
    loginCustomer,
    registerCustomer,
    logoutCustomer,
    loginAdmin,
    logoutAdmin,
    availableUsers,
  };
}
