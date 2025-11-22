import mqtt from "mqtt";
import { handleTracking } from "../tracking/tracking.service.js";

const BROKER_URL = process.env.MQTT_BROKER_URL;
if (!BROKER_URL) {
  console.error("MQTT BROKER URL is not found");
}

export const startMQTT = () => {
  const client = mqtt.connect(BROKER_URL!);

  client.on("connect", () => {
    console.log("Connected to MQTT broker: ", BROKER_URL);
    client.subscribe("bus/+/gps", (err) => {
      if (err) console.error("Subscribe error: ", err);
    });
  });

  client.on("error", (err) => {
    console.log("MQTT client error: ", err);
  });

  client.on("message", async (topic, message) => {
    try {
      const payload = JSON.parse(message.toString());
      const bus_id = Number(payload.busId ?? payload.busis ?? payload.id);
      const latitude = Number(payload.lat ?? payload.latitude);
      const longitude = Number(payload.lng ?? payload.longitude);
      const timestamp = payload.timestamp ?? new Date().toISOString();

      if (
        !Number.isFinite(bus_id) ||
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      ) {
        console.warn("Invalid MQTT payload: ", { topic, payload });
        return;
      }
      await handleTracking({
        bus_id,
        latitude,
        longitude,
      });
      console.log("GPS for bus: ", bus_id);
    } catch (err) {
      console.error("MQTT Message error: ", err, "raw: ", message.toString());
    }
  });
};
