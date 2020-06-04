const express = require('express')
const bodyParser = require('body-parser');

const eventsRouter = express.Router()
eventsRouter.use(bodyParser.json())
eventsRouter.use(bodyParser.urlencoded({extended:false}))

const Helpers = require('../utils/helpers')
const commonEmitter =  Helpers.commonEmitter;

eventsRouter.post("/events", (req,res) => {
  console.log("Emitting event")
  console.log(req.body)
  if(req.body.event && req.body.event.data){
    let data = req.body.event.data;
    commonEmitter.emit(data.event,data);
  }
  res.sendStatus(200)
})

module.exports = eventsRouter