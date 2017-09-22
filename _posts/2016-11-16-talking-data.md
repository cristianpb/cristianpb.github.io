---
layout: post
title: "Kaggle exercise: Talking data"
date:   2016-11-16 21:01:25 +0200
categories: ["kaggle", "r"]
---

## Introduction

----

<amp-img src="/images/talking_data/logotalking.png" alt="Logo talking data" height="289" width="862" layout="responsive"></amp-img>

- Le but de cette exercice est de construire un modèle pour prédire les caractéristiques démographiques (âge et genre) des utilisateurs de smartphones avec les applications installées, géolocalisation et les caractéristiques des portables. 

- Ce modèle permettra aux développeurs et annonceurs de mieux cibler ses offres de marketing selon les préférences des utilisateurs.   

- TalkingData veut déterminer les caractéristiques de plus de 350 millions d'utilisateurs en Chine.

## Données

<amp-img src="/images/talking_data/description.svg" alt="Talking data description" height="532" width="691" layout="responsive"></amp-img>

## Librairies


```r
rm(list=ls());gc()
```

```
##            used  (Mb) gc trigger   (Mb)  max used   (Mb)
## Ncells  1684989  90.0    4799883  256.4   8631012  461.0
## Vcells 48367176 369.1  343765888 2622.8 685123017 5227.1
```

```r
library('ggplot2')        # Visualization
library('plyr')           # Data manipulation
library('xgboost')        # XGBoost
library('data.table')     # Efficient data manipulation
library('FeatureHashing')
```
## Lecture des données


```r
train <- fread("../TalkingData/input/gender_age_train.csv",
	       colClasses=c("character","character","integer","character"),
	       stringsAsFactors=F)
setkey(train,device_id)
test <- fread("../TalkingData/input/gender_age_test.csv",
	      colClasses=c("character"), stringsAsFactors=F)
setkey(test,device_id)
test$group <- test$age <- test$gender <- NA
```

### Train et test


```r
str(train)
```

```
## Classes 'data.table' and 'data.frame':	74645 obs. of  4 variables:
##  $ device_id: chr  "-1000369272589010951" "-1000572055892391496" "-1000643208750517791" "-1001337759327042486" ...
##  $ gender   : chr  "F" "F" "M" "M" ...
##  $ age      : int  26 27 29 30 22 40 36 47 33 44 ...
##  $ group    : chr  "F24-26" "F27-28" "M29-31" "M29-31" ...
##  - attr(*, ".internal.selfref")=<externalptr> 
##  - attr(*, "sorted")= chr "device_id"
```

```r
str(test)
```

```
## Classes 'data.table' and 'data.frame':	112071 obs. of  4 variables:
##  $ device_id: chr  "-1000025442746372936" "-1000030473234264316" "-1000146476441213272" "-100015673884079572" ...
##  $ gender   : logi  NA NA NA NA NA NA ...
##  $ age      : logi  NA NA NA NA NA NA ...
##  $ group    : logi  NA NA NA NA NA NA ...
##  - attr(*, ".internal.selfref")=<externalptr> 
##  - attr(*, "sorted")= chr "device_id"
```

### Train: Genre 



```r
# N is the number of rows in each group
gendertrain <- train[,.(freq_label=.N),by="gender"] 
# Transforming into percentage
gendertrain$freq_label <- prop.table(as.numeric(gendertrain$freq_label))
# Pie Chart
ggplot(gendertrain, aes(x="", y=freq_label, fill=gender))+
	geom_bar(width = 1, stat = "identity") + coord_polar("y", start=0) +
	theme(axis.text.x=element_blank()) +
	geom_text(aes(y = freq_label/3 + c(0, cumsum(freq_label)[-length(freq_label)]),
		      label = paste(round(freq_label*100,digits=0),"%")), size=5) + xlab("") + ylab("")
```

<amp-img src="/images/talking_data/unnamed-chunk-9-1.png" alt="Talking data description" height="504" width="504" layout="responsive"></amp-img>

```r
rm(gendertrain);gc()
```

```
##            used  (Mb) gc trigger   (Mb)  max used   (Mb)
## Ncells  1884699 100.7    4799883  256.4   8631012  461.0
## Vcells 49690360 379.2  275012710 2098.2 685123017 5227.1
```

## Train: Age et genre


