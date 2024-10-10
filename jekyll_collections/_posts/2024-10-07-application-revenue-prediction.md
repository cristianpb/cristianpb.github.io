---
layout: post
title: 'Application revenue prediction'
date: 2024-10-07
description: This article presents a study on predicting user-generated revenue within a digital application. Using gradient boosting models and a dataset containing user installation features and engagement metrics, the study aims to forecast revenue at day 120. The model's performance and key influencing factors are analyzed, providing insights for optimizing monetization strategies in the digital applications industry.
categories:
  - data science
tags: 
 - kaggle
 - python
image:
  path: /assets/img/application-revenue-prediction/main-16x9.jpg
  height: 788
  width: 1400
thumb:
  path: /assets/img/application-revenue-prediction/main-thumb.jpg
  height: 225
  width: 400
#video: true


---

## Introduction

In the competitive landscape of the digital applications industry, maximizing revenue generation is a paramount objective. This exercise aims to develop a predictive model capable of forecasting application-generated revenue by leveraging a combination of user features and engagement metrics. By understanding user characteristics and their interactions with the application, we can gain valuable insights into revenue potential and optimize monetization strategies.

##  Data

The dataset provides information about users application installation features and also the engagement features through 120 days.
The dataset is divided in 2 parts:
* The train data, which includes 1.7 millions of lines.
* The test data, which includes 12.5 thousands of lines.

Each line contains information about an user. The train dataset contains information of users that installed the application from February until the end of November.The test dataset contains information from users that installed the application the 1st of December.

### Individual user features

These informations are gather the first day that the user installs the application.

#### Install date

This represents the day when the users install the application. We can see that there has been a tendency increase from February until December. There are some periods where the installations have been higher than other like in the first part of May or October. However there are some outlayer days, where the installations have been extremely low, like August 16th, September 22th, or November 2nd, 4th or 12th.

<amp-img src="/assets/img/application-revenue-prediction/install_date.png" alt="Application install date" height="289" width="862" layout="responsive"></amp-img>

One can also notice that the install day has a weekly seasonality, more install occurs during the weekend.

<amp-img src="/assets/img/application-revenue-prediction/week_seasonality.png" alt="Weekly seasonality of application install date" height="289" width="862" layout="responsive"></amp-img>

#### Platform

In this dataset applications are mainly installed in IOS systems.

<amp-img src="/assets/img/application-revenue-prediction/platform.png" alt="Platforms devices where applications are installed" height="289" width="862" layout="responsive"></amp-img>

#### Personalised ads

This represents whether the user opted in for personalized ads or other services. The train dataset have a higher number of users that didn't choose for personalized ads. In the test dataset, the repartition is almost at the same level.

<amp-img src="/assets/img/application-revenue-prediction/is_optim.png" alt="The application have been optimized or not" height="289" width="862" layout="responsive"></amp-img>

#### App Id

There are two application that have been installed. Both in the train and the test set.

<amp-img src="/assets/img/application-revenue-prediction/app_id.png" alt="The id of the installed apps" height="289" width="862" layout="responsive"></amp-img>

#### Country

This represents the country where the app has been downloaded. We can see that the installations are mainly in the US market.

<amp-img src="/assets/img/application-revenue-prediction/country.png" alt="Country where the app have been downloaded" height="289" width="1062" layout="responsive"></amp-img>


#### Ad Network

This represents the ID of the ad network that displayed the ads to the user.
There are 3 main ad networks in the train and the test set.

<amp-img src="/assets/img/application-revenue-prediction/ad_network.png" alt="ad network that displayed the ads to the user" height="289" width="1062" layout="responsive"></amp-img>

#### Campaign type

In marketing terms, this is category of the ad campaign that was used to acquired the user.

<amp-img src="/assets/img/application-revenue-prediction/campaign_type.png" alt="Type of ad campaign that acquired the user" height="289" width="1062" layout="responsive"></amp-img>

#### Campaign id

There are more than 178 campaign_ids, counting some of them which are unique.

<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th>index</th>
      <th>campaign_id</th>
      <th>count</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>...</td>
      <td>559244</td>
    </tr>
    <tr>
      <th>1</th>
      <td>da2...</td>
      <td>317648</td>
    </tr>
    <tr>
      <th>2</th>
      <td>99a...</td>
      <td>203638</td>
    </tr>
    <tr>
      <th>3</th>
      <td>c6d...</td>
      <td>114357</td>
    </tr>
    <tr>
      <th>4</th>
      <td>281...</td>
      <td>70904</td>
    </tr>
    <tr>
      <th>...</th>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <th>174</th>
      <td>blo...</td>
      <td>1</td>
    </tr>
    <tr>
      <th>175</th>
      <td>gam...</td>
      <td>1</td>
    </tr>
    <tr>
      <th>176</th>
      <td>blo...</td>
      <td>1</td>
    </tr>
    <tr>
      <th>177</th>
      <td>dow...</td>
      <td>1</td>
    </tr>
    <tr>
      <th>178</th>
      <td>ぶろっ...</td>
      <td>1</td>
    </tr>
  </tbody>
