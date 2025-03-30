---
layout: post
title: "Building a Flask Application: Where to Start"
date: 2022-02-09 02:10:38 -0800
categories: [development, opinion]
tags: [python, vue, web-development, programming]
---

Flask is a Python framework designed to provide a lightweight and highly flexible web server. [Flask](http://flask.pocoo.org/docs/1.0/) sells itself by stating how unopinionated it is, how few dependancies are required and how simple it is to get developing. Unlike [Django](https://www.djangoproject.com/), which has the opposite mentality of Flask, there is no default modeling, database abstraction or form management. All that's provided is an interface to basic web server needs like requests, routing and templating - the bare bones required to create a web app.

There are benefits to this approach - mainly, there's no requirment to implement functionality specific to Flask (for the most part). If you've worked with Django, or other web frameworks (like [Meteor](https://www.meteor.com/), or even [WordPress](https://wordpress.org/)), there's a learning curve when it comes to implememnting functionality outside the default framework. Another positive is how there are an abundance of extenstions that provide a wide range of solutions to common application problems. Flask-SQLAlchemy, for example, connects the standard SQLAlchemy to Flask, providing boilerplate logic when creating databases.

Perhaps the main negative is to all that freedom is when you want things to work without configuration or potentional conflict. Relying on third-part support means development of core features and external code can fall out of wack - especially when major iterations are released. But this concern is mitigated when you do your dudiligence selecting plugins.

## What other tech should be used?

Selecting Flask is only one part of the puzzle when building a web app. A web framework like Flask doesn't provide all the bells and whistles needed to create a complete app. The frontend, database, devtools and more all need to be sorted too.

### Picking a database

Backend's need to be connected to a database, where many options abound. Personally, I'd look for well supported database ORMs, like SQLAlchemy. From there, I'd choose whichever makes the most sense. [Postgres](https://www.postgresql.org/) is a personal favourite since its FOSS and very capable - implementing the full SQL standard and many new features (like JSON). MySQL is also a popular choice, it's mostly free and has a native IDE. Outside of SQL (relational DBs) exist NoSQL databases, Mongo being the mainstream choice for most, it provides all the benefits of Non relation databases (like very flexible data stores, easy data modeling and native JSON support). Mongo also has the benefit of being very well supported, both financially and across programming languages.

Redis and in-memory keybased datastores should also be considered depending on how you want to access data. Redis provides a simple and _fast_ way to pull data like sessions and simple objects without bogging down your server.

### Choosing Front end tech

Another choice that needs to be settled is what templating engine should be picked. My [previous article](https://gabehab.github.io/me/python/vue/web-development/programming/opinion/2019/01/31/refreshing-old-stacks.html) takes in depth about the newest tech in client and UI rendering. But ultimately, if you know you don't need the power and complexity created by using new fangled templating engines, a simple native tempalting engine can be used, like Jinja for Flask, or EJS, Pug, or Handlebars for Express and Ruby.

### What about development tools?

Another factor is how you actually want to develop your application. This means local development environments that compliment your code and lifestyle. The use of devtools has been made easy thanks to Gulp, NPM, Grunt, Webpack, and the like. These tools may seem overkill or hard to learn but creating new programs without them is just as tedious.

Also, source control is pivotal, and 100% neccessary when creating _any_ sized project! Github is very popular, and pretty straightforward.

## In the end, there are a tonne of options

Only you know what you need and want - but make sure to research all your options! Overlooking this can mean lots of code debt in the future. Here's an example of the tech I've used in the past to create complex web apps.

{:.table.table.table-striped.table-hover}
Part of Stack | Technology | Libraries|
--- | --- | ---|
Frontend | Vue | Vuex, Router, SCSS|
Backend | Flask | SQLAlchemy, Celery, Pandas|
Database | Postgres, Redis | |
DevTools | Venv, Webpack | Vue-cli, Uglify|