```r
agetrain <- ddply(train,.(age,gender),summarise, freq_label=length(age))
#agetrain <- train[,.(freq_label=.N,gender),by=c("age","gender")] # N is the number of rows in each group
meanM <- weighted.mean(agetrain$age[agetrain$gender =="M"],agetrain$freq_label[agetrain$gender =="M"])
meanF <- weighted.mean(agetrain$age[agetrain$gender =="F"],agetrain$freq_label[agetrain$gender =="F"])

# Bar plot
ggplot(data=agetrain) + geom_bar(aes(x=age, y=freq_label, fill=gender),
	colour="black", stat="identity") +
	xlab("Age")+ ylab("Number of persons") +
	geom_vline(aes(xintercept=meanF),col="red")+
	geom_vline(aes(xintercept=meanM),col="blue")
```

<amp-img src="/images/talking_data/unnamed-chunk-10-1.png" alt="Talking data description" height="504" width="504" layout="responsive"></amp-img>

```r
rm(agetrain);gc()
```

```
##            used  (Mb) gc trigger   (Mb)  max used   (Mb)
## Ncells  1888426 100.9    4799883  256.4   8631012  461.0
## Vcells 49697213 379.2  220010168 1678.6 685123017 5227.1
```
Age moyenne est 32 pour les femmes et 31 pour les hommes.

## Analyse des marques du portables


```r
phone <- fread("../TalkingData/input/phone_brand_device_model_trans.csv", stringsAsFactors = F, colClasses = c('character','character','character'))
setkey(phone,device_id)
```
Dimension of phone table (187245, 3)

Dimension of train table (74645, 4)


```r
# Combiner train et phone
phonetrain <- merge(train,phone,by=c("device_id"), all.x=T)
```

Dimension du tableau train (74839, 6)

Dimension du tableau phonetrain augmente, ce qui veut dire qu'il y a des doublons


```r
# Lignes identiques répétées
duplicate_phone <- phone[duplicated(phone,by=NULL),]
```

Doublons du tableau phone : 523



```r
# Enlever les doublons identiques
phone <- unique(phone,by=NULL)
dim(phone)
```

```
## [1] 186722      3
```


```r
# Est-ce qu'il y a des dispositifs avec des marques ou modèles différents?
duplicate_phone <- phone[duplicated(phone,by="device_id")]
```
Dispositifs avec différents marques ou modèles: 6


```r
merge(duplicate_phone,phone,by="device_id",all.x=T)
```

```
##                device_id phone_brand.x device_model.x phone_brand.y
##  1: -3004353610608679970       Coolpad           7296       Coolpad
##  2: -3004353610608679970       Coolpad           7296       Coolpad
##  3: -5269721363279128080        Xiaomi           MI 3       samsung
##  4: -5269721363279128080        Xiaomi           MI 3        Xiaomi
##  5: -6590454305031525112        Huawei     荣耀6 Plus        Xiaomi
##  6: -6590454305031525112        Huawei     荣耀6 Plus        Huawei
##  7: -7059081542575379359         Meizu     魅蓝Note 2            LG
##  8: -7059081542575379359         Meizu     魅蓝Note 2         Meizu
##  9: -7297178577997113203        Huawei         荣耀3C        Huawei
## 10: -7297178577997113203        Huawei         荣耀3C        Huawei
## 11:  5245428108336915020        Xiaomi    MI One Plus         Meizu
## 12:  5245428108336915020        Xiaomi    MI One Plus        Xiaomi
##          device_model.y
##  1:                5891
##  2:                7296
##  3: Galaxy Core Advance
##  4:                MI 3
##  5:                MI 3
##  6:          荣耀6 Plus
##  7:             Nexus 5
##  8:          魅蓝Note 2
##  9:          荣耀畅玩5X
## 10:              荣耀3C
## 11:                 MX4
## 12:         MI One Plus
```


```r
# Enlever les doublons
phone <- unique(phone)
dim(phone)
```

```
## [1] 186716      3
```


```r
# Combiner le tableau train avec le tableau phone pour avoir les
# characteristiques des devices 
phonetrain <- merge(train,phone,by=c("device_id"), all.x=T)
phonetest <- merge(test,phone,by=c("device_id"), all.x=T)
str(phonetrain)
```

```
## Classes 'data.table' and 'data.frame':	74645 obs. of  6 variables:
##  $ device_id   : chr  "-1000369272589010951" "-1000572055892391496" "-1000643208750517791" "-1001337759327042486" ...
##  $ gender      : chr  "F" "F" "M" "M" ...
##  $ age         : int  26 27 29 30 22 40 36 47 33 44 ...
##  $ group       : chr  "F24-26" "F27-28" "M29-31" "M29-31" ...
##  $ phone_brand : chr  "vivo" "OPPO" "Gionee" "OPPO" ...
##  $ device_model: chr  "Y17T" "R819T" "GN137" "A31" ...
##  - attr(*, "sorted")= chr "device_id"
##  - attr(*, ".internal.selfref")=<externalptr>
```

