"use strict"

const express = require('express')
const app = express()
const http = require('http').Server(app)
const Tracker = require('./tracker.js')

app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

http.listen(3000, () => {
  console.log('Server started! Listening on :3000 port...')
  const tracker = new Tracker(http)
  tracker.start();
})
