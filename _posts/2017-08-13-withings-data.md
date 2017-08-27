---
layout: post
title: "Withings data"
date: 2017-08-13
description: "Steps data from my smart watch"
categories: ["run", "python", "chartjs"]
calheatmap: true
chartjs: true

---

Code inside [python notebook](https://nbviewer.jupyter.org/url/cristianpb.github.io/images/withings/01-Withings.ipynb).

## Calendar heatmap of steps

<div id="cal-heatmap"></div>
<button id="example-c-PreviousDomain-selector" style="height: 20; width: 20px; margin-top: 10px;margin-bottom: 10px;" class="btn"><i class="icon icon-chevron-left"></i>< </button>
<button id="example-c-NextDomain-selector" style="height: 25; width: 20px; margin-bottom: 10px;" class="btn"><i class="icon icon-chevron-right"></i>></button>

## Daily steps 

<canvas id="scatterChart" width="400" height="200"></canvas>

## Steps per day

<canvas id="barChart" width="400" height="200"></canvas>

## Steps per month

<canvas id="barChartMonth" width="400" height="200"></canvas>

<script type="text/javascript">
var data_steps = {{ site.data.withings.withings_steps | jsonify }}
var cal = new CalHeatMap();
cal.init({
    start: new Date(2016, 4, 1, 1), // January, 1st 2000
    range: 12,
    domain: "month",
    subDomain: "day",
    nextSelector: "#example-c-NextDomain-selector",
    previousSelector: "#example-c-PreviousDomain-selector",
    data: data_steps.steps_heatmap,
    itemName: ["step", "steps"],
    subDomainTitleFormat: {
		empty: "No data recorded in {date}",
		filled: "{count} {name} on {date}"
	},
    legend: [3000, 7000, 10000, 15000, 20000],
    legendColors: ["#ecf5e2", "#232181"]
});
var timeFormat = 'YY:MM:dd';
var ctx = document.getElementById("scatterChart").getContext('2d');
var scatterChart = new Chart(ctx, {
    type: 'scatter',
    data: {
        datasets: [{
            label: 'Scatter Dataset',
            fill:false,
            showLine: false,
            data: data_steps.steps_points
        },{ label: 'Mean',
            fill:false,
            pointRadius: 1,
            borderColor: '#FFB0C1',
            backgroundColor: '#FF6384',
            data: data_steps.steps_mean
        }, {label: 'upper',
            fill:1,
            pointRadius: 1,
            borderColor: '#9AD0F5',
            backgroundColor: '#36A2EB',
            data: data_steps.steps_mean_high
        }, {label: 'lower',
            fill:1,
            pointRadius: 1,
            borderColor: '#9AD0F5',
            backgroundColor: '#36A2EB',
            data: data_steps.steps_mean_low
}]
    },
    options: {
        scales: {
            xAxes: [{
                type: 'time',
                position: 'bottom'
            }]
        }
    }
});

var ctx = document.getElementById("barChart").getContext('2d');
var barChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: data_steps.steps_weekday.index,
        datasets: [{
            label: 'Scatter Dataset',
            fill:false,
            showLine: false,
            borderColor: '#9AD0F5',
            backgroundColor: '#36A2EB',
            data: data_steps.steps_weekday.values
        }]
    },
    options: {
        responsive: true,
                    legend: {
                        display: false,
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Steps per day'
                    }
    }
});
var ctx = document.getElementById("barChartMonth").getContext('2d');
var barChartMonth = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: data_steps.steps_month.index,
        datasets: [{
            label: 'Scatter Dataset',
            borderColor: '#9AD0F5',
            backgroundColor: '#36A2EB',
            fill:false,
            showLine: false,
            data: data_steps.steps_month.values
        }]
    },
    options: {
        responsive: true,
                    legend: {
                        display: false,
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Steps per month'
                    }
    }
});
</script>
