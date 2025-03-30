---
layout: post
title: "Build a URL Shortener with Node + Mongo"
date: 2022-02-13 01:10:48 -0800
categories: [development, opinion]
tags: [nodejs, programming, web-development, code, mongodb]
---

A while back, long before tonight, I built a [Node.js](https://nodejs.org/en/) application called [Lyt.Haus](https://lyt.haus) that shortened URLs. Conceptually, it's simple and not exactly groundbreaking—there are hundreds, if not thousands, of sites offering similar functionality. So, why did I bother investing the time? Simply put, I wanted to tackle a project with a realistic goal that I could build from scratch within a manageable timeframe and, ultimately, use myself (and others).

Looking back, I think it was a great use of my time. It allowed me to dive deep into a full JavaScript/typescript stack while providing real-world experience building a new application from scratch. I'd recommend any developer, beginner or expert programmer alike, looking for learn fast to give it a shot.

## The Magic Sauce

I'll skip over the usual project setup and environment-specific details and jump into the code. But first, let's orient ourselves with a file overview:

- `views`
  - `index.ejs`
  - `accounts.ejs`
- `routes`
  - `index.js`
  - `accounts.js`
  - `users.js`
- `models`
  - `users.js`
  - `urls.js`
- `app.js`
- `middleware`
  - `permissions.js`
- `credentials`
  - `secretstuff.js`
- `package.json`

It's a fairly straightforward layout, based on the classic MVC pattern. Since my first attempt at this project didn't involve Vue, I used a templating engine native to Express. I opted for EJS over Pug/Jade because I preferred the syntax, though Pug is definitely more common.

The `routes` and `models` directories are the core of this application. The models are straightforward. Using MongoDB makes development very flexible. Here's what a shortened URL looks like as a schema:

```javascript
// models/urls.js - a schema for shortened URLs

let mongoose = require("mongoose");
let uniqueValidator = require("mongoose-unique-validator");
let Schema = mongoose.Schema;
let safeBase = require("urlsafe-base64"); // Need special Base64 for URL friendliness (slashes omitted)

// Create a schema for our links
let urlSchema = new Schema({
  _id: {
    type: String,
    index: true,
  },
  long_url: {
    type: String,
    required: true,
  },
  short_url: {
    type: String,
    trim: true,
    index: true,
    unique: true,
    sparse: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  count: {
    // Simple analytics for tracking clicks to the long URL from the short URL
    type: Number,
    required: true,
    default: 0,
  },
  categories: [
    {
      // Allows users to add a list of categories to the URL for their dashboard
      type: String,
      ref: "Url.categories.name",
    },
  ],
});

urlSchema.plugin(uniqueValidator); // Include the plugin to validate record uniqueness
```

There's nothing particularly special about the URL records; the schema defines the basic required information.

Now for the secret sauce — how the shortener actually functions. There are two parts. First, we define a counter schema, a record that updates and counts how many URLs have been shortened. Here's that schema:

```javascript
let CounterSchema = Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});
let counter = mongoose.model("counter", CounterSchema);
```

The `seq` attribute is incremented for every new URL. It's a centralized place to record and generate the next unique (and short) identifier. It also allows for the potential to create a more complicated URL shortener that can tie into user accounts, specific domains, etc. But for now, it just counts.

```javascript
urlSchema.pre("save", function (next) {
  let doc = this;
  counter.findByIdAndUpdate(
    { _id: "entityId" },
    { $inc: { seq: 1 } },
    { upsert: false, new: false },
    function (error, counter) {
      if (error) return next(error);
      let newid = safeBase.encode(Buffer.from(counter.seq.toString()));
      doc._id = newid.toString();
      next();
    }
  );
});
```

This is the heart of the process! Here, we translate the counter that we created above into a base64, unique ID that's also not very long. There are letious ways of doing this, like using the default ID associated with a MongoDB record. However, that ID is a pain to type and, if truncated, isn't guaranteed to be unique. Moreover, this approach ties the Mongo record's ID to the short URL ID, making them essentially the same thing—which is convenient and saves space.

All in all, when creating the models for a URL shortener, think simple and rely on native approaches like the one above. This has been a brief overview of what a MongoDB schema can look like. Next, we'll dive deeper into the routes and the logic behind generating URLs and stopping spammers with Captcha!
