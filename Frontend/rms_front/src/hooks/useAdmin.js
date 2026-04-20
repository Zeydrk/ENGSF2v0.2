import { useState } from "react";
import axios from "axios";

export function useAdmin() {
    const [admins, setAdmins] = useState([]);
    const BASE_URL = "http://localhost:3000";

    async function fetchAdmins(user) {
        // You likely need withCredentials here too so the browser SAVES the cookie after login
        const response = await axios.post(`${BASE_URL}/admins/login`, user, {
            withCredentials: true 
        });
        setAdmins(prev => [...prev, response.data]);
        return response;
    }

    async function createAdmin(user) {
        const response = await axios.post(`${BASE_URL}/admins/`, user);
        setAdmins(prev => [...prev, response.data]);
        return response;
    }
    
    async function forgotPassword(email) {
        const response = await axios.post(`${BASE_URL}/admins/forgot-password`, email);
        setAdmins(response.data);
        return response.data;
    }

    async function resetPassword(password, token) {
        const response = await axios.post(`${BASE_URL}/admins/reset-password`, { password, token });
        setAdmins(response.data);
        return response.data;
    }

    // --- NEW LOGOUT FUNCTION ---
    async function logoutAdmin() {
        // We pass an empty object {} as the body, followed by the config object
        const response = await axios.post(`${BASE_URL}/admins/logout`, {}, {
            withCredentials: true // CRITICAL: Tells Axios to send the session cookie
        });
        
        // Clear your local state to reflect that the user is gone
        setAdmins([]);
        
        return response.data;
    }

    return {
        admins,
        fetchAdmins,
        createAdmin,
        forgotPassword,
        resetPassword,
        logoutAdmin, // Make sure to export it here
    };
}