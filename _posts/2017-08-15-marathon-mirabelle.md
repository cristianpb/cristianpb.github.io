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

<div style="width:100%;"><div style="position:relative;width:100%;height:0;padding-bottom:60%;"><iframe src="data:text/html;charset=utf-8;base64,PCFET0NUWVBFIGh0bWw+CjxoZWFkPiAgICAKICAgIDxtZXRhIGh0dHAtZXF1aXY9ImNvbnRlbnQtdHlwZSIgY29udGVudD0idGV4dC9odG1sOyBjaGFyc2V0PVVURi04IiAvPgogICAgPHNjcmlwdD5MX1BSRUZFUl9DQU5WQVMgPSBmYWxzZTsgTF9OT19UT1VDSCA9IGZhbHNlOyBMX0RJU0FCTEVfM0QgPSBmYWxzZTs8L3NjcmlwdD4KICAgIDxzY3JpcHQgc3JjPSJodHRwczovL3VucGtnLmNvbS9sZWFmbGV0QDEuMC4xL2Rpc3QvbGVhZmxldC5qcyI+PC9zY3JpcHQ+CiAgICA8c2NyaXB0IHNyYz0iaHR0cHM6Ly9hamF4Lmdvb2dsZWFwaXMuY29tL2FqYXgvbGlicy9qcXVlcnkvMS4xMS4xL2pxdWVyeS5taW4uanMiPjwvc2NyaXB0PgogICAgPHNjcmlwdCBzcmM9Imh0dHBzOi8vbWF4Y2RuLmJvb3RzdHJhcGNkbi5jb20vYm9vdHN0cmFwLzMuMi4wL2pzL2Jvb3RzdHJhcC5taW4uanMiPjwvc2NyaXB0PgogICAgPHNjcmlwdCBzcmM9Imh0dHBzOi8vY2RuanMuY2xvdWRmbGFyZS5jb20vYWpheC9saWJzL0xlYWZsZXQuYXdlc29tZS1tYXJrZXJzLzIuMC4yL2xlYWZsZXQuYXdlc29tZS1tYXJrZXJzLmpzIj48L3NjcmlwdD4KICAgIDxzY3JpcHQgc3JjPSJodHRwczovL2NkbmpzLmNsb3VkZmxhcmUuY29tL2FqYXgvbGlicy9sZWFmbGV0Lm1hcmtlcmNsdXN0ZXIvMS4wLjAvbGVhZmxldC5tYXJrZXJjbHVzdGVyLXNyYy5qcyI+PC9zY3JpcHQ+CiAgICA8c2NyaXB0IHNyYz0iaHR0cHM6Ly9jZG5qcy5jbG91ZGZsYXJlLmNvbS9hamF4L2xpYnMvbGVhZmxldC5tYXJrZXJjbHVzdGVyLzEuMC4wL2xlYWZsZXQubWFya2VyY2x1c3Rlci5qcyI+PC9zY3JpcHQ+CiAgICA8bGluayByZWw9InN0eWxlc2hlZXQiIGhyZWY9Imh0dHBzOi8vdW5wa2cuY29tL2xlYWZsZXRAMS4wLjEvZGlzdC9sZWFmbGV0LmNzcyIgLz4KICAgIDxsaW5rIHJlbD0ic3R5bGVzaGVldCIgaHJlZj0iaHR0cHM6Ly9tYXhjZG4uYm9vdHN0cmFwY2RuLmNvbS9ib290c3RyYXAvMy4yLjAvY3NzL2Jvb3RzdHJhcC5taW4uY3NzIiAvPgogICAgPGxpbmsgcmVsPSJzdHlsZXNoZWV0IiBocmVmPSJodHRwczovL21heGNkbi5ib290c3RyYXBjZG4uY29tL2Jvb3RzdHJhcC8zLjIuMC9jc3MvYm9vdHN0cmFwLXRoZW1lLm1pbi5jc3MiIC8+CiAgICA8bGluayByZWw9InN0eWxlc2hlZXQiIGhyZWY9Imh0dHBzOi8vbWF4Y2RuLmJvb3RzdHJhcGNkbi5jb20vZm9udC1hd2Vzb21lLzQuNi4zL2Nzcy9mb250LWF3ZXNvbWUubWluLmNzcyIgLz4KICAgIDxsaW5rIHJlbD0ic3R5bGVzaGVldCIgaHJlZj0iaHR0cHM6Ly9jZG5qcy5jbG91ZGZsYXJlLmNvbS9hamF4L2xpYnMvTGVhZmxldC5hd2Vzb21lLW1hcmtlcnMvMi4wLjIvbGVhZmxldC5hd2Vzb21lLW1hcmtlcnMuY3NzIiAvPgogICAgPGxpbmsgcmVsPSJzdHlsZXNoZWV0IiBocmVmPSJodHRwczovL2NkbmpzLmNsb3VkZmxhcmUuY29tL2FqYXgvbGlicy9sZWFmbGV0Lm1hcmtlcmNsdXN0ZXIvMS4wLjAvTWFya2VyQ2x1c3Rlci5EZWZhdWx0LmNzcyIgLz4KICAgIDxsaW5rIHJlbD0ic3R5bGVzaGVldCIgaHJlZj0iaHR0cHM6Ly9jZG5qcy5jbG91ZGZsYXJlLmNvbS9hamF4L2xpYnMvbGVhZmxldC5tYXJrZXJjbHVzdGVyLzEuMC4wL01hcmtlckNsdXN0ZXIuY3NzIiAvPgogICAgPGxpbmsgcmVsPSJzdHlsZXNoZWV0IiBocmVmPSJodHRwczovL3Jhd2dpdC5jb20vcHl0aG9uLXZpc3VhbGl6YXRpb24vZm9saXVtL21hc3Rlci9mb2xpdW0vdGVtcGxhdGVzL2xlYWZsZXQuYXdlc29tZS5yb3RhdGUuY3NzIiAvPgogICAgPHN0eWxlPmh0bWwsIGJvZHkge3dpZHRoOiAxMDAlO2hlaWdodDogMTAwJTttYXJnaW46IDA7cGFkZGluZzogMDt9PC9zdHlsZT4KICAgIDxzdHlsZT4jbWFwIHtwb3NpdGlvbjphYnNvbHV0ZTt0b3A6MDtib3R0b206MDtyaWdodDowO2xlZnQ6MDt9PC9zdHlsZT4KICAgIAogICAgICAgICAgICA8c3R5bGU+ICNtYXBfZmNlZWI2OWQ1ZjZhNDU2ZGE2N2FkMTU5NTZhZjA5MDkgewogICAgICAgICAgICAgICAgcG9zaXRpb24gOiByZWxhdGl2ZTsKICAgICAgICAgICAgICAgIHdpZHRoIDogMTAwLjAlOwogICAgICAgICAgICAgICAgaGVpZ2h0OiAxMDAuMCU7CiAgICAgICAgICAgICAgICBsZWZ0OiAwLjAlOwogICAgICAgICAgICAgICAgdG9wOiAwLjAlOwogICAgICAgICAgICAgICAgfQogICAgICAgICAgICA8L3N0eWxlPgogICAgICAgIAogICAgPHNjcmlwdCBzcmM9Imh0dHBzOi8vbGVhZmxldC5naXRodWIuaW8vTGVhZmxldC5oZWF0L2Rpc3QvbGVhZmxldC1oZWF0LmpzIj48L3NjcmlwdD4KPC9oZWFkPgo8Ym9keT4gICAgCiAgICAKICAgICAgICAgICAgPGRpdiBjbGFzcz0iZm9saXVtLW1hcCIgaWQ9Im1hcF9mY2VlYjY5ZDVmNmE0NTZkYTY3YWQxNTk1NmFmMDkwOSIgPjwvZGl2PgogICAgICAgIAo8L2JvZHk+CjxzY3JpcHQ+ICAgIAogICAgCgogICAgICAgICAgICAKICAgICAgICAgICAgICAgIHZhciBzb3V0aFdlc3QgPSBMLmxhdExuZygtOTAsIC0xODApOwogICAgICAgICAgICAgICAgdmFyIG5vcnRoRWFzdCA9IEwubGF0TG5nKDkwLCAxODApOwogICAgICAgICAgICAgICAgdmFyIGJvdW5kcyA9IEwubGF0TG5nQm91bmRzKHNvdXRoV2VzdCwgbm9ydGhFYXN0KTsKICAgICAgICAgICAgCgogICAgICAgICAgICB2YXIgbWFwX2ZjZWViNjlkNWY2YTQ1NmRhNjdhZDE1OTU2YWYwOTA5ID0gTC5tYXAoCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbWFwX2ZjZWViNjlkNWY2YTQ1NmRhNjdhZDE1OTU2YWYwOTA5JywKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtjZW50ZXI6IFs0OC44NDE1MDgzMTk3LDIuMzMyOTIzMTEwMTFdLAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgem9vbTogMTEsCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhCb3VuZHM6IGJvdW5kcywKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxheWVyczogW10sCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3JsZENvcHlKdW1wOiBmYWxzZSwKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyczogTC5DUlMuRVBTRzM4NTcKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7CiAgICAgICAgICAgIAogICAgICAgIAogICAgCiAgICAgICAgICAgIHZhciB0aWxlX2xheWVyXzk1OGVhZmJjYjAwYzQwZGNhMDdhMzFlNjZkZTZiYTExID0gTC50aWxlTGF5ZXIoCiAgICAgICAgICAgICAgICAnaHR0cHM6Ly97c30udGlsZS5vcGVuc3RyZWV0bWFwLm9yZy97en0ve3h9L3t5fS5wbmcnLAogICAgICAgICAgICAgICAgewogICAgICAgICAgICAgICAgICAgIG1heFpvb206IDE4LAogICAgICAgICAgICAgICAgICAgIG1pblpvb206IDEsCiAgICAgICAgICAgICAgICAgICAgY29udGludW91c1dvcmxkOiBmYWxzZSwKICAgICAgICAgICAgICAgICAgICBub1dyYXA6IGZhbHNlLAogICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0aW9uOiAnRGF0YSBieSA8YSBocmVmPSJodHRwOi8vb3BlbnN0cmVldG1hcC5vcmciPk9wZW5TdHJlZXRNYXA8L2E+LCB1bmRlciA8YSBocmVmPSJodHRwOi8vd3d3Lm9wZW5zdHJlZXRtYXAub3JnL2NvcHlyaWdodCI+T0RiTDwvYT4uJywKICAgICAgICAgICAgICAgICAgICBkZXRlY3RSZXRpbmE6IGZhbHNlCiAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgKS5hZGRUbyhtYXBfZmNlZWI2OWQ1ZjZhNDU2ZGE2N2FkMTU5NTZhZjA5MDkpOwoKICAgICAgICAKICAgIAogICAgICAgICAgICB2YXIgaGVhdF9tYXBfMzBlMmQxN2JlMzNkNGJkNGFhYWFhMTFmMmMwYjk1MmIgPSBMLmhlYXRMYXllcigKICAgICAgICAgICAgICAgIFtbNDguODQ2MDcyNDUwOTA2ODI0LCAyLjMzNTMxNjU1NzA5ODE4NjRdLCBbNDguODQ2MTI3MzUxNTE5MzQzLCAyLjMzNTI3MDQ1MDEzODEyMThdLCBbNDguNzgyMDIzMzM3OTYyOTYxLCAyLjI5MDMwODg5NTA5NjAyMjJdLCBbNDguODQ2MTQ1NTA1NDE1MTY2LCAyLjMzNTE5NTAyODUxOTg1NTVdLCBbNDguODQ5NDc4NzEyNDEyNTkxLCAyLjMzMjYwMDYyMTc2NTczNDJdLCBbNDguODQ2MDkzOTMzMzc3MzA0LCAyLjMzNTE1MjUzMDgwNDc0OTRdLCBbNDguODQ2Mzk0ODExMjk0NzY1LCAyLjMzNTY1NzEyMDMzOTc2MTFdLCBbNDguODQ2Mzk5Njg3OTQ5NjM1LCAyLjMzNTU5OTcwODcyMzAyMTRdLCBbNDguODQ2MDQ2NzE5NTg2Mzc2LCAyLjMzNTIzODI1MzUyNzk4MDhdLCBbNDguODQ2MzgxOTE4MjM4OTk3LCAyLjMzNTY4NDQ0ODM0OTA1NjZdLCBbNDguODQ2NDYwNzE5MjE1MTUyLCAyLjMzNTcyMDUzMDE3NTkxMzJdLCBbNDguODQ1NjA0NTM1ODgyMzUyLCAyLjMzNTEzODcyMTQ3MDU4ODNdLCBbNDguODQ2NDA0NjI2NDEzMzk2LCAyLjMzNTgxMTg4Nzg3ODc4NzldLCBbNDguODQ2MDU3NTMzOTUwNjIxLCAyLjMzNTM0NjAxOTI1OTI1OTRdLCBbNDguODQ2MTIzMTQ5MDMyMjU5LCAyLjMzNTI1MTcxNjk2Nzc0Ml0sIFs0OC44NDYyMTUzODg1OTcxNTIsIDIuMzM1Njc5MTI3NTMxODgyN10sIFs0OC44NDQzMjU5NTEyOTYxNDksIDIuMzM0OTg4NzI5NDU3OTczMl0sIFs0OC44NDM5NjQ5OTU4Nzk5MzYsIDIuMzMzNDk0MDA0MjM3Nzg3XSwgWzQ4LjgyMjMzNjc0NTE2MzA3MSwgMi4zMzgwODQ3NDA3NDA3NDA2XV0sCiAgICAgICAgICAgICAgICB7CiAgICAgICAgICAgICAgICAgICAgbWluT3BhY2l0eTogMC41LAogICAgICAgICAgICAgICAgICAgIG1heFpvb206IDE4LAogICAgICAgICAgICAgICAgICAgIG1heDogMS4wLAogICAgICAgICAgICAgICAgICAgIHJhZGl1czogMjAsCiAgICAgICAgICAgICAgICAgICAgYmx1cjogMTUsCiAgICAgICAgICAgICAgICAgICAgZ3JhZGllbnQ6IG51bGwKICAgICAgICAgICAgICAgICAgICB9KQogICAgICAgICAgICAgICAgLmFkZFRvKG1hcF9mY2VlYjY5ZDVmNmE0NTZkYTY3YWQxNTk1NmFmMDkwOSk7CiAgICAgICAgCjwvc2NyaXB0Pg==" style="position:absolute;width:100%;height:100%;left:0;top:0;border:none !important;" allowfullscreen webkitallowfullscreen mozallowfullscreen></iframe></div></div>




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
