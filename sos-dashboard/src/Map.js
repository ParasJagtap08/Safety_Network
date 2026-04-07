import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function Map({ alerts }) {
  return (
    <MapContainer
      center={[18.52, 73.85]}
      zoom={13}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {alerts.map((alert, i) => (
        <Marker key={i} position={[alert.lat, alert.lng]}>
          <Popup>{alert.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default Map;