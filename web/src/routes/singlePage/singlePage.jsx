import './singlePage.scss';
import Slider from '../../components/slider/Slider';
import Map from '../../components/map/Map';
import { useLoaderData } from 'react-router-dom';
import apiRequest from '../../lib/apiRequest';
import { useState, useEffect } from 'react';

function SinglePage() {
  const data = useLoaderData();
  const postData = data.data;
  const postDetails = postData.PostDetail;
  const userData = postData.user;

  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsSaved(data.isSaved || false);
    console.log('Initial save status:', data.isSaved || false);
  }, [data.isSaved]);



  useEffect(() => {
    console.log('This post is saved: ', isSaved);
  }, [isSaved]);



  const handleSave = async () => {
    try {
      if (isLoading) return;

      setIsLoading(true);
      const response = await apiRequest.post('/user/save', {
        id: postData.id,
      });
      console.log(response);
      const newSavedState = !isSaved;
      setIsSaved(newSavedState);

      console.log(
        newSavedState
          ? 'Post saved successfully!'
          : 'Post removed from saved list!'
      );
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Failed to save post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  const formatDistance = distance => {
    if (!distance) return 'Not specified';
    return distance >= 1000
      ? `${(distance / 1000).toFixed(1)}km`
      : `${distance}m`;
  };

  const formatUtilities = utilities => {
    switch (utilities) {
      case 'owner':
        return 'Owner is responsible';
      case 'tenant':
        return 'Tenant is responsible';
      case 'shared':
        return 'Shared responsibility';
      default:
        return 'Not specified';
    }
  };

  const formatPetPolicy = pet => {
    switch (pet) {
      case 'allowed':
        return 'Pets allowed';
      case 'not-allowed':
        return 'No pets allowed';
      default:
        return 'Not specified';
    }
  };

  const formatPropertyType = type => {
    return type
      ? type.charAt(0).toUpperCase() + type.slice(1)
      : 'Not specified';
  };

  const formatListingType = type => {
    return type === 'buy' ? 'For Sale' : 'For Rent';
  };

  return (
    <div className='singlePage'>
      <div className='details'>
        <div className='wrapper'>
          <Slider images={postData.images} />
          <div className='info'>
            <div className='top'>
              <div className='post'>
                <h1>{postData.title}</h1>
                <div className='address'>
                  <img src='/pin.png' alt='Location pin' />
                  <span>
                    {postData.address}, {postData.city}
                  </span>
                </div>
                <div className='price'>
                  ${postData.price?.toLocaleString()}
                  <span className='listing-type'>
                    ({formatListingType(postData.type)})
                  </span>
                </div>
                <div className='property-type'>
                  {formatPropertyType(postData.property)}
                </div>
              </div>
              <div className='user'>
                <img
                  src={userData.avatar}
                  alt={`${userData.username}'s avatar`}
                />
                <div className='user-info'>
                  <span className='username'>{userData.username}</span>
                  <br />
                  <span className='email'>{userData.email}</span>
                </div>
              </div>
            </div>
            <div className='bottom'>
              <div
                className='description'
                dangerouslySetInnerHTML={{ __html: postDetails.description }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className='features'>
        <div className='wrapper'>
          <p className='title1'>General Information</p>
          <div className='listVertical'>
            <div className='feature'>
              <img src='/utility.png' alt='Utilities icon' />
              <div className='featureText'>
                <span>Utilities</span>
                <p>{formatUtilities(postDetails.utilities)}</p>
              </div>
            </div>
            <div className='feature'>
              <img src='/pet.png' alt='Pet policy icon' />
              <div className='featureText'>
                <span>Pet Policy</span>
                <p>{formatPetPolicy(postDetails.pet)}</p>
              </div>
            </div>
            <div className='feature'>
              <img src='/fee.png' alt='Income requirements icon' />
              <div className='featureText'>
                <span>Income Requirements</span>
                <p>{postDetails.income || 'No specific requirements'}</p>
              </div>
            </div>
          </div>

          <p className='title1'>Property Details</p>
          <div className='sizes'>
            {postDetails.size && (
              <div className='size'>
                <img src='/size.png' alt='Size icon' />
                <span>{postDetails.size.toLocaleString()} sqft</span>
              </div>
            )}
            <div className='size'>
              <img src='/bed.png' alt='Bedroom icon' />
              <span>
                {postData.bedroom}{' '}
                {postData.bedroom === 1 ? 'bedroom' : 'bedrooms'}
              </span>
            </div>
            <div className='size'>
              <img src='/bath.png' alt='Bathroom icon' />
              <span>
                {postData.bathroom}{' '}
                {postData.bathroom === 1 ? 'bathroom' : 'bathrooms'}
              </span>
            </div>
          </div>

          <p className='title1'>Nearby Places</p>
          <div className='listHorizontal'>
            {postDetails.school && (
              <div className='feature'>
                <img src='/school.png' alt='School icon' />
                <div className='featureText'>
                  <span>School</span>
                  <p>{formatDistance(postDetails.school)} away</p>
                </div>
              </div>
            )}
            {postDetails.bus && (
              <div className='feature'>
                <img src='/bus.png' alt='Bus stop icon' />
                <div className='featureText'>
                  <span>Public Transport</span>
                  <p>{formatDistance(postDetails.bus)} away</p>
                </div>
              </div>
            )}
            {postDetails.restaurant && (
              <div className='feature'>
                <img src='/restaurant.png' alt='Restaurant icon' />
                <div className='featureText'>
                  <span>Restaurant</span>
                  <p>{formatDistance(postDetails.restaurant)} away</p>
                </div>
              </div>
            )}
          </div>

          {postData.latitude && postData.longitude && (
            <>
              <p className='title1'>Location</p>
              <div className='mapContainer'>
                <Map items={[postData]} />
              </div>
            </>
          )}

          <div className='property-meta'>
            <p className='title1'>Property Information</p>
            <div className='meta-grid'>
              <div className='meta-item'>
                <span className='meta-label'>Listed on:</span>
                <span className='meta-value'>
                  {new Date(postData.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className='meta-item'>
                <span className='meta-label'>Property ID:</span>
                <span className='meta-value'>{postData.id}</span>
              </div>
              {postData.latitude && postData.longitude && (
                <div className='meta-item'>
                  <span className='meta-label'>Coordinates:</span>
                  <span className='meta-value'>
                    {parseFloat(postData.latitude).toFixed(6)},{' '}
                    {parseFloat(postData.longitude).toFixed(6)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className='buttons'>
            <button className='message-btn'>
              <img src='/chat.png' alt='Chat icon' />
              Send a Message
            </button>
            <button
              className={`save-btn ${isSaved ? 'saved' : ''}`}
              onClick={handleSave}
              disabled={isLoading}
            >
              <img src='/save.png' alt='Save icon' />
              {isLoading
                ? 'Saving...'
                : isSaved
                ? 'Remove from Saved'
                : 'Save the Place'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SinglePage;