```r
str(phonetest)
```

```
## Classes 'data.table' and 'data.frame':	112071 obs. of  6 variables:
##  $ device_id   : chr  "-1000025442746372936" "-1000030473234264316" "-1000146476441213272" "-100015673884079572" ...
##  $ gender      : logi  NA NA NA NA NA NA ...
##  $ age         : logi  NA NA NA NA NA NA ...
##  $ group       : logi  NA NA NA NA NA NA ...
##  $ phone_brand : chr  "samsung" "samsung" "Meizu" "Xiaomi" ...
##  $ device_model: chr  "Galaxy Grand 2" "Galaxy Trend DUOS 2" "魅蓝NOTE" "小米note" ...
##  - attr(*, "sorted")= chr "device_id"
##  - attr(*, ".internal.selfref")=<externalptr>
```


```r
# Group by phone brand
phonetraingroup <- ddply(phonetrain,.(phone_brand),summarise, freq_label=length(phone_brand))
highphone <- phonetraingroup[(phonetraingroup$freq_label > 4000),]
lowphone <- phonetraingroup[(phonetraingroup$freq_label <= 4000),]
highphone <- rbind(highphone,c("other",sum(lowphone$freq_label)))
highphone$freq_label <- prop.table(as.numeric(highphone$freq_label))
ggplot(highphone, aes(x="", y=freq_label, fill=phone_brand))+
        geom_bar(width = 1, stat = "identity") + coord_polar("y", start=0) +
        theme(axis.text.x=element_blank()) +
        geom_text(aes(y = freq_label/3 + c(0, cumsum(freq_label)[-length(freq_label)]),
                      label = paste(round(freq_label*100,digits=0),"%")), size=5)
```

<amp-img src="/images/talking_data/unnamed-chunk-19-1.png" alt="Talking data description" height="504" width="504" layout="responsive"></amp-img>

```r
rm(lowphone,highphone,phonetraingroup,duplicate_phone,phone);gc()
```

```
##            used  (Mb) gc trigger   (Mb)  max used   (Mb)
## Ncells  1889826 101.0    4799883  256.4   8631012  461.0
## Vcells 50618796 386.2  176008134 1342.9 685123017 5227.1
```
80% du marche est contrôlé par 6 grands marques

## Applications des téléphones

Chaque enregistrement des applications indexe dans le tableau events avec la
position et la date.


```r
events <- fread("../TalkingData/input/events.csv", header = TRUE,
		stringsAsFactors=F,colClasses =
			c('character','character','Date','numeric','numeric'))
```

```
## Read 65.8% of 3252950 rowsRead 78.1% of 3252950 rowsRead 3252950 rows and 5 (of 5) columns from 0.182 GB file in 00:00:04
```

```r
setkeyv(events,c("device_id","event_id"))
str(events)
```

```
## Classes 'data.table' and 'data.frame':	3252950 obs. of  5 variables:
##  $ event_id : chr  "1004583" "1026437" "1032393" "1077411" ...
##  $ device_id: chr  "-100015673884079572" "-100015673884079572" "-100015673884079572" "-100015673884079572" ...
##  $ timestamp: chr  "2016-05-02 06:34:52" "2016-05-01 00:12:55" "2016-05-04 08:05:40" "2016-05-03 00:30:32" ...
##  $ longitude: num  0 0 0 0 0 0 0 0 0 0 ...
##  $ latitude : num  0 0 0 0 0 0 0 0 0 0 ...
##  - attr(*, ".internal.selfref")=<externalptr> 
##  - attr(*, "sorted")= chr  "device_id" "event_id"
```

Global position of events


```r
ggplot() + borders('world', colour='gray50', fill='gray50') +
        geom_point(aes(x=events$longitude, y=events$latitude),
                   color='blue',size=1)
```

<amp-img src="/images/talking_data/unnamed-chunk-21-1.png" alt="Talking data description" height="504" width="504" layout="responsive"></amp-img>

Main number of events based in China

```r
ggplot() + borders('world', colour='gray50', fill='gray50') +
        coord_cartesian(xlim = c(70,140),ylim = c(15,55)) +
        geom_point(aes(x=events$longitude, y=events$latitude),
                   color='blue',size=1)
```

