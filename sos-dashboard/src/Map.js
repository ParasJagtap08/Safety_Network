import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

// IMPORTANT (fixes marker icon issue in Leaflet)
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

function Map() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "alerts"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("🔥 FIREBASE DATA:", data); // DEBUG

      setAlerts(data);
    });

    return () => unsubscribe();
  }, []);

  return (
    <MapContainer
      center={[18.5204, 73.8567]} // Pune exact center
      zoom={13}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {alerts.map((alert, i) => {
        const lat = Number(alert.lat);
        const lng = Number(alert.lng);

        console.log("📍 Marker:", lat, lng); // DEBUG

        return (
          <Marker key={i} position={[lat, lng]}>
            <Popup>
              <b>{alert.name}</b> <br />
              {lat}, {lng}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

export default Map;