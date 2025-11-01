// src/data/layersData.js
// Cinematic, smoothly graded color stops (colorFrom = bottom/closer, colorTo = top/farther)

export const layersData = [
  // 🌍 EARTH & ATMOSPHERE
  {
    name: "Ground Level",
    place: "Earth Surface",
    distanceKm: 0,
    distanceAU: 0,
    description: "Starting point on Earth's surface — lush ground and open blue sky.",
    colorFrom: "#166534", // ground (dark green)
    colorTo:   "#60a5fa", // sky (light blue)
  },
  {
    name: "Troposphere",
    place: "Earth Atmosphere",
    distanceKm: 12,
    distanceAU: 8e-9,
    description: "Weather layer — clouds, aircraft, and fading blue.",
    colorFrom: "#60a5fa", // lower sky
    colorTo:   "#2563eb", // higher sky (brighter-to-deeper blue)
  },
  {
    name: "Stratosphere",
    place: "Earth Atmosphere",
    distanceKm: 50,
    distanceAU: 3.3e-8,
    description: "Home of ozone layer — sunlight scattering fades to indigo.",
    colorFrom: "#2563eb", // high sky blue
    colorTo:   "#1e40af", // deep blue / indigo
  },
  {
    name: "Mesosphere",
    place: "Earth Atmosphere",
    distanceKm: 85,
    distanceAU: 5.7e-8,
    description: "Meteors burn up here; air gets very thin and cold.",
    colorFrom: "#1e40af", // deep blue
    colorTo:   "#2b2350", // indigo -> deeper indigo
  },
  {
    name: "Thermosphere",
    place: "Earth Atmosphere",
    distanceKm: 600,
    distanceAU: 4e-7,
    description: "Auroras dance in this layer; atmosphere fades toward space.",
    colorFrom: "#2b2350", // deep indigo
    colorTo:   "#3b0764", // violet glow
  },
  {
    name: "Exosphere",
    place: "Earth Atmosphere",
    distanceKm: 10000,
    distanceAU: 0.000067,
    description: "The final trace of Earth's atmosphere — transition into space.",
    colorFrom: "#3b0764", // violet glow (near-thermosphere)
    colorTo:   "#0b0b22", // near-space navy (fading to black)
  },

  // 🌎 EARTH ORBIT & SOLAR SYSTEM
  {
    name: "Low Earth Orbit",
    place: "Near Earth Space",
    distanceKm: 2000,
    distanceAU: 0.000013,
    description: "Satellites and ISS orbit here; Earth’s curve visible below.",
    colorFrom: "#0b0b22", // near-space navy (below)
    colorTo:   "#000814", // deeper space navy (above)
  },
  {
    name: "Geostationary Orbit",
    place: "Near Earth Space",
    distanceKm: 35786,
    distanceAU: 0.000239,
    description: "Satellites match Earth’s rotation — appear stationary.",
    colorFrom: "#000814", // deep space navy
    colorTo:   "#000000", // pure black
  },
  {
    name: "Lunar Orbit",
    place: "Moon Region",
    distanceKm: 384400,
    distanceAU: 0.00257,
    description: "Around the Moon — gray-white reflected light dominates.",
    colorFrom: "#000000", // space black (below)
    colorTo:   "#111827", // moonlight gray-blue (above, hint of reflected light)
  },
  {
    name: "Inner Solar System",
    place: "Mercury, Venus, Earth, Mars",
    distanceKm: 2.5e8,
    distanceAU: 1.67,
    description: "Rocky planets orbit the Sun — bright, warm light.",
    colorFrom: "#111827", // faint space glow (below)
    colorTo:   "#7c2d12", // warm amber hint (above, sunlit tones)
  },
  {
    name: "Asteroid Belt",
    place: "Between Mars and Jupiter",
    distanceKm: 4e8,
    distanceAU: 2.67,
    description: "Dust and rock fields scattered across this vast region.",
    colorFrom: "#7c2d12", // warm inner-solar hint (below)
    colorTo:   "#3f3f46", // dusty gray (above)
  },
  {
    name: "Outer Solar System",
    place: "Jupiter to Neptune",
    distanceKm: 4.5e9,
    distanceAU: 30,
    description: "Gas giants and icy moons; sunlight grows faint.",
    colorFrom: "#3f3f46", // darker gray (below)
    colorTo:   "#031026", // cold blue-black (above)
  },
  {
    name: "Kuiper Belt",
    place: "Beyond Neptune",
    distanceKm: 7.5e9,
    distanceAU: 50,
    description: "Frozen bodies and dwarf planets orbit here.",
    colorFrom: "#031026", // cold blue-black (below)
    colorTo:   "#042438", // faint icy cyan tint (above)
  },
  {
    name: "Heliopause",
    place: "Boundary of the Solar Wind",
    distanceKm: 2e10,
    distanceAU: 133,
    description: "Edge of the Sun’s influence — true interstellar space begins.",
    colorFrom: "#042438", // faint icy tint (below)
    colorTo:   "#000000", // interstellar black (above)
  },

  // 🌌 INTERSTELLAR SPACE
  {
    name: "Local Interstellar Cloud",
    place: "Interstellar Medium",
    distanceKm: 9.5e12,
    distanceAU: 6.3e4,
    description: "Solar System drifts through thin gas and cosmic dust.",
    colorFrom: "#000000", // interstellar black (below)
    colorTo:   "#081026", // subtle midnight-blue haze (above)
  },
  {
    name: "Local Bubble",
    place: "Milky Way Region",
    distanceKm: 1e14,
    distanceAU: 6.7e5,
    description: "Vast cavity formed by ancient supernova explosions.",
    colorFrom: "#081026", // midnight-blue haze
    colorTo:   "#1e293b", // gray-blue interstellar dust
  },
  {
    name: "Orion Arm",
    place: "Milky Way Galaxy",
    distanceKm: 1e16,
    distanceAU: 6.7e7,
    description: "Our Solar System’s home spiral arm in the Milky Way.",
    colorFrom: "#1e293b", // interstellar blue-gray
    colorTo:   "#1e1b4b", // deeper indigo halo
  },
  {
    name: "Milky Way Core",
    place: "Galactic Center",
    distanceKm: 2.6e17,
    distanceAU: 1.7e9,
    description: "The galactic center glows with intense radiation near a black hole.",
    colorFrom: "#1e1b4b", // indigo outskirts (below)
    colorTo:   "#fde047", // bright warm core glow (above)
  },
  {
    name: "Galactic Halo",
    place: "Milky Way Outskirts",
    distanceKm: 9e17,
    distanceAU: 6e9,
    description: "Sparse stars and dark matter envelop the Milky Way.",
    colorFrom: "#fde047", // residual core light (below)
    colorTo:   "#000000", // black halo (above)
  },

  // 🌠 COSMIC SCALE
  {
    name: "Local Group",
    place: "Galaxy Cluster",
    distanceKm: 2.5e19,
    distanceAU: 1.7e11,
    description: "Milky Way, Andromeda, and 80+ galaxies bound by gravity.",
    colorFrom: "#000000", // intergalactic black (below)
    colorTo:   "#1e3a8a", // faint blue galaxy tint (above)
  },
  {
    name: "Virgo Supercluster",
    place: "Cluster of Galaxies",
    distanceKm: 1.1e21,
    distanceAU: 7.3e12,
    description: "Thousands of galaxies forming a gravitational cluster.",
    colorFrom: "#1e3a8a", // faint galaxy blue
    colorTo:   "#312e81", // cosmic indigo haze
  },
  {
    name: "Laniakea Supercluster",
    place: "Supercluster Region",
    distanceKm: 5e21,
    distanceAU: 3.3e13,
    description: "Our massive home supercluster connected by filaments.",
    colorFrom: "#312e81", // indigo filaments (below)
    colorTo:   "#6b2b6e", // magenta-violet filament glow (above)
  },
  {
    name: "Cosmic Web",
    place: "Large-Scale Universe",
    distanceKm: 3e23,
    distanceAU: 2e15,
    description: "Web-like filaments of galaxies stretching across the cosmos.",
    colorFrom: "#6b2b6e", // filament glow (below)
    colorTo:   "#0b0010", // very deep black (above)
  },
  {
    name: "Cosmic Microwave Background",
    place: "Observable Universe Edge",
    distanceKm: 4.3e26,
    distanceAU: 2.9e18,
    description: "Relic radiation from the Big Bang — the oldest light we can see.",
    colorFrom: "#0b0010", // near-black (below)
    colorTo:   "#2f0710", // faint reddish CMB hint (above)
  },
  {
    name: "Edge of Observable Universe",
    place: "Cosmic Horizon",
    distanceKm: 8.8e26,
    distanceAU: 5.9e18,
    description: "The limit of what we can observe — beyond lies the unknown.",
    colorFrom: "#2f0710", // faint CMB tint (below)
    colorTo:   "#000000", // absolute black (above)
  },
];
