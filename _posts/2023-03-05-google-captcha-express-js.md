---
layout: post
title: "Using Google's Captcha V3 with Express and Node"
date: 2023-03-05 17:10:48 -0800
categories: [development, opinion]
tags: [express, captcha, node, web-development, programming, opinion]
---

Before getting started, [check out the newer version of this article](https://quickthoughts.ca/development/degoogle/2020/12/16/using-hcaptcha-in-vue-instead-of-google.html) where I implement hCaptcha with express/Vue. hCaptcha is a non-google dependent captcha service. Otherwise, enjoy.

Building an anonymous user-facing technology is risky! Abuse, and spam are likely, along with potential DOS and other security/performance issues abound. Hence, [Google ReCaptcha](https://developers.google.com/recaptcha/) - a wide-spread (everyone uses it), intelligent (it's a lot more versatile than before) way to help limit spam from otherwise exposed forms.

Captcha systems are very common in today's internet with websites demanding clarity on species (robot or human) before providing anything useful. And it makes sense, non-validated users (i.e. webcrawlers, bots, spiders, etc) can easily abuse services, reducing resources for meaningful clients. Google's latest version is especially useful in that it grades the quality of the user on a scale (0 - 1), allowing for judgement of quality to be determined by the client.

It also can grade users without any user interaction - no more clicking "I'm not a robot." buttons during checkout or form submission! A seamless integration means legitimate users no longer have to be burdened by puzzle-esque questionnaires. So yeah, all in all, it's a good start at validating interactions on forms (although there's plenty more one can do to limit spam).

## Integrating Google ReCaptcha V3 with an Express application

The [documentation](https://developers.google.com/recaptcha/docs/v3) provided by Google is reasonably helpful - but an actual example is better!

### The Frontend setup!

First, add the correct ReCaptcha `<script />` to your client-side-facing template (Load it earlier enough to provide enough data for a more accurate response). Something like:

```html
<script src="https://www.google.com/recaptcha/api.js?render=_reCAPTCHA_site_key&onload=onLoad&render=explicit"></script>
```

Next, configure how you want the script to inject itself into the form you wanted guarded. I add the callback function in the script's `src` to inject the captcha value into the form.

```javascript
function onLoad() {
  grecaptcha.ready(function () {
    grecaptcha
      .execute(`${captchaToken}`, { action: "submit" })
      .then(function (token) {
        // Find the hidden input element in the form I wanted validated
        let t = document.querySelector("#reCaptcha");
        // give it a value returned by ReCaptcha
        t.value = token;
      });
  });
}
```

<br/>
```HTML
    <form>
        <!-- Other form stuff -->
        <input id="reCaptcha" type="hidden" name="g-recaptcha-response">
    </form>
```

All in all, all that's happening is the script loads, calls the function, injects a reCaptcha token into the form that we can validate against on the server. Simple stuff!

### Setting up the Backend

We need to be able to parse the form, grab the token value, and then shoot out a call to the reCaptcha service and see if the submitted form can be trusted.

In Express, a simple middleware that can parse and shootout a request to the service is just what the Doctor ordered. It provides a portable way to pick and choose which routes need to be validated, and allows an easy way to reject requests.

```javascript
function verifyRecaptcha(req, res, next) {
  const captchaURL = `https://www.google.com/recaptcha/api/siteverify`;
  // Get the token from the form
  const key = req.body["g-recaptcha-response"];

  if (!key) throw new Error("Captcha could not be verified. Please try again.");

  // axios works in Node, isn't that nice?
  axios({
    url: captchaURL,
    method: "POST",
    // reCaptcha demands x-www-form-urlencoded requests
    headers: { ContentType: "application/x-www-form-urlencoded" },
    body: `secret=${SECRET}&response=${req.body["g-recaptcha-response"]}`,
  })
    .then((captchaRes) => {
      const data = captchaRes.data;
      // check if successfully requested, and that a score over .5 is met
      if (data.success === true && data.score > 0.5) {
        next();
      }
      throw new Error("Captcha could not be verified. Please try again.");
    })
    .catch((error) => {
      next(error);
    });
}
```

The function grabs the token from the form, shoots a POST request to reCaptcha, and then checks if its successful and returns a high enough score to continue on to the next step.

A route looks very familiar.

```javascript
router.route("/login", verifyRecaptcha).get(handleRoute);
```

And that's it! A really straightforward way to provide some protection and judge user interactions.
