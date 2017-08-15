---
layout: post
title: "Withings data"
date: 2017-08-13
description: "This post used javascript library Chartjs to illustrate interactively the statistics of a running activity"
categories: ["run", "python", "chartjs", "folium"]
calheatmap: true
chartjs: true

---

```python
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import json

df = pd.read_csv('input/activities.csv', parse_dates=[0])

print(df.shape)
df.head()

# Daily steps to json

df_steps = pd.concat([df.Date.dt.strftime("%s"), df.Steps], axis=1)

dic_steps = dict()
for k,x in df_steps.iterrows():
    dic_steps[x['Date']] = x['Steps']

with open('output/data_steps.json', 'w') as outfile:
    json.dump(dic_steps, outfile)
```


<div id="cal-heatmap"></div>
<button id="example-c-PreviousDomain-selector" style="margin-bottom: 10px;" class="btn"><i class="icon icon-chevron-left"></i></button>
<button id="example-c-NextDomain-selector" style="margin-bottom: 10px;" class="btn"><i class="icon icon-chevron-right"></i></button>
<script type="text/javascript">
    var data_steps_heat = {{ site.data.data_steps | jsonify }}
	var cal = new CalHeatMap();
    cal.init({
        start: new Date(2016, 3, 1, 1), // January, 1st 2000
        range: 12,
        domain: "month",
        subDomain: "day",
        nextSelector: "#example-c-NextDomain-selector",
        previousSelector: "#example-c-PreviousDomain-selector",
        data: data_steps_heat,
        legend: [3000, 7000, 10000, 15000, 20000],
        legendColors: ["#ecf5e2", "#232181"]
    });
</script>

## Scatter plot

```python
list_steps = []
for k,x in df.iterrows():
    list_steps.append({'x': x['Date'].strftime("%Y-%m-%d"), 'y': x['Steps']})

with open('output/list_steps.json', 'w') as outfile:
    json.dump(list_steps, outfile)
```

### Mean and confidence interval


```python
x=df['Date'].dt.strftime("%s").astype('int').values
y=df['Steps'].values
num_samples = 100
p, cov = np.polyfit(x, y, 3, cov=True)
z = np.poly1d(p)

xi = np.linspace(np.min(x), np.max(x), num_samples)
yi = z(xi)

list_mean_steps = []
list_upper_steps = []
list_lower_steps = []
for i in range(num_samples):
    list_mean_steps.append({'x': pd.to_datetime(xi, unit='s', errors='ignore')[i].strftime("%Y-%m-%d"), 'y': np.round(yi[i])})
    list_upper_steps.append({'x': pd.to_datetime(xi, unit='s', errors='ignore')[i].strftime("%Y-%m-%d"), 'y': np.round(yi[i]+np.percentile(df['Steps'],2.5))})
    list_lower_steps.append({'x': pd.to_datetime(xi, unit='s', errors='ignore')[i].strftime("%Y-%m-%d"), 'y': np.round(yi[i]-np.percentile(df['Steps'],2.5))})


with open('output/list_mean_steps.json', 'w') as outfile:
    json.dump(list_mean_steps, outfile)
with open('output/list_upper_steps.json', 'w') as outfile:
    json.dump(list_upper_steps, outfile)
with open('output/list_lower_steps.json', 'w') as outfile:
    json.dump(list_lower_steps, outfile)
```


<canvas id="scatterChart" width="400" height="200"></canvas>
<script>
var timeFormat = 'YY:MM:dd';
var data_mean = {{ site.data.list_mean_steps | jsonify }}
var data_lower = {{ site.data.list_lower_steps | jsonify }}
var data_upper = {{ site.data.list_upper_steps | jsonify }}
var data_steps = {{ site.data.list_steps | jsonify }}
var ctx = document.getElementById("scatterChart").getContext('2d');
var scatterChart = new Chart(ctx, {
    type: 'scatter',
    data: {
        datasets: [{
            label: 'Scatter Dataset',
            fill:false,
            showLine: false,
            data: data_steps
        },{ label: 'Mean',
            fill:false,
            pointRadius: 1,
            borderColor: '#FFB0C1',
            backgroundColor: '#FF6384',
            data: data_mean
        }, {label: 'upper',
            fill:1,
            pointRadius: 1,
            borderColor: '#9AD0F5',
            backgroundColor: '#36A2EB',
            data: data_upper
        }, {label: 'lower',
            fill:1,
            pointRadius: 1,
            borderColor: '#9AD0F5',
            backgroundColor: '#36A2EB',
            data: data_lower
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
</script>

## Bar plots

```python
with open('output/steps_day.json', 'w') as outfile:
    json.dump([x[0] for x in df.groupby(df['Date'].dt.dayofweek).agg({'Steps':np.mean}).round(1).values ], outfile)

with open('output/steps_month.json', 'w') as outfile:
    json.dump([x[0] for x in df.groupby(df['Date'].dt.month).agg({'Steps':np.mean}).round(1).values ], outfile)
```


<canvas id="barChart" width="400" height="200"></canvas>
<script>
var steps_day = {{ site.data.steps_day | jsonify }}
var ctx = document.getElementById("barChart").getContext('2d');
var barChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        datasets: [{
            label: 'Scatter Dataset',
            fill:false,
            showLine: false,
            data: steps_day
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

<canvas id="barChartMonth" width="400" height="200"></canvas>
<script>
var steps_month = {{ site.data.steps_month | jsonify }}
var ctx = document.getElementById("barChartMonth").getContext('2d');
var barChartMonth = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        datasets: [{
            label: 'Scatter Dataset',
            fill:false,
            showLine: false,
            data: steps_month
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