</table>

A common technique to deal with this behaviour is to group the less common ones.
This can be achieved with the following python function.

```python
def get_most_popular(series, threshold=None, top_values=None):
    if threshold is not None:
        popular_idx = series.value_counts().to_frame().query('count > @threshold').index.tolist()
        new_series = series.copy()
        new_series.loc[:] = "other"
        new_series.loc[series.isin(popular_idx)] = series
        return new_series
    if top_values is not None:
        popular_idx = series.value_counts().to_frame().head(top_values).index.tolist()
        new_series = series.copy()
        new_series.loc[:] = "other"
        new_series.loc[series.isin(popular_idx)] = series
        return new_series
```

The threshold can be changed in order to have a number of categories that are representative for a group.

<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>campaign_id</th>
      <th>count</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>...</td>
      <td>559244</td>
    </tr>
    <tr>
      <th>1</th>
      <td>da...</td>
      <td>317648</td>
    </tr>
    <tr>
      <th>2</th>
      <td>99...</td>
      <td>203638</td>
    </tr>
    <tr>
      <th>3</th>
      <td>c6...</td>
      <td>114357</td>
    </tr>
    <tr>
      <th>4</th>
      <td>28...</td>
      <td>70904</td>
    </tr>
    <tr>
      <th>...</th>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <th>96</th>
      <td>20...</td>
      <td>11</td>
    </tr>
    <tr>
      <th>97</th>
      <td>ブロ...</td>
      <td>11</td>
    </tr>
    <tr>
      <th>98</th>
      <td>MA...</td>
      <td>10</td>
    </tr>
    <tr>
      <th>99</th>
      <td>xx...</td>
      <td>9</td>
    </tr>
    <tr>
      <th>100</th>
      <td>17...</td>
      <td>8</td>
    </tr>
  </tbody>
</table>

#### Model

The model of the devices also contains several occurrences, with ids that sometimes are unique, so applying the same grouping function, one could obtain the top 100 models. 
Following the platform repartition, we find Iphones and Ipads in the top devices.
One should notice that `IPhoneUnkown` and `IPadUnknown` are not in test set.

<amp-img src="/assets/img/application-revenue-prediction/model.png" alt="Device model" height="289" width="862" layout="responsive"></amp-img>

#### Manufacturer

This represents the manufacturer of the user's device. The main manufacturer is Apple, followed by Samsung and Google. The repartition of manufacturer follows the same distribution for the train and the test datasets.

<amp-img src="/assets/img/application-revenue-prediction/manufacturer.png" alt="Device manufacturer" height="289" width="862" layout="responsive"></amp-img>

#### Mobile classification

This classification can be related with monetary value of the mobile. High end devices have the best classification **Tier 1**, like the last Iphone or Iphone. The cheapest telephones will be on **Tier 5**. Some of them doesn't have classification.

<amp-img src="/assets/img/application-revenue-prediction/mobile_classification.png" alt="Mobile classification" height="289" width="862" layout="responsive"></amp-img>

#### City

The city where the user downloaded the app.
The most popular cities are Tokyo, Chicago and Houston.
There are come Japanese cities that doesn't appear in the test dataset like Otemae, Tacoma or Nishikicho.

<amp-img src="/assets/img/application-revenue-prediction/city.png" alt="City" height="289" width="862" layout="responsive"></amp-img>

#### Other variables

There are some variables that are not useful for revenue predictions such as ` game_type` and `user_id`  since they are all unique values.

### User engagement features

During the life of the application, the user might interact by clicking through ads or by buying things on the platform. These features are measures using a cumulative value for day: 0, 3, 7, 14, 30, 60, 90 and 120.


#### Revenues generated by the application

The main revenues are measured by the variable `dX_rev`, where `X` is the number of days where it's measured. This is variable that is going to be predicted.The distribution is similar for test and train dataset.
This variable is treated in `log` form since it variates mostly between 0 and 1. 
70.0% of users produces less than $1 of revenue.


<amp-img src="/assets/img/application-revenue-prediction/d0_rev.png" alt="Total revenu at day zero" height="289" width="862" layout="responsive"></amp-img>


This variable is decomposed in `dX_iap_rev` and `dX_ad_rev` which are the revenues for ads and purchased items respectively. It is possible to notice that the total revenue is mainly pushed by ads.

<amp-img src="/assets/img/application-revenue-prediction/d0_ad_iap_rev.png" alt="Decomposed total revenue at day zero" height="489" width="862" layout="responsive"></amp-img>


