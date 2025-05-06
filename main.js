// main.js
const firebaseConfig = {
  apiKey: "AIzaSyDQDsu2PYzKcSgxAoQsfOTVVaDSeT9MhAE",
  authDomain: "gogiamtoc-7f85e.firebaseapp.com",
  projectId: "gogiamtoc-7f85e",
  storageBucket: "gogiamtoc-7f85e.firebasestorage.app",
  messagingSenderId: "725651689818",
  appId: "1:725651689818:web:8523c9ac0b4b990e00e363",
  measurementId: "G-THME4FQKRY"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const violationTable = document.getElementById("violationTable");
const yearInput = document.getElementById("yearInput");
const monthInput = document.getElementById("monthInput");
const dateInput = document.getElementById("dateInput");

let chart;

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function renderChart(dataMap) {
  const labels = Object.keys(dataMap);
  const data = Object.values(dataMap);

  if (chart) chart.destroy();
  chart = new Chart(document.getElementById("violationChart"), {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Số lượt vi phạm",
        data,
        backgroundColor: "rgba(75, 192, 192, 0.6)"
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } }
    }
  });
}

function resetFilters() {
  yearInput.value = "";
  monthInput.value = "";
  dateInput.value = "";
  loadData();
}

async function loadData() {
  const snapshot = await db.collection("violation").get();
  const raw = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    raw.push({
      id: doc.id,
      tocDo: data.TocDo,
      thoiGian: data.ThoiGian.toDate()
    });
  });

  const year = parseInt(yearInput.value);
  const month = parseInt(monthInput.value);
  const specificDate = dateInput.value ? new Date(dateInput.value) : null;

  const filtered = raw.filter(entry => {
    const d = entry.thoiGian;
    return (!year || d.getFullYear() === year) &&
           (!month || d.getMonth() + 1 === month) &&
           (!specificDate || d.toDateString() === specificDate.toDateString());
  });

  violationTable.innerHTML = filtered.map(v => `
    <tr>
      <td>${v.id}</td>
      <td>${v.thoiGian.toLocaleString()}</td>
      <td>${v.tocDo}</td>
    </tr>
  `).join("");

  const dateMap = {};
  filtered.forEach(v => {
    const key = formatDate(v.thoiGian);
    dateMap[key] = (dateMap[key] || 0) + 1;
  });

  renderChart(dateMap);
}

yearInput.addEventListener("input", loadData);
monthInput.addEventListener("input", loadData);
dateInput.addEventListener("input", loadData);

loadData();
