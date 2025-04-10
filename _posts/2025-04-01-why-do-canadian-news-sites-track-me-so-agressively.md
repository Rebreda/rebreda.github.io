---
layout: post
title: "Why do Canadian News Sites Track Me so Much?"
date: 2025-04-01 08:10:27
tags: [canadian news, trackers]
categories: [research]
hero_path: /assets/images/SpyLaptop.png
hero_alt: "A cartoon image of a laptop with a magnifying glass looking at a concern human using the machine"
featured: true
---

I noticed while reading the news on the [CBC](https://www.cbc.ca/) (Canadian Broadcasting Corporation) that ublock origin blocked 11 domains from making a connection which struck me as odd. Why was Canada's national news organization trying to leverage 11 dubious services while i read the news? Before jumping the gun, I figured I'd also check other private and public news and news-like organizations if they too were aggressively using trackers and privacy-invasive ad networks to harvest user data and thats what started my adventure down the rabbit hole of researching the pervasiveness of trackers across news agencies and media companies.

If you're asking why they need this data, they probably don't. It's a pervasive myth across the tech industry that every morsole of user-related data is valuable and required to maximize a products potential. These days, virtually every modern company, personal site, or random blog uses software that relentlessly collects personal user data. The reality is having _some_ analytics is actually really important but only to a point, its pretty obvious that an author of something would want to know if people are actually reading their work.

However, that's not necessariy the only reason this data is collected. Ads are a moneization stragey companies employe to keep their content free (unless you're Amazon or Netflix, which use them to subsidize premium subscribtion fees). This changing the equation a little, the motivation for the organization is now to sell ads, and ad networks want every bit of data related to the user that's seeing it. This means that in order to have ads, you'd also need to colllect a lot of data.

And that's not even the worst of it. Some companies might have ads, but also then collect and _sell_ the very data their collecting on their own users directly to [data brokers](https://databrokerswatch.org/#whyDataBrokers) for additional profit. This is where the data privacy issues kick into overgear, and often what people mean when they say "if you don't pay for the product, you are the product". Data brokers represent (If you're curious, this very blog uses [GoatCounter](https://www.goatcounter.com/), a very lightweight, user-privacy respecting analytics platform). Even as regulations across the globe rollout, it's often underpowered, under-enforenced or otherwise fractured and unable to keep up with the global nature of data harvesting across the internet. It

Most reputable companies will have a privacy policy, terms of service, EULA (end-user licence agreement) or other legal document that outlines the nature of the data being collected. These documents are often produced solely to reduce liability that come from the aformentioned regulations, not for the user's benefit. And that's why a lot of companies produce these documents in a hard-to-understand legaleze type language which would leave any normal person confused or otherwise unable to parse what exactly is happening. Fortunately, not all organizations hate their userbase _that_ much and provide relatively straightforward privacy notices (like the CBC, for example, which [spells out their data collection rational](https://cbc.radio-canada.ca/en/impact-and-accountability/privacy/privacy-notice/what-we-collect) in plain english).

With all that in mind, lets get back to the research - I'll leave it to the reader to decide if they believe the exchange of insane amounts of personal data for the service is reasonable.

![Screenshot of uBlock Origin readout on CBC](/assets/images/cbc-uBlock-origin-readout.png "uBlock Origin blocking multiple domains on CBC's website")

First, in case the adblocker in question isn't familiar, [uBlock origin](https://ublockorigin.com/) is a free and open source web extension that aims to block ads, trackers and privacy-infrining services from harvesting user data as they browser websites among other things. A website can embed other web services into their experience that take actions while the user accesses that website. This is generally very useful, as it lets website builders to use other tools like load content from across the internet. However, it also enables ad networks and other data harvesters to easily track user behaviour across websites.

## The Research

I checked a couple of other Canadian news agencies online to build up some initiution and it became obvious the CBC wasn't going to be the worst offender - Global News and CTV also had 18 and 10 blocked domains and I'd reckon there are worse actors out there. Each site loaded a bunch of ad network services, user interaction tracking, and plenty of other marketing/product related software that provides the companies the lowest level analytics into user behaviour on their platform. I also realized that I'd need to shore up my own data collection efforts of these trackers to provide any sort of concrete understanding of the state of news agencies data collecting practices. You see, not all trackers are equal and just gut-checking blocked domains isn't particularly interesting. Plus, manually analysizing even a fews websites would be slow and prone to mistakes.

So I built out an automated tracker checker that scans and processes a list of sites, and then compiles all the raw data into a human digestible analysis on the sites. I called the project [autotracko](https://github.com/Rebreda/autotracko) which is available on Github and has more details of how the actual mechanics work. The high level is it leverages a [headless browser](https://github.com/puppeteer/puppeteer) with a bunch of NodeJS code to load a list of domains, find what requests the pages make, then crosscheck the request domains to a [tracker blocklist](https://github.com/duckduckgo/tracker-blocklists) from DuckDuckGo which provides an up-to-date list of suspected trackers.

After running through the list, there are a couple scripts to automatically compile interesting statistics from the raw results and provide insights of what types of trackers are commonly used, which sites use what trackers, and other geographic data, like what countries news agency use the most trackers.

## Whats next

And since I was investigating news agencies, I acted like a journalist and sent a request to the CBC asking for clarity in their data policies to get their side of the story.
