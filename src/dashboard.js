import * as echarts from "echarts";

// Utility to insert section title
function createSectionTitle(text) {
  const h2 = document.createElement("h2");
  h2.textContent = text;
  h2.className = "text-xl font-semibold text-gray-700 mt-10 mb-4";
  return h2;
}

// Global variable to hold results for later use
let globalResults = [];

// --- Tab Switching Logic ---
function setupTabs(results) {
  const tabs = {
    charts: document.getElementById("content-charts"),
    domainLookup: document.getElementById("content-domain-lookup"),
    trackerNetwork: document.getElementById("content-tracker-network")
  };

  const btnCharts = document.getElementById("tab-charts");
  const btnDomain = document.getElementById("tab-domain-lookup");
  const btnNetwork = document.getElementById("tab-tracker-network");

  let trackerNetworkInitialized = false;

  function activateTab(selected) {
    Object.entries(tabs).forEach(([key, el]) => {
      el.classList.toggle("hidden", key !== selected);
    });
    // Update button styles for active/inactive tabs
    [btnCharts, btnDomain, btnNetwork].forEach(btn => {
      btn.classList.remove("bg-blue-500", "text-white");
      btn.classList.add("bg-gray-200", "text-gray-700");
    });
    if (selected === "charts") {
      btnCharts.classList.replace("bg-gray-200", "bg-blue-500");
      btnCharts.classList.replace("text-gray-700", "text-white");
    } else if (selected === "domainLookup") {
      btnDomain.classList.replace("bg-gray-200", "bg-blue-500");
      btnDomain.classList.replace("text-gray-700", "text-white");
    } else if (selected === "trackerNetwork") {
      btnNetwork.classList.replace("bg-gray-200", "bg-blue-500");
      btnNetwork.classList.replace("text-gray-700", "text-white");
      // Delay initialization until container is visible
      if (!trackerNetworkInitialized) {
        initTrackerNetwork(globalResults);
        trackerNetworkInitialized = true;
      }
    }
  }

  btnCharts.addEventListener("click", () => activateTab("charts"));
  btnDomain.addEventListener("click", () => activateTab("domainLookup"));
  btnNetwork.addEventListener("click", () => activateTab("trackerNetwork"));

  // Activate default tab
  activateTab("charts");
}

// --- Entry point ---
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const analyticsRes = await fetch("/assets/data/analytics.json");
    const resultsRes = await fetch("/assets/data/results.json");

    const analytics = await analyticsRes.json();
    const results = await resultsRes.json();
    globalResults = results; // store globally for later use
    console.log("Analytics:", analytics);
    console.log("Results:", results);

    const chartsContainer = document.getElementById("charts");

    // Add section titles before each chart
    chartsContainer.insertBefore(createSectionTitle("Trackers Detected per Site"), document.getElementById("bar-chart"));
    chartsContainer.insertBefore(createSectionTitle("Tracker Categories (Pie Chart)"), document.getElementById("pie-chart"));
    chartsContainer.insertBefore(createSectionTitle("Tracker Distribution by Country & Owner"), document.getElementById("stacked-bar-chart"));
    chartsContainer.insertBefore(createSectionTitle("Top 10 Tracker Domains (Doughnut Chart)"), document.getElementById("doughnut-chart"));

    // Initialize charts for the "Charts" tab
    initBarChart(results);
    initPieChart(analytics);
    initStackedBarChart(analytics);
    initDoughnutChart(analytics);

    // Initialize Domain Lookup for "Domain Lookup" tab
    initDomainLookup(results);

    // Setup tab switching; the tracker network chart will initialize on demand.
    setupTabs(results);
  } catch (err) {
    console.error("Dashboard data error:", err);
    alert("Failed to load dashboard data.");
  }
});

