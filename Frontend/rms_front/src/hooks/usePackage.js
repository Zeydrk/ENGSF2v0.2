import axios from 'axios';
import { useState } from 'react';

export function usePackage() {
  const [packages, setPackages] = useState([]);
  const [archivedPackages, setArchivedPackages] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [balance, setBalance] = useState(0);
  const BASE_URL = "http://localhost:3000";

  function computeBalance(packagesList) {
    return packagesList
      .filter(p => p.payment_Status.toLowerCase() === "paid")
      .reduce((sum, p) => sum + Number(p.price || 0), 0);
  }

const getAllPackage = async () => {
  try {
    const response = await fetch('http://localhost:3000/packages');
    if (!response.ok) {
      throw new Error('Failed to fetch packages');
    }
    const data = await response.json();
    setPackages(data); // This should only show non-archived packages
  } catch (error) {
    console.error('Error fetching packages:', error);
    setError(error.message);
  }
};

  async function createPackage(packg) {
    try {
      const res = await axios.post(`${BASE_URL}/packages/create`, {
        ...packg,
        payment_Status: "unpaid"
      });

      setPackages(prev => [...prev, res.data]);
    } catch (err) {
      console.error("Error creating package:", err);
      throw err;
    }
  }

  const deletePackage = async (packageData) => {
    try {
      const response = await fetch(`http://localhost:3000/packages/delete`, {
        method: 'POST',  // Change from DELETE to POST
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: packageData.id }), // Make sure to send the id in body
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete package');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting package:', error);
      throw error;
    }
  };
  async function updatePackage(packg) {
    try {
      const original = packages.find(p => p.id === packg.id);

      const res = await axios.post(`${BASE_URL}/packages/update`, {
        ...packg,
        payment_Status: packg.payment_Status.toLowerCase()
      });

      const updated = res.data.package || res.data;

      let newBalance = balance;
      if (original.payment_Status.toLowerCase() === "unpaid" && updated.payment_Status.toLowerCase() === "paid") {
        newBalance += Number(updated.price || 0);
      }
      if (original.payment_Status.toLowerCase() === "paid" && updated.payment_Status.toLowerCase() === "unpaid") {
        newBalance -= Number(updated.price || 0);
      }
      setBalance(newBalance);

      setPackages(prev => prev.map(p => p.id === packg.id ? updated : p));
      
      return { success: true, data: updated };
    } catch (err) {
      console.error("Error updating package:", err);
      if (err.response?.data?.error === "UNPAID_PACKAGE") {
        throw new Error(err.response.data.message);
      }
      throw err;
    }
  }

  async function getAllSellers() {
    try {
      const res = await axios.get(`${BASE_URL}/packages/sellers/list`);
      setSellers(res.data);
    } catch (err) {
      console.error("Error fetching sellers:", err);
      throw err;
    }
  }

  async function getArchivedPackages() {
    try {
      const res = await axios.get(`${BASE_URL}/packages/archived/all`);
      setArchivedPackages(res.data);
      return res.data;
    } catch (err) {
      console.error("Error fetching archived packages:", err);
      throw err;
    }
  }

  async function restorePackage(packageId) {
    try {
      const res = await axios.post(`${BASE_URL}/packages/restore`, { id: packageId });
      return res.data;
    } catch (err) {
      console.error("Error restoring package:", err);
      throw err;
    }
  }

  return {
    packages,
    archivedPackages,
    sellers,
    balance,
    getAllPackage,
    createPackage,
    deletePackage,
    updatePackage,
    getAllSellers,
    getArchivedPackages,
    restorePackage
  };
}