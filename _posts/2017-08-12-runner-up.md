---
layout: post
title: "Running statistics from Santorini experience"
date: 2017-08-12
description: "This post used javascript library Chartjs to illustrate interactively the statistics of a running activity"
categories: ["run", "python", "chartjs", "folium"]
maps: true
chartjs: true
calheatmap: true

---

Last year I participated to the trial race [Santorini
Experience](http://www.santorini-experience.com/). It started at
[Oia](https://en.wikipedia.org/wiki/Oia%2C_Greece) and depending on the number
of kilometres that you wanted to run, it may have 5, 10 or 15 kilometres.  I
ran 15 km of the magical path that connects Oia to Fira, overlooking the
[Caldera](https://en.wikipedia.org/wiki/Santorini_caldera).  During the race, I
used the open source tracker for android
[RunnerUp](https://github.com/jonasoreland/runnerup), which is a simple but
very complete tracker without all the bloatware that have some other popular
trackers.  This post shows some graphics of the data that I captured during the
race.

[RunnerUp](https://github.com/jonasoreland/runnerup) records the coordinates,
time and altitude which I exported using a `.tcx` format.  The `tcx` format is
a `xml` format from Garmin, I converted to a `csv` file using [a script from
Corey
Siegel](https://github.com/coreysiegel/tcx-gpx-csv/blob/master/tcx2csv.py).
Then, I used pandas to pre-process the `csv` file. The details can be found in the 
[python notebook](https://nbviewer.jupyter.org/url/cristianpb.github.io/images/runner-up/03-Export_json.ipynb).
The coordinates latitude and longitude can be used to plot the trajectory of
the race using folium library with a back end of Leaflet.

{% include santorini.html %}

The race trajectory was symmetrical: 7.5 kilometres forwards to Fira and 7.5 kilometres backwards to Oia.
It has 189 meters from the lowest point to the highest one. During the 15 km I have climbed 1486 meters. 

I used [ChartJS](http://www.chartjs.org/) to plot my speed performance. My maximal speed was around 15
kilometres per hour and there are some parts of the race where I almost walked
because the relief was too steep. 

<canvas id="myChart" width="400" height="200"></canvas>

The first three kilometres  were easy to overcome with a mean speed over 8
kilometres per hour. After the 4 kilometre it was difficult to keep a good
average, then I have a average speed of 6.6 kilometres per hour.  The speed
oscillated with the relief and at the end I end the race within 1 hour and 40
minutes, having a average speed of 9 kilometres per hour.

<div id="container" style="width: 100%;">
        <canvas id="canvas"></canvas>
</div>

<script>
var ctx = document.getElementById("myChart").getContext('2d');
var data_santorini = {{ site.data.santorini.santorini | jsonify }} ;
var timeFormat = 'HH:mm:ss';
var myChart = new Chart(ctx, {
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

        var color = Chart.helpers.color;
        var barChartData = {
            labels: data_santorini.Interval.Distance,
            datasets: [{
                label: 'Speed',
                borderColor: '#FFB0C1',
                backgroundColor: '#FF6384',
                borderWidth: 1,
                yAxisID: "y-axis-1",
                data: data_santorini.Interval.Speed
            }, {
                label: 'Altitude',
                borderColor: '#9AD0F5',
                backgroundColor: '#36A2EB',
                borderWidth: 1,
                yAxisID: "y-axis-2",
                data: data_santorini.Interval.Altitude
            }]
        };

        window.onload = function() {
            var ctx = document.getElementById("canvas").getContext("2d");
            window.myBar = new Chart(ctx, {
                type: 'bar',
                data: barChartData,
                options: {
                    responsive: true,
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: false,
                        text: 'Chart.js Bar Chart'
                    },
               scales: {
                   xAxes: [{
                       scaleLabel: {
                           display: true,
                           labelString: 'Kilometre'
                       }
                         }],
                   yAxes: [ {
                        type: "linear", // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                        display: true,
                        position: "left",
                        id: "y-axis-1",
                        scaleLabel: {
                            display: true,
                            labelString: 'Speed [km/h]',
                            fontColor: '#FF6384'
                        },
                        // grid line settings
                        gridLines: {
                            drawOnChartArea: false, // only want the grid lines for one axis to show up
                        },
                   },{
                        type: "linear", // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                        display: true,
                        position: "right",
                        id: "y-axis-2",
                        scaleLabel: {
                            display: true,
                            fontColor: '#36A2EB',
                            labelString: 'Altitude [m]'
                        }
                   }]
                  }
                }
            });

        };
</script>
