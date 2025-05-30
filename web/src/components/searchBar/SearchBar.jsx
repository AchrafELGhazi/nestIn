import { useState } from 'react';
import './searchBar.scss';
import { Link, useNavigate } from 'react-router-dom';

const types = ['buy', 'rent'];

function SearchBar() {
  const [query, setQuery] = useState({
    type: 'buy',
    city: '',
    minPrice: 0,
    maxPrice: 0,
  });

  const navigate = useNavigate();

  const switchType = val => {
    setQuery(prev => ({ ...prev, type: val }));
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setQuery(prev => ({
      ...prev,
      [name]: name.includes('Price') ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();

    const searchParams = new URLSearchParams();
    searchParams.set('type', query.type);

    if (query.city.trim()) {
      searchParams.set('city', query.city.trim());
    }

    if (query.minPrice > 0) {
      searchParams.set('minPrice', query.minPrice.toString());
    }

    if (query.maxPrice > 0) {
      searchParams.set('maxPrice', query.maxPrice.toString());
    }

    navigate(`/list?${searchParams.toString()}`);
  };

  return (
    <div className='searchBar'>
      <div className='type'>
        {types.map(type => (
          <button
            key={type}
            onClick={() => switchType(type)}
            className={query.type === type ? 'active' : ''}
            type='button'
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type='text'
          name='city'
          value={query.city}
          placeholder='City Location'
          onChange={handleChange}
        />
        <input
          type='number'
          name='minPrice'
          value={query.minPrice || ''}
          min={0}
          max={10000000}
          placeholder='Min Price'
          onChange={handleChange}
        />
        <input
          type='number'
          name='maxPrice'
          value={query.maxPrice || ''}
          min={0}
          max={10000000}
          placeholder='Max Price'
          onChange={handleChange}
        />
        <button type='submit' className='search-button'>
          <img src='/search.png' alt='Search' />
        </button>
      </form>
    </div>
  );
}

export default SearchBar;