<amp-img src="/images/talking_data/unnamed-chunk-22-1.png" alt="Talking data description" height="504" width="504" layout="responsive"></amp-img>

## Applications dans le tableau event


```r
event_app <- fread("../TalkingData/input/app_events.csv",colClasses=rep("character",4))
```

```
## Read 0.0% of 32473067 rowsRead 15.8% of 32473067 rowsRead 31.6% of 32473067 rowsRead 46.9% of 32473067 rowsRead 62.2% of 32473067 rowsRead 77.6% of 32473067 rowsRead 93.3% of 32473067 rowsRead 32473067 rows and 4 (of 4) columns from 0.966 GB file in 00:00:10
```

```r
setkey(event_app,event_id)
str(event_app)
```

```
## Classes 'data.table' and 'data.frame':	32473067 obs. of  4 variables:
##  $ event_id    : chr  "1000000" "1000000" "1000000" "1000000" ...
##  $ app_id      : chr  "543880124725657021" "2229153468836897886" "-506173428906005275" "5927333115845830913" ...
##  $ is_installed: chr  "1" "1" "1" "1" ...
##  $ is_active   : chr  "1" "1" "0" "0" ...
##  - attr(*, ".internal.selfref")=<externalptr> 
##  - attr(*, "sorted")= chr "event_id"
```

Pour pouvoir combiner avec le tableau de numéro de dispositif (device_id) il
faut grouper les applications dans chaque évènement


```r
# Fonction pour coller les applications dans une meme colomne separes par ","
# "app_id1,app_id2,app_3,..."  from @lewis:Low RAM bag-of-apps
toStr  <- function(x) paste(x, collapse = ",") 
# Combiner les evenements par event_id
event_app <- event_app[ , .(apps = toStr(app_id)), by = event_id]
str(event_app)
```

```
## Classes 'data.table' and 'data.frame':	1488096 obs. of  2 variables:
##  $ event_id: chr  "1000000" "1000004" "1000005" "1000006" ...
##  $ apps    : chr  "543880124725657021,2229153468836897886,-506173428906005275,5927333115845830913,-1633887856876571208,4743373741129926453,8693964"| __truncated__ "5195654633279707117,2229153468836897886,-6608180948776167473,6284164581582112235,1001398498434380294,5927333115845830913,-27055"| __truncated__ "5195654633279707117,-4762108283218821740,1000519352029378378,6284164581582112235,5927333115845830913,3433289601737013244,-39552"| __truncated__ "-7689286664726196654,-6159006306231678365,-3955212733485100109" ...
##  - attr(*, "sorted")= chr "event_id"
##  - attr(*, ".internal.selfref")=<externalptr>
```
Maintenant il faut combiner les avec le tableau d'évènements pour obtenir le
id du dispositif et ensuite avoir les applications par dispositif.


```r
# Combiner avec le tableau d'évènements avec applications par évènement
events <- merge(events, event_app, by = "event_id", all.x = T)
events <- events[ , .(apps = toStr(apps)), by = device_id]
rm(event_app);gc()
```

```
##             used   (Mb) gc trigger   (Mb)  max used   (Mb)
## Ncells   1937956  103.5    8134204  434.5  10167755  543.1
## Vcells 134332577 1024.9  530008062 4043.7 724249325 5525.6
```

```r
str(events)
```

```
## Classes 'data.table' and 'data.frame':	60865 obs. of  2 variables:
##  $ device_id: chr  "29182687948017175" "-8195816569128397698" "163167796882803305" "-4537233125614571555" ...
##  $ apps     : chr  "NA,8026407831917254841,6324195578393301030,6666573791286858743,8693964245073640147,2689721421138748406,-709131373705578095,6324"| __truncated__ "NA,289117438905230816,-8504475857937456387,NA,2229153468836897886,1001398498434380294,5927333115845830913,4574657903816099535,8"| __truncated__ "NA,6284164581582112235,5927333115845830913,3433289601737013244,-6159006306231678365,8693964245073640147,-395459949649198327,622"| __truncated__ "NA,3433289601737013244,3433289601737013244,1088227414300337900,NA,NA,NA,NA,NA,NA,5927333115845830913,-6590029937880196169,34332"| __truncated__ ...
##  - attr(*, ".internal.selfref")=<externalptr>
```
Il y a l'information des applications pour 60865
dispositifs uniquement.

Ensuite il est possible d'associer les dispositifs aux applications installées.


