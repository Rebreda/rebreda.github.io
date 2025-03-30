---
layout: post
title: "Using hCaptcha instead of Google's ReCaptcha with Vue and Express"
date: 2020-12-15 17:10:48 -0800
categories: [development, degoogle]
tags: [vue, captcha, node, web-development, programming, google]
---

For much the same reasons as my last [captcha related post](/development/opinion/2020/03/06/google-captcha-express-js.html), when needing a form of bot deterrence, it makes sense to use a captcha provider. At [fixed.link](https://fixed.link) we use it to gate registrations and no-account shortened URLs to help remove some risk of spam. To quickly sum it up, using a provider allows for an easy means of stopping most bots abilities to interact with an application.

Historically, implementing a useful, and not-too-impossible challenge-test was difficult and chalk-full of issues (accessibility, language, buggy). With that said, there is no excuse into todays world to rely on a privacy-invading, ad-selling organization like Google for such a tool. This is where [hCaptcha](https://hCaptcha.com/?r=1d541b532693) comes in. Please note that I've used my referral link to hCaptcha (although it remains unknown what that actually provides me, but just fyi).

hCaptcha actually pays for the privilege of servings its challenges on your application, which is obviously a nice touch compared to ReCaptcha. As for scale and performance, [giants like cloudflare](https://blog.cloudflare.com/moving-from-recaptcha-to-hcaptcha/) use it for their DDOS protection, so I'd doubt you'd run into scalability issues.

Changing providers couldn't be more straightforward as hCaptcha allows for a direct drop-in replacement for most of [Google ReCaptcha's](https://developers.google.com/recaptcha/) API and features. Furthermore, hCaptcha and the community [provide libraries](https://github.com/hCaptcha) for both frontend and backend environments, meaning its extremely easy to integrate and include as a dependency.

As for how to implement a captcha service effectively, it needs to be implemented _around_ frontend interactions and verified on the backend. That is, gate your expensive interaction (i.e. registering for an account) that triggers the challenge, and shoot a request to your normal API endpoint after the user completes the test. From there, the server confirms with hCaptcha that the generated frontend token is valid and then carry on with processing the request normally. This acts as a pass/no-pass middleware before the actual requested endpoint is hit.

For this article, I'll be using [vue-hcaptcha](https://github.com/hCaptcha/vue-hcaptcha) which is a simple wrapper of their JS API with all the necessary vue-ification (e.g. events) that make it easy to drop in a Vue application. As for the backend, I've decided to use a [community package](https://github.com/vastus/node-hcaptcha) for Node. Again, this package is also a very simple wrapper (it literally has one function that makes a http request to hCaptcha's `/verify` endpoint), but done well, with zero external dependancies - so no point rewriting whats already implemented!

## Using hCaptcha in a Vue app

The [documentation](https://github.com/hCaptcha/vue-hcaptcha) for the Vue library is useful, as is the general [documentation](https://docs.hcaptcha.com/) provided by hCaptcha for the service itself! Setting up is simply done by pluging in your secret key

### The frontend setup

First, install the library!

`npm install @hcaptcha/vue-hcaptcha --save`

Next grab your _sitekey_ and throw it in your `.env` file of choice. Note that for dev, its likely you'd want to use `10000000-ffff-ffff-ffff-000000000001` so you don't need to actually answer your challenges.

```env
VUE_APP_HCAPTCHA_SITEKEY=10000000-ffff-ffff-ffff-000000000001
```

### Using the hCaptcha component

Finally, using the library. In the component you want to gate (e.g. a form), add in the hcaptcha component. Check out this exammple below.

```js
<template>
  <div class="formContainer">
    <vue-hcaptcha
      ref="importantButton"
      :sitekey="VUE_APP_HCAPTCHA_SITEKEY"
      theme="dark"
      size="invisible"
      @verify="onCallback"
      @expired="onExpire"
      @error="onError"
    />

    <form id="importantForm">
        <b-input
          v-model="juicyData"
          placeholder="Put info here"
        />
      <button
        @click="onSubmit"
      >Click Me</button>
    </form>
  </div>
</template>
```

Wow thats a lot of stuff. But in reality, just a form with an input and a button. The fun stuff is the `<vue-hcaptcha />` component. Attached to that component are the events provided by the library. But before we get there, we need to handle the submit! In this case, just a simple button with a method `onSubmit()`.

```js
<script>
import VueHcaptcha from '@hcaptcha/vue-hcaptcha';

export default {
  components: {
    VueHcaptcha,
  },
  data() {
    return {
      juicyData: '',
      VUE_APP_HCAPTCHA_SITEKEY: process.env.VUE_APP_HCAPTCHA_SITEKEY,
    };
  },
  methods: {
    onSubmit() {
      // hit the captcha components .execute() method, which does all the heavy lifting
      this.$refs.importantButton.execute();
    },
    onCallback(response) {
      this.captcha = response; // get the token from the successful challenge
      this.$store.dispatch('makeAsyncRequest', { // eg fetch(`/endpoint`, {payload})
        captcha: this.captcha,
        juicyData: this.juicyData
      });
    },
    onExpire() {
      // example of handling expired captcha
      this.$store.commit('SET_ERROR', 'Captcha expired. Please try again.');
    },
    onError(error) {
      // do something with the error
    },
  },
};
</script>
```

Wow again, even more code to read... but again, it's mostly easy stuff.

To start, set the sitekey via `process.env.VUE_APP_HCAPTCHA_SITEKEY` in `data`, this gives us access to, well, the sitekey.

Next, recall the `$ref` on the hcaptcha component, we reference that in the `onSubmit` method, and that works its magic, setting up the challenge and all that goodness.

From there, we attach some methods to handle the events passed back from the hCaptcha component. Very self explaintory, with the important event being handled by `onCallback(response)`. This is where we make the request to our backend, and verify the challenge is actually genuine.

### Setting up the Express application (backend)

We need to be able to parse the request, grab the token value, and then shoot out a call to the hCaptcha service and see if the request can be trusted. Set the `HCAPTCHA_SECRET` in the server's `.env`.

In Express, a simple middleware that can parse and shootout a request to the service is just what the Doctor ordered. It provides a portable way to pick and choose which routes need to be validated, and allows an easy way to reject requests. In `verification.js` we'll create this middleware.

```javascript
const HCAPTCHA_SECRET = process.env.HCAPTCHA_SECRET;
const { verify } = require("hcaptcha");
/**
 * Validate client facing Captcha request.
 */
module.exports = async function verifyCaptcha(req, res, next) {
  // get captcha token from body
  const token = req.body["captcha"];
  // request verification
  await verify(HCAPTCHA_SECRET, token)
    .then(() => next()) //passed, so go forward
    .catch((error) => {
      next(error); //oh no, bad, handle accordingly
    });
};
```

The function grabs the token from the form, shoots a POST request to hCaptcha, and then checks if its successful and returns a high enough score to continue on to the next step.

A route looks very familiar, just add the middleware, and bingo-bango. Here's an example,

```js
const { verifyCaptcha } = require("../middleware/verification");
router.route("/register").post(verifyCaptcha, handleRegistration);
```

And that's it! A really straightforward way to provide some protection and judge user interactions. If you'd like to see it in the wild, check out [fixed.link](https://fixed.link), manage URLs and own your links! Its a free URL management service (with free URL shortening).
