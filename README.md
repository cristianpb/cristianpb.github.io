# [cristianpb.github.io](http://cristianpb.github.io)

This repository contains the source files of my website [cristianpb.github.io](http://cristianpb.github.io). These are the main features:

* Algolia for searching for posts
* Jekyll to build static content
* Github pages to deploy static sites
* AMP standard for good SEO
* Gulp jobs to minimize css content
* Bulma compress css framework

## Installation

Install bundler gem and the packages in the Gemfile

```
gem install bundler
bundle install --jobs 4 --retry 3
```

### Development tools

* Install node packages:

```
npm install
```

## Usage

* Serve application using default port 4000:

```
bundle exec jekyll serve
```

* Build compress css files

```
npm run build
```

* Watch changes in order to build css files

```
npm run watch
```

* Push algolia indices

```
bundle exec jekyll algolia
```

![](http://www.girliemac.com/assets/images/articles/2013/12/jekyll.png)
