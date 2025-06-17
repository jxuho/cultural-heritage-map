import { Menu, MenuItem } from "./ContextMenu";


const MapContextMenu = () => {

  return (
    <Menu>
        <MenuItem onClick={() => console.log('hello')}>
          <div className="px-1 mx-1">Add new cultural site</div>
        </MenuItem>
    </Menu>
  );
};

export default MapContextMenu;
