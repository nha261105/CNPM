import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import supabase from "./config/supabaseClient.js";
// import { startMQTT } from "./modules/mqtt/mqtt.service.js";


import authRoutes from "./modules/auth/auth.routes.js";
import overviewRoutes from "./modules/overview/overview.route.js";
import trackingRoutes from "./modules/tracking/tracking.routes.js";
import realtimeRoutes from "./modules/realtime/realtime.route.js";
import MessageRoute from "./modules/message/message.router.js";
import StudentsRoute from "./modules/students/students.router.js";
import nofiticationRoute from "./modules/nofications/nofitications.route.js";
import scheduleRoutes from "./modules/schedule/schedule.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import busRoutes from "./modules/bus/bus.routes.js"
import routeRoutes from "./modules/routes/route.routes.js"
import pickupPointRoutes from "./modules/pickup_point/pickup_point.routes.js"

dotenv.config();

// startMQTT();

const server = express();
const port: number | string = process.env.PORT || 5000;

//middlewares
server.use(cors());
server.use(express.json());

// Routes

// ------------------- PULIC ROUTE --------------------------
server.use("/api/auth", authRoutes);
// Health check endpoint
server.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});
server.use("/api/tracking", trackingRoutes);

// ------------------- ADMIN ROUTE --------------------------
server.use("/api/admin/overview",overviewRoutes);
server.use("/api/admin/realtime" ,realtimeRoutes);
server.use("/api/admin/nofitications",nofiticationRoute);
server.use("/api/schedule", scheduleRoutes);
server.use("/api/users", userRoutes)
server.use("/api/bus", busRoutes)
server.use("/api/routes", routeRoutes)
server.use("/api/pickup_point", pickupPointRoutes)

// ------------------- DRIVER ROUTE --------------------------
server.use("/api", StudentsRoute);

// ------------------- PARENT ROUTE --------------------------
server.use("/api", MessageRoute);

async function testConnect() {
  const { data, error } = await supabase.from("type_account").select("*");

  if (error) {
    console.error("ket noi that bai", error.message);
  } else {
    console.log("ket noi thanh cong");
    console.log("data: ", data);
  }
}

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  testConnect();
});
