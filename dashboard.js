const maxDataPoints = 10;

const tempCtx = document.getElementById("tempChart")?.getContext("2d");
const tempChart = new Chart(tempCtx, {
  type: "line",
  data: { labels: [], datasets: [{ label: "Temperature (°C)", data: [], backgroundColor: "rgba(255, 99, 132, 0.2)", borderColor: "rgba(255, 99, 132, 1)", borderWidth: 1, tension: 0.3 }] },
  options: {
    scales: {
      x: { title: { display: true, text: "Time" } },
      y: { title: { display: true, text: "°C" }, beginAtZero: true }
    },
    animation: { duration: 0 }
  }
});

const humCtx = document.getElementById("humidityChart")?.getContext("2d");
const humidityChart = new Chart(humCtx, {
  type: "line",
  data: { labels: [], datasets: [{ label: "Humidity (%)", data: [], backgroundColor: "rgba(54, 162, 235, 0.2)", borderColor: "rgba(54, 162, 235, 1)", borderWidth: 1, tension: 0.3 }] },
  options: {
    scales: {
      x: { title: { display: true, text: "Time" } },
      y: { title: { display: true, text: "%" }, beginAtZero: true }
    },
    animation: { duration: 0 }
  }
});

const soilCtx = document.getElementById("soilMoistureChart")?.getContext("2d");
const soilMoistureChart = new Chart(soilCtx, {
  type: "line",
  data: { labels: [], datasets: [{ label: "Soil Moisture (%)", data: [], backgroundColor: "rgba(153, 102, 255, 0.2)", borderColor: "rgba(153, 102, 255, 1)", borderWidth: 1, tension: 0.3 }] },
  options: {
    scales: {
      x: { title: { display: true, text: "Time" } },
      y: { title: { display: true, text: "%" }, beginAtZero: true }
    },
    animation: { duration: 0 }
  }
});

const rainCtx = document.getElementById("rainFallChart")?.getContext("2d");
const rainFallChart = new Chart(rainCtx, {
  type: "line",
  data: { labels: [], datasets: [{ label: "Rain Fall (%)", data: [], backgroundColor: "rgba(153, 102, 255, 0.2)", borderColor: "rgb(37, 37, 240)", borderWidth: 1, tension: 0.3 }] },
  options: {
    scales: {
      x: { title: { display: true, text: "Time" } },
      y: { title: { display: true, text: "%" }, beginAtZero: true }
    },
    animation: { duration: 0 }
  }
});


const ws = new WebSocket("ws://localhost:3000");
ws.onopen = () => console.log("Connected to WebSocket server");
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updateRealtimeCharts(data);
  addRealtimeDataRow(data);
};

function updateRealtimeCharts(data) {
  const timeLabel = new Date(data.timestamp).toLocaleTimeString();

  function updateChart(chart, value) {
    if (chart.data.labels.length >= maxDataPoints) {
      chart.data.labels.shift();
      chart.data.datasets[0].data.shift();
    }
    chart.data.labels.push(timeLabel);
    chart.data.datasets[0].data.push(value);
    chart.update();
  }

  updateChart(tempChart, data.temperature);
  updateChart(humidityChart, data.humidity);
  updateChart(soilMoistureChart, data.soil_moisture);
  updateChart(rainFallChart, data.rainfall);
}

