---
layout: post
title: "Building a Startup on $10 a Month"
date: 2021-01-15 17:10:48 -0800
categories: [startup, opinion]
tags: [startups, business, advice, cash-strapped, tech, opinion]
---

When building Fixed.link, I prioritized minimizing spend and built my startup which served many thousands of users while spending only $10 a month. Early on in your startup journey, it's crucial to be resourceful and make things work for you. How? Specifically for SaaS startups, utilize flexible tools (e.g., while managed Kubernetes/database/load balancer/toaster services are convenient, they're far more expensive than a VPS), "hack" things (use free tiers and competitor services to ensure your service runs smoothly), choose the most effective advertising channels, seek out referrals, and code—don't buy (unless absolutely necessary). This is the approach I've taken so far. Read on for more ideas and specific examples of how I've put these practices into action. A heads up: I use referrals for tools that save money or get things done; these are marked with an asterisk (\*).

## The Mindset Behind Founding a Low-Cost Startup

It’s likely that every founder (and really, most people) dreams of success. However, it’s no secret that only a small fraction of startups actually achieve it. The realities of the startup world are harsh—even with significant funding, success is never guaranteed. Now, I'm not suggesting there's no correlation between success and funding (having ample cash certainly doesn’t hurt). But for those of us who aren’t so fortunate, what can we do? Simply put, keep your expenses aligned with your comfort level with risk. For me, being frugal is second nature, and I knew the odds of overcoming early startup hurdles were against me. Therefore, I’ve strived to minimize financial burdens (without imposing unnecessary technical limitations) while still positioning myself for market success.

## Use Flexible Tools and Know Your Scale

We’ve discussed the mindset needed for starting a budget-conscious company, but how do you create something viable without spending a fortune? Well, your offering shouldn't be expensive to manufacture or provide. Ideally, it should be software—something scalable. Furthermore, there’s no point in saving money if it hinders your ability to sell or deliver a product/service. That’s where experience comes in. Know when to build versus buy, and when to choose a simple solution over the fancy new one. Become an expert builder, a master tinkerer, and a jack of all trades. Technology changes rapidly, and while SaaS becomes increasingly user-friendly, it can also become expensive.

For example, microservice architecture is currently very popular and often utilizes pay-per-instance services that offer easily scalable containers. This is great for ultra-scalable, high-traffic systems, but it's also expensive! Understand your scale, and don't solve problems you won't face in the near future. A simple VPS (or a collection of VPS) can be a robust and cost-effective alternative. Personally, I use [DigitalOcean's $10/month VPS](https://m.do.co/c/62406b4b1e4f)\* which also has a free-tier and have no issue serving thousands of requests daily. Looking ahead, tools like Docker Swarm can make scaling relatively easy. Other techniques, such as CDNs, aggressive caching, queues, and smart product planning can make a huge difference in performance while keeping RAM/CPU costs down—at virtually no cost.

## Embrace "Free" and Work Around Costs

Take advantage of free services. FOSS is great, but free is free. Fixed.link doesn't pay for emails, analytics/tracking, or ads. In fact, other than the VPS, there are no extra expenses. Surprised? You might be thinking, "How can email be free?" Well, we send fewer than 300 emails a day, which is free at [SendInBlue](https://www.sendinblue.com/pricing/). When you scale, they offer great deals to startups (just reach out), keeping costs manageable. I could have created my own email service, but from past experience, this is where time is more valuable than money. Self-hosted email services are a pain.

Many companies, even small startups, believe they _need_ deep, AI-driven, growth-hacking analytics services to understand their users. I can already hear them say, "Without the black magic wizardry of expensive MarTech tools, how can we possibly decide what color our buttons should be?!" Having worked in product, I've attended countless meetings where we’d review heatmaps of clicks on a page and user journey flow charts to determine that we must _change/fix/break/add a new button/modal/input/color_. Instead, Fixed.link uses [Umami](https://github.com/umami-software/umami), a FOSS analytics service. It’s easy to self-host, simple to use, and far less invasive than paid services. It covers the basics, isn't based on voodoo, and costs nothing. Ultimately, find tools that work for you, but avoid buying more than you need.
