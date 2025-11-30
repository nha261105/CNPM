import type { Request, Response } from "express";
import Router from "express"
const router = Router();

/**
 * GET /api/osrm/route
 * Query params: coords=[lat,lng;lat,lng;...]
 */
router.get("/route", async (req: Request, res: Response) => {
  try {
    const { coords } = req.query;

    if (!coords || typeof coords !== "string") {
      return res.status(400).json({ error: "Missing coords parameter" });
    }

    // Parse coords: "lat1,lng1;lat2,lng2" → convert to OSRM format "lng,lat;lng,lat"
    const coordsArray = coords.split(";").map((pair) => {
      const [lat, lng] = pair.split(",").map(Number);
      return `${lng},${lat}`; // OSRM uses lng,lat
    });

    const coordStr = coordsArray.join(";");
    const url = `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson`;

    console.log("  Fetching OSRM route:", url);

    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      console.error(" OSRM error:", response.status, text);
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();
    const route = data.routes?.[0];

    if (!route) {
      return res.status(404).json({ error: "No route found" });
    }

    // Convert [lng,lat] → [lat,lng] for Leaflet
    const coordinates = route.geometry.coordinates.map((c: number[]) => [c[1], c[0]]);

    console.log(" OSRM route fetched:", coordinates.length, "points");

    return res.json({
      coordinates,
      distance: route.distance,
      duration: route.duration,
    });
  } catch (err: any) {
    console.error(" OSRM proxy error:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;