import Chat from '../../components/chat/Chat';
import List from '../../components/list/List';
import './profilePage.scss';

function ProfilePage() {
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
              <img
                src='https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
                alt='User Avatar'
              />
            </div>
            <div className='info-item'>
              <span className='label'>Username:</span>
              <span className='value'>John Doe</span>
            </div>
            <div className='info-item'>
              <span className='label'>E-mail:</span>
              <span className='value'>john@gmail.com</span>
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
