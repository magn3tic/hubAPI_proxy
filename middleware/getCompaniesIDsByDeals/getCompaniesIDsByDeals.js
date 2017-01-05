const _ = require('lodash');
const request = require('request');
const getCompaniesInit = require('../getCompanyByID');
const HUBSPOTSECRET = process.env.HUBSPOTSECRET;

function getCompanyIdsByDeals(dealsArr) {
  let tempCompanyIdArray = [];
  let tempCompaniesArray = [];
  let counter = 0;
  // console.log('getCompanyIdsByDeals got ', dealsArr);

  const getIds = new Promise((resolve, reject) => {
    _.forEach(dealsArr.deals, (obj) => {
      if (!obj.associations.associatedCompanyIds.length) {
        return
      } else {
        tempCompanyIdArray.push(obj.associations.associatedCompanyIds[0]);
      }
    })

    let IDResults = (tempCompanyIdArray.length > 1) ? resolve(getCompaniesInit(tempCompanyIdArray)) : reject(console.error('no results in ID array in getCompanyIdsByDeals'));

  })
}

module.exports = getCompanyIdsByDeals;

