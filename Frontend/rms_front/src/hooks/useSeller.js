import { useState } from "react";
import axios from "axios";

export function useSeller() {
  const [sellers, setSellers] = useState([]);
  const BASE_URL = "http://localhost:3000/sellers";

  async function getAllSellers() {
    const res = await axios.get(BASE_URL);
    setSellers(res.data || []);
  }

  async function createSeller(seller) {
    const res = await axios.post(`${BASE_URL}/create`, seller);
    setSellers(prev => [...prev, res.data]);
  }

  async function updateSeller(seller) {
    await axios.post(`${BASE_URL}/update`, seller);
    await getAllSellers();
  }

  async function deleteSeller(id) {
    await axios.post(`${BASE_URL}/delete`, { id });
    await getAllSellers();
  }

  async function claimSeller(id) {
    await axios.post(`${BASE_URL}/claim`, { id });
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
