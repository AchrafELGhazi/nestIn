import { MapContainer, TileLayer } from 'react-leaflet'
import './map.scss'
import "leaflet/dist/leaflet.css";
import Pin from '../pin/Pin';

function Map({ items }) {
  const center=[29.7917, -8.0926]

  return (
    <MapContainer center= {center} zoom={5} scrollWheelZoom={false} className='map'>
    <TileLayer
      // attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
      
    {items.map(item=>(
      <Pin item={item} key={item.id}/>
    ))}
      
  </MapContainer>
  )
}

export default Map