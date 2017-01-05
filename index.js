require('dotenv').config({path: './config/.env'});
const express = require('express');
const request = require('request');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 1337;
const hubSecret = process.env.HUBSPOTSECRET;
const server = app.listen(port);
const middleware = require('./middleware');
const cors = require('cors');

server.on('listening', () =>
  console.log(`express proxy application started on ${port}`)
);

app.options('*', cors())
.use(cors());

app.route('/hubAPI/refresh')
.get((req, res)=> {
  middleware.getDeals()
  .then(result=> res.send(result))
  .catch(err=> console.log('err: ', err))
});

app.route('/hubAPI')
.get((req, res) => {
  middleware.readJSONFile('./companies.json')
  .then(json=> res.send(json))
  .catch(err=> console.error(err))
})