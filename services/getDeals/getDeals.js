const _ = require('lodash');
const request = require('request');
const getCompanyIDsByDeals = require('../getCompaniesIDsByDeals');
const APIBASE = process.env.APIBASE;
const HUBSPOTSECRET = process.env.HUBSPOTSECRET;
const DEALSEND = process.env.DEALSEND;

function getDeals() {
  // Additional hubapi options
  options = '&includeAssociations=true&limit=250&properties=stage';
  const hubDealsCall = new Promise((resolve, reject)=> {
    request(APIBASE + DEALSEND + HUBSPOTSECRET + options, (error, response, body) => {
      let result = (error) ? reject(console.error(error)) : resolve(getCompanyIDsByDeals(JSON.parse(body)));
    })
  })
  return hubDealsCall;
}

module.exports = getDeals;