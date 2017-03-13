const _ = require('lodash');
const request = require('request');
const getCompaniesInit = require('../getCompanyByID');
const HUBSPOTSECRET = process.env.HUBSPOTSECRET;

function getCompanyIdsByDeals(dealsArr) {
  let tempCompanyIdArray = [];
  let tempDealIDsArray = [];
  let tempCompaniesArray = [];
  let counter = 0;
  // console.log('getCompanyIdsByDeals got ', dealsArr);

  return new Promise((resolve, reject) => {
    _.forEach(dealsArr[0].deals, (obj) => {
      if (!obj.dealId) {
        console.log('!obj: ', obj);
        return
      } else {
        tempDealIDsArray.push(obj.dealId);
        // console.log('tempDealIDsArray: ', tempDealIDsArray);
      }
    })
    let IDResults = (tempCompanyIdArray.length > 1) ? resolve(getCompaniesInit(tempCompanyIdArray)) : reject(console.error('no results in ID array in getCompanyIdsByDeals'));
  })
}

module.exports = getCompanyIdsByDeals;

