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
<button id="example-c-PreviousDomain-selector" style="height: 20; width: 20px; margin-top: 10px;margin-bottom: 10px;" class="btn"><i class="icon icon-chevron-left"></i>< </button>
<button id="example-c-NextDomain-selector" style="height: 25; width: 20px; margin-bottom: 10px;" class="btn"><i class="icon icon-chevron-right"></i>></button>

## Bar plot

<canvas id="barChart" width="400" height="200"></canvas>
<canvas id="barChartWeek" width="400" height="200"></canvas>
<canvas id="barChartMonth" width="400" height="200"></canvas>
<canvas id="bubbleChartSpeed" width="400" height="200"></canvas>

<script type="text/javascript">
    var data_marathon = {{ site.data.marathon.marathon | jsonify }}
	var cal = new CalHeatMap();
    cal.init({
        start: new Date(2017, 5, 1, 1), // January, 1st 2000
        range: 4,
        domain: "month",
        subDomain: "day",
        nextSelector: "#example-c-NextDomain-selector",
        previousSelector: "#example-c-PreviousDomain-selector",
        data: data_marathon.heatmap_km,
        legend: [3, 5, 10, 20],
        legendColors: ["#ecf5e2", "#232181"]
    });

var ctx = document.getElementById("barChart").getContext('2d');
var barChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: data_marathon.weekday.index,
        datasets: [{
            label: 'Number of trainnings',
            fill:false,
            showLine: false,
            borderColor: '#FFB0C1',
            backgroundColor: '#FF6384',
            data: data_marathon.weekdayTrains
        },{
            label: 'Number of kilometers',
            fill:false,
            showLine: false,
            borderColor: '#9AD0F5',
            backgroundColor: '#36A2EB',
            data: data_marathon.weekday.Kilometers
        },{
            label: 'Speed',
            fill:false,
            showLine: false,
            data: data_marathon.weekday.Speed
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
                        text: 'Weekly'
                    }
    }
});

var ctx = document.getElementById("barChartWeek").getContext('2d');
var barChartWeek = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: data_marathon.week.index,
        datasets: [{
            label: 'Number of trainnings',
            fill:false,
            showLine: false,
            borderColor: '#FFB0C1',
            backgroundColor: '#FF6384',
            data: data_marathon.week.Trains
        },{
            label: 'Number of kilometers',
            fill:false,
            showLine: false,
            borderColor: '#9AD0F5',
            backgroundColor: '#36A2EB',
            data: data_marathon.week.Kilometers
        },{
            label: 'Speed',
            fill:false,
            showLine: false,
            data: data_marathon.week.Speed
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
                        text: 'Week number'
                    }
    }
});

var ctx = document.getElementById("barChartMonth").getContext('2d');
var barChartMonth = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: data_marathon.month.index,
        datasets: [{
            label: 'Number of trainnings',
            fill:false,
            showLine: false,
            borderColor: '#FFB0C1',
            backgroundColor: '#FF6384',
            data: data_marathon.month.Trains
        },{
            label: 'Number of kilometers',
            fill:false,
            showLine: false,
            borderColor: '#9AD0F5',
            backgroundColor: '#36A2EB',
            data: data_marathon.month.Kilometers
        },{
            label: 'Speed',
            fill:false,
            showLine: false,
            data: data_marathon.month.Speed
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
                        text: 'Week number'
                    }
    }
});

var ctx = document.getElementById("bubbleChartSpeed").getContext('2d');
var bubbleChartSpeed = new Chart(ctx, {
    type: 'bubble',
    data: {
        datasets: [{
            label: '',
            borderColor: '#FFB0C1',
            backgroundColor: '#FF6384',
            data: data_marathon.bubble_speed
        }]
    },
    options: {
        scales: {
            xAxes: [{
                type: 'time',
                label: 'Date',
                position: 'bottom',
            }],
            yAxes: [{
                position: 'left',
                        scaleLabel: {
                            display: false,
                            fontColor: '#FF6384',
                            labelString: 'Speed [km/h]'
                        }
            }]
        },
        responsive: true,
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Speed by training'
                    }
    }
});
</script>