#### Correlation of values

The correlation matrix allows to find correlated features. 

<amp-img src="/assets/img/application-revenue-prediction/correlation_matrix.png" alt="Correlation matrix" height="489" width="862" layout="responsive"></amp-img>

The following variables are correlated:
* "iap_ads_rev_d0" and "iap_ads_count_d0": Which means that the revenue from ads in correlated with the number of ads.
* "iap_coins_count_d0" and "iap_count_d0": Which means that the number of coins bought by the user is correlated with the number of items bought by the user.
* "iap_coins_rev_d0" and "d0_iap_rev" and  "d0_rev": Which means that revenue from coin purchases is correlated with the  revenue from in app purchases and the total revenue.

The correlated values can be removed from the modelling stage.


#### Evolution over time

The cumulate value changes during the days. However, in the following figure, we can notice that the revenue distribution remains the same. The distribution reduces because there is less data with `d120_rev`.

<amp-img src="/assets/img/application-revenue-prediction/d0_rev_evolution.png" alt="Evolution of total revenue over time" height="389" width="862" layout="responsive"></amp-img>


#### Missing values

The objective of the problem is to predict revenue on the day 120, but this value is available for every line in the dataset because we don't have the information from the future. For instance, the test dataset is from 1 December, so we only have information for day zero. 

<amp-img src="/assets/img/application-revenue-prediction/missing_target.png" alt="Missing data for revenue at day 120" height="389" width="862" layout="responsive"></amp-img>


## Modelling

To predict revenue at day 120, a traditional approach can be employed using structured data as the training dataset and the `d120_rev` column as the target variable.
This approach leverages the existing information in the dataset to forecast future revenue.

### Feature selection

Based on variable exploration, the following modifications were made to user installation features:

* Categorical values such as campaign_id, model, manufacturer, and city were consolidated by grouping less frequent categories together.
* Utilizing the installation_date for each user, additional features were derived, including the number of installations per day, the day of the week, and the month.
* To highlight the distinct nature of Apple devices, a binary column was introduced to indicate whether the installation was made on an Apple device.

```python
X = (
    df
    .assign(
        campaign_id=lambda x: get_most_popular(x['campaign_id'], threshold=THRESHOLD_POPULAR_CAMPAING),
        model=lambda x: get_most_popular(x['model'], threshold=THRESHOLD_POPULAR_MODEL),
        manufacturer=lambda x: get_most_popular(x['manufacturer'], top_values=TOP_MANUFACTURER),
        city=lambda x: get_most_popular(x['city'], top_values=TOP_CITIES),
        is_optin=lambda x: x['is_optin'].replace({1:"optin", 0: "not_optin"}),
        installations_perday=lambda x: x['install_date'].dt.strftime('%Y-%m-%d').to_frame().merge(installations_perday, how='left', left_on='install_date', right_index=True)[0],
        installation_day=lambda x: x['install_date'].dt.day_name(),
        installation_month=lambda x: x['install_date'].dt.month,
        is_apple = lambda x: x['manufacturer'].str.contains('apple', flags=re.IGNORECASE, na=False).replace({True:"is_apple", False: "not_apple"}),
        mobile_classification = lambda x: x['mobile_classification'].replace(r'^\s*$', 'unkown_mobile_classification', regex=True),
    )
    .assign(**{col: lambda x, col=col: x[col].astype('category') for col in user_cols})
    .get(engagement_cols + user_cols + [target_col, 'dataset'])
)
```

To ensure that each class is treated equally and to accommodate the requirements of models that cannot handle categorical variables directly, certain columns were transformed using one-hot encoding.
This technique converts categorical values into numerical representations, enabling the model to process them effectively.


```python
one_hot_columns = ['is_optin', 'platform', 'app_id', 'country', 'ad_network_id', 'campaign_type', 'mobile_classification']
X = pd.get_dummies(data = X, prefix = 'OHE', prefix_sep='_',
               columns = one_hot_columns,
               drop_first =False,
              dtype='int8')
```

While the numerical values were left intact, normalization might be considered to improve model performance.
Correlated features were removed based on exploratory data analysis.
To ensure realistic predictions on day zero, information from features like (d3, d7, d14, ...) was excluded from the training dataset.
This prevents the model from over-relying on these features and improves its ability to make accurate predictions in cases where such information is unavailable.


### Train test split

The dataset was randomly divided into training, testing, and validation sets, with proportions of 60%, 20%, and 20%, respectively. The training and validation sets were used during the model training phase to optimize hyperparameters and evaluate performance. The testing set was reserved for final model evaluation and comparison with other models.

```
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=1)
X_train, X_val, y_train, y_val = train_test_split(X_train, y_train, test_size=0.25, random_state=1)
```

### Model selection

