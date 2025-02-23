let map;

// 🌍 Define Region Coordinates (using the second block's values for more detailed zoom)
const regionCoordinates = {
    "South": { lat: 53.565189, lng: 34.882395 },
    "Center": { lat: 54.565189, lng: 34.882395 },
    "North": { lat: 55.565189, lng: 34.882395 }
};

// 🌱 Define Plant Icons (colors)
const plantIcons = {
    "rice": "yellow",
    "maize": "gold",
    "chickpea": "tan",
    "kidneybeans": "red",
    "pigeonpeas": "darkorange",
    "mothbeans": "brown",
    "mungbean": "green",
    "blackgram": "black",
    "lentil": "darkred",
    "pomegranate": "crimson",
    "banana": "yellowgreen",
    "mango": "orange",
    "grapes": "purple",
    "watermelon": "lightgreen",
    "muskmelon": "khaki",
    "apple": "red",
    "orange": "orangered",
    "papaya": "darkorange",
    "coconut": "saddlebrown",
    "cotton": "white",
    "jute": "beige",
    "coffee": "brown"
};

// ✅ Initialize OpenStreetMap with Leaflet.js once the DOM is ready
document.addEventListener("DOMContentLoaded", function () {
    // Initialize map and set view centered on "Center"
    map = L.map("map").setView([54.565189, 34.882395], 9);

    // Load OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    // Loop through each region and add a marker using its coordinates
    Object.keys(regionCoordinates).forEach(region => {
        const { lat, lng } = regionCoordinates[region];

        // Create a marker at the region's coordinates
        const marker = L.marker([lat, lng], {
            icon: L.divIcon({
                className: 'leaflet-div-icon',
                html: `<div style="background-color:blue; width:12px; height:12px; border-radius:50%"></div>`,
                iconSize: [12, 12]
            })
        }).addTo(map);

        // Bind a popup that displays the region name
        marker.bindPopup(`<b>Direction ${region}</b><br>`);
    });

    // Now load plant markers after initializing region markers
    loadPlantMarkers();
});

// ✅ Load plant markers using random placement and filtering
async function loadPlantMarkers() {
    try {
        const response = await fetch("http://localhost:3000/api/plant-locations");
        const plants = await response.json();

        console.log("🌍 Plant Data Fetched:", plants);

        if (plants.length === 0) {
            console.warn("⚠️ No plant data received. Check your database!");
            return;
        }

        // Use filtering: track which plant types have been processed per region
        const markedPlantsPerRegion = {};

        plants.forEach(plant => {
            const region = plant.Plantation_area;

            // Ensure the region exists in our coordinates
            if (!regionCoordinates[region]) {
                console.warn(`⚠️ Warning: No coordinates found for "${region}". Check spelling!`);
                return;
            }

            // Initialize the set for filtering if not already present
            if (!markedPlantsPerRegion[region]) {
                markedPlantsPerRegion[region] = new Set();
            }

            // Skip if this plant type has already been added for the region
            if (markedPlantsPerRegion[region].has(plant.plant_name)) {
                return;
            }

            console.log(`🔍 Processing ${plant.plant_name} in ${region}`);

            const location = regionCoordinates[region];
            const color = plantIcons[plant.plant_name] || "gray"; // Default color if not defined

            // Random placement logic using urban_offset
            const urbanOffset = plant.urban_offset || 0;
            const angle = urbanOffset * Math.PI * 2; 
            const radius = (urbanOffset * 0.0005) * urbanOffset; 
            const plantLat = location.lat + Math.cos(angle) * radius;
            const plantLng = location.lng + Math.sin(angle) * radius;

            console.log(`📍 Adding Marker for ${plant.plant_name} at ${plantLat}, ${plantLng}`);

            // Create a colored marker for the plant
            const marker = L.marker([plantLat, plantLng], {
                icon: L.divIcon({
                    className: 'leaflet-div-icon',
                    html: `<div style="background-color:${color}; width:12px; height:12px; border-radius:50%"></div>`,
                    iconSize: [12, 12]
                })
            }).addTo(map);

            // Bind sensor data popup to the marker
            marker.bindPopup(`
                <b>${plant.plant_name} in ${region}</b><br>
                🌡 Temp: ${plant.temperature}°C<br>
                💧 Humidity: ${plant.humidity}%<br>
                🧪 pH: ${plant.ph}<br>
                🌧 Rainfall: ${plant.rainfall}mm<br>
                📍Distance: ${urbanOffset} Km
            `);

            // Draw a colored square boundary around the marker
            drawSquare(plantLat, plantLng, color);

            // Mark this plant as processed in the region
            markedPlantsPerRegion[region].add(plant.plant_name);
        });
    } catch (error) {
        console.error("Error fetching plant locations:", error);
    }
}

// Draw a colored square boundary around a given location
function drawSquare(lat, lng, color) {
    const offset = 0.005; // Adjust this value to change the square size
    const bounds = [
        [lat - offset, lng - offset],
        [lat + offset, lng + offset]
    ];

    L.rectangle(bounds, {
        color: color,
        weight: 2,
        fillOpacity: 0.2
    }).addTo(map);
}
