export default function HUD({ data }) {
  if (!data) return null;

  const { distanceKm, distanceAU, layer, place } = data;

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center text-white select-none pointer-events-none space-y-2">
      <h1 className="text-2xl sm:text-3xl font-bold text-sky-200 drop-shadow-md transition-all duration-500">
        {distanceKm.toLocaleString()} km
      </h1>
      <h2 className="text-sm sm:text-base text-gray-400">({distanceAU} AU)</h2>
      <p className="text-lg sm:text-xl font-semibold text-sky-100 drop-shadow-md">
        {layer}
      </p>
      <p className="text-xs sm:text-sm text-gray-400 italic">{place}</p>
    </div>
  );
}
