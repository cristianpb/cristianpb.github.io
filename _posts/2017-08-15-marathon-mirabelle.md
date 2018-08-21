---
layout: post
title: "Marathon training program"
date: 2017-08-13
description: "Stats for my preparation for the Metz Marathon"
categories: ["run", "python", "chartjs", "folium"]
calheatmap: true
chartjs: true

---

I wanted to run a marathon at least once in my life, then I chose to do the
[Marathon de Metz](http://www.marathon-metz.fr).

## Running calendar

I began my preparation program 3 months before the race. I started running regularly the first week of July. Mostly small distances on weekdays and longest ones during the weekend. I wasn't strict at the beginning, during the month of July but, then I my training became more regular. 

<div id="cal-heatmap"></div>

## Daily behaviour

From my daily analysis I can say that I prefer to run mostly on Tuesday and that I barely run on Fridays. Saturdays runs are the longest ones, with an average of 20.4 km. Regarding speed, I run slower on Saturdays, because distance are longer.

<canvas id="radarWeekly" width="400" height="200"></canvas>

## Weekly behaviour

It is nice to see the weekly progress, running 22 kilometres at the beginning of July and reaching 46 kilometres on September. In average, I train 3 times a week.

<canvas id="barChartWeek" width="400" height="200"></canvas>

## Monthly behaviour

There is also an monthly progress, being September my best month with 164 km and 14 training sessions. Almost half of the month.

<canvas id="barChartMonth" width="400" height="200"></canvas>


## Marathon time prediction

It is possible to estimate the elapsed the time that I would spend to cover the 42.195 km of the marathon. I applied a simple linear regression using the cover distance and the climbed altitude. 

The predicted time is 3.99 hours with an average speed of 10.56 km/h. One may see that for my training, the cover distance is more important than the climb altitude when predicting the elapsed time. 

```python
from sklearn import linear_model

# Use distance and climb height
X_train = recent_frame[['Kilometers','Climb']].values
y_train = recent_frame['Time']
# Test with the marathon 42.195 km and 400 m climb
X_test = np.array([42.195, 400]).reshape(1,-1)

# Use linear regression
regr = linear_model.LinearRegression()
regr.fit(X_train, y_train)
y_pred = regr.predict(X_test)
print('Distance: {} Km, Speed: {} Km/h, Time: {} hours \n'.format(X_test[0][0], X_test[0][0]/float(y_pred[0]/60), y_pred[0]/60))
>>> Distance: 42.195 Km, Speed: 10.56 Km/h, Time: 3.99 hours 
```
<canvas id="linearRegressionChart" width="400" height="200"></canvas>

## Average speed and length per training

My average speed varies depending on the number of kilometres that I run. For long distances, the average was near 11.2 km/hour. Meanwhile, for shorter distances I was able to reach 12.7 km/hours during 8 kilometres.

<canvas id="bubbleChartSpeed" width="400" height="300"></canvas>

## Data analysis

The python code used to explore the data can be found inside this [python notebook](https://nbviewer.jupyter.org/url/cristianpb.github.io/images/runner-up/04-Multiple_Trainning.ipynb).

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
    cellSize: 15,
    legend: [3, 5, 10, 20],
    legendColors: ["#ecf5e2", "#232181"],
    itemName: ["kilometre", "kilometres"],
    tooltip: true,
    subDomainTitleFormat: {
		empty: "No data recorded in {date}",
		filled: "{count} {name} on {date}"
	},
    onClick: function(date, nb) {
        $("#onClick-placeholder").html("<br/>On <b>" +
			moment(date).format("LL") + "</b> <br/>I run <b>" +
			(nb === null ? "unknown" : nb) + "</b> kilometres"
		);
	}
});

var ctx = document.getElementById("radarWeekly").getContext('2d');
var radarWeekly = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: data_marathon.weekday.index,
            datasets: [{
                label: 'Number of trainings',
                fill:false,
                showLine: false,
                borderColor: '#FF6384',
                backgroundColor: '#FFB0C1',
                data: data_marathon.weekday.Trains
            },{
            label: 'Average kilometres',
            fill:false,
            showLine: false,
            borderColor: '#36A2EB',
            backgroundColor: '#9AD0F5',
            data: data_marathon.weekday.Kilometers
            },{
                label: 'Average speed',
                fill:false,
                showLine: false,
                data: data_marathon.weekday.Speed
            }
            ]
        },
        options: {
            legend: {
                position: 'top',
            },
            title: {
                display: false,
                text: 'Chart.js Radar Chart'
            },
            scale: {
              ticks: {
                beginAtZero: true
              }
            },
            tooltips: {
					mode: 'index',
					intersect: false,
				},
			hover: {
					mode: 'index',
					intersect: false
				},
        }
});


