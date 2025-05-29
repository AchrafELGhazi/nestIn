import "./listPage.scss";
import Filter from "../../components/filter/Filter"
import Card from "../../components/card/Card"
import Map from "../../components/map/Map";
import { useLoaderData } from "react-router-dom";

function ListPage() {
  const posts = useLoaderData()
  const postsData = posts.data

  return (
    <div className='listPage'>
      <div className='listContainer'>
        <div className='wrapper'>
          <Filter />
          {postsData.map(item => (
            <Card key={item.id} item={item} />
          ))}
        </div>
      </div>
      <div className='mapContainer'>
        <Map items={postsData} />
      </div>
    </div>
  );
}

export default ListPage;
