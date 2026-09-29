import { useAuth } from "@/features/auth/hooks/useAuth";
import { Navigate } from "react-router";
import React from 'react'
import Spinner from "@/components/ui/Spinner.jsx";

const Protected = ({children}) => {
    const { loading,user } = useAuth()

    if(loading){
        return <Spinner label="Loading..." />
    }

    if(!user){
        return <Navigate to={'/login'} />
    }
  return children
}

export default Protected
