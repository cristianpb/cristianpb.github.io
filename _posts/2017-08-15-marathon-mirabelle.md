---
layout: post
title: "Marathon Mirabelle Metz"
date: 2017-08-13
description: "This post used javascript library Chartjs to illustrate interactively the statistics of a running activity"
categories: ["run", "python", "chartjs", "folium"]
calheatmap: true
chartjs: true

---

<div id="cal-heatmap"></div>
<button id="example-c-PreviousDomain-selector" style="margin-bottom: 10px;" class="btn"><i class="icon icon-chevron-left"></i></button>
<button id="example-c-NextDomain-selector" style="margin-bottom: 10px;" class="btn"><i class="icon icon-chevron-right"></i></button>
<script type="text/javascript">
    var data_steps_heat = {{ site.data.marathon.marathon.heatmap_km | jsonify }}
	var cal = new CalHeatMap();
    cal.init({
        start: new Date(2017, 5, 1, 1), // January, 1st 2000
        range: 4,
        domain: "month",
        subDomain: "day",
        nextSelector: "#example-c-NextDomain-selector",
        previousSelector: "#example-c-PreviousDomain-selector",
        data: data_steps_heat,
        legend: [3, 5, 10, 20],
        legendColors: ["#ecf5e2", "#232181"]
    });
</script>

## Bar plot

<canvas id="barChart" width="400" height="200"></canvas>
<script>
var steps_day = {{ site.data.marathon.marathon.weekday | jsonify }}
var ctx = document.getElementById("barChart").getContext('2d');
var barChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: steps_day.index,
        datasets: [{
            label: 'Scatter Dataset',
            fill:false,
            showLine: false,
            borderColor: '#FFB0C1',
            backgroundColor: '#FF6384',
            data: steps_day.Trains
        },{
            label: 'Scatter Dataset',
            fill:false,
            showLine: false,
            borderColor: '#9AD0F5',
            backgroundColor: '#36A2EB',
            data: steps_day.Kilometers
        },{
            label: 'Scatter Dataset',
            fill:false,
            showLine: false,
            data: steps_day.Speed
        }
        ]
    },
    options: {
        responsive: true,
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Chart.js Bar Chart'
                    }
    }
});
</script>

<canvas id="barChartMonth" width="400" height="200"></canvas>
<script>
var steps_month = {{ site.data.marathon.marathon.week | jsonify }}
var ctx = document.getElementById("barChartMonth").getContext('2d');
var barChartMonth = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: steps_month.index,
        datasets: [{
            label: 'Scatter Dataset',
            fill:false,
            showLine: false,
            data: steps_month.Speed
        }]
    },
    options: {
        responsive: true,
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Chart.js Bar Chart'
                    }
    }
});
</script>
