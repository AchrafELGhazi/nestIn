import { useContext, useState } from 'react';
import './profileUpdatePage.scss';
import { AuthContext } from '../../context/AuthContext';
import { User } from 'lucide-react';
import apiRequest from '../../lib/apiRequest';
import UploadWidget from '../../cloudinary/uploadWidget';

function ProfileUpdatePage() {
  const { currentUser, updateUser } = useContext(AuthContext);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [avatar, setAvatar] = useState(currentUser.avatar);


  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const formData = new FormData(e.target);
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');

    const updateData = {};
    if (username && username.trim()) updateData.username = username.trim();
    if (email && email.trim()) updateData.email = email.trim();
    if (password && password.trim()) updateData.password = password.trim();
    updateData.avatar = avatar;
    
    if (Object.keys(updateData).length === 0) {
      setError('Please provide at least one field to update');
      setIsLoading(false);
      return;
    }

    try {
      const result = await apiRequest.put(
        `/user/${currentUser.id}`,
        updateData
      );

      if (result.data.success) {
        setSuccess('Profile updated successfully!');
        updateUser(result.data.data);

        e.target.reset();
        if (currentUser.username)
          e.target.username.value =
            result.data.data.username || currentUser.username;
        if (currentUser.email)
          e.target.email.value = result.data.data.email || currentUser.email;
      } else {
        setError(result.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update error:', error);

      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('An error occurred while updating your profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className='profileUpdatePage'>
      <div className='formContainer'>
        <form onSubmit={handleSubmit}>
          <h1>Update Profile</h1>

          {error && <div className='error-message'>{error}</div>}
          {success && <div className='success-message'>{success}</div>}

          <div className='item'>
            <label htmlFor='username'>Username</label>
            <input
              id='username'
              name='username'
              type='text'
              defaultValue={currentUser.username || ''}
              placeholder='Enter new username'
            />
          </div>

          <div className='item'>
            <label htmlFor='email'>Email</label>
            <input
              id='email'
              name='email'
              type='email'
              defaultValue={currentUser.email || ''}
              placeholder='Enter new email'
            />
          </div>

          <div className='item'>
            <label htmlFor='password'>Password</label>
            <input
              id='password'
              name='password'
              type='password'
              placeholder='Enter new password (leave blank to keep current)'
            />
          </div>

          <button type='submit' disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>

      <div className='sideContainer'>
        {avatar ? (
          <img src={avatar} alt='User avatar' className='avatar' />
        ) : (
          <User className='avatar text-gray-400' size={120} />
        )}
        <UploadWidget
          uwConfig={{
            cloudName: 'dcrlbpshu',
            uploadPreset: 'NestIn',
            multiple: false,
            maxImageSize: 10000000,
            folder: 'avatars',
          }}
          setState={setAvatar}
        />
        <div className='user-info'>
          <h3>{currentUser.username}</h3>
          <p>{currentUser.email}</p>
        </div>
      </div>
    </div>
  );
}

export default ProfileUpdatePage;