function addRealtimeDataRow(data) {
  const tbody = document.getElementById("realtimeData");
  if (!tbody) return;

  const row = document.createElement("tr");
  row.classList.add("transition", "duration-300", "hover:bg-gray-100");
  row.innerHTML = `
    <td class="px-4 py-2 text-sm text-gray-700">${data.timestamp}</td>
    <td class="px-4 py-2 text-sm text-gray-700">${data.temperature}°C</td>
    <td class="px-4 py-2 text-sm text-gray-700">${data.humidity}%</td>
    <td class="px-4 py-2 text-sm text-gray-700">${data.soil_moisture}%</td>
    <td class="px-4 py-2 text-sm text-gray-700">${data.ph}%</td>
    <td class="px-4 py-2 text-sm text-gray-700">${data.rainfall}%</td>
    <td class="px-4 py-2 text-sm text-gray-700">${data.nitrogen}%</td>
    <td class="px-4 py-2 text-sm text-gray-700">${data.phosphorus}%</td>
    <td class="px-4 py-2 text-sm text-gray-700">${data.potassium}%</td>
    <td class="px-4 py-2 text-sm text-gray-700">${data.organic_matter}%</td>
    <td class="px-4 py-2 text-sm text-gray-700">${data.wind_speed}%</td>
    <td class="px-4 py-2 text-sm text-gray-700">${data.co2}%</td>
  `;
  tbody.prepend(row);

  while (tbody.rows.length > 10) {
    tbody.deleteRow(tbody.rows.length - 1);
  }
}


function displayAlert(message) {
  let alertContainer = document.getElementById("alertContainer");
  if (!alertContainer) {
      // Create container if it doesn't exist
      alertContainer = document.createElement("div");
      alertContainer.id = "alertContainer";
      alertContainer.style.position = "fixed";
      alertContainer.style.top = "10px";
      alertContainer.style.right = "10px";
      alertContainer.style.zIndex = "1000";
      document.body.appendChild(alertContainer);
  }
  const alertBanner = document.createElement("div");
  alertBanner.className = "bg-red-200 text-red-800 p-3 mb-2 rounded shadow";
  alertBanner.textContent = message;
  alertContainer.appendChild(alertBanner);
  
  // Remove the alert after 5 seconds
  setTimeout(() => {
      alertBanner.remove();
  }, 5000);
}


function checkAlertConditions(data) {
  if (parseFloat(data.soil_moisture) < 15) {
    displayAlert("Alert: 💦💦Low soil moisture detected!💦💦");
    // You could also call: +
    showSuggestionCard("soil", data.soil_moisture);
  }
  if (parseFloat(data.rainfall) > 8) {
    displayAlert("Alert: ⛈️⛈️Too much rain detected!⛈️⛈️");
    showSuggestionCard("rainfall", data.rainfall);
  }
  if (parseFloat(data.temperature) > 32) {
    displayAlert("Alert: 🔥🔥Heat detected!🔥🔥");
    // For temperature suggestion, you might do:
    showSuggestionCard("temperature", data.temperature);
  }
}

// WebSocket handler
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updateRealtimeCharts(data);
  addRealtimeDataRow(data);
  checkAlertConditions(data);
};

// Simulation functions can also use the same check:
function simulateCriticalDataTemp() {
  const testData = {
    timestamp: new Date().toISOString(),
    temperature: 70,      // high value to trigger heat alert
    humidity: 50,         // normal value
    soil_moisture: 40,    // normal value
    ph: 6.5,
    rainfall: 0
  };
  
  updateRealtimeCharts(testData);
  addRealtimeDataRow(testData);
  checkAlertConditions(testData);
}

function simulateCriticalDataMois() {
  const testData = {
    timestamp: new Date().toISOString(),
    temperature: 25,
    humidity: 50,
    soil_moisture: 1,    // low value to trigger moisture alert
    ph: 6.5,
    rainfall: 0
  };
  
  updateRealtimeCharts(testData);
  addRealtimeDataRow(testData);
  checkAlertConditions(testData);
}

function simulateCriticalDataRain() {
  const testData = {
    timestamp: new Date().toISOString(),
    temperature: 25,
    humidity: 50,
    soil_moisture: 40,
    ph: 6.5,
    rainfall: 50       // high rainfall to trigger rain alert
  };
  
  updateRealtimeCharts(testData);
  addRealtimeDataRow(testData);
  checkAlertConditions(testData);
}



