const _ = require('lodash');
const limit = require("simple-rate-limiter");
const callAPI = limit(require("request")).to(10).per(1000);
// const APIBASE = process.env.APIBASE;
const APIBASE = 'https://api.hubapi.com/';
const HUBSPOTCOMPANIESEND = 'companies/v2/companies/';
const fs = require('fs');
const fileToWrite = 'companies.json';
let globalCompanyStore = [];

function getCompaniesInit(companyIDsArray, options) {
  return new Promise((resolve, reject)=> {
    getCompanyById(companyIDsArray, options)
      .then((companyArray) => {
        if(companyArray) {
          console.log('promise resolved')
          // fs.writeFile('data/' + fileToWrite, companyArray, err => {
          //   if (err) throw err;
          //   console.log('saved companyArray: ');
          // })
          resolve(companyArray);
        } else {
          reject(err => console.log(err))
        }
      })
      .catch(err => console.log(err));
  })
}

function getCompanyById(companyIDsArray, options) {
  // Loop through tempCompanyArr, and make api call to get one company for each id in the tempCompanyArr.
  // console.log('company Ids Array: ', companyIDsArray);
  const inputArrLen = companyIDsArray.length;
  const globalArrLen = globalCompanyStore.length;
  let callsComplete = globalArrLen === inputArrLen;
  let index = 0;
  let headers = options.headers;
  return new Promise((resolve, reject) => {
    _.forEach(companyIDsArray, (companyId) => {
      ++index;
      callAPI({url: APIBASE + HUBSPOTCOMPANIESEND + companyId, headers}, (err, res, body) => {
        if (err) {
          reject(err);
        } else {
          globalCompanyStore.push(JSON.parse(res.body));
          if (index === globalCompanyStore.length) {
            resolve(JSON.stringify(globalCompanyStore))
          }
        }
      })
    })
  })
}

module.exports = getCompaniesInit;