```r
device_train <- merge(phonetrain, events, by = "device_id", all.x = T)
device_test <- merge(phonetest, events, by = "device_id", all.x = T)
rm(events);gc()
```

```
##             used   (Mb) gc trigger   (Mb)  max used   (Mb)
## Ncells   1933245  103.3    6507363  347.6  10167755  543.1
## Vcells 133575512 1019.2  424006449 3235.0 724249325 5525.6
```

```r
str(device_train)
```

```
## Classes 'data.table' and 'data.frame':	74645 obs. of  7 variables:
##  $ device_id   : chr  "-1000369272589010951" "-1000572055892391496" "-1000643208750517791" "-1001337759327042486" ...
##  $ gender      : chr  "F" "F" "M" "M" ...
##  $ age         : int  26 27 29 30 22 40 36 47 33 44 ...
##  $ group       : chr  "F24-26" "F27-28" "M29-31" "M29-31" ...
##  $ phone_brand : chr  "vivo" "OPPO" "Gionee" "OPPO" ...
##  $ device_model: chr  "Y17T" "R819T" "GN137" "A31" ...
##  $ apps        : chr  NA NA NA "8693964245073640147,7167114343576723123,5927333115845830913,6956699582426139508,NA,NA,NA,NA,-7054804880832650555,-5368809411346"| __truncated__ ...
##  - attr(*, ".internal.selfref")=<externalptr> 
##  - attr(*, "sorted")= chr "device_id"
```

```r
str(device_test)
```

```
## Classes 'data.table' and 'data.frame':	112071 obs. of  7 variables:
##  $ device_id   : chr  "-1000025442746372936" "-1000030473234264316" "-1000146476441213272" "-100015673884079572" ...
##  $ gender      : logi  NA NA NA NA NA NA ...
##  $ age         : logi  NA NA NA NA NA NA ...
##  $ group       : logi  NA NA NA NA NA NA ...
##  $ phone_brand : chr  "samsung" "samsung" "Meizu" "Xiaomi" ...
##  $ device_model: chr  "Galaxy Grand 2" "Galaxy Trend DUOS 2" "魅蓝NOTE" "小米note" ...
##  $ apps        : chr  NA NA NA "6324195579000287296,-7745076081943986520,-506173428906005275,5927333115845830913,936333950832647056,7316250158002095415,5033830"| __truncated__ ...
##  - attr(*, ".internal.selfref")=<externalptr> 
##  - attr(*, "sorted")= chr "device_id"
```

J'ai choisi l'algorithme du gradient boosting tree (XGB).
Cette algorithme accepte des variables type numérique. Donc il faut transformer
depuis le format long vers un format de matrix large.


```r
# FeatureHashing library permet de faire la transition vers une
# matrice 'sparse'
#
b <- 2 ^ 14 # The hash size of feature hashing
#
# f: Formula for hashed matrix. -1 to remise the intercept column
f <- ~ phone_brand + device_model + split(apps, delim = ",") - 1 
X_train <- hashed.model.matrix(f, device_train, b)
X_test  <- hashed.model.matrix(f, device_test,  b)
str(X_train)
```

```
## Formal class 'dgCMatrix' [package "Matrix"] with 6 slots
##   ..@ i       : int [1:1074293] 592 7155 31344 71970 4589 10094 12753 20196 25129 42360 ...
##   ..@ p       : int [1:16385] 0 4 13 72 93 93 94 95 95 95 ...
##   ..@ Dim     : int [1:2] 74645 16384
##   ..@ Dimnames:List of 2
##   .. ..$ : chr(0) 
##   .. ..$ : chr [1:16384] "1" "2" "3" "4" ...
##   ..@ x       : num [1:1074293] 1 1 1 1 1 1 1 1 1 1 ...
##   ..@ factors : list()
```

```r
str(X_test)
```

```
## Formal class 'dgCMatrix' [package "Matrix"] with 6 slots
##   ..@ i       : int [1:1625049] 23788 25876 57495 83863 86218 98030 99614 104190 363 6329 ...
##   ..@ p       : int [1:16385] 0 8 24 97 116 116 116 118 118 118 ...
##   ..@ Dim     : int [1:2] 112071 16384
##   ..@ Dimnames:List of 2
##   .. ..$ : chr(0) 
##   .. ..$ : chr [1:16384] "1" "2" "3" "4" ...
##   ..@ x       : num [1:1625049] 1 1 1 1 1 1 1 1 1 1 ...
##   ..@ factors : list()
```