// Function to show the suggestion card based on the alert type
function showSuggestionCard(type, value) {
  const suggestionCard = document.getElementById("suggestionCard");
  const suggestionText = document.getElementById("suggestionText");
  
  if (type === "rainfall") {
    suggestionText.textContent = `Rainfall Alert⛈️⛈️ : ${value}% detected. Suggestion: Adjust your water plan for the next 3 hours – the heavy rain may mean your plants don’t need extra irrigation right now.`;
    suggestionS.textContent = `Plan : adjust your water plan for the next 3 hours⛔️⛔️.`;
  }
  else if (type === "temperature") {
    suggestionText.textContent = `Heat Alert🔥🔥 : ${value}°C detected. Suggestion: Consider adding shade or adjusting irrigation to help cool the plants.`;
    suggestionS.textContent = `Plan : Increase Spraying water on the plants💦💦.`; 
  }
  else if (type === "soil") {
    suggestionText.textContent = `Soil Moisture Alert🍂🍂 : ${value}% detected. Suggestion: Monitor and adjust irrigation to maintain optimal moisture.`;
    suggestionS.textContent = `Plan : Adjust irrigation to maintain optimal moisture💦💦.`;
  }
  
  // Show the suggestion card (remove the 'hidden' class)
  suggestionCard.classList.remove("hidden");
  
  // Optionally, auto-hide after a few seconds:
  // setTimeout(hideSuggestionCard, 7000);
}

// function checkAlertConditions(data) {
//   if (parseFloat(data.soil_moisture) < 15) {
//     displayAlert("Alert: 💦💦Low soil moisture detected!💦💦");
//     // You could also call: +
//     showSuggestionCard("soil", data.soil_moisture);
//   }
//   if (parseFloat(data.rainfall) > 8) {
//     displayAlert("Alert: ⛈️⛈️Too much rain detected!⛈️⛈️");
//     showSuggestionCard("rainfall", data.rainfall);
//   }
//   if (parseFloat(data.temperature) > 32) {
//     displayAlert("Alert: 🔥🔥Heat detected!🔥🔥");
//     // For temperature suggestion, you might do:
//     showSuggestionCard("temperature", data.temperature);
//   }
// }


// Function to hide the suggestion card
function hideSuggestionCard() {
  const suggestionCard = document.getElementById("suggestionCard");
  suggestionCard.classList.add("hidden");
}

function loadData(endpoint, tableBodyId) {
  fetch(endpoint)
    .then(response => response.json())
    .then(data => {
      const tbody = document.getElementById(tableBodyId);
      if (!tbody) return;
      tbody.innerHTML = "";
      data.forEach(item => {
        const row = document.createElement("tr");
        row.classList.add("transition", "duration-300", "hover:bg-gray-100");

        row.innerHTML = Object.keys(item).map(key =>
          `<td class="px-4 py-2 text-sm text-gray-700">${item[key]}</td>`
        ).join("");
        tbody.appendChild(row);
      });
    })
    .catch(error => {
      console.error(`Error loading data from ${endpoint}`, error);
    });
}

document.addEventListener("DOMContentLoaded", function () {
  async function fetchWeatherData() {
    try {
      const response = await fetch("http://localhost:3000/api/weather");
      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }
      const data = await response.json();

      // ตรวจสอบว่ามีค่าที่ถูกต้องหรือไม่
      if (data && data.temperature !== undefined) {
        document.getElementById("weatherLocation").textContent = data.location || "Unknown";
        document.getElementById("weatherTemp").textContent = data.temperature || "-";
        document.getElementById("weatherHumidity").textContent = data.humidity || "-";
        document.getElementById("weatherWind").textContent = data.windSpeed || "-";
        document.getElementById("weatherDesc").textContent = data.weather || "No data";

        // อัปเดตไอคอน ถ้ามีข้อมูล
        if (data.icon) {
          const weatherIcon = `https://openweathermap.org/img/wn/${data.icon}.png`;
          const iconElement = document.getElementById("weatherIcon");
          iconElement.src = weatherIcon;
          iconElement.classList.remove("hidden"); // แสดงไอคอนเมื่อโหลดสำเร็จ
        }
      } else {
        console.error("Invalid weather data:", data);
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  }

  // เรียกใช้เมื่อโหลดหน้าเว็บ และอัปเดตทุก 10 นาที
  fetchWeatherData();
  setInterval(fetchWeatherData, 600000);
});