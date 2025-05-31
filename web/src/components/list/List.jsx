import './list.scss'
import Card from"../card/Card"
import {listData} from"../../lib/dummydata"

function List({items}){
  return (
    <div className='list'>
      {items.map(item => (
        <Card key={item.id} item={item} />
      ))}
    </div>
  );
}

export default List