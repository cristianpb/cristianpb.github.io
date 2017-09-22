---
layout: post
title: "Marathon Mirabelle Metz"
date: 2017-08-13
description: "Stats for my preparation for the Metz Marathon"
categories: ["run", "python", "chartjs", "folium"]
calheatmap: true
chartjs: true

---

I wanted to run a marathon at least once in my life. Then I started a
preparation program 3 months before the course.

## Running calendar

I started running regularly the first week of july. I run small distances on the weekdays and I tried to run more during the weekend. At the begining not that much but starting from august I started to run regularly on saturdays.

<div id="cal-heatmap"></div>

## Daily behaviour

<canvas id="radarWeekly" width="400" height="200"></canvas>

## Weekly behaviour

<canvas id="barChartWeek" width="400" height="200"></canvas>

## Monthly behaviour

<canvas id="barChartMonth" width="400" height="200"></canvas>

## Average speed and length per training

<canvas id="bubbleChartSpeed" width="400" height="200"></canvas>

## Longest run 

<canvas id="SpeedAltitudeChart" width="400" height="200"></canvas>

## Python notebook with data preprocessing

Code inside [python notebook](https://nbviewer.jupyter.org/url/cristianpb.github.io/images/runner-up/04-Multiple_Trainning.ipynb).

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
                fill:true,
                showLine: false,
                borderColor: '#FFB0C1',
                backgroundColor: '#FF6384',
                data: data_marathon.weekday.Trains
            },{
            label: 'Average kilometres',
            fill:true,
            showLine: false,
            borderColor: '#9AD0F5',
            backgroundColor: '#36A2EB',
            data: data_marathon.weekday.Kilometers
            },{
                label: 'Average speed',
                fill:true,
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
        },
{
            label: 'Predicted',
            borderColor: '#FFB0C1',
            backgroundColor: '#FF6384',
            data: data_marathon.bubble_speed.predict,
            fill:false,
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
                        var value = data.datasets[0].data[tooltipItems.index].r;
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

//var map = L.map('map');
//var drawMap = function(){
//
//    map.setView([48.777845, 2.2909380], 11);
//    mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
//    L.tileLayer(
//        'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//            attribution: '&copy; ' + mapLink + ' Contributors',
//            maxZoom: 15,
//        }).addTo(map);
//
//    for (var i = 0; i < data_marathon.leaflet.length; i++) {
//		//marker = new L.marker([data_marathon.leaflet[i][0],data_marathon.leaflet[i][1]])
//		//	.bindPopup(data_marathon.leaflet[i][2])
//            //	.addTo(map);
//        var circle = L.circle([data_marathon.leaflet[i][0], data_marathon.leaflet[i][1]], {
//            color: 'red',
//            fillColor: '#f03',
//            fillOpacity: 0.5,
//            radius: 500
//    }).addTo(map).bindPopup(data_marathon.leaflet[i][2]);
//		
//	}
//    var popup = L.popup();
//
//	function onMapClick(e) {
//		popup
//			.setLatLng(e.latlng)
//			.setContent("You clicked the map at " + e.latlng.toString())
//			.openOn(map);
//	}
//
//	map.on('click', onMapClick);
//
//    //var geoD = [];
//    //_.each(allDim.top(Infinity), function (d) {
//    //    geoD.push([d["Latitude"], d["Longitude"], 1]);
//    //  });
//    //var heat = L.heatLayer(data_marathon.leaflet,{
//    //    radius: 5,
//    //    blur: 10, 
//    //    maxZoom: 1,
//    //}).addTo(map);
//
//};
//drawMap();

var ctx = document.getElementById("SpeedAltitudeChart").getContext('2d');
var data_santorini = {{ site.data.marathon.marathon_run | jsonify }} ;
var timeFormat = 'HH:mm:ss';
var SpeedAltitudeChart = new Chart(ctx, {
    type: 'line',
    data: {
            labels: data_santorini.AltSpeed.Time,
        datasets: [{
            label: "Speed",
            fill: false,
            yAxisID: "y-axis-1",
            borderColor: '#FFB0C1',
            backgroundColor: '#FF6384',
            lineTension: 0,
            data: data_santorini.AltSpeed.Speed
        },{
            label: "Altitude",
            fill: true,
            pointRadius: 1,
            borderColor: '#9AD0F5',
            backgroundColor: '#36A2EB',
            yAxisID: "y-axis-2",
            lineTension: 0,
            data: data_santorini.AltSpeed.Altitude
        }
        ]
    },
    options: {
               title:{
                    display: false,
                   text: 'Chart.js Time Scale'
               },
            tooltips: {
					mode: 'index',
					intersect: false,
				},
			hover: {
					mode: 'index',
					intersect: false
				},
               scales: {
                   xAxes: [{
                       type: "time",
                       time: {
                           format: timeFormat,
                           //round: 'minute',
                           tooltipFormat: 'HH:mm:ss',
                           displayFormats: {
                                                  millisecond: '',
                                                  second: '',
                                                  minute: 'H:mm'
                                              }
                       },
                       scaleLabel: {
                           display: true,
                           labelString: 'Time [Hour:minute]'
                       }
                   }, ],
                   yAxes: [{
                        type: "linear", // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                        display: true,
                        position: "left",
                        id: "y-axis-1",
                        scaleLabel: {
                            display: true,
                            fontColor: '#FF6384',
                            labelString: 'Speed [km/h]'
                        }
                   }, {
                        type: "linear", // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                        display: true,
                        position: "right",
                        id: "y-axis-2",
                        scaleLabel: {
                            display: true,
                            labelString: 'Altitude [m]',
                            fontColor: '#36A2EB'
                        },
                        // grid line settings
                        gridLines: {
                            drawOnChartArea: false, // only want the grid lines for one axis to show up
                        },
                   }]
               },
              }
});
</script>
