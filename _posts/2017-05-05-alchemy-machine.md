---
layout: post
title: "The alchemy machine"
date:   2017-05-02 20:51:25 +0200
description: "The objetive is to create a simulator of magic potions using AngularJS and node.js"
categories: ['angularjs', 'nodejs', 'express']
---

The objective of this project is to make an small interface using some popular
libraries such as **nodejs** and **angularjs**.  I chose this project because I
never have the opportunity of using these technologies and I thought that it
was a good opportunity to get in touch them. 

[AngularJS](https://angularjs.org/) is great for declaring static documents.
His data binding is a way of updating the view whenever the model changes, as
well as updating the model whenever the view changes.
I use it in the front end to access all the data and render the different views and changes of the app.
[NodeJS](https://nodejs.org/en/) is used on the server side to execute
JavaScript code.

![](/images/alchemy-machine/architecture.svg)

## Structure of the files

I use the following files for this application. The file `core.js` contains the angularjs module, `index.html` contains the external webpage, `package.json` contains the `npm` node modules used for the application.I use [express.js](http://expressjs.com/) to create an small server which communicates javascript code in the back-end with the `index.html` file in the front-end. It is included in `server.js`, which include all javascript code executed using nodejs. 

```tree
├── public
│   ├── core.js
│   └── index.html
├── package.json
├── data.json
└── server.js
```

### Data

Inside `server.js` I define a `JSON` object with the data needed for my alchemy machine such as:

* The ingredients:
	* The name.
	* An emojis (everybody loves emojis :heart:).
	* A boolean to know if the item has been selected or not.
	* The quantity (randomly created).
	* An `url` from an image of the ingredient.

```json
"Ingredients": [
        {"text": "Avocado",     "emoji" : "🥑 ",  "selected" :false, "quantity": 3, "image": "https://cdn.authoritynutrition.com/wp-content/uploads/2014/09/avocadoo-sliced-in-half.jpg"},
        {"text": "Watermellon", "emoji" : "🍉 ",  "selected" :false, "quantity": 2, "image": "http://www.pvfarms.com/images/ourproduce_watermelon.png"},
        {"text": "Jalapeno",    "emoji" : "🌶",    "selected" :false, "quantity": 3, "image": "http://images.realfoodtoronto.com/D.cache.large/Jalapeno-Pepper.jpg"},
        {"text": "Pineapple",   "emoji" : "🍍 ",  "selected" :false, "quantity": 2, "image": "http://www.cuisine-de-bebe.com/wp-content/uploads/lananas.jpg"},
        {"text": "Kiwi",        "emoji" : "🥝 ",  "selected" :false, "quantity": 5, "image": "http://media.mercola.com/assets/images/foodfacts/kiwifruit-nutrition--facts.jpg"},
        {"text": "Strawberry",  "emoji" : "🍓",   "selected" :false, "quantity": 2, "image": "http://maviedemamanlouve.com/wp-content/uploads/2015/10/fraise-1.jpg"},
        {"text": "Lemon",       "emoji" : "🍋  ", "selected" :false, "quantity": 4, "image": "https://realfood.tesco.com/media/images/Lemon-easter-biscuits-hero-1d74c01d-8906-45fe-8135-322f0520c434-0-472x310.jpg"},
        {"text": "Banana",      "emoji" : "🍌 ",  "selected" :false, "quantity": 2, "image": "http://www.granini.com/data/images/fruit_images/full/banana.png"}
],
```

* The recipes for the potions:
	* The name of the potion.
	* The number of potions made (initially 0).
	* The ingredients needed to do this potion (randomly chosen).

```json
"Recipes":[
        {"name" : "Power",        "quantity" : 0, "ingredients" : ["Avocado",   "Jalapeno",    "Pineapple"]},
        {"name" : "Invisibility", "quantity" : 0, "ingredients" : ["Pineapple", "Kiwi",        "Lemon"  ]},
        {"name" : "Agility",      "quantity" : 0, "ingredients" : ["Banana",    "Watermellon", "Strawberry"]}
],
```

* An object to know if the chosen ingredients produce a magic potion and the name of the potion.

```json
"Magic" : [{"value": false, "name": "empty"}]};
```

## Angularjs module

The file `core.js` contains the module `alchemyMachine`, the controller `mainController` and the functions to handle the actions inside the application. There are two main functions: 
	* `get ('/api/donnes')` that hit the node _API_ to obtain all the data from the route `/api/donnes/` and bind it to `$scope.todos`.
	* `post ('/api/donnes/mix` that sends that hit the `/api/donnes/mix` to create a potion with the selected ingredients.

```js
var alchemyMachine = angular.module('alchemyMachine', []);

function mainController($scope, $http) {
    // when landing on the page, get all info and show them
    $http.get('/api/donnes')
        .success(function(data) {
            $scope.info = data;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });

    // hits the route to make a potion
    $scope.createPotion = function() {
        $http.post('/api/donnes/mix', $scope.info)
            .success(function(data) {
                $scope.formData = {};
                $scope.info = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };

}
```

## Nodejs server

The `server.js` file exposes the application at `http://localhost:8080/`

```js
// listen (start app with node server.js) ======================================
app.listen(8080);
console.log("Please see: http://localhost:8080/");
```

The file `server.js` also contains the routes to handle the _API_ calls. The `app.get` call send the data to the route `/api/donnes` to be access then by the front-end. It means that _JSON_ data can be viewed in the explorer at `localhost:8080/api/donnes`. The `app.post` call interacts with the server to calculate if the selected ingredients are part of a magic potion recipe. First it loops the ingredients list to obtain the selected ones and after that it loops the recipes list to see if the selected ingredients are contained in the recipes. If the ingredients are part of a magic potion:
* The boolean flag that indicates a magic potion is activated.
* The name of the magic potion is saved.
* The quantity for that magic potion is increased.
* The number of used ingredients decreases.

At the end the `app.post` call saves the modifications of the data inside file `data.json`.

```js
// get all info
app.get('/api/donnes', function(req, res) {
        res.json(Data); // return all info in JSON format
});

// create a potion
app.post('/api/donnes/mix', function(req, res) {
        var mix = [];
        var mixposition = [];
        req.body.Magic[0].value = false;
        for(i=0;i<req.body.Ingredients.length;i++) {
                if (req.body['Ingredients'][i]["selected"] && req.body['Ingredients'][i]["quantity"] > 0) {
                        mix.push(req.body['Ingredients'][i]["text"]);
                        mixposition.push(i);
                }
        }
        for(i=0;i<req.body.Recipes.length;i++) {
                if ( _.isEqual(req.body.Recipes[i]["ingredients"].sort(), mix.sort()) ) {
                        req.body.Magic[0].value = true;
                        req.body.Magic[0].name = req.body.Recipes[i].name;
                        req.body.Recipes[i].quantity++;
                        for(i=0;i<mix.length;i++) {
                                req.body['Ingredients'][mixposition[i]].quantity--;
                        }
                }
        }
        fs.writeFile('data.json', JSON.stringify(req.body));
        res.json(req.body);
});
```

The `server.js` file exposes the application using the file `index.html`.

```js
// application -------------------------------------------------------------
app.get('*', function(req, res) {
        res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});
```

## Front end view 

The `index.html` file interacts directly with angularjs using the module and the controller defined before. It shows:
* The images from the ingredients.
* The number and type of potion made
* The name and the number of available ingredients in terms of emojis :relaxed:.
* The ingredients of the available recipes.
* The **mix** button.

```html
<!doctype html>

<!-- ASSIGN OUR ANGULAR MODULE -->
<html ng-app="alchemyMachine">
<head>
    <!-- META -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1"><!-- Optimize mobile viewport -->                                                                 
    <title>The Alchemy Machine</title>

    <!-- SCROLLS -->
    <link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap.min.css"><!-- load bootstrap -->
    <style>                                                                                                                                                                       #inline_images {display: inline-block;}
        html                    { overflow-y:scroll; }
        body                    { padding-top:50px; }
        #ingredient-list              { margin-bottom:30px; }
    </style>

    <!-- SPELLS -->
    <script src="//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script><!-- load jquery -->
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.0.8/angular.min.js"></script><!-- load angular -->
    <script src="core.js"></script>                                                                                                                                       
</head>                                                                                                                                                                   <!-- SET THE CONTROLLER AND GET ALL INFO -->
<body ng-controller="mainController">
    <div class="container">

      <div class="text-center">
        <h1> The alchemy Machine </h1>
      </div>

      <div id="inline_images" ng-repeat="todo in info.Ingredients">
        <img ng-src="{{todo.image}}" width=100 height=100/>
      </div>

      <!-- INGREDIENT AND POTION LIST -->
      <div id="ingredient-list" class="row">

        <div class="col-md-4">
          <div ng-show="info.Recipes">
            <h3> 💊  Potions made </h3>
          </div>
          <li ng-repeat="w in info.Recipes">
            {{w.name}}: {{w.quantity}}
          </li>
        </div>

        <div class="col-md-4">
          <h3> 🗃 Available ingredients </h3>
          <!-- LOOP OVER THE DATA IN $scope.info -->
          <div class="checkbox" ng-repeat="todo in info.Ingredients">
            <label>
              <input type="checkbox" ng-model="todo.selected" >{{ todo.text }} {{ todo.emoji.repeat(todo.quantity) }}
            </label>
          </div>
          <button type="submit" class="btn btn-primary btn-lg" ng-click="createPotion()">Mix</button>
        </div>

        <div class="col-md-4">
          <h3> 📖  Recipes </h3>
          <li ng-repeat="w in info.Recipes">
            {{w.name}}: <i ng-repeat="e in w.ingredients">{{e}},</i>
          </li>
          <div ng-show="info.Magic[0].value">
            <h1>Potion:  {{ info.Magic[0].name }} ! </h1>
          </div>
        </div>

      </div>
    </div>
  </body>
</html>
```

## Final view

In the following **gif**, I test the main functions of the application: selecting ingridients to make magic potions, see how the number of ingridients decreases while I am making potions and also that I not able to do magic potions when I run out of the ingridients.

![](/images/alchemy-machine/alchemy.gif)


## Test the application

The application can be found at my [github](https://github.com/cristianpb/alchemy-machine). To get it all up and running:

* Make sure you have [Node](https://nodejs.org/en/) and [npm](https://www.npmjs.com/) installed
* Clone the repo: git clone git@github.com:cristianpb/alchemy-machine.git
* Install the application: npm install
* Start the server: node server.js
* View in your browser at http://localhost:8080
