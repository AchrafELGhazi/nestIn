import './singlePage.scss';
import Slider from '../../components/slider/Slider';
import Map from '../../components/map/Map';
import { useLoaderData } from 'react-router-dom';

function SinglePage() {
  const data = useLoaderData();
  const postData = data.data;
  const postDetails = postData.PostDetail;
  const userData = postData.user;

  // Helper function to format distance
  const formatDistance = distance => {
    if (!distance) return 'Not specified';
    return distance >= 1000
      ? `${(distance / 1000).toFixed(1)}km`
      : `${distance}m`;
  };

  // Helper function to format utilities policy
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

  // Helper function to format pet policy
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

  // Helper function to format property type
  const formatPropertyType = type => {
    return type
      ? type.charAt(0).toUpperCase() + type.slice(1)
      : 'Not specified';
  };

  // Helper function to format listing type
  const formatListingType = type => {
    return type === 'buy' ? 'For Sale' : 'For Rent';
  };

  // Helper function to strip HTML tags from description
  const stripHtml = html => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
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
          <p className='title'>General Information</p>
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

          <p className='title'>Property Details</p>
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

          <p className='title'>Nearby Places</p>
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
              <p className='title'>Location</p>
              <div className='mapContainer'>
                <Map items={[postData]} />
              </div>
            </>
          )}

          <div className='property-meta'>
            <p className='title'>Property Information</p>
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
            <button className='save-btn'>
              <img src='/save.png' alt='Save icon' />
              Save the Place
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SinglePage;
