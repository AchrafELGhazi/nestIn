import { useContext } from 'react';
import Chat from '../../components/chat/Chat';
import List from '../../components/list/List';
import './profilePage.scss';
import { AuthContext } from '../../context/AuthContext';
import { User } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';
import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Await, useLoaderData } from 'react-router-dom';
import { Suspense } from 'react';

function ProfilePage() {
  const { updateUser, currentUser } = useContext(AuthContext);
  const { listResponse, savedResponse } = useLoaderData();

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {currentUser && (
        <div className='profilePage'>
          <div className='details'>
            <div className='wrapper'>
              <div className='title'>
                <h1>User Information</h1>
                <Link to={'/profile/update'}>
                  <button>Update Profile</button>
                </Link>
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
                  <span className='value'>
                    {formatDate(currentUser.createdAt)}
                  </span>
                </div>
              </div>
              <div className='title'>
                <h1>My List</h1>
                <Link to={'/post/new'}>
                  <button>Create New Post</button>
                </Link>
              </div>
              <Suspense fallback={<p>Loading...</p>}>
                <Await
                  resolve={listResponse}
                  errorElement={<p>Error loading myList!</p>}
                >
                  {listResponse => (
                    // listResponse.data.map(post => (
                    //   console.log(post)
                    // ))
                    <List items={listResponse.data} />
                  )}
                </Await>
              </Suspense>
              <div className='title'>
                <h1>Saved List</h1>
              </div>
              <Suspense fallback={<p>Loading...</p>}>
                <Await
                  resolve={savedResponse}
                  errorElement={<p>Error loading myList!</p>}
                >
                  {savedResponse => (
                    // listResponse.data.map(post => (
                    //   console.log(post)
                    // ))
                    <List items={savedResponse.data} />
                  )}
                </Await>
              </Suspense>
            </div>
          </div>
          <div className='chatContainer'>
            <div className='wrapper'>
              <Chat />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProfilePage;
