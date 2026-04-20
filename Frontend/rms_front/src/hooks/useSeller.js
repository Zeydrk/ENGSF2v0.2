import { useState } from "react";
import axios from "axios";

export function useSeller() {
  const [sellers, setSellers] = useState([]);
  // const BASE_URL = "http://localhost:3000/sellers";
  const API_URL = import.meta.env.VITE_API_URL;


  async function getAllSellers() {
    const res = await axios.get(API_URL);
    setSellers(res.data || []);
  }

  async function createSeller(seller) {
    const res = await axios.post(`${API_URL}/sellers/create`, seller);
    setSellers(prev => [...prev, res.data]);
  }

  async function updateSeller(seller) {
    await axios.post(`${API_URL}/sellers/update`, seller);
    await getAllSellers();
  }

  async function deleteSeller(id) {
    await axios.post(`${API_URL}/sellers/delete`, { id });
    await getAllSellers();
  }

  async function claimSeller(id) {
    await axios.post(`${API_URL}/sellers/claim`, { id });
    await getAllSellers();
  }



  return {
    sellers,
    getAllSellers,
    createSeller,
    updateSeller,
    deleteSeller,
    claimSeller,
  };
}
