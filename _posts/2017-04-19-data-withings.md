---
layout: post
title: "Data withings smart watch"
date:   2017-04-19 21:01:25 +0200
description: "Analysis for one year data of my daily sleep time and number of steps."
categories: ['withings', 'r', 'data']
---

# Annual report 

Last year my friends gave me a [withings
steel](https://www.withings.com/us/en/products/activite-steel) as a birthday
gift.  It has been almost one year and  I wanted to do the annual report about
how has been this year in terms of data. 
I used [R](https://en.wikipedia.org/wiki/R_(programming_language)) to do the
analysis because I think it is easy to get beautiful and informative graphs. 

## Library import 

I used the following libraries:

```r
library('ggplot2') # data manipulation
library('scales')
library('zoo') #yearmon
library(RColorBrewer)
theme_set(theme_gray(base_size = 19))
```

## Sleeping data

```r
sleep <- read.csv("input/sleep.csv", header = TRUE, stringsAsFactors=F)
sleep$from <- strptime(sleep$from,"%Y-%m-%d %H:%M")
sleep$to <- strptime(sleep$to,"%Y-%m-%d %H:%M")
sleep$duration <-  difftime(sleep$to, sleep$from ,units="hour")
ggplot(aes(x = sleep$to, y = sleep$duration), data = sleep) + geom_point(na.rm=T) +
	scale_y_continuous(name="Sleep time [hours]",breaks=seq(2,12,1),limits=c(2,11)) +
	scale_x_datetime(name="Date",breaks = date_breaks("1 months"),
        labels = date_format("%b")) +
 	stat_smooth(na.rm=T) 
```

![plot of chunk unnamed-chunk-2](/images/data_withings/sleep.svg)

During my last PhD year I used to sleep less than 7 hours in average. I
defended my PhD the 29th of September, after that my sleep has increased
steadily to a little less than 8 hours.

```r
# facet by year ~ month, and each subgraph will show week-of-month versus weekday the year is simple
sleep$year <- as.numeric(as.POSIXlt(sleep$to)$year+1900)
sleep$month<-as.numeric(as.POSIXlt(sleep$to)$mon+1)

# turn months into ordered facors to control the appearance/ordering in the presentation
sleep$monthf<-factor(sleep$month,levels=as.character(1:12),labels=c("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"),ordered=TRUE)

# the day of week is again easily found
sleep$weekday = as.numeric(format(as.POSIXlt(sleep$to),"%u"))
 
# again turn into factors to control appearance/abbreviation and ordering
# I use the reverse function rev here to order the week top down in the graph
# you can cut it out to reverse week order
sleep$weekdayf<-factor(sleep$weekday,levels=rev(1:7),labels=rev(c("Mon","Tue","Wed","Thu","Fri","Sat","Sun")),ordered=TRUE)
 
# the monthweek part is a bit trickier - first a factor which cuts the data into month chunks
sleep$yearmonth<-as.yearmon(sleep$to)
sleep$yearmonthf<-factor(sleep$yearmonth)
 
# then find the "week of year" for each day
sleep$week <- as.numeric(format(as.POSIXlt(sleep$to),"%W"))
 
# and now for each monthblock we normalize the week to start at 1
sleep <- do.call("rbind",as.list(by(sleep, sleep["yearmonthf"], transform, monthweek=1+week-min(week))))
#sleep <- ddply(sleep,.(yearmonthf),transform,monthweek=1+week-min(week))
#sleep$monthweek <- 1+sleep$week-min(sleep$week)
 
# Now for the plot
ggplot(sleep, aes(monthweek, weekdayf, fill = sleep$duration)) +
	geom_tile(colour = "white") + facet_grid(year~monthf) +
	scale_fill_gradient() + xlab("Week of Month") +
	ylab("") + labs(fill="Sleep hours \n") 
```

![plot of chunk unnamed-chunk-3](/images/data_withings/calendar.svg)

I tend to sleep longer on weekends. There are some empty spaces that correspond
to days when I didn't have the watch, because I broke the bracelet a couple of
times. Still it is very cheap to replace on ebay.

## Activity time

Regarding the activity time. I have the information about the number of steps
that I have done each day.  A number of calories is calculated using this
information. The watch doesn't have an altimeter so I don't have information
about the elevation. 

```r
activities <- read.csv("input/activities.csv", header = TRUE, stringsAsFactors=F)
activities$Date <- strptime(activities$Date,"%Y-%m-%d")
str(activities)
```

```
## 'data.frame':	347 obs. of  5 variables:
##  $ Date           : POSIXlt, format: "2017-04-18" "2017-04-17" ...
##  $ Steps          : int  2208 5206 7287 5455 5212 5367 4577 5407 4930 16677 ...
##  $ Distance..m.   : num  1.8 5.44 6.89 4.37 4.22 4.35 3.71 4.35 3.93 12.8 ...
##  $ Elevation..m.  : int  0 0 0 0 0 0 0 0 0 0 ...
##  $ Active.calories: int  64 308 305 156 150 155 132 155 140 458 ...
```

```r
p <- ggplot(aes(x = activities$Date, y = activities$Steps), data = activities) +
        geom_point() + scale_y_continuous(name="Steps",breaks=seq(0,40000,5000)) +
        scale_x_datetime(name="Date",breaks = date_breaks("1 months"), labels =
                         date_format("%b")) +
        stat_smooth(na.rm=T)
ggsave(file="figure/activity.svg", plot=p, width=10, height=8)
```

![plot of chunk unnamed-chun3](/images/data_withings/activity.svg)

During the last summer I have walked more in average. I tend to go out more
during the sunny days.  In addition I have been walking less than last year
because I don't have to walk to much to go working.

```r
activities$year <- as.numeric(as.POSIXlt(activities$Date)$year+1900)
activities$month<-as.numeric(as.POSIXlt(activities$Date)$mon+1)

# turn months into ordered facors to control the appearance/ordering in the presentation
activities$monthf<-factor(activities$month,levels=as.character(1:12),labels=c("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"),ordered=TRUE)

# the day of week is again easily found
activities$weekday = as.numeric(format(as.POSIXlt(activities$Date),"%u"))

p <- ggplot(aes(x = activities$weekday, y = activities$Steps), data = activities) +
        geom_point() + scale_y_continuous(name="Steps",breaks=seq(0,40000,5000)) +
        scale_x_discrete(breaks=c(1, 2, 3, 4, 5, 6, 7), limits=c(1,2,3,4,5,6,7),
                   labels=c("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")) +
        xlab("Weekday") +
        stat_smooth(na.rm=T)
ggsave(file="figure/activity_weekday.svg", plot=p, width=10, height=8)
```

![plot of chunk unnamed-chunk-4](/images/data_withings/activity_weekday.svg)

I tend to walk more during the weekends.

_Lets see how it goes this summer !_
