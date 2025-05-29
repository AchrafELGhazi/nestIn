import './newPostPage.scss';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import React, { useState } from 'react';
import apiRequest from '../../lib/apiRequest';
import UploadWidget from '../../cloudinary/uploadWidget';

function NewPostPage() {
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    address: '',
    city: '',
    bedroom: '',
    bathroom: '',
    type: 'rent',
    property: 'apartment',
    latitude: '',
    longitude: '',
    utilities: 'owner',
    pet: 'allowed',
    income: '',
    size: '',
    school: '',
    bus: '',
    restaurant: '',
  });

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    const requiredFields = [
      'title',
      'price',
      'address',
      'city',
      'bedroom',
      'bathroom',
    ];
    const emptyFields = requiredFields.filter(field => !formData[field]);

    if (emptyFields.length > 0) {
      setError(`Please fill in all required fields: ${emptyFields.join(', ')}`);
      return false;
    }

    if (!description.trim()) {
      setError('Description is required');
      return false;
    }

    if (parseInt(formData.price) <= 0) {
      setError('Price must be greater than 0');
      return false;
    }

    if (parseInt(formData.bedroom) < 1) {
      setError('Bedroom number must be at least 1');
      return false;
    }

    if (parseInt(formData.bathroom) < 1) {
      setError('Bathroom number must be at least 1');
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setFormData({
      title: '',
      price: '',
      address: '',
      city: '',
      bedroom: '',
      bathroom: '',
      type: 'rent',
      property: 'apartment',
      latitude: '',
      longitude: '',
      utilities: 'owner',
      pet: 'allowed',
      income: '',
      size: '',
      school: '',
      bus: '',
      restaurant: '',
    });
    setDescription('');
    setImages([]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await apiRequest.post('/post', {
        postData: {
          title: formData.title,
          price: parseInt(formData.price),
          address: formData.address,
          city: formData.city,
          bedroom: parseInt(formData.bedroom),
          bathroom: parseInt(formData.bathroom),
          type: formData.type,
          property: formData.property,
          latitude: formData.latitude || null,
          longitude: formData.longitude || null,
          images: images,
        },
        postDetail: {
          description: description,
          utilities: formData.utilities,
          pet: formData.pet,
          income: formData.income || null,
          size: formData.size ? parseInt(formData.size) : null,
          school: formData.school ? parseInt(formData.school) : null,
          bus: formData.bus ? parseInt(formData.bus) : null,
          restaurant: formData.restaurant
            ? parseInt(formData.restaurant)
            : null,
        },
      });

      setSuccess('Post created successfully! 🎉');
      resetForm();

      setTimeout(() => {
        setSuccess('');
      }, 5000);
    } catch (error) {
      console.error('Error creating post:', error);
      setError(
        error.response?.data?.message ||
          'Failed to create post. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageRemove = indexToRemove => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className='newPostPage'>
      <div className='formContainer'>
        <h1>Add New Post</h1>

        {error && (
          <div className='message error-message'>
            <span>❌ {error}</span>
            <button
              type='button'
              className='close-btn'
              onClick={() => setError('')}
              aria-label='Close error message'
            >
              ✕
            </button>
          </div>
        )}

        {success && (
          <div className='message success-message'>
            <span>✅ {success}</span>
            <button
              type='button'
              className='close-btn'
              onClick={() => setSuccess('')}
              aria-label='Close success message'
            >
              ✕
            </button>
          </div>
        )}

        <div className='wrapper'>
          <form onSubmit={handleSubmit}>
            <div className='form-section'>
              <h3>Basic Information</h3>

              <div className='item'>
                <label htmlFor='title'>Title *</label>
                <input
                  id='title'
                  name='title'
                  type='text'
                  value={formData.title}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  placeholder='Enter property title'
                  required
                />
              </div>

              <div className='item'>
                <label htmlFor='price'>Price *</label>
                <input
                  id='price'
                  name='price'
                  type='number'
                  value={formData.price}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  placeholder='Enter price'
                  min='1'
                  required
                />
              </div>

              <div className='item'>
                <label htmlFor='address'>Address *</label>
                <input
                  id='address'
                  name='address'
                  type='text'
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  placeholder='Enter full address'
                  required
                />
              </div>

              <div className='item'>
                <label htmlFor='city'>City *</label>
                <input
                  id='city'
                  name='city'
                  type='text'
                  value={formData.city}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  placeholder='Enter city'
                  required
                />
              </div>

              <div className='item description'>
                <label htmlFor='desc'>Description *</label>
                <ReactQuill
                  theme='snow'
                  value={description}
                  onChange={setDescription}
                  readOnly={isLoading}
                  placeholder='Describe your property in detail...'
                />
              </div>
            </div>

            <div className='form-section'>
              <h3>Property Details</h3>

              <div className='item-row'>
                <div className='item'>
                  <label htmlFor='bedroom'>Bedrooms *</label>
                  <input
                    min={1}
                    id='bedroom'
                    name='bedroom'
                    type='number'
                    value={formData.bedroom}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder='Number of bedrooms'
                    required
                  />
                </div>

                <div className='item'>
                  <label htmlFor='bathroom'>Bathrooms *</label>
                  <input
                    min={1}
                    id='bathroom'
                    name='bathroom'
                    type='number'
                    value={formData.bathroom}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder='Number of bathrooms'
                    required
                  />
                </div>
              </div>

              <div className='item-row'>
                <div className='item'>
                  <label htmlFor='type'>Listing Type</label>
                  <select
                    name='type'
                    value={formData.type}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  >
                    <option value='rent'>For Rent</option>
                    <option value='buy'>For Sale</option>
                  </select>
                </div>

                <div className='item'>
                  <label htmlFor='property'>Property Type</label>
                  <select
                    name='property'
                    value={formData.property}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  >
                    <option value='apartment'>Apartment</option>
                    <option value='house'>House</option>
                    <option value='condo'>Condo</option>
                    <option value='land'>Land</option>
                  </select>
                </div>
              </div>

              <div className='item'>
                <label htmlFor='size'>Total Size (sqft)</label>
                <input
                  min={0}
                  id='size'
                  name='size'
                  type='number'
                  value={formData.size}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  placeholder='Square footage'
                />
              </div>
            </div>

            <div className='form-section'>
              <h3>Location & Coordinates</h3>

              <div className='item-row'>
                <div className='item'>
                  <label htmlFor='latitude'>Latitude</label>
                  <input
                    id='latitude'
                    name='latitude'
                    type='text'
                    value={formData.latitude}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder='e.g., 40.7128'
                  />
                </div>

                <div className='item'>
                  <label htmlFor='longitude'>Longitude</label>
                  <input
                    id='longitude'
                    name='longitude'
                    type='text'
                    value={formData.longitude}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder='e.g., -74.0060'
                  />
                </div>
              </div>
            </div>

            <div className='form-section'>
              <h3>Policies & Amenities</h3>

              <div className='item-row'>
                <div className='item'>
                  <label htmlFor='utilities'>Utilities Policy</label>
                  <select
                    name='utilities'
                    value={formData.utilities}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  >
                    <option value='owner'>Owner Responsible</option>
                    <option value='tenant'>Tenant Responsible</option>
                    <option value='shared'>Shared</option>
                  </select>
                </div>

                <div className='item'>
                  <label htmlFor='pet'>Pet Policy</label>
                  <select
                    name='pet'
                    value={formData.pet}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  >
                    <option value='allowed'>Pets Allowed</option>
                    <option value='not-allowed'>No Pets</option>
                  </select>
                </div>
              </div>

              <div className='item'>
                <label htmlFor='income'>Income Policy</label>
                <input
                  id='income'
                  name='income'
                  type='text'
                  value={formData.income}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  placeholder='e.g., "3x rent required" or "No income requirement"'
                />
              </div>
            </div>

            <div className='form-section'>
              <h3>Nearby Amenities (Distance in minutes)</h3>

              <div className='item-row'>
                <div className='item'>
                  <label htmlFor='school'>School</label>
                  <input
                    min={0}
                    id='school'
                    name='school'
                    type='number'
                    value={formData.school}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder='Minutes to nearest school'
                  />
                </div>

                <div className='item'>
                  <label htmlFor='bus'>Public Transport</label>
                  <input
                    min={0}
                    id='bus'
                    name='bus'
                    type='number'
                    value={formData.bus}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder='Minutes to bus/metro'
                  />
                </div>

                <div className='item'>
                  <label htmlFor='restaurant'>Restaurant</label>
                  <input
                    min={0}
                    id='restaurant'
                    name='restaurant'
                    type='number'
                    value={formData.restaurant}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder='Minutes to restaurants'
                  />
                </div>
              </div>
            </div>

            <button
              type='submit'
              className={`sendButton ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className='spinner'></span>
                  Creating Post...
                </>
              ) : (
                'Add Post'
              )}
            </button>
          </form>
        </div>
      </div>

      <div className='sideContainer'>
        <h3>Property Images</h3>

        {images.length > 0 && (
          <div className='images-grid'>
            {images.map((image, index) => (
              <div key={index} className='image-container'>
                <img src={image} alt={`Property ${index + 1}`} />
                <button
                  type='button'
                  className='remove-image-btn'
                  onClick={() => handleImageRemove(index)}
                  disabled={isLoading}
                  aria-label={`Remove image ${index + 1}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <UploadWidget
          uwConfig={{
            cloudName: 'dcrlbpshu',
            uploadPreset: 'NestIn',
            multiple: true,
            maxImageSize: 10000000,
            folder: 'postImages',
          }}
          setState={setImages}
          disabled={isLoading}
        />

        {images.length === 0 && (
          <p className='no-images-text'>
            📷 Add some photos to showcase your property
          </p>
        )}
      </div>
    </div>
  );
}

export default NewPostPage;
