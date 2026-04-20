import axios from "axios";
import { useState, useCallback } from "react";

// --- Optional debounce helper ---
function debounce(cb, delay = 300) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => cb(...args), delay);
  };
}

export function useProduct() {
  const BASE_URL = "http://localhost:3000";

  // --- State ---
  const [products, setProducts] = useState([]);
  const [archived, setArchived] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- Error handler ---
  const handleError = (err) => {
    console.error(err);
    setError(err?.message || "Something went wrong");
  };

  // --- Fetch all active products ---
  const getAllProducts = useCallback(async (page = 1, limit = 7) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/products?page=${page}&limit=${limit}`);
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();
      setProducts(data.products || []);
      setError("");
      return data;
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Fetch all archived products ---
  const archivedProducts = useCallback(async (page = 1, limit = 7) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/products/archived?page=${page}&limit=${limit}`);
      if (!res.ok) throw new Error("Failed to load archived products");
      const data = await res.json();
      setArchived(data.products || []);
      setError("");
      return data;
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = async (product) => {
    try {
      const response = await axios.post(`${BASE_URL}/products/create`, product);
      await getAllProducts();
    } catch (err) {
      handleError(err);
    }
  };

  const updateProduct = async (product) => {
    try {
    await axios.post(`${BASE_URL}/products/update`, product);
  
      await getAllProducts();
    } catch (err) {
      handleError(err);
    }
  };

  const deleteProduct = async (product) => {
    try {
      await axios.post(`${BASE_URL}/products/delete`, { id: product.id });
      await getAllProducts();
    } catch (err) {
      handleError(err);
    }
  };

  const archiveProduct = async (product) => {
    try {
      await axios.post(`${BASE_URL}/products/archive`, { id: product.id });
      await getAllProducts();
      await archivedProducts();
    } catch (err) {
      handleError(err);
    }
  };

  const archiveAddBack = async (product) => {
    try {
      await axios.post(`${BASE_URL}/products/addBack`, { id: product.id });
      await getAllProducts();
      await archivedProducts();
    } catch (err) {
      handleError(err);
    }
  };

  // --- Debounced Search ---
const searchProduct = useCallback(
  debounce(async (search, category) => {

    const res = await axios.get(`${BASE_URL}/products/search`, {
      params: {
        search: search || "",
        category: category || "",
      },
    });

    setProducts(res.data || []);
  }, 300),
  []
);


  const searchArchivedProduct = useCallback(
    debounce(async (search, category) => {
    const res = await axios.get(`${BASE_URL}/products/searchArchive`, {
      params: {
        search: search || "",
        category: category || "",
      },
    });
    setArchived(res.data || []);
  }, 300),
  []
  );

  // // --- Category Sorting ---
  // const categorySort = async (order) => {
  //   try {
  //     const res = await axios.get(`${BASE_URL}/products/category`, { params: { sort: order } });
  //     setProducts(res.data?.length ? res.data : []);
  //     setError(res.data?.length ? "" : `No products for: ${order}`);
  //   } catch (err) {
  //     handleError(err);
  //   }
  // };

  // const categoryArchiveSort = async (order) => {
  //   try {
  //     const res = await axios.get(`${BASE_URL}/products/categoryArchive`, { params: { sort: order } });
  //     setArchived(res.data?.length ? res.data : []);
  //     setError(res.data?.length ? "" : `No archived products for: ${order}`);
  //   } catch (err) {
  //     handleError(err);
  //   }
  // };

  // --- Return everything ---
  return {
    products,
    archived,
    loading,
    error,
    setError,
    getAllProducts,
    archivedProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    archiveProduct,
    archiveAddBack,
    searchProduct,
    searchArchivedProduct,
    //categorySort,
    //categoryArchiveSort,
  };
}
