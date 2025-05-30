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
          <div className='owner-header'>
            <div className='owner-info'>
              <img
                src={userData.avatar}
                alt={`${userData.username}'s avatar`}
                className='owner-avatar'
              />
              <div className='owner-details'>
                <h3 className='owner-name'>{userData.username}</h3>
                <p className='owner-email'>{userData.email}</p>
                <span className='listing-date'>
                  Listed{' '}
                  {new Date(postData.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
            <div className='action-buttons'>
              <button
                className='message-btn'
                onClick={() => console.log('Message owner')}
              >
                <img src='/chat.png' alt='Chat icon' />
                Message
              </button>
              <button
                className={`save-btn ${isSaved ? 'saved' : ''}`}
                onClick={handleSave}
                disabled={isLoading}
              >
                <img src='/save.png' alt='Save icon' />
                {isLoading ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>

          <div className='property-header'>
            <div className='property-title-section'>
              <div className='property-badges'>
                <span className='property-type-badge'>
                  {formatPropertyType(postData.property)}
                </span>
                <span className='listing-type-badge'>
                  {formatListingType(postData.type)}
                </span>
              </div>
              <h1 className='property-title'>{postData.title}</h1>
              <div className='property-location'>
                <img src='/pin.png' alt='Location pin' />
                <span>
                  {postData.address}, {postData.city}
                </span>
              </div>
              <div className='price-container'>
                <span className='price'>
                  ${postData.price?.toLocaleString()}
                </span>
                <span className='price-type'>
                  {postData.type === 'buy' ? 'Purchase Price' : 'Monthly Rent'}
                </span>
              </div>
            </div>
          </div>

          <div className='property-images'>
            <Slider images={postData.images} />
          </div>

          <div className='property-description'>
            <h2 className='section-title'>About this property</h2>
            <div
              className='description-content'
              dangerouslySetInnerHTML={{ __html: postDetails.description }}
            />
          </div>

          <div className='property-specs'>
            <h2 className='section-title'>Property Specifications</h2>
            <div className='specs-grid'>
              {postDetails.size && (
                <div className='spec-item'>
                  <img src='/size.png' alt='Size icon' />
                  <div className='spec-details'>
                    <span className='spec-label'>Size</span>
                    <span className='spec-value'>
                      {postDetails.size.toLocaleString()} sqft
                    </span>
                  </div>
                </div>
              )}
              <div className='spec-item'>
                <img src='/bed.png' alt='Bedroom icon' />
                <div className='spec-details'>
                  <span className='spec-label'>Bedrooms</span>
                  <span className='spec-value'>{postData.bedroom}</span>
                </div>
              </div>
              <div className='spec-item'>
                <img src='/bath.png' alt='Bathroom icon' />
                <div className='spec-details'>
                  <span className='spec-label'>Bathrooms</span>
                  <span className='spec-value'>{postData.bathroom}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='features'>
        <div className='wrapper'>
          <div className='info-section'>
            <h2 className='section-title'>General Information</h2>
            <div className='info-grid'>
              <div className='info-item'>
                <img src='/utility.png' alt='Utilities icon' />
                <div className='info-content'>
                  <span className='info-label'>Utilities</span>
                  <p className='info-value'>
                    {formatUtilities(postDetails.utilities)}
                  </p>
                </div>
              </div>
              <div className='info-item'>
                <img src='/pet.png' alt='Pet policy icon' />
                <div className='info-content'>
                  <span className='info-label'>Pet Policy</span>
                  <p className='info-value'>
                    {formatPetPolicy(postDetails.pet)}
                  </p>
                </div>
              </div>
              <div className='info-item'>
                <img src='/fee.png' alt='Income requirements icon' />
                <div className='info-content'>
                  <span className='info-label'>Income Requirements</span>
                  <p className='info-value'>
                    {postDetails.income || 'No specific requirements'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {(postDetails.school ||
            postDetails.bus ||
            postDetails.restaurant) && (
            <div className='nearby-section'>
              <h2 className='section-title'>Nearby Places</h2>
              <div className='nearby-grid'>
                {postDetails.school && (
                  <div className='nearby-item'>
                    <img src='/school.png' alt='School icon' />
                    <div className='nearby-content'>
                      <span className='nearby-label'>School</span>
                      <p className='nearby-distance'>
                        {formatDistance(postDetails.school)} away
                      </p>
                    </div>
                  </div>
                )}
                {postDetails.bus && (
                  <div className='nearby-item'>
                    <img src='/bus.png' alt='Bus stop icon' />
                    <div className='nearby-content'>
                      <span className='nearby-label'>Public Transport</span>
                      <p className='nearby-distance'>
                        {formatDistance(postDetails.bus)} away
                      </p>
                    </div>
                  </div>
                )}
                {postDetails.restaurant && (
                  <div className='nearby-item'>
                    <img src='/restaurant.png' alt='Restaurant icon' />
                    <div className='nearby-content'>
                      <span className='nearby-label'>Restaurant</span>
                      <p className='nearby-distance'>
                        {formatDistance(postDetails.restaurant)} away
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {postData.latitude && postData.longitude && (
            <div className='location-section'>
              <h2 className='section-title'>Location</h2>
              <div className='map-wrapper'>
                <div className='map-container'>
                  <Map items={[postData]} />
                </div>
                <div className='coordinates-info'>
                  <span className='coordinates-label'>Coordinates:</span>
                  <span className='coordinates-value'>
                    {parseFloat(postData.latitude).toFixed(6)},{' '}
                    {parseFloat(postData.longitude).toFixed(6)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className='property-details-section'>
            <h2 className='section-title'>Property Details</h2>
            <div className='details-grid'>
              <div className='detail-item'>
                <span className='detail-label'>Property ID</span>
                <span className='detail-value'>{postData.id}</span>
              </div>
              <div className='detail-item'>
                <span className='detail-label'>Property Type</span>
                <span className='detail-value'>
                  {formatPropertyType(postData.property)}
                </span>
              </div>
              <div className='detail-item'>
                <span className='detail-label'>Listing Type</span>
                <span className='detail-value'>
                  {formatListingType(postData.type)}
                </span>
              </div>
              <div className='detail-item'>
                <span className='detail-label'>Listed Date</span>
                <span className='detail-value'>
                  {new Date(postData.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SinglePage;
