import { useState } from 'react';
import './navbar.scss';
import { Link, useNavigate } from 'react-router-dom';
import apiRequest from '../../lib/apiRequest';

function Navbar() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(true);

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      setError('');
      setIsLoading(true);
      const result = await apiRequest.post('/auth/logout');
      localStorage.removeItem('user');
      setUser(false);
      navigate('/');
      console.log(result.data);
    } catch (error) {
      console.log(error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <nav>
      <div className='left'>
        <a href='/' className='logo'>
          <img src='/logo.png' alt='' />
          <span>NestIn</span>
        </a>
        <a href='/'>Home</a>
        <a href='/'>About</a>
        <a href='/'>Contact</a>
        <a href='/'>Agents</a>
      </div>
      <div className='right'>
        {user ? (
          <div className='user'>
            <img
              src='https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
              alt=''
            />
            <span>John Doe</span>
            <Link to='/profile' className='profile'>
              <div className='notification'>3</div>
              <span>Profile</span>
            </Link>
            <button onClick={handleLogout} disabled={isLoading}>
              Logout
            </button>
          </div>
        ) : (
          <>
            <a href='/'>Sign in</a>
            <a href='/' className='register'>
              Sign up
            </a>
          </>
        )}
        <div className='menuIcon'>
          <img src='/menu.png' alt='' onClick={() => setOpen(prev => !prev)} />
        </div>
        <div className={open ? 'menu active' : 'menu'}>
          <a href='/'>Home</a>
          <a href='/'>About</a>
          <a href='/'>Contact</a>
          <a href='/'>Agents</a>
          <a href='/'>Sign in</a>
          <a href='/'>Sign up</a>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
