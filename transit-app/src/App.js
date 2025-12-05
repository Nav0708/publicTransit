
// import React from 'react';
// //import { APIProvider } from "@vis.gl/react-google-maps";
// import MapComponent from './components/mapComponent.js';


// function App () {
// console.log("API KEY:", process.env.REACT_APP_GOOGLE_MAPS_API_KEY);

//   return (
//     <div>
//       <h1>Seattle Transit Map view</h1>
//       <MapComponent />
//     </div>
//   );
//   };
// export default App;

import "./App.css";
import React, { useEffect, useState } from "react";
import RoutesDropdown from "./components/routesComponent";
import TransitMap from "./components/transitComponent";
import RouteMapWithStops from './components/mapComponent.js';

export default function App() {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [busNumber, setBusNumber] = useState(null);

  useEffect(() => {
    async function loadRoutes() {
      const res = await fetch(
        "https://api.pugetsound.onebusaway.org/api/where/routes-for-agency/1.json?key=TEST"
      );
      const data = await res.json();
      setRoutes(data?.data?.list || []);
      setBusNumber(data?.data?.list[0]?.nullSafeShortName || null);
    }
    loadRoutes();
  }, []);

  return (
    <div  className="app-container">
      <h1>Seattle Transit App</h1>
    <>
      <RoutesDropdown
      className="routes-dropdown"
        routes={routes}
        onSelectRoute={setSelectedRoute}
      /><TransitMap selectedRoute={selectedRoute} />
      <div className="map-container">
        <RouteMapWithStops selectedRoute={selectedRoute} busNumber={busNumber} />
      </div>
      
    </>
    </div>
  );
}