// --- Chart Initializations ---
function initBarChart(results) {
  const validResults = (Array.isArray(results) ? results : []).filter(r => r && typeof r.domain === "string");

  const chart = echarts.init(document.getElementById("bar-chart"));
  const domains = validResults.map(r => r.domain);
  const trackerCounts = validResults.map(r => Array.isArray(r.trackers) ? r.trackers.length : 0);

  chart.setOption({
    title: { text: "Trackers per Site", left: "center" },
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: domains, axisLabel: { rotate: 30 } },
    yAxis: { type: "value", name: "Trackers" },
    series: [{ name: "Trackers", type: "bar", data: trackerCounts, itemStyle: { color: "#4F46E5" } }]
  });
}

function initPieChart(analytics) {
  const chart = echarts.init(document.getElementById("pie-chart"));
  const categories = Array.isArray(analytics.topTrackerCategories) ? analytics.topTrackerCategories : [];

  const data = categories.map(cat => ({ name: cat.name, value: cat.count }));

  chart.setOption({
    tooltip: { trigger: "item" },
    series: [{
      name: "Category",
      type: "pie",
      radius: "60%",
      data,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: "rgba(0, 0, 0, 0.4)"
        }
      }
    }]
  });
}

function initStackedBarChart(analytics) {
  const byCountry = analytics.analysisByCountry || {};
  const countryData = {};

  Object.entries(byCountry).forEach(([country, data]) => {
    data.topTrackerOwners.forEach(owner => {
      const ownerName = owner.name?.displayName || owner.name?.name || "Unknown";
      countryData[country] = countryData[country] || {};
      countryData[country][ownerName] = (countryData[country][ownerName] || 0) + owner.count;
    });
  });

  const countries = Object.keys(countryData);
  const owners = Array.from(new Set(countries.flatMap(c => Object.keys(countryData[c]))));

  const series = owners.map(owner => ({
    name: owner,
    type: "bar",
    stack: "total",
    emphasis: { focus: "series" },
    data: countries.map(c => countryData[c][owner] || 0)
  }));

  const chart = echarts.init(document.getElementById("stacked-bar-chart"));
  chart.setOption({
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    legend: { data: owners },
    xAxis: { type: "category", data: countries },
    yAxis: { type: "value" },
    series
  });
}

function initDoughnutChart(analytics) {
  const domainCounts = {};

  const byCategory = analytics.analysisByCategory || {};
  Object.values(byCategory).forEach(category => {
    category.topTrackerOwners.forEach(owner => {
      const name = owner.name?.displayName || owner.name?.name;
      if (name) domainCounts[name] = (domainCounts[name] || 0) + owner.count;
    });
  });

  const top = Object.entries(domainCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  const chart = echarts.init(document.getElementById("doughnut-chart"));
  chart.setOption({
    tooltip: { trigger: "item" },
    series: [{
      name: "Domain",
      type: "pie",
      radius: ["40%", "70%"],
      avoidLabelOverlap: false,
      data: top,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: "rgba(0, 0, 0, 0.5)"
        }
      }
    }]
  });
}

// --- Domain Lookup Feature ---
function initDomainLookup(results) {
  const selectElem = document.getElementById("domain-select");

  // Populate the select with domain options.
  results.forEach(r => {
    if (r.domain) {
      const option = document.createElement("option");
      option.value = r.domain;
      option.textContent = r.domain;
      selectElem.appendChild(option);
    }
  });

  selectElem.addEventListener("change", () => {
    const selectedDomain = selectElem.value;
    const siteData = results.find(r => r.domain === selectedDomain);
    renderDomainDetails(siteData);
  });

  // Auto-select first domain if available.
  if (selectElem.options.length > 0) {
    selectElem.selectedIndex = 0;
    selectElem.dispatchEvent(new Event("change"));
  }
}

