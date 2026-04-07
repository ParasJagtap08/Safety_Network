import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import Map from "./Map";

function Dashboard() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "sos_alerts"), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data());
      setAlerts(data);
    });

    return () => unsub();
  }, []);

  return (
    <div>
      <h2>🚨 Live Alerts</h2>

      {alerts.map((alert, i) => (
        <div key={i}>
          <p><b>{alert.name}</b></p>
          <p>{alert.lat}, {alert.lng}</p>
        </div>
      ))}

      <Map alerts={alerts} />
    </div>
  );
}

export default Dashboard;