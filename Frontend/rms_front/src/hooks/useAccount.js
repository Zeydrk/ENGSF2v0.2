//import necessary packages
import axios from "axios";
import { useState } from "react";

//main function
export function useAccount() {
    const [accounts, setAccounts] = useState([])
    // const BASE_URL = "http://localhost:3000"
    const API_URL = import.meta.env.VITE_API_URL;
    
    async function createAccount(user){
        const response = await axios.post(`${API_URL}/accounts/register2`, user)
        setAccounts(prev => [...prev, response.data])
        return response.data
    }

    async function loginAccount(user){
        const response = await axios.post(`${API_URL}/accounts/login`, user)
        setAccounts(prev => [...prev, response.data])
        return response
    }


    return{
        accounts,
        createAccount,
        loginAccount,
    }
}

