import SearchBar from '../../components/searchBar/SearchBar';
import './homePage.scss';

function HomePage() {
  return (
    <div className='homePage'>
      <div className='textContainer'>
        <div className='wrapper'>
          <h1 className='title'>
            <div className='backdrop'></div>
            Find <span className='highlight'>Real Estate</span> & Get Your{' '}
            <span className='highlight'>Dream Place</span>
          </h1>
          <p>
            At NestIn, we simplify everything, from buying your dream home to
            selling or renting your property. Whether you're a first-time buyer
            or an experienced investor, NestIn offers the tools, insights, and
            expert support you need to make the right decisions.
          </p>
          <SearchBar />
          <div className='boxes'>
            <div className='box'>
              <h1>16+</h1>
              <h2>Years of Experience</h2>
            </div>
            <div className='box'>
              <h1>200</h1>
              <h2>Award Gained</h2>
            </div>
            <div className='box'>
              <h1>2000+</h1>
              <h2>Property Ready</h2>
            </div>
          </div>
        </div>
      </div>
      <div className='imgContainer'>
        <img src='/bg.png' alt='' />
      </div>
    </div>
  );
}

export default HomePage;