function renderDomainDetails(siteData) {
  const detailsDiv = document.getElementById("domain-details");
  detailsDiv.innerHTML = ""; // Clear previous details

  if (!siteData) {
    detailsDiv.textContent = "No data available for the selected domain.";
    return;
  }

  const header = document.createElement("h3");
  header.textContent = `Details for ${siteData.domain}`;
  header.className = "text-lg font-bold text-gray-800 mb-4";
  detailsDiv.appendChild(header);

  // Display key details and a table of trackers.
  const infoDiv = document.createElement("div");
  infoDiv.className = "mb-4 text-sm text-gray-600";
  infoDiv.innerHTML = `
    <p><strong>Final URL:</strong> ${siteData.finalUrl}</p>
    <p><strong>Page Size:</strong> ${siteData.totalSize} bytes</p>
    <p><strong>Timestamp:</strong> ${new Date(siteData.timestamp).toLocaleString()}</p>
  `;
  detailsDiv.appendChild(infoDiv);

  const table = document.createElement("table");
  table.className = "min-w-full divide-y divide-gray-200";
  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr class="bg-gray-100 text-xs font-medium text-gray-700 uppercase tracking-wider">
      <th class="px-4 py-2 text-left">Tracker Domain</th>
      <th class="px-4 py-2 text-left">Owner</th>
      <th class="px-4 py-2 text-left">Prevalence</th>
      <th class="px-4 py-2 text-left">Categories</th>
    </tr>
  `;
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  tbody.className = "bg-white divide-y divide-gray-200";

  (siteData.trackers || []).forEach(tracker => {
    const tr = document.createElement("tr");
    const owner = tracker.info?.owner || "N/A";
    const categories = Array.isArray(tracker.info?.categories)
      ? tracker.info.categories.join(", ")
      : "N/A";
    tr.innerHTML = `
      <td class="px-4 py-2">${tracker.domain}</td>
      <td class="px-4 py-2">${owner}</td>
      <td class="px-4 py-2">${tracker.info?.prevalence ?? "N/A"}</td>
      <td class="px-4 py-2">${categories}</td>
    `;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  detailsDiv.appendChild(table);
}

// --- Tracker Network (Graph) Visualization ---
// This visualization shows how sites are connected to trackers.
// We ensure nodes have unique IDs by prefixing "site-" or "tracker-" to avoid duplicates.
// Also, we initialize the graph only when its tab is active.
function initTrackerNetwork(results) {
  // Build nodes and links for force-directed graph.
  const siteNodes = [];
  const trackerNodes = {};
  const links = [];

  results.forEach(site => {
    if (!site.domain) return;
    const siteId = "site-" + site.domain;
    siteNodes.push({
      id: siteId,
      name: site.domain,
      category: 0, // Sites
      symbolSize: 50,
      itemStyle: { color: "#4F46E5" }
    });

    (site.trackers || []).forEach(tracker => {
      if (!tracker.domain) return;
      const trackerId = "tracker-" + tracker.domain;
      if (!trackerNodes[trackerId]) {
        trackerNodes[trackerId] = {
          id: trackerId,
          name: tracker.domain,
          category: 1, // Trackers
          symbolSize: 30,
          itemStyle: { color: "#EC4899" }
        };
      }
      links.push({
        source: siteId,
        target: trackerId,
        value: tracker.info?.prevalence || 1
      });
    });
  });

  const nodes = [...siteNodes, ...Object.values(trackerNodes)];
  const chart = echarts.init(document.getElementById("tracker-network-chart"));
  chart.setOption({
    title: { text: "Tracker Network Graph", left: "center" },
    tooltip: {
      formatter: function (params) {
        return params.data.name;
      }
    },
    legend: {
      data: ["Sites", "Trackers"],
      top: "bottom"
    },
    series: [{
      type: "graph",
      layout: "force",
      roam: true,
      label: { show: true },
      edgeSymbol: ["none", "arrow"],
      edgeSymbolSize: [0, 10],
      data: nodes,
      links: links,
      categories: [{ name: "Sites" }, { name: "Trackers" }],
      force: { repulsion: 100, edgeLength: [50, 150] }
    }]
  });

  // Optionally, listen for window resize to adjust graph dimensions.
  window.addEventListener("resize", () => chart.resize());
}