```r
# Label vector. Transform group factors to integers 0:11
Y_key <- sort(unique(device_train$group))
Y     <- match(device_train$group, Y_key) - 1
```

<amp-img src="/images/talking_data/xtrain.svg" alt="Talking data description" height="504" width="504" layout="responsive"></amp-img>


```r
# Je teste d'abord le model à partir de 50000 dispositifs connus de train (74645 au total)
model <- sample(1:length(Y), 50000)
valid <- (1:length(Y))[-model]

set.seed(100)
param <- list(objective = "multi:softprob", num_class = 12,
              booster = "gblinear", eta = 0.01,
              eval_metric = "mlogloss")

dmodel <- xgb.DMatrix(X_train[model,], label = Y[model])
dvalid <- xgb.DMatrix(X_train[valid,], label = Y[valid])
watch  <- list(model = dmodel, valid = dvalid)

# Premier validation pour savoir le nombre de tours (nrounds à utiliser)
m1 <- xgb.train(data = dmodel, param, nrounds = 100,
                watchlist = watch, verbose=1)
```

```
## [0]	model-mlogloss:2.453019	valid-mlogloss:2.463175
## [1]	model-mlogloss:2.429327	valid-mlogloss:2.448532
## [2]	model-mlogloss:2.409742	valid-mlogloss:2.437439
## [3]	model-mlogloss:2.392664	valid-mlogloss:2.428449
## [4]	model-mlogloss:2.377299	valid-mlogloss:2.420852
## [5]	model-mlogloss:2.363189	valid-mlogloss:2.414244
## [6]	model-mlogloss:2.350059	valid-mlogloss:2.408373
## [7]	model-mlogloss:2.337721	valid-mlogloss:2.403073
## [8]	model-mlogloss:2.326054	valid-mlogloss:2.398239
## [9]	model-mlogloss:2.314965	valid-mlogloss:2.393794
## [10]	model-mlogloss:2.304379	valid-mlogloss:2.389678
## [11]	model-mlogloss:2.294247	valid-mlogloss:2.385852
## [12]	model-mlogloss:2.284518	valid-mlogloss:2.382278
## [13]	model-mlogloss:2.275168	valid-mlogloss:2.378931
## [14]	model-mlogloss:2.266157	valid-mlogloss:2.375793
## [15]	model-mlogloss:2.257458	valid-mlogloss:2.372841
## [16]	model-mlogloss:2.249054	valid-mlogloss:2.370061
## [17]	model-mlogloss:2.240919	valid-mlogloss:2.367439
## [18]	model-mlogloss:2.233039	valid-mlogloss:2.364964
## [19]	model-mlogloss:2.225398	valid-mlogloss:2.362627
## [20]	model-mlogloss:2.217980	valid-mlogloss:2.360419
## [21]	model-mlogloss:2.210772	valid-mlogloss:2.358332
## [22]	model-mlogloss:2.203762	valid-mlogloss:2.356355
## [23]	model-mlogloss:2.196944	valid-mlogloss:2.354489
## [24]	model-mlogloss:2.190302	valid-mlogloss:2.352721
## [25]	model-mlogloss:2.183828	valid-mlogloss:2.351049
## [26]	model-mlogloss:2.177517	valid-mlogloss:2.349468
## [27]	model-mlogloss:2.171357	valid-mlogloss:2.347974
## [28]	model-mlogloss:2.165346	valid-mlogloss:2.346563
## [29]	model-mlogloss:2.159472	valid-mlogloss:2.345227
## [30]	model-mlogloss:2.153734	valid-mlogloss:2.343969
## [31]	model-mlogloss:2.148123	valid-mlogloss:2.342782
## [32]	model-mlogloss:2.142635	valid-mlogloss:2.341663
## [33]	model-mlogloss:2.137264	valid-mlogloss:2.340611
## [34]	model-mlogloss:2.132007	valid-mlogloss:2.339622
## [35]	model-mlogloss:2.126857	valid-mlogloss:2.338695
## [36]	model-mlogloss:2.121815	valid-mlogloss:2.337824
## [37]	model-mlogloss:2.116872	valid-mlogloss:2.337011
## [38]	model-mlogloss:2.112023	valid-mlogloss:2.336253
## [39]	model-mlogloss:2.107273	valid-mlogloss:2.335547
## [40]	model-mlogloss:2.102612	valid-mlogloss:2.334890
## [41]	model-mlogloss:2.098037	valid-mlogloss:2.334285
## [42]	model-mlogloss:2.093548	valid-mlogloss:2.333729
## [43]	model-mlogloss:2.089138	valid-mlogloss:2.333217
## [44]	model-mlogloss:2.084813	valid-mlogloss:2.332750
## [45]	model-mlogloss:2.080561	valid-mlogloss:2.332324
## [46]	model-mlogloss:2.076379	valid-mlogloss:2.331943
## [47]	model-mlogloss:2.072277	valid-mlogloss:2.331602
## [48]	model-mlogloss:2.068241	valid-mlogloss:2.331301
## [49]	model-mlogloss:2.064275	valid-mlogloss:2.331040
## [50]	model-mlogloss:2.060372	valid-mlogloss:2.330811
## [51]	model-mlogloss:2.056536	valid-mlogloss:2.330623
## [52]	model-mlogloss:2.052758	valid-mlogloss:2.330471
## [53]	model-mlogloss:2.049045	valid-mlogloss:2.330351
## [54]	model-mlogloss:2.045388	valid-mlogloss:2.330267
## [55]	model-mlogloss:2.041791	valid-mlogloss:2.330214
## [56]	model-mlogloss:2.038246	valid-mlogloss:2.330192
## [57]	model-mlogloss:2.034761	valid-mlogloss:2.330203
## [58]	model-mlogloss:2.031321	valid-mlogloss:2.330244
## [59]	model-mlogloss:2.027941	valid-mlogloss:2.330317
## [60]	model-mlogloss:2.024607	valid-mlogloss:2.330418
## [61]	model-mlogloss:2.021322	valid-mlogloss:2.330546
## [62]	model-mlogloss:2.018087	valid-mlogloss:2.330703
## [63]	model-mlogloss:2.014898	valid-mlogloss:2.330887
## [64]	model-mlogloss:2.011750	valid-mlogloss:2.331094
## [65]	model-mlogloss:2.008654	valid-mlogloss:2.331332
## [66]	model-mlogloss:2.005595	valid-mlogloss:2.331594
## [67]	model-mlogloss:2.002586	valid-mlogloss:2.331880
## [68]	model-mlogloss:1.999610	valid-mlogloss:2.332188
## [69]	model-mlogloss:1.996678	valid-mlogloss:2.332524
## [70]	model-mlogloss:1.993788	valid-mlogloss:2.332880
## [71]	model-mlogloss:1.990933	valid-mlogloss:2.333260
## [72]	model-mlogloss:1.988117	valid-mlogloss:2.333662
## [73]	model-mlogloss:1.985340	valid-mlogloss:2.334087
## [74]	model-mlogloss:1.982598	valid-mlogloss:2.334532
## [75]	model-mlogloss:1.979892	valid-mlogloss:2.335000
## [76]	model-mlogloss:1.977219	valid-mlogloss:2.335489
## [77]	model-mlogloss:1.974579	valid-mlogloss:2.335997
## [78]	model-mlogloss:1.971977	valid-mlogloss:2.336525
## [79]	model-mlogloss:1.969406	valid-mlogloss:2.337071
## [80]	model-mlogloss:1.966867	valid-mlogloss:2.337639
## [81]	model-mlogloss:1.964359	valid-mlogloss:2.338225
## [82]	model-mlogloss:1.961881	valid-mlogloss:2.338826
## [83]	model-mlogloss:1.959430	valid-mlogloss:2.339447
## [84]	model-mlogloss:1.957015	valid-mlogloss:2.340088
## [85]	model-mlogloss:1.954625	valid-mlogloss:2.340745
## [86]	model-mlogloss:1.952263	valid-mlogloss:2.341417
## [87]	model-mlogloss:1.949931	valid-mlogloss:2.342107
## [88]	model-mlogloss:1.947623	valid-mlogloss:2.342815
## [89]	model-mlogloss:1.945344	valid-mlogloss:2.343537
## [90]	model-mlogloss:1.943093	valid-mlogloss:2.344276
## [91]	model-mlogloss:1.940863	valid-mlogloss:2.345031
## [92]	model-mlogloss:1.938662	valid-mlogloss:2.345802
## [93]	model-mlogloss:1.936484	valid-mlogloss:2.346587
## [94]	model-mlogloss:1.934333	valid-mlogloss:2.347386
## [95]	model-mlogloss:1.932204	valid-mlogloss:2.348201
## [96]	model-mlogloss:1.930100	valid-mlogloss:2.349030
## [97]	model-mlogloss:1.928019	valid-mlogloss:2.349874
## [98]	model-mlogloss:1.925958	valid-mlogloss:2.350730
## [99]	model-mlogloss:1.923920	valid-mlogloss:2.351599
```

