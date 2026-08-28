import { Router } from "express";

const router = Router();

router.get("/nearby-hospitals", async (req, res) => {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  const latitude = Number(req.query.lat);
  const longitude = Number(req.query.lng);
  const radius = Math.min(Math.max(Number(req.query.radius || 10000), 1000), 50000);

  if (!key || key === "MY_GOOGLE_MAPS_API_KEY") {
    return res.status(503).json({ error: "Google Maps is not configured" });
  }
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return res.status(400).json({ error: "Valid latitude and longitude are required" });
  }

  try {
    const response = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.regularOpeningHours.openNow",
      },
      body: JSON.stringify({
        includedTypes: ["hospital"],
        maxResultCount: 20,
        rankPreference: "DISTANCE",
        locationRestriction: {
          circle: {
            center: { latitude, longitude },
            radius,
          },
        },
      }),
    });
    const data = await response.json() as any;
    if (!response.ok) {
      const reason = data.error?.message ? `: ${data.error.message}` : "";
      return res.status(502).json({ error: `Google Maps hospital search failed (${response.status})${reason}` });
    }

    const toRadians = (value: number) => value * Math.PI / 180;
    const distanceKm = (targetLatitude: number, targetLongitude: number) => {
      const deltaLatitude = toRadians(targetLatitude - latitude);
      const deltaLongitude = toRadians(targetLongitude - longitude);
      const a = Math.sin(deltaLatitude / 2) ** 2 + Math.cos(toRadians(latitude)) * Math.cos(toRadians(targetLatitude)) * Math.sin(deltaLongitude / 2) ** 2;
      return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const hospitals = (data.places || []).map((place: any) => {
      const placeLatitude = place.location?.latitude;
      const placeLongitude = place.location?.longitude;
      const distance = distanceKm(placeLatitude, placeLongitude);
      return {
        id: `google-hospital-${place.id}`,
        name: place.displayName?.text || "Hospital",
        address: place.formattedAddress || "Address unavailable",
        phone: "Phone unavailable",
        distance: `${distance.toFixed(1)} km`,
        eta: `${Math.max(3, Math.round(distance * 2.5))} min drive`,
        waitTime: "Live Google Maps listing",
        notes: place.regularOpeningHours?.openNow === false ? "Currently closed" : "Live Google Maps hospital listing",
        latitude: placeLatitude,
        longitude: placeLongitude,
        distanceValue: distance,
      };
    }).filter((hospital: any) => Number.isFinite(hospital.latitude) && Number.isFinite(hospital.longitude))
      .sort((first: any, second: any) => first.distanceValue - second.distanceValue)
      .slice(0, 5)
      .map(({ distanceValue, ...hospital }: any) => hospital);

    return res.json({ hospitals, count: hospitals.length, source: "google_maps" });
  } catch {
    return res.status(502).json({ error: "Unable to reach Google Maps" });
  }
});

export default router;