const fs = require('fs');
const Qs = require('qs');
const passport = require('passport');
const OAuth2Stratgy = require('passport-oauth').OAuth2Stratgy;
const axios = require('axios');
const request = require('request');
const hubAPI = process.env.APIBASE;
const hubAuthEnd = process.env.HUBOAUTHEND;
const clientID = process.env.HUBCLIENTID;
const clientSecret = process.env.HUBCLIENTSECRET;


function hubAuth(hubAuthData) {
  const result = new Promise((resolve, reject) => {
    axios.post(url, options, {headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
    }})
    .then(res=> resolve(res))
    .catch(err=> reject(err));
  })
  return result;
}

module.exports = hubAuth;