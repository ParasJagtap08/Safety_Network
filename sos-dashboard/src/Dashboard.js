import Map from "./Map";
import { useState } from "react";

function Dashboard() {
  const [alerts] = useState([
    { name: "Test User", lat: 18.5204, lng: 73.8567 }
  ]);

  return (
    <div>
      <h2>🚨 Live Alerts</h2>

      {alerts.map((alert, i) => (
        <div key={i}>
          <p><b>{alert.name}</b></p>
          <p>{alert.lat}, {alert.lng}</p>
        </div>
      ))}

      {/* ✅ MOVE IT INSIDE */}
      <Map alerts={alerts} />

    </div>
  );
}

export default Dashboard;