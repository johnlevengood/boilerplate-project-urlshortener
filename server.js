require('dotenv').config();
const express = require('express');
const path = require('path')
const cors = require('cors');
const bodyParser = require('body-parser')
const app = express();
const dns = require('dns')
require('./src/db/mongoose')
const urlParse = require('url')
const Url = require('./src/models/url');
const mongoose = require('mongoose')
// Basic Configuration
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

// http://expressjs.com/en/starter/static-files.html
const publicDirectoryPath = path.join(__dirname, './public');
app.use(express.static(publicDirectoryPath));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.get('/api/shorturl/:shorturl', async (req,res) => {
    const id = req.params.shorturl
    if (!id) {
        return res.send({ error: 'invalid url' })
    }
    try {
        const orig = await Url.findById(id)
        if (!orig) {
            return res.send({ error: 'invalid url' })
        }
        res.redirect(orig.original_url)
    } catch (e) {
        return res.send({ error: 'invalid url' })
    }
})

app.post('/api/shorturl/new', async (req,res) => {
    
    const orig = req.body.url
    if (!orig) {
        return res.send({ error: 'invalid url' })
    }
    try {
        const thisUrl = new URL(orig)
        if (thisUrl.protocol !== 'https:' && thisUrl.protocol !== 'http:'){
            return res.send({ error: 'invalid url' })
        }
        dns.lookup(thisUrl.hostname, {}, async (err, address, family) => {
            if (err){
                return res.send({ error: 'invalid url' })
            }
            const newUrl = new Url({
                original_url: orig
            })
            await newUrl.save()
            res.send({ original_url: newUrl.original_url, short_url: newUrl._id })
        })
    } catch (e) {
        return res.send({ error: 'invalid url' })
    }
})

app.listen(PORT, function() {
  console.log(`Listening on port ${PORT}`);
});
