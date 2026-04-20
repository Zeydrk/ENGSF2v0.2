//import necessary packages
import axios from "axios";
import { useState } from "react";

//main function
export function useAccount() {
    const [accounts, setAccounts] = useState([])
    const BASE_URL = "http://localhost:3000"
    
    async function createAccount(user){
        const response = await axios.post(`${BASE_URL}/accounts/register2`, user)
        setAccounts(prev => [...prev, response.data])
        return response.data
    }

    async function loginAccount(user){
        const response = await axios.post(`${BASE_URL}/accounts/login`, user)
        setAccounts(prev => [...prev, response.data])
        return response
    }


    return{
        accounts,
        createAccount,
        loginAccount,
    }
}

