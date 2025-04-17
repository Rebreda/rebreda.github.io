import * as echarts from "echarts";

let globalResults = [];

function setupTabs() {
  const tabs = {
    charts: document.getElementById("content-charts"),
    domainLookup: document.getElementById("content-domain-lookup"),
    trackerNetwork: document.getElementById("content-tracker-network"),
  };

  const btnCharts = document.getElementById("tab-charts");
  const btnDomain = document.getElementById("tab-domain-lookup");
  const btnNetwork = document.getElementById("tab-tracker-network");

  let trackerNetworkInitialized = false;

  function activateTab(selected) {
    Object.entries(tabs).forEach(([key, el]) => {
      el.classList.toggle("hidden", key !== selected);
    });
    [btnCharts, btnDomain, btnNetwork].forEach((btn) => {
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
      if (!trackerNetworkInitialized) {
        setTimeout(() => {
          initTrackerNetwork(globalResults);
          trackerNetworkInitialized = true;
        }, 100); // Ensure container is visible before rendering
      }
    }
  }

  btnCharts.addEventListener("click", () => activateTab("charts"));
  btnDomain.addEventListener("click", () => activateTab("domainLookup"));
  btnNetwork.addEventListener("click", () => activateTab("trackerNetwork"));

  activateTab("charts");
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const analyticsRes = await fetch("/assets/data/analytics.json");
    const resultsRes = await fetch("/assets/data/results.json");

    const analytics = await analyticsRes.json();
    const results = await resultsRes.json();
    globalResults = results;

    initBarChart(results);
    initPieChart(analytics);
    initStackedBarChart(analytics);
    initDoughnutChart(analytics);
    initDomainLookup(results);

    setupTabs();
  } catch (err) {
    console.error("Dashboard data error:", err);
    alert("Failed to load dashboard data.");
  }
});

function initBarChart(results) {
  const chart = echarts.init(document.getElementById("bar-chart"));
  const domains = results.map((r) => r.domain);
  const trackerCounts = results.map((r) => r.trackers?.length || 0);
  chart.setOption({
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: domains, axisLabel: { rotate: 30 } },
    yAxis: { type: "value", name: "Trackers" },
    series: [{
      name: "Trackers",
      type: "bar",
      data: trackerCounts,
      itemStyle: { color: "#4F46E5" },
    }],
  });
}

function initPieChart(analytics) {
  const chart = echarts.init(document.getElementById("pie-chart"));
  const categories = analytics.topTrackerCategories || [];
  const data = categories.map((cat) => ({ name: cat.name, value: cat.count }));
  chart.setOption({
    tooltip: { trigger: "item" },
    series: [{
      type: "pie",
      radius: "60%",
      data,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: "rgba(0, 0, 0, 0.4)",
        },
      },
    }],
  });
}

function initStackedBarChart(analytics) {
  const byCountry = analytics.analysisByCountry || {};
  const countryData = {};
  Object.entries(byCountry).forEach(([country, data]) => {
    data.topTrackerOwners.forEach((owner) => {
      const name = owner.name?.displayName || owner.name?.name || "Unknown";
      countryData[country] = countryData[country] || {};
      countryData[country][name] = (countryData[country][name] || 0) + owner.count;
    });
  });
  const countries = Object.keys(countryData);
  const owners = Array.from(new Set(countries.flatMap((c) => Object.keys(countryData[c]))));
  const series = owners.map((owner) => ({
    name: owner,
    type: "bar",
    stack: "total",
    data: countries.map((c) => countryData[c][owner] || 0),
  }));
  const chart = echarts.init(document.getElementById("stacked-bar-chart"));
  chart.setOption({
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    legend: { data: owners },
    xAxis: { type: "category", data: countries },
    yAxis: { type: "value" },
    series,
  });
}

function initDoughnutChart(analytics) {
  const domainCounts = {};
  const byCategory = analytics.analysisByCategory || {};
  Object.values(byCategory).forEach((cat) => {
    cat.topTrackerOwners.forEach((owner) => {
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
      type: "pie",
      radius: ["40%", "70%"],
      data: top,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: "rgba(0, 0, 0, 0.5)",
        },
      },
    }],
  });
}