Gradient boosting models have demonstrated exceptional performance in similar Kaggle competitions, making them well-suited for this task.
I selected three popular gradient boosting models: XGBoost, CatBoost, and LightGBM.
To predict the revenue value, I employed the regression version of these models.
The RMSE metric was chosen to monitor the models' performance throughout the training process.

The following figure illustrates the evolution of the loss function for both the training and validation datasets. Training was halted when the validation loss stopped decreasing to prevent overfitting.

<amp-img src="/assets/img/application-revenue-prediction/train_val.png" alt="Train and validation loss evolution" height="489" width="862" layout="responsive"></amp-img>

In order to find the best parameters of the model I used the open-source python library [hyperopt](https://hyperopt.github.io/hyperopt/). 
Hyperopt is used for hyperparameter optimization of machine learning models. It allows you to define the search space for your parameters and the optimization strategy. Hyperopt then tries a certain number of configurations to find the best possible set of parameters for your model.

In the context of gradient boosting models, some of the parameters you might want to tune using Hyperopt include:
* The number of leaves and the maximum depth of the decision trees.
* The `min_child_weight` parameter, which stops the algorithm from splitting a node further if the number of samples in that node falls below a certain threshold.
* The learning rate and the number of estimators used by the model.

```python
space={
    'enable_categorical': True,
    'learning_rate': hp.quniform("learning_rate", 0.05, 0.1, 0.05),
    'max_depth': hp.quniform("max_depth", 3, 18, 1),
    'max_leaves': hp.quniform ('max_leaves', 1,9, 1),
    'min_child_weight' : hp.quniform('min_child_weight', 0, 10, 1),
    'n_estimators': 2000,
    'early_stopping_rounds': 5,
    'device': "cuda:0",
    'seed': 0
    }


def objective(space):
    clf=XGBRegressor(
         enable_categorical= True,
        learning_rate=space["learning_rate"],
        max_depth=int(space["max_depth"]),
        max_leaves=int(space['max_leaves']),
        min_child_weight=int(space['min_child_weight']),
        n_estimators=int(space['n_estimators']),
        early_stopping_rounds=int(space['early_stopping_rounds']),
        device= "cuda:0",
        seed=0
    )
        
    evaluation = [( X_train, y_train), ( X_test, y_test)]

    clf.fit(X_train, y_train, 
            eval_set=[(X_train, y_train), (X_val, y_val)],
            verbose=False)
    
    pred = clf.predict(X_test)
    mae = mean_absolute_error(pred, y_test)
    rmse = root_mean_squared_error(pred, y_test)
    print(f"mae: {mae}, rmse: {rmse}")
    return {'loss': rmse, 'status': STATUS_OK }
    
trials = Trials()
best_hyperparams = fmin(fn = objective,
                        space = space,
                        algo = tpe.suggest,
                        max_evals = 100,
                        trials = trials)
```

The predictions from the three models have been combined using a weighted average.

### Results

One of the advantages of gradient boosting models is their interpretability.
These models can identify the most influential variables in making predictions.
The following figure presents the feature importance for the XGBoost model.
The `installations per day` feature is the most significant, providing valuable context about the day the user installs the application.
Another important variable is the city where the user downloaded the app, as it implies information about the user's demographics.
Engagement variables, such as total revenue from ads, are also crucial for the final decision.

<amp-img src="/assets/img/application-revenue-prediction/feature_importance.png" alt="Feature importance for the model predictions" height="489" width="862" layout="responsive"></amp-img>

The RMSE of the model on the test dataset is 0.748. Since the target variable was transformed using a logarithmic function, this RMSE corresponds to a predicted error of approximately $1.11, which represents the most common error for each use case prediction.
The following figure illustrates the distribution of the actual target values in the test dataset and the predicted values generated by the model.
The model tends to predict values between 0.1 and 1. It struggles to accurately predict the behavior of the target variable in the range between 0.001 and 0.01.

<amp-img src="/assets/img/application-revenue-prediction/predictions.png" alt="Distribution of the predictions of the model" height="489" width="862" layout="responsive"></amp-img>


## Conclusion

This study aimed to develop a model to predict user-generated revenue within a digital application. By leveraging user installation features and engagement metrics, the model can provide valuable insights for optimizing monetization strategies.

The analysis revealed several key factors influencing revenue generation. Features like installation day, user city, and total ad revenue were identified as the most impactful on the model's predictions.

The XGBoost model achieved an RMSE of 0.748 on the test dataset, which translates to a predicted error of approximately $1.11 for most user cases. However, the model exhibits limitations in accurately predicting low-revenue users (target values between 0.001 and 0.01).

Overall, this study demonstrates the potential of gradient boosting models for user revenue prediction within digital applications. By incorporating additional features and refining the model further, one can potentially improve prediction accuracy and gain deeper insights into user behavior that can be harnessed for effective revenue generation strategies.
