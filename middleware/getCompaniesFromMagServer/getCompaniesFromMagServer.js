const _ = require('lodash');
const request = require('request');

function getCompaniesFromMagServer() {
  let companiesArr = [];
  const getCompanies = new Promise((resolve, reject) => {
      request('http://dev.magne.tc/api/hubspot/cache/clients.json', (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          // console.log('resolving call to ' + 'http://dev.magne.tc/api/hubspot/cache/clients.json', ' response body: ', body);
          resolve(JSON.parse(body))
        }
      });
  })
  return getCompanies;
}

module.exports = getCompaniesFromMagServer;