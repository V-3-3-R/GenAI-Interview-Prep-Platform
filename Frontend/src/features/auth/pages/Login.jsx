import React, { useState } from 'react'
import { useNavigate,Link } from 'react-router-dom'
import "../auth.form.scss"
import { useAuth } from "../hooks/useAuth.js";
import SplashCursor from "../../../components/ui/SplashCursor.jsx";
import Spinner from "../../../components/ui/Spinner.jsx";

const Login = () => {

    const  {loading, handleLogin} = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        await handleLogin({email,password})
        navigate('/')
    }

    if(loading){
        return <Spinner label="Loading..." />
    }

  return (
    <main>
        <SplashCursor />
        <div className='form-container'>
            {/* MAIN HEADING */}
            <h1>Login</h1>
            {/* THE REQUIRED FIELDS IN THE FORM */}
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input onChange={(e)=>{setEmail(e.target.value)}} type="text" id='email' name='email' placeholder='Enter your Email' />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input onChange={(e)=>{setPassword(e.target.value)}} type="password" id='password' name='password' placeholder='Enter your Password' />
                </div>
                <button className='button button-primary' type="submit">Login</button>

            </form>
            <p>Don't have an account? <Link to={"/register"}>Register</Link></p>
        </div>
    </main>
  )
}

export default Login
