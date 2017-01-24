const _ = require('lodash');
const limit = require("simple-rate-limiter");
const callAPI = limit(require("request")).to(10).per(1000);
const APIBASE = process.env.APIBASE;
const HUBSPOTSECRET = process.env.HUBSPOTSECRET;
const HUBSPOTCOMPANIESEND = '/companies/v2/companies/';
const fs = require('fs');
const fileToWrite = 'companies.json';
let globalCompanyStore = [];

function getCompaniesInit(companyIDsArray) {
  getCompanyById(companyIDsArray)
    .then((companyArray) => {
      console.log('promise resolved')
      fs.writeFile('data/' + fileToWrite, companyArray, err => {
        if (err) throw err;
        console.log('saved companyArray: ');
      })
    })
    .catch(err => console.log(err));
}

function getCompanyById(companyIDsArray) {
  // Loop through tempCompanyArr, and make api call to get one company for each id in the tempCompanyArr.
  const inputArrLen = companyIDsArray.length;
  const globalArrLen = globalCompanyStore.length;
  let callsComplete = globalArrLen === inputArrLen;
  let index = 0;
  return new Promise((resolve, reject) => {
    _.forEach(companyIDsArray, (companyId) => {
      ++index;
      callAPI(APIBASE + HUBSPOTCOMPANIESEND + companyId + HUBSPOTSECRET, (err, res, body) => {
        if (err) {
          reject(err);
        } else {
          globalCompanyStore.push(res.body);
          if(index === globalCompanyStore.length) {
            resolve(globalCompanyStore)
          }
        }
      })
    })
  })
}

module.exports = getCompaniesInit;