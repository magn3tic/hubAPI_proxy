const getCompanyIdsByDeals = require('./getCompaniesIDsByDeals');
const getCompaniesInit = require('./getCompanyByID');
const getCompaniesFromMagServer = require('./getCompaniesFromMagServer');
const getDeals = require('./getDeals');
const readJSONFile = require('./readJSON');

module.exports = {
  getCompanyIdsByDeals,
  getCompaniesInit,
  getCompaniesFromMagServer,
  getDeals,
  readJSONFile
};