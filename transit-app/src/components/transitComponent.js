import React, { useEffect, useState } from "react";

export default function TransitComponent({ selectedRoute }) {
  const [buses, setBuses] = useState([]);

  useEffect(() => {
    if (!selectedRoute) return;

    async function loadBuses() {
      try {
        const res = await fetch(
          "https://api.pugetsound.onebusaway.org/api/where/vehicles-for-agency/1.json?key=TEST"
        );
        const data = await res.json();

        const filtered = data?.data?.list?.filter(
          (bus) => bus.trip?.routeId === selectedRoute
        ) || [];

        setBuses(filtered);
      } catch (err) {
        console.log("Failed to fetch buses:", err);
      }
    }

    loadBuses();
    const interval = setInterval(loadBuses, 15000);
    return () => clearInterval(interval);
  }, [selectedRoute]);

  return (
    <div>
      <h3>Live Buses for Route: {selectedRoute}</h3>
      {buses.length === 0 && <p>No active buses found</p>}

      <ul>
        {buses.map((bus) => (
          <li key={bus.id}>
            Bus ID: {bus.id} — Lat: {bus.lat}, Lon: {bus.lon}
          </li>
        ))}
      </ul>
    </div>
  );
}
