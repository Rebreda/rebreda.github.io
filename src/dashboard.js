// assets/js/dashboard.js
import * as echarts from 'echarts';

function createChart(containerId, title, data) {
  const chartDom = document.getElementById(containerId);
  const myChart = echarts.init(chartDom);
  const option = {
    title: {
      text: title,
      left: 'center',
    },
    tooltip: {},
    xAxis: {
      type: 'category',
      data: data.categories,
    },
    yAxis: {
      type: 'value',
    },
    series: [{
      data: data.values,
      type: 'bar',
    }]
  };
  myChart.setOption(option);
}

// Fetch and render results.json data. This example uses a simple bar chart.
fetch("/assets/data/results.json")
  .then(response => response.json())
  .then(resultsData => {
    // Process resultsData to create a dataset for visualization.
    // For example, count the number of sites with trackers, group by a metric, etc.
    // This is just a dummy example:
    const categories = [];
    const values = [];
    resultsData.forEach(item => {
      // Assuming each item represents a site
      categories.push(item.domain);
      values.push(item.trackers ? item.trackers.length : 0);
    });
    createChart('chart-results', 'Trackers per Site', { categories, values });
  })
  .catch(err => console.error('Error loading results.json:', err));

// Fetch and render analytics.json data.
fetch("/assets/data/analytics.json")
  .then(response => response.json())
  .then(analyticsData => {
    // For this chart, assume we want to show the total tracker instances per country.
    // Process analyticsData.analysisByCountry into categories and values arrays:
    const categories = [];
    const values = [];
    for (const country in analyticsData.analysisByCountry) {
      categories.push(country);
      values.push(analyticsData.analysisByCountry[country].totalTrackerInstances);
    }
    createChart('chart-analytics', 'Tracker Instances by Country', { categories, values });
  })
  .catch(err => console.error('Error loading analytics.json:', err));
