---
layout: post
title: "Refreshing an old stack's front end"
date: 2022-01-31 11:10:48 -0800
categories: [development, opinion]
tags: [python, vue, web-development, programming, opinion]
---

It's obvious that refactoring or restructuring code too often is bad, and it's especially obvious that completely switching an application's core technology isn't ideal either - but sometimes it _is_ exactly what a stale project needs. When an app's tech gets old, obsecured and falls out of favour with developers, updating its source code can quickly become a challenge. The importance of staying current with tech trends is reasonably important for most companies, and is only compounded when a company sells SaaS that relies on core software written decades before CSS3, or real, full-featured JS engines, or a world without Internet Explorer's [Trident rendering engine](<https://en.wikipedia.org/wiki/Trident_(software)>).

But so is a complete rewrite - tay aking that old source code written in ASP.net and used by dozens of products across teams and servers is no small feat. As a result, sometimes it makes sense to break time-based tech paradigms and mix the paint a little. Just because you're running some archaic database system, or an ancient .NET backend doesn't mean the newest in front end tech is unattainable.

## The New Front End, now with logic!

If you've kept up with frontend tech, you'd assuredly heard of [React](https://reactjs.org/), [Vue.js](https://vuejs.org/), or [Angular](https://angular.io/). All three aim to do roughly the same thing - provide a logically and programmatic solution to mantaining front-end UI. If you dig deeper, you'd soon discover nuance differences on how each approach the problem, how they've evolved to accomplish wildly impressive things (think native cross-OS app development) and the way each embraced the new world of rendering UI/UX with JavaScript.

Personally, I fell in love with Vue and how it provides familiar syntax, a logical paradigm that maps well with backend/browser use cases and best yet, a very active and large open source community. Unlike React (which is funded by the likes of [Facebook](https://www.youtube.com/watch?v=-Y2R01k4SXI)) and Angular (similarlly tied up with Google), Vue has an earnest community-first vibe.

All in all, I highly encourage readers that aren't well versed in either three to learn about each and consider adding one of them to your tech stack. It's quite effortless and barrier-free to create a component that integrates into existing code. Especially when the component is isolate in functionality and decoupled from the view at hand (e.g. the recommended section at the end of an article).

## Why?!

Realistically, when developers use existing server rendered templating engines, they do so out of a sense of familiarity and ease. It takes zero set up to create static, model driven views when creating an application - until less trivial use cases arise (which pretty much always occurs).

Every 'backend' tech stack has at least one templating engine, and some _are_ the templating language, like PHP. But the strength of these langauges isn't how fast they can render HTML, it's typically how straightforward it is to use ORMs or create RESTful APIs. The server side rendering is an afterthought, and still heavily relies on front end languages like JavaScript and CSS to do a majority of the grunt work.

So why would you want to create a highly coupled template that will ultimately need to use JS and burden yourself with twice the work load. Vue and the like allow for a decoupled approach, allowing for native technologies to handle the frontend. By defering rendering to the client, the server can be free of weird and always-tedious rendering engines.

Furthermore, decoupling your views from your API is always good - APIs shouldn't be tied to client facing UI. Since technologies on all sides of the equation change rapidly and with little regard for each, your approach should be able to handle that.

## Front end no longer means server rendered!

Break free from Jinja, PHP, [Fluid](https://github.com/sebastienros/fluid) and trying to keep up with complex UI/UX. Consider the fact JavaScript is ubiquitous and is a native way to interact with client facing applications. Old stacks need not worry, you can handle APIs with ease and comfort with JS templating engines!
