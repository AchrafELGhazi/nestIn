import './register.scss';
import { Link , useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';


function Register() {
  const [error, setError] = useState("");
  const navigate = useNavigate()
  const API_URL = import.meta.env.VITE_API_URL || '';

  const handleSubmit = async e => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const res = await axios.post(`${API_URL}/auth/register`, {
        username,
        email,
        password,
      });

      console.log(res.data);
      navigate("/login")
    } catch (error) {
      console.log(error);
      setError(
        error.response?.data?.message || error.message || 'Registration failed'
      );
    }t
  };
  return (
    <div className='register'>
      <div className='formContainer'>
        <form onSubmit={handleSubmit}>
          <h1>Create an Account</h1>
          <input name='username' type='text' placeholder='Username' />
          <input name='email' type='text' placeholder='Email' />
          <input name='password' type='password' placeholder='Password' />
          {error && <span className='error'>{error}</span>}
          <button>Register</button>
          <Link to='/login'>Do you have an account?</Link>
        </form>
      </div>
      <div className='imgContainer'>
        <img src='/bg.png' alt='' />
      </div>
    </div>
  );
}

export default Register;
