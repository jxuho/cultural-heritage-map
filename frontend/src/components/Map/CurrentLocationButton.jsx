import { useMap } from "react-leaflet";
import { useState } from "react";
import L from "leaflet";
import { MdMyLocation } from "react-icons/md";

const CurrentLocationButton = () => {
  const map = useMap();
  const [locMarker, setLocMarker] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    if (!navigator.geolocation) {
      alert("Can't use current location function.");
      return;
    }

    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        map.setView([latitude, longitude], 16);

        if (locMarker) {
          map.removeLayer(locMarker);
        }

        const marker = L.circleMarker([latitude, longitude], {
          radius: 8,
          color: "red",
        }).addTo(map);
        setLocMarker(marker);
        setIsLoading(false);
      },
      () => {
        alert("Failed to get your location.");
        setIsLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 10000,
      }
    );
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="absolute bottom-4 right-4 z-[1000] bg-white shadow px-3 py-2 rounded text-sm cursor-pointer flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin h-4 w-4 text-gray-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          Checking Location...
        </>
      ) : (
        <>
          <MdMyLocation className="text-lg" />
          Current Location
        </>
      )}
    </button>
  );
};

export default CurrentLocationButton;