var ctx = document.getElementById("barChartWeek").getContext('2d');
var barChartWeek = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: data_marathon.week.index,
        datasets: [{
            label: 'Number of trainings',
            fill:false,
            showLine: false,
            borderColor: '#FFB0C1',
            backgroundColor: '#FF6384',
            data: data_marathon.week.Trains
        },{
            label: 'Total kilometres',
            fill:false,
            showLine: false,
            borderColor: '#9AD0F5',
            backgroundColor: '#36A2EB',
            data: data_marathon.week.Kilometers
        },{
            label: 'Average speed',
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
                        display: false,
                        text: 'Week number'
                    },
            tooltips: {
					mode: 'index',
					intersect: false,
				},
			hover: {
					mode: 'index',
					intersect: false
				},
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
                        display: false,
                        text: 'Week number'
                    },
            tooltips: {
					mode: 'index',
					intersect: false,
				},
			hover: {
					mode: 'index',
					intersect: false
				},
    }
});

var ctx = document.getElementById("bubbleChartSpeed").getContext('2d');
var bubbleChartSpeed = new Chart(ctx, {
    type: 'bubble',
    data: {
        datasets: [{
            label: 'Predicted',
            borderColor: '#FFB0C1',
            backgroundColor: '#FF6384',
            data: data_marathon.bubble_speed.predict,
            fill:false,
            borderDash: [10,5]
        },
{
            label: '5 km',
            borderColor: '#9AD0F5',
            backgroundColor: '#36A2EB',
            data: data_marathon.bubble_speed.real
        }, 
{
            label: '10 km',
            borderColor: '#36A2EB',
            backgroundColor: '#36A2EB',
            data: {},
            borderWidth: 10,
            type: 'scatter'
        },
{
            label: '20 km',
            borderColor: '#36A2EB',
            backgroundColor: '#36A2EB',
            data: {},
            borderWidth: 15,
            type: 'scatter'
        }
]
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
                            display: true,
                            //fontColor: '#FF6384',
                            labelString: 'Speed [km/h]'
                        },
                ticks: {
                userCallback: function(value, index, values) {
                return parseInt(value);
                }
                }
            }]
        },
        responsive: true,
                    legend: {
                        display:true,
                        position: 'top',
    labels: {
                            usePointStyle: true
                        }
                    },
                    title: {
                        display: true,
                        text: 'Average speed by training'
                    },
            tooltips: {
					mode: 'nearest',
					intersect: false,
  callbacks: {

                    label: function(tooltipItems, data) { 
                        var value = data.datasets[1].data[tooltipItems.index].r;
                        //value = value.toString();
                        return tooltipItems.xLabel + ', ' + tooltipItems.yLabel + ' Km/h, ' + value + ' Km';
                    }
                }
				},
			hover: {
					mode: 'nearest',
					intersect: false
				},
    }
});
var ctx = document.getElementById("linearRegressionChart").getContext('2d');
var linearRegressionChart = new Chart(ctx, {
    type: 'scatter',
    data: {
        datasets: [{
            label: 'Training',
            borderColor: '#9AD0F5',
            backgroundColor: '#36A2EB',
            fill:false, 
            showLine: false,
            data: data_marathon.linear_reg.points
        },{
            label: 'Prediction',
            borderColor: '#FFB0C1',
            backgroundColor: '#FF6384',
            borderDash: [10,5],
            fill:false, 
            showLine: true,
            data: data_marathon.linear_reg.line
        }], 
    },
    options: {
        scales: {
            xAxes: [{
                scaleLabel: {
                            display: true,
                            //fontColor: '#FF6384',
                            labelString: 'Kilometers'
                        },
                position: 'bottom',
            }],
            yAxes: [{
                position: 'left',
                scaleLabel: {
                            display: true,
                            //fontColor: '#FF6384',
                            labelString: 'Time [hours]'
                        },
            }]
        },
        responsive: true,
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: false,
                        text: 'Week number'
                    },
            tooltips: {
					mode: 'index',
					intersect: false,
                    callbacks: {
                    label: function(tooltipItems, data) { 
                        //var value = data.datasets[0].data[tooltipItems.index].r;
                        //value = value.toString();
                        return tooltipItems.xLabel + ' km, ' + tooltipItems.yLabel + ' hours';
                    }
                }
				},
			hover: {
					mode: 'nearest',
					intersect: false
				},
    }
});
</script>
