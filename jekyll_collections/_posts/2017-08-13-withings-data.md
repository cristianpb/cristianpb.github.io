---
layout: post
title: "Two years data from Withings smart watch"
date: 2017-08-13
description: "The withings smart watch helps me find insights my health. How much I move and sleep."
categories:
  - visualization
tags: 
  - run
  - python
  - chartjs
  - withings
calheatmap: true
chartjs: true
image:
  path: /assets/img/withings/main-crop.jpg
  height: 200
  width: 300

---

The withings smart watch looks like a regular watch. It's very difficult to
tell that it has bluetooth and movement sensors inside. In addition it has long
duration battery and it's very elegant.

I have been using the watch during two years. Here you can find some of the
insights that the data that the watch collected tell me.

<amp-img src="/assets/img/withings/main.jpg" alt="Withings data" height="420" width="533" layout="responsive"></amp-img>

## Calendar heatmap of steps

This calendar plot shows the number of daily steps. Each box is a day. It's interactive, so you can hover your mouse to read the data. The colour meaning is the following:
- The white means that there are no steps that have been recorded that day.
- Light blue means that I didn't walk a lot that day.
- Dark blue means that I have been walking a lot that day.

I have been wearing the device very often, so you can notice that there are a lot of blue squares. It's also interesting to see holidays where I walk more than regular.

<div id="cal-heatmap"></div>
<br>
<button id="example-c-PreviousDomain-selector" class="button"><i class="fas 
fa-angle-left is-medium"></i>Previous </button>
<button id="example-c-NextDomain-selector" class="button">Next month <i 
class="fas fa-angle-right is-medium"></i></button>

## Daily steps 

This chart shows the number of daily steps in a more regular way. You might see the following:
- I have been walking more at the end of 2016, at the end of my PhD.
- My walking record is 37k steps, on 14 august 2016. It was on holidays at Italy. 

<canvas id="scatterChart" width="400" height="200"></canvas>

## Steps per day

This chart shows the number of daily steps grouped by weekday. You might notice that Saturday is the day when I walk the most and Monday is a very lazy day. 

<canvas id="barChart" width="400" height="200"></canvas>

## Steps per month

This chart shows the number of daily steps grouped by month. You might notice some seasonal effects.
- The summer is very active for me. Being July the month when I walk the most.
- I tend to be more lazy on winter. November is a month where I didn't walk a lot in two years.

<canvas id="barChartMonth" width="400" height="200"></canvas>

## Conclusions

This data helps me to know myself more. Mondays are not my days. Saturdays and Summer are the periods of the time when I walk more.

The code to process data and plot the chatjs graphs can be found in this [python notebook](https://nbviewer.jupyter.org/url/cristianpb.github.io/assets/img/withings/01-Withings.ipynb).

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
    legendColors: ["#ecf5e2", "#232181"],
    legendCellSize: 20,
    legendCellPadding: 5,
    tooltip: true
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
        },
        tooltips: {
				mode: 'nearest',
				intersect: false,
  callbacks: {

                    label: function(tooltipItems, data) { 
                        return tooltipItems.xLabel + ', ' + tooltipItems.yLabel + ' steps';
                    }
                }
			},
		hover: {
				mode: 'nearest',
				intersect: false
			},
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
