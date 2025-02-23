let map;

// 🌍 Predefined Coordinates for Farm Locations
const regionCoordinates = {
    "South": { lat: 53.565189, lng: 34.882395 },
    "Center": { lat: 54.565189, lng: 34.882395 }, // Bangkok
    "North": { lat: 55.565189, lng: 34.882395 } // Nakhon Si Thammarat
};
//54.565189, 34.882395]

// 🌱 Define Different Colors for Plant Types
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

// ✅ Automatically Merge Regions & Plants
const regionPlantCoordinates = {};
let latOffset = 0.00005; // Reduced offset to keep plants close together

Object.keys(regionCoordinates).forEach(region => {
    regionPlantCoordinates[region] = [];

    Object.keys(plantIcons).forEach((plant, index) => {
        const latAdjustment = (index % 2 === 0 ? 1 : -1) * (Math.floor(index / 2) * latOffset);
        const lngAdjustment = (index % 2 === 1 ? 1 : -1) * (Math.floor(index / 2) * latOffset);

        regionPlantCoordinates[region].push({
            plant: plant,
            lat: regionCoordinates[region].lat + latAdjustment, 
            lng: regionCoordinates[region].lng + lngAdjustment, 
            color: plantIcons[plant]
        });
    });
});

console.log("🌍 Region and Plant Coordinates:", regionPlantCoordinates);

// ✅ Initialize OpenStreetMap with Leaflet.js
document.addEventListener("DOMContentLoaded", function () {
    map = L.map("map").setView([54.565189, 34.882395], 9);

    // ✅ Load OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    loadPlantMarkers();
});
async function loadPlantMarkers() {
    const response = await fetch("http://localhost:3000/api/plant-locations");
    const plants = await response.json();

    console.log("🌍 Plant Data Fetched:", plants);

    if (plants.length === 0) {
        console.warn("⚠️ No plant data received. Check your database!");
        return;
    }
    plants.forEach(plant => {
        console.log(`🔍 Processing plant: ${plant.plant_name}, Location ID: ${plant.location_id}`);
    
        if (!regionCoordinates[plant.Plantation_area]) {
            console.warn(`⚠️ Warning: No coordinates found for "${plant.Plantation_area}". Check spelling!`);
            return;
        }
    
        const location = regionCoordinates[plant.Plantation_area];
        const color = plantIcons[plant.plant_name] || "gray"; // Default to gray if missing
    
        // // ✅ Apply Urban Offset (Fixed Offset, No Continuous Change)
        const urbanOffset = plant.urban_offset || 0;
        // const plantLat = location.lat + (urbanOffset * 0.0002);
        // const plantLng = location.lng + (urbanOffset * 0.0002);
        // const urbanOffset = plant.urban_offset || 0; // Default to 0 if null

        // ✅ สุ่มมุม 0 - 360 องศา
        // const angle = Math.random() * Math.PI * 2;
        // const radius = (Math.random() * 0.015) * urbanOffset;

        // // ✅ คำนวณค่า Lat/Lng โดยใช้มุมและระยะ
        // const plantLat = location.lat + Math.cos(angle) * radius;
        // const plantLng = location.lng + Math.sin(angle) * radius;
        
        const angle = urbanOffset * Math.PI * 2;

        // ✅ กำหนดระยะจากจุดกึ่งกลาง (ใช้ urbanOffset เป็นตัวกำหนด)
        const radius = (Math.random() * 0.015) * urbanOffset;

        // ✅ คำนวณค่า Lat/Lng โดยใช้มุมและระยะ
        const plantLat = location.lat + Math.cos(angle) * radius;
        const plantLng = location.lng + Math.sin(angle) * radius;

    
        console.log(`📍 Adding Marker for ${plant.plant_name} at ${plantLat}, ${plantLng}`);
    
        // ✅ Create colored marker for plant
        const marker = L.marker([plantLat, plantLng], {
            icon: L.divIcon({
                className: `leaflet-div-icon`,
                html: `<div style="background-color:${color}; width:12px; height:12px; border-radius:50%"></div>`,
                iconSize: [12, 12]
            })
        }).addTo(map);
    
        // ✅ Show sensor data in popup
        marker.bindPopup(`
            <b>${plant.plant_name} in ${plant.Plantation_area}</b><br>
            🌡 Temp: ${plant.temperature}°C<br>
            💧 Humidity: ${plant.humidity}%<br>
            🧪 pH: ${plant.ph}<br>
            🌧 Rainfall: ${plant.rainfall}mm
            📍Ditant: ${urbanOffset} Km
        `);
    
        // ✅ Draw area around plant location
        drawSquare(plantLat, plantLng, color);
    });

}


// ✅ Draw Colored Square Boundary Around Location
function drawSquare(lat, lng, color) {
    const offset = 0.005; // Adjust square size for better visibility

    const bounds = [
        [lat - offset, lng - offset],
        [lat + offset, lng + offset] // Bottom lefts
        // [lat + offset + 0.1, lng + offset]  // Top right
    ];

    L.rectangle(bounds, {
        color: color,
        weight: 2,
        fillOpacity: 0.2
    }).addTo(map);
}

