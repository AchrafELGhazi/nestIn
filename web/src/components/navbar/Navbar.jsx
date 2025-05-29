import { useState } from 'react';
import './navbar.scss';
import { Link, useNavigate } from 'react-router-dom';
import apiRequest from '../../lib/apiRequest';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { User } from 'lucide-react';

function Navbar() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { currentUser, updateUser } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await apiRequest.post('/auth/logout');
      updateUser(null);
      navigate('/');
      setOpen(false);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMenuItemClick = () => {
    setOpen(false);
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
        {currentUser ? (
          <div className='user'>
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                className='user-avatar'
              />
            ) : (
              <User size={27} className='user-icon' />
            )}
            <span>{currentUser.username}</span>
            <Link to='/profile' className='profile'>
              <div className='notification'>3</div>
              <span>Profile</span>
            </Link>
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className='logout'
            >
              {isLoading ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        ) : (
          <>
            <a href='/login'>Sign in</a>
            <a href='/register' className='register1'>
              Sign up
            </a>
          </>
        )}

        <div className='menuIcon'>
          <img src='/menu.png' alt='' onClick={() => setOpen(prev => !prev)} />
        </div>

        {open && (
          <div className='menu-overlay' onClick={() => setOpen(false)}></div>
        )}

        <div className={open ? 'menu active' : 'menu'}>
          <div className='menu-header'>
            <div className='menu-logo'>
              <img src='/logo.png' alt='NestIn' />
              <span>NestIn</span>
            </div>
          </div>

          <div className='menu-content'>
            <div className='menu-nav'>
              <Link to='/' onClick={handleMenuItemClick}>
                Home
              </Link>
              <Link to='/' onClick={handleMenuItemClick}>
                About
              </Link>
              <Link to='/' onClick={handleMenuItemClick}>
                Contact
              </Link>
              <Link to='/' onClick={handleMenuItemClick}>
                Agents
              </Link>
            </div>

            {currentUser ? (
              <div className='menu-user-section'>
                <div className='menu-user-info'>
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.username}
                      className='menu-user-avatar'
                    />
                  ) : (
                    <User size={24} className='menu-user-icon' />
                  )}
                  <span className='menu-username'>{currentUser.username}</span>
                  <div className='menu-notification'>3</div>
                </div>
                <div className='menu-user-actions'>
                  <Link
                    to='/profile'
                    className='menu-profile-btn'
                    onClick={handleMenuItemClick}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    disabled={isLoading}
                    className='menu-logout-btn'
                  >
                    {isLoading ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              </div>
            ) : (
              <div className='menu-auth-section'>
                <Link
                  to='/login'
                  className='menu-signin-btn'
                  onClick={handleMenuItemClick}
                >
                  Sign in
                </Link>
                <Link
                  to='/register'
                  className='menu-signup-btn'
                  onClick={handleMenuItemClick}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
