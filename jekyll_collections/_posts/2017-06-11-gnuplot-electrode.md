---
layout: post
title: "Using gnuplot to plot heatmaps for scientific publications"
date: 2017-06-10
description: "How to use gnuplot to make heatmaps and manage labels for scientific publications"
categories:
  - visualization
tags: ["gnuplot"]
image:
  path: /assets/img/gnuplot-electrode/main-4x3.jpg
  height: 1050
  width: 1400
thumb:
  path: /assets/img/gnuplot-electrode/main-thumb.jpg
  height: 200
  width: 300

---

Gnuplot is a simple plotting program used make graphics for scientific
publication. In this post I will explain how I made some plots published in the
article [Cyclic voltammetry simulations with cellular
automata](http://www.sciencedirect.com/science/article/pii/S1877750315300107).
In this article we have information about a three diemensional regular lattice
and the a state for each cell of the lattice.
It is difficult see the variation of a dense cell using a three dimensional
representation, therefore we will use lateral projections of the lattice. 

## Heatmaps

The first projection is a like a top view of the lattice. We have a two
dimensional matrix where each element has a number that represents a
concentration of species. This can be represented as a heatmap where the
concentration is linked to a color scale.   

```python
reset
load 'moreland.plt'
SCALE=2
index=1
set terminal gif animate delay 50 optimize font "Lato" enhanced
set label 'Re' at graph -0.1,1.05
set label 'Ox' at graph 1.02,1.05
set output "Profile.gif"
#Axes
set xr [0:1360]
set yr [0:1360]
set xtics offset 0.0,0.3
set ytics offset 0.7,0.0
set mytics 5
set mxtics
set xlabel 'x [µm]' offset 0,0.0
set ylabel 'y [µm]' offset 1.0,0.0
# Grid
set tmargin screen 0.8
set grid front
set grid noxtics noytics
set size square
# Colorbox
set cbrange [-0.22:0.22]
set colorbox horizontal user size 0.50,0.015 origin graph 0,1.015
set cbtics ('' -0.22,'20' -0.2, '15' -0.15, '10' -0.1, '5' -0.05, '0' 0, '5' 0.05, '10' 0.1, '15'  0.15, '20' 0.2, '' 0.22) offset 0,2.0
set cblabel "Cell\'s percentage [%]" offset 1,5.0
do for [t=0:37848:1992] {
plot sprintf("ProfileXY%d.dat",t) matrix u ($1*SCALE):($2*SCALE):3 w image notitle
}
```

<amp-img src="/assets/img/gnuplot-electrode/Profile.gif" alt="Electrode profile XY" height="480" width="640" layout="responsive"></amp-img>

## Degrade line curves

The second representation is just the evolution of the one dimensional
concentration, which has been averaged in the other dimensions.

```python
load 'palettedegrade.plt'
filename='profileztra.dat'
filename2='profileztraRe.dat'
set terminal svg font "Lato,18"
set output 'ProfilZ.svg'
NZ=264
NX=530
SCALE=0.2

# Axes
set xr [0:NZ] #Time /16
set yr [:21]
set mytics 5
set mxtics

# Multiplot
set multiplot layout 2,1 rowsfirst

#----------------
#-  First plot  -
#----------------

set tmargin at screen 0.90; set bmargin at screen 0.55
set key bottom right title 'Voltage [V]' spacing 0.8
unset xlabel
set ylabel 'Concentration Ox [\%]' offset 1.5,-0.0
set xtics (" " 0, sprintf(" ") (50*NZ/NX), sprintf(" ") (100*NZ/NX), sprintf(" ") (150*NZ/NX), sprintf(" ") (200*NZ/NX), sprintf(" ",(250)) (250*NZ/NX), sprintf(" ") (300*NZ/NX), sprintf(" ") (350*NZ/NX), sprintf(" ") (400*NZ/NX), sprintf(" ") (450*NZ/NX), sprintf(" ") NX/2-1) offset 0,0.3
set ytics offset 0.5,0  add ("" 0)

plot filename u ($1*100) w l ls 1 title '0.8',\
filename u ($2*100) w l ls 2 notitle,\
filename u ($3*100) w l ls 3 title '0.611',\
filename u ($4*100) w l ls 4 notitle,\
filename u ($5*100) w l ls 5 title '0.422',\
filename u ($6*100) w l ls 6 notitle,\
filename u ($7*100) w l ls 7 title '0.233',\
filename u ($8*100) w l ls 8 notitle,\
filename u ($9*100) w l ls 9 title '0.044',\
filename u ($10*100) w l ls 10 notitle,\
filename u ($11*100) w l ls 11 notitle ,\
filename u ($12*100) w l ls 12 notitle,\
filename u ($13*100) w l ls 13 notitle,\
filename u ($14*100) w l ls 14 notitle,\
filename u ($15*100) w l ls 15 notitle,\
filename u ($16*100) w l ls 16 notitle,\
filename u ($17*100) w l ls 17 notitle,\
filename u ($18*100) w l ls 18 notitle,\
filename u ($19*100) w l ls 19 notitle,\
filename u ($20*100) w l ls 20 notitle

#-----------------
#-  Second plot  -
#-----------------

set tmargin at screen 0.55; set bmargin at screen 0.20
set key top right notitle
set xlabel 'Distance from the electrode [µm]' offset 0,0.5
set ylabel 'Concentration Re [\%]' offset 1.5,-0.5
set xtics (0, sprintf("%.0f",(50)) (50*NZ/NX), sprintf("%.0f",(100)) (100*NZ/NX), sprintf("%.0f",(150)) (150*NZ/NX), sprintf("%.0f",(200)) (200*NZ/NX), sprintf("%.0f",(250)) (250*NZ/NX), sprintf("%.0f",(300)) (300*NZ/NX), sprintf("%.0f",(350)) (350*NZ/NX), sprintf("%.0f",(400)) (400*NZ/NX), sprintf("%.0f",(450)) (450*NZ/NX), sprintf("%.0f",(NX/2*SCALE*10)) NX/2-1)
set ytics offset 0.5,0 add ("0" 0)

plot filename2 u ($1*100) w l ls 1 notitle,\
filename2 u ($2*100) w l ls 2 notitle,\
filename2 u ($3*100) w l ls 3 notitle,\
filename2 u ($4*100) w l ls 4 notitle,\
filename2 u ($5*100) w l ls 5 notitle,\
filename2 u ($6*100) w l ls 6 notitle,\
filename2 u ($7*100) w l ls 7 notitle,\
filename2 u ($8*100) w l ls 8 notitle,\
filename2 u ($9*100) w l ls 9 notitle,\
filename2 u ($10*100) w l ls 10 title '-0.145',\
filename2 u ($11*100) w l ls 11 notitle,\
filename2 u ($12*100) w l ls 12 title '0.034',\
filename2 u ($13*100) w l ls 13 notitle,\
filename2 u ($14*100) w l ls 14 title '0.223',\
filename2 u ($15*100) w l ls 15 notitle,\
filename2 u ($16*100) w l ls 16 title '0.412',\
filename2 u ($17*100) w l ls 17 notitle,\
filename2 u ($18*100) w l ls 18 title '0.601',\
filename2 u ($19*100) w l ls 19 notitle,\
filename2 u ($20*100) w l ls 20 title '0.79'

unset multiplot
unset output
```

<amp-img src="/assets/img/gnuplot-electrode/ProfilZ.svg" alt="Electrode Profile Z" height="480" width="600" layout="responsive"></amp-img>

The plots that have been presented here have different format than the ones
that appear in the paper article [Cyclic voltammetry simulations with cellular
automata](http://www.sciencedirect.com/science/article/pii/S1877750315300107),
which are in vectorial `eps` format. This is because html renders better `svg`
graphics and the animation have been used in `gif` format.