```r
# En suite je peut utiliser l'ensemble du train pour faire le model
dtrain <- xgb.DMatrix(X_train, label = Y)
dtest  <- xgb.DMatrix(X_test)

m2 <- xgb.train(data = dtrain, param, nrounds = 60)

# Je teste mon modele avec la fraction du train que je connais 
out <- matrix(predict(m2, dvalid), ncol = 12, byrow = T)  

# Je obtiens une matrice de probabilités que je teste avec des numeros au hasard
myfun <- function(w) {                                             
    sample(0:11, 1, prob=w)                                         
} 
predicValues <- apply(out, 1, myfun)                                          
confusionmat <- table(var1=predicValues,var2=Y[valid])                                         
melted_cormat <- melt(confusionmat)                                     
ggplot(data = melted_cormat, aes(x=var1, y=var2, fill=value)) + geom_tile()
```

<amp-img src="/images/talking_data/unnamed-chunk-28-1.png" alt="Talking data description" height="504" width="504" layout="responsive"></amp-img>

```r
library(caret)
confusionMatrix(predicValues,Y[valid])   
```

```
## Confusion Matrix and Statistics
## 
##           Reference
## Prediction   0   1   2   3   4   5   6   7   8   9  10  11
##         0  269  99  96 117 118  97 168 199  97 146 158 156
##         1  117 176  66 105 102  90 160 203 117 109 194 153
##         2   89  81 121  77  93  59 116 166 108 134 137 147
##         3  105  92  76 195 140  91 162 200 109 149 213 168
##         4  125 115  86 151 263 134 149 216 124 182 202 190
##         5   94  91  69 102 127 194 142 166  91 136 182 202
##         6  162 129  85 133 136 112 441 310 156 177 209 216
##         7  163 157 118 144 150 124 289 488 214 299 294 269
##         8  124  93  71  87 127  87 185 244 224 192 251 198
##         9  116 103  80 149 168 115 211 286 175 390 312 224
##         10 145 131  90 146 200 150 211 331 204 301 582 352
##         11 152 122 100 137 211 147 192 296 177 253 345 610
## 
## Overall Statistics
##                                          
##                Accuracy : 0.1604         
##                  95% CI : (0.1558, 0.165)
##     No Information Rate : 0.126          
##     P-Value [Acc > NIR] : < 2.2e-16      
##                                          
##                   Kappa : 0.0775         
##  Mcnemar's Test P-Value : 7.119e-14      
## 
## Statistics by Class:
## 
##                      Class: 0 Class: 1 Class: 2 Class: 3 Class: 4 Class: 5
## Sensitivity           0.16195 0.126710  0.11437 0.126377  0.14332 0.138571
## Specificity           0.93687 0.939112  0.94883 0.934854  0.92661 0.939686
## Pos Pred Value        0.15640 0.110553  0.09111 0.114706  0.13578 0.121554
## Neg Pred Value        0.93928 0.947382  0.95981 0.941251  0.93077 0.947677
## Prevalence            0.06740 0.056360  0.04293 0.062609  0.07446 0.056807
## Detection Rate        0.01091 0.007141  0.00491 0.007912  0.01067 0.007872
## Detection Prevalence  0.06979 0.064597  0.05389 0.068980  0.07860 0.064760
## Balanced Accuracy     0.54941 0.532911  0.53160 0.530616  0.53497 0.539129
##                      Class: 6 Class: 7 Class: 8 Class: 9 Class: 10
## Sensitivity           0.18178   0.1572 0.124722  0.15802   0.18902
## Specificity           0.91786   0.8969 0.927393  0.91257   0.89516
## Pos Pred Value        0.19462   0.1801 0.118959  0.16745   0.20471
## Neg Pred Value        0.91130   0.8807 0.930938  0.90688   0.88547
## Prevalence            0.09844   0.1260 0.072875  0.10014   0.12493
## Detection Rate        0.01789   0.0198 0.009089  0.01582   0.02362
## Detection Prevalence  0.09195   0.1099 0.076405  0.09450   0.11536
## Balanced Accuracy     0.54982   0.5270 0.526057  0.53529   0.54209
##                      Class: 11
## Sensitivity            0.21144
## Specificity            0.90202
## Pos Pred Value         0.22247
## Neg Pred Value         0.89613
## Prevalence             0.11706
## Detection Rate         0.02475
## Detection Prevalence   0.11126
## Balanced Accuracy      0.55673
```
