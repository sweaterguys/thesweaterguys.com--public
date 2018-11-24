# [TheSweaterGuys.com](https://github.com/sweaterguys/thesweaterguys.com)
![banner image](public/img/admin/banner.jpg?raw=true)
Welcome to **The Sweater Guys Website!** Check out this repo for all the necessary steps for implementation and deployment

# Setup

The website was built to be as sexy as humanly possible without compromising on load times or functionality, to minimize load times, minimal packages were used to keep the website loading in reaction time (200ms).

The site is pure JQuery, JS, HTML and CSS. No PHP.

All dynamic elements are built with a Node.js Express Server

Instead of using popular raster render engines such as canvas.js or fabric.js, the design studio core functionality is **entirely built using SVG**

Making use of the ejs render engine, svg templates (mockups) are parameterized with a base svg path, a shadow/texture layer and a upload area in between.

The upload layer is brought to life with some ajax and made resizable/draggable with JQuery. This is the main point of innovation on the website, SVG rendering allows for **faster loading, 0 rendering, and easy real time manipulation.**

![Website Diagram](public/img/admin/website_diagram.png?raw=true)

## Requirements
In order to run this server, you need to have node.js and npm installed, all other packages will be installed on *Setup*.
Run:

> Linux
```bash
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install -y nodejs
```
> Mac
```bash
curl "https://nodejs.org/dist/latest/node-${VERSION:-$(wget -qO- https://nodejs.org/dist/latest/ | sed -nE 's|.*>node-(.*)\.pkg</a>.*|\1|p')}.pkg" > "$HOME/Downloads/node-latest.pkg" && sudo installer -store -pkg "$HOME/Downloads/node-latest.pkg" -target "/"
```
> [Windows](https://nodejs.org/en/#download)

*source: https://nodejs.org/en/download/package-manager/*
### .Secrets
Unfortunately, since not everyone on [Sweater Planet](https://thesweaterguys.com/sweaterplanet) is as friendly as you are, we had to encrypt our credentials. If you are a Sweater Guy:
```bash
brew git-secret && git-secret init
```
[git-secret](http://git-secret.io/) is a library that allows you to decrypt the .secret files such as credentials.json in the private folder.

It builds an RSA encryption key:pass pair that allows you to run:
```bash
git-secret reveal
```
_check the [requirements](http://git-secret.io/installation) if you're stuck ([gnupg](https://formulae.brew.sh/formula/gnupg))_

## Installation
In order to setup the server, follow these simple steps:

 1. Clone the GitHub Repo: 
```bash
git clone https://github.com/sweaterguys/thesweaterguys.com.git
```

 2. Cd into the folder *"TheSweaterGuys.com"*:
```bash
cd TheSweaterGuys
```

3. Install necessary packages:
```bash
npm i
```

4. Initiate the Server:

| `npm start` | or | `npm run dev` |
|---|---|---|
## Testing

Now that your server is working, you can test it out at your local host on port 3000

 - http://localhost:3000/
It is highly recommended to use [webstorm](https://www.jetbrains.com/webstorm/) with [nodemon](https://nodemon.io/) for testing.
This allows you to restart the server automatically on save.

http://localhost:3000|Webstorm
:-------------------------:|:-------------------------:
![Local Website](public/img/admin/local_website.png?raw=true)|![Webstorm](public/img/admin/visual_studio_code.png?raw=true)

## Implementation
Since the Website is hosted through Google App Engine, pushing live updates is as simple as running:
```bash
gcloud app deploy
```
although I have created a slightly more efficient and secure start script:
```bash
npm run deploy <deploymentName>
```
to get gcloud working you need the [Google Cloud SDK](https://cloud.google.com/sdk/#Quick_Start) and credentials for the app engine (which I'm not going to walk through here for obvious reasons.

# API Documentation
The Website comes deployed with The Sweater Guys API library

(some of which is original, most of it is derived from other Github repos :heart:)

### Auth
A simple Node JS middleware that takes a base64 basic key:pass pair and verifies it before continuing with the code

This is used on post-sensitive api's not meant to be accessed by non Sweater Guys such as:
- _sms.send_
- _email.send_
- _slack.send_

### Cart
simple library for updating cookies on the users browser (previously called cookieMonster)

**Four Methods:**

| method | use | pseudo |
|---|---|---|
| `get` | grabs the current cart quantity | `cookies['cart'].length` |
| `set` | adds items to the 'cart' cookie | `res.cookie(cart.push(body))` |
| `update` | changes perams of item in cart | `for (item in items){ cart.push...}` |
| `delete` | removes item or items from cart | `cart.splice(req.query.delete, 1)` |

_*Cookies can cause issues when developing as any changes to the way items are added to cart or interpreted can raise issues for users that previously have set cookies._

use in app.js error catch for legacy users:
```javascript
res.clearCookie('cart');
res.redirect('/');
```

### Email
Okay this one is cool:

The email api uses the gmail api to send html emails based on parameterized ejs templates
```javascript
ejs.renderFile(__dirname + '/email/templates/' + data.template, {body: body}, 
    function(err, str){
        Buffer.from(str).toString("base64")
        // then send the string to gmail api
    });
```
_Disclaimer: Google Credential on-boarding **sucks** the first time_

### Mockup
This is the main API. It's a restful version of the design studio built to create mockups without a UI

Starting with posted parameters:
 ```text
    item -> hoodie t-shirt quarter crew
    color -> red or #ffffff
    size -> s m l xl (optional)
    logo -> path buffer b64 (optional but like whats the point if you don't)
    quantity -> n (optional)
```
The library returns an SVG mockup and then saves it to our public drive as a PNG.

**Helpers:**
- [svg to png](https://www.npmjs.com/package/svg-to-png)
- bucketMe (save buffer to GCS bucket)
- grabFile (glorified version of [request](https://www.npmjs.com/package/request))
- base64 ([mime-type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types) string interpolation)

Due to the synchronicity dependent nature of file uploading, this api (as well as most others in the lib) is built with [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
```javascript
(...perams) => new Promise((resolve) => {...}).then((buffer) => resolve(base64(buffer)))
```
if you don't understand that^ code: read [this](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions) and [this](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) and [this](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters) and [this](https://nodejs.org/api/buffer.html)

### Pay
Simple library to integrate with BluePay's [bp10emu](https://www.bluepay.com/sites/default/files/documentation/BluePay_bp10emu/BluePay%201-0%20Emulator.txt) API for incoming transactions

Basically just glorified serialization of incoming posted perams from the payment portal route.

The code is simple enough to understand but required lots of painstaking tuning as BluePay's documentation isn't as comprehensive as PayPal or Stripe (but way way way cheaper)

A lot of this:
```javascript
data.split('<a href=...')[1].split('">here</a>')[0].split('&amp;');
```
### Ship
Shipment API to purchase a shipping label from [Canada Post](https://www.canadapost.ca/cpotools/apps/drc/home?execution=e3s1)'s archaic platform and return a PDF, then print said PDF using [cloud print](https://developers.google.com/cloud-print/) on our local printer from the App Engine.

**TED'S README HERE**

### Slack

The Slack API (formerly part of the contact api) has 2 functions:
- **Send**
    
    Sends a Slack message to an authorized workspace using the phenomenal and well documented :innocent: [@slack/client Node.js module](http://slackapi.github.io/node-slack-sdk/)
    Takes JSON or JS Object of the form:
    ```javascript
    body = {
      channel: "CHANNEL_ID", 
      message: "hi.",
      images: ["URL_0","..."]
    }
    ```
    and returns a status (200 is gr8!)
- **Receive** _**(BETA)**_
    
    Receives Slack Messages through an incoming WebHook through the [slack developer console](https://api.slack.com/incoming-webhooks)
    
    This can theoretically be used to leverage the entire admin functionality of the website and be used to create a two way public app for B2B functionality

### SMS

The SMS Api is similar to the Slack API with a Send and Receive Module, but uses the [Twilio API](https://www.twilio.com/docs/sms/quickstart/node)

- **Send**

    Takes posted JSON or JS Objects in the format:
     ```javascript
    body = {
      number: "TO_NUMBER", 
      message: "hi.",
      media: ["URL_0","..."]
    }
    ```
    and returns a messageId (as long as you get one you're golden)
    
- **Receive** _**(BETA)**_
    
    Working on the ability to send texts to The Sweater Guys phone number with specs and images and receive mockups

### Stock

The Stock API integrates with a GCloud Compute Engine that uses [Selenium in Python](https://selenium-python.readthedocs.io/) to automate the use of their website _RESTFULLY_
Setting up a Compute Engine in linux with dependencies for Selenium is a whole other Readme so I'll save that for later and put a link 

`HERE`

When I'm done

The API has two functions:
- **Get**

    Makes a simple Get request to the Compute Engine which returns live stock data off our suppliers website in JSON

- **Order**

    Purchases garments from the supplier based on what the user purchased (sent in JSON via request library).
    
    The posted JSON requires auth headers stored in encrypted credentials :smiling_imp:
    
*_You may notice that this API uses `process.env` variables._ 
These are referenced from the [.env file](https://www.npmjs.com/package/dotenv) in private and allow us to easily change the compute engine IP address without diving into the source code

### Upload

The upload API pipes a [buffer write stream](https://nodejs.org/api/fs.html#fs_class_fs_writestream) to the [Google Cloud Storage API](https://www.npmjs.com/package/@google-cloud/storage)
The important thing to note is that you must pass a `file` to the API constructed with the [multer middleware](https://www.npmjs.com/package/multer), check out this example of a form upload receiving route:
```javascript
// this is a simplified router #ES6 :sunglasses:

const Multer = require('multer'),
    multer = Multer({storage: Multer.memoryStorage()}),
    upload = require('upload')

module.exports = require('express').Router()
    .post('/upload', multer.single('file'), (req, res) =>
        upload(req.file).then(file => res.send(file))
    )
```
you can post to this route with client side JS or even a simple HTML form:
```html
<form action="api/upload" method=POST encType="multipart/form-data">
    <input type="file" name="file" accept="image/*" id="file">
</form>
```

That's it for API's (for now :tired_face:)

# Next Steps
## AI
We want the website to render the CSS and HTML based on User scraped data.
We then want every single part of the UX A-B Tested with a forking algorithm:

![Forking Algorithm](public/img/admin/forking_algorithm.png?raw=true)

## General Debugging
**Known Issues:**
- Index load time (pre-cache)
- Add to Cart missing data alert 
- Mobile Support

**Rectify Issues:**
- Add Reject support for promises globally
- Buggy UI on product page uploaded img
- HomePage styling + **Cool Func** (not to be confused with _Core Func_)
 
 **CSS** (only developers know it deserves it's  own category):
- Footer
- Design Studio
- Index
- Cart + Checkout
- Product
- Contact

# Thanks for the Interest!

**--- Dexter Storey** | [CCO The Sweater Guys](https://thesweaterguys.com/?Name=Elon%20Musk)