function initDomainLookup(results) {
  const select = document.getElementById("domain-select");
  results.forEach((r) => {
    const opt = document.createElement("option");
    opt.value = r.domain;
    opt.textContent = r.domain;
    select.appendChild(opt);
  });
  select.addEventListener("change", () => {
    const site = results.find((r) => r.domain === select.value);
    renderDomainDetails(site);
  });
  if (select.options.length > 0) {
    select.selectedIndex = 0;
    select.dispatchEvent(new Event("change"));
  }
}

function renderDomainDetails(site) {
  const container = document.getElementById("domain-details");
  container.innerHTML = "";
  if (!site) {
    container.textContent = "No data for this domain.";
    return;
  }
  const header = `<h3 class="text-lg font-bold mb-2">${site.domain}</h3>`;
  const info = `
    <p class="text-sm mb-2"><strong>Final URL:</strong> ${site.finalUrl}</p>
    <p class="text-sm mb-2"><strong>Size:</strong> ${site.totalSize.toLocaleString()} bytes</p>
    <p class="text-sm mb-4"><strong>Timestamp:</strong> ${new Date(site.timestamp).toLocaleString()}</p>
  `;
  const tableRows = (site.trackers || [])
    .map(t => `
      <tr>
        <td class="px-4 py-2">${t.domain}</td>
        <td class="px-4 py-2">${t.info?.owner || "N/A"}</td>
        <td class="px-4 py-2">${t.info?.prevalence || "N/A"}</td>
        <td class="px-4 py-2">${(t.info?.categories || []).join(", ")}</td>
      </tr>
    `)
    .join("");
  const table = `
    <table class="min-w-full table-auto text-sm">
      <thead>
        <tr class="bg-gray-100">
          <th class="px-4 py-2 text-left">Tracker</th>
          <th class="px-4 py-2 text-left">Owner</th>
          <th class="px-4 py-2 text-left">Prevalence</th>
          <th class="px-4 py-2 text-left">Categories</th>
        </tr>
      </thead>
      <tbody class="divide-y">${tableRows}</tbody>
    </table>
  `;
  container.innerHTML = header + info + table;
}

function initTrackerNetwork(results) {
  const siteNodes = [];
  const trackerNodes = {};
  const links = [];

  results.forEach((site) => {
    const siteId = `site-${site.domain}`;
    siteNodes.push({
      id: siteId,
      name: site.domain,
      category: 0,
      symbolSize: 60,
      itemStyle: { color: "#3B82F6" },
    });

    (site.trackers || []).forEach((tracker) => {
      const domain = normalizeDomain(tracker.domain);
      const trackerId = `tracker-${domain}`;
      if (!trackerNodes[trackerId]) {
        trackerNodes[trackerId] = {
          id: trackerId,
          name: domain,
          category: 1,
          symbolSize: 35,
          // itemStyle: { color: "#F472B6" },
        };
      }
      links.push({
        source: siteId,
        target: trackerId,
        value: tracker.info?.prevalence || 1,
        lineStyle: { opacity: 0.6, width: 2 },
      });
    });
  });

  const nodes = [...siteNodes, ...Object.values(trackerNodes)];
  const chart = echarts.init(document.getElementById("tracker-network-chart"));

  chart.setOption({
    tooltip: { formatter: (params) => params.data.name },
    legend: {
      data: ["Websites", "Trackers"],
      bottom: 10,
    },
    series: [{
      type: "graph",
      layout: "force",
      roam: true,
      data: nodes,
      links,
      categories: [{ name: "Websites" }, { name: "Trackers" }],
      label: {
        show: true,
        formatter: (p) => p.data.name.length > 15 ? p.data.name.slice(0, 12) + "..." : p.data.name,
      },
      force: {
        repulsion: 1000,
        edgeLength: 100,
      },
      edgeSymbol: ["none", "arrow"],
      edgeSymbolSize: [0, 6],
    }],
  });

  window.addEventListener("resize", () => chart.resize());
}

function normalizeDomain(domain) {
  try {
    const parts = domain.split(".").filter(Boolean);
    return parts.length <= 2 ? domain : parts.slice(-2).join(".");
  } catch {
    return domain;
  }
}
