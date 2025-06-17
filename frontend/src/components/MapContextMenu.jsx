// components/MapContextMenu.jsx
import React from 'react';
import { useMapEvents } from 'react-leaflet';

const MapContextMenu = ({ position, onClose, onMenuItemClick }) => {
  
  const handleMenuClick = (action) => {
    onMenuItemClick(action, position);
    onClose(); // Close the context menu after an item is clicked
  };
  
  // Close the context menu if the map is clicked anywhere else
  useMapEvents({
    click: () => {
      onClose();
    },
  });
  
  if (!position) return null; // Only render if a position is provided
  return (
    <div
      className="absolute bg-white border border-gray-300 rounded shadow-lg z-[1000]" // Increased z-index
      style={{ top: position.y, left: position.x }}
      onContextMenu={(e) => e.preventDefault()} // Prevent browser's context menu on this div
    >
      <ul className="py-1 text-sm text-gray-700">
        <li
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          onClick={() => handleMenuClick('show-coordinates')}
        >
          Show Coordinates: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
        </li>
        <li
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          onClick={() => handleMenuClick('add-marker')}
        >
          Add Marker Here
        </li>
        {/* Add more menu items as needed */}
      </ul>
    </div>
  );
};

export default MapContextMenu;