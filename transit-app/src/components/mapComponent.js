import '../App.css';
import React, { useRef, useEffect, useState } from "react";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = { width: "100%", height: "600px" };
const center = { lat: 47.6062, lng: -122.3321 }; // Seattle


const routeStops = [
  { id: "1_10911", name: "U District Station - Bay 3", lat:47.661205, lng: -122.30323 },
  { id: "1_10912", name: "15th Ave NE & NE 43rd St", lat: 47.65937, lng: -122.312096 },
  { id: "1_10914", name: "15th Ave NE & NE Campus Pkwy", lat: 47.656422, lng: -122.312164 },
];

export default function RouteMapWithStops({ routeId, busNumber }) {
  const mapRef = useRef(null);
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedStop, setSelectedStop] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  // Add Transit Layer
  useEffect(() => {
    if (isLoaded && mapRef.current) {
      const transitLayer = new window.google.maps.TransitLayer();
      transitLayer.setMap(mapRef.current);
    }
  }, [isLoaded]);



useEffect(() => {
  navigator.geolocation.getCurrentPosition(pos => {
    setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
  });
}, []);


  // Fetch or simulate buses
  useEffect(() => {
    if (!isLoaded) return;

    const fetchBuses = async () => {
      try {
        const res = await fetch(
          "https://api.pugetsound.onebusaway.org/api/where/vehicles-for-agency/1.json?key=TEST" 
        );
        const data = await res.json();
        const filteredBuses =
          data.data.list
            ?.filter(bus => bus.location && bus.trip?.routeId === routeId)
            .map(bus => ({
              vehicleId: bus.vehicleId,
              busNumber: bus.trip?.routeShortName || bus.trip?.routeId || "N/A",
              lat: bus.location.lat,
              lng: bus.location.lon,
              tripId: bus.tripId,
              status: bus.status,
              phase: bus.phase,
              closestStop: bus.tripStatus?.closestStop,
            })) || [];
        setBuses(filteredBuses);
      } catch (err) {
        console.error("Failed to fetch buses:", err);
      }
    };

    fetchBuses();
    const interval = setInterval(fetchBuses, 15000); 
    return () => clearInterval(interval);
  }, [isLoaded, routeId]);

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={14}
      onLoad={map => (mapRef.current = map)}
    >
      {userLocation && (
        <Marker
          position={userLocation}
          icon={{
            url: "/user-icon.png", 
            scaledSize: new window.google.maps.Size(30, 30),
          }}
        />
      )}
      {routeStops.map(stop => (
        <Marker
          key={stop.id}
          position={{ lat: stop.lat, lng: stop.lng }}
          icon={{
            url: "/stop-icon.png", 
            scaledSize: new window.google.maps.Size(40, 40),
          }}
          onClick={() => setSelectedStop(stop)}
        />
      ))}

      {/* Buses */}
      {buses.map(bus => (
        <Marker
          key={bus.vehicleId}
          position={{ lat: bus.lat, lng: bus.lng }}
          icon={{
            url: "/bus-icon.png",
            scaledSize: new window.google.maps.Size(10, 10),
          }}
          onClick={() => setSelectedBus(bus)}
        />
      ))}

      {/* InfoWindow for bus */}
      {selectedBus && (
        <InfoWindow
        className="bus-info"
          position={{ lat: selectedBus.lat, lng: selectedBus.lng }}
          onCloseClick={() => setSelectedBus(null)}
        >
          <div>
            <p><strong>Bus Number:</strong> {busNumber}</p>
            <p><strong>Vehicle ID:</strong> {selectedBus.vehicleId}</p>
            <p><strong>Trip ID:</strong> {selectedBus.tripId}</p>
            <p><strong>Status:</strong> {selectedBus.status}</p>
            <p><strong>Phase:</strong> {selectedBus.phase}</p>
            {selectedBus.closestStop && (
              <p><strong>Closest Stop:</strong> {selectedBus.closestStop}</p>
            )}
          </div>
        </InfoWindow>
      )}

      {/* InfoWindow for stop */}
      {selectedStop && (
        <InfoWindow
        className="stop-info"
          position={{ lat: selectedStop.lat, lng: selectedStop.lng }}
          onCloseClick={() => setSelectedStop(null)}
        >
          <div>
            <p><strong>Stop Name:</strong> {selectedStop.name}</p>
            <p><strong>Stop ID:</strong> {selectedStop.id}</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
    
  );
}
