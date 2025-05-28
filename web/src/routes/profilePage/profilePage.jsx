import { useContext } from 'react';
import Chat from '../../components/chat/Chat';
import List from '../../components/list/List';
import './profilePage.scss';
import { AuthContext } from '../../context/AuthContext';
import { User } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ProfilePage() {
  const { updateUser, currentUser } = useContext(AuthContext);

  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser]);

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className='profilePage'>
      <div className='details'>
        <div className='wrapper'>
          <div className='title'>
            <h1>User Information</h1>
            <button>Update Profile</button>
          </div>
          <div className='info'>
            <div className='info-item'>
              <span className='label'>Avatar:</span>
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.username}
                  className='user-avatar'
                />
              ) : (
                <User size={27} className='user-icon' />
              )}
            </div>
            <div className='info-item'>
              <span className='label'>Username:</span>
              <span className='value'>{currentUser.username}</span>
            </div>
            <div className='info-item'>
              <span className='label'>E-mail:</span>
              <span className='value'>{currentUser.email}</span>
            </div>
            <div className='info-item'>
              <span className='label'>Joined at:</span>
              <span className='value'>{formatDate(currentUser.createdAt)}</span>
            </div>
          </div>
          <div className='title'>
            <h1>My List</h1>
            <button>Create New Post</button>
          </div>
          <List />
          <div className='title'>
            <h1>Saved List</h1>
          </div>
          <List />
        </div>
      </div>
      <div className='chatContainer'>
        <div className='wrapper'>
          <Chat />
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
