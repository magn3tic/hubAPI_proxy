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
  return new Promise((resolve, reject) => {
    _.forEach(companyIDsArray, (companyId) => {
      options.url = APIBASE + HUBSPOTCOMPANIESEND + companyId;
      ++index;
      callAPI(options, (err, res, body) => {
        if (err) {
          reject(err);
        } else {
          globalCompanyStore.push(res.body);
          if (index === globalCompanyStore.length) {
            resolve(globalCompanyStore)
          }
        }
      })
    })
  })
}

module.exports = getCompaniesInit;