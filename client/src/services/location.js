// Browser geolocation helpers. All are best-effort: if the user denies
// permission or the device can't provide a fix, callers get null/undefined
// and the app falls back to city-wide dispatch.

// Get a one-off position as [lng, lat] (GeoJSON order). Resolves null on failure.
export function getCoordinates(timeoutMs = 8000) {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve([pos.coords.longitude, pos.coords.latitude]),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 30000 }
    );
  });
}

// Watch position; calls cb([lng, lat]) on each update. Returns a stop function.
export function watchCoordinates(cb) {
  if (!('geolocation' in navigator)) return () => {};
  const id = navigator.geolocation.watchPosition(
    (pos) => cb([pos.coords.longitude, pos.coords.latitude]),
    () => {},
    { enableHighAccuracy: true, maximumAge: 15000 }
  );
  return () => navigator.geolocation.clearWatch(id);
}
