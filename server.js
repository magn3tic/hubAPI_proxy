require('dotenv').config({ path: './config/.env' });
const express = require('express');
const request = require('request');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 1337;
const hubSecret = process.env.HUBSPOTSECRET;
const server = app.listen(port);
const middleware = require('./middleware');
const getDeals = middleware.getDeals;
const readJSONFile = middleware.readJSONFile;
const hubAuth = middleware.hubAuth;
const cors = require('cors');
// Hub constants
const hubAPI = process.env.HUBAPIBASE;
const hubAuthToken = process.env.HUBOAUTHTOKEN;
const clientID = process.env.HUBCLIENTID;
const clientSecret = process.env.HUBCLIENTSECRET;
const hubAuthInit = process.env.HUBAUTHINIT;
const callbackURL = process.env.CALLBACKURL;
const HUBCONTACTSALL = process.env.HUBCONTACTSALL;
const HUBDEALSALL = process.env.HUBDEALSALL;
const HUBDEAL = process.env.HUBDEAL;

// Server Env. To share with others switch to 'staging'
const serverEnv = 'dev';
// const serverEnv = 'staging';

// Passport
var passport = require('passport')
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
const Qs = require('qs');
const bodyParser = require('body-parser');

const _ = require('lodash');

server.on('listening', () =>
  console.log(`express proxy application started on ${port}`)
);

app.options('*', cors())
  .use(cors());

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.route('/hubAPI/refresh')
  .get((req, res) => {
    getDeals()
      .then(result => res.send(result))
      .catch(err => console.log('err: ', err))
  });

// This route and its functions should be abstracted into services/middleware when going to prod
app.route('/hubAPI')
  .post((req, res, next) => {
    // readJSONFile('./data/companies.json')
    //   .then(json => res.send(json))
    //   .catch(err => console.error(err))
    console.log('req: ', req.body.variable_name);

  })

app.route('/hubContacts')
  .post((req, res) => {
    if (fs.existsSync(__dirname + '/data/contacts.json')) {
      console.log('contacts.json already exists, sending file');
      res.status(200).send(fs.readFileSync(__dirname + '/data/contacts.json'));
      return
    }
    console.log('req bearer: ', req.body.authorization[0]);
    let token = req.body.authorization[0];
    let vidOffset = '';
    let options = {
      url: hubAPI + HUBCONTACTSALL + '?contacts=100',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`,
        'User-Agent': 'request',
        Accept: 'application/json',
      }
    }

    let contacts = [];
    var callback = (error, response, body) => {
      return new Promise((resolve, reject) => {
        let hasMore = body['has-more'];
        var info = JSON.parse(body);
        if (!error && response.statusCode == 200) {
          contacts.push(info);
          // console.log('successful callback to get contacts, contacts: ', contacts);
          setTimeout(function () {
            vidOffset = info['vid-offset'];
            hasMore = info['has-more'];
            options.url = hubAPI + HUBCONTACTSALL + '?contacts=100' + '&vidOffset=' + vidOffset;
            console.log('in callback new vidOffset: ', options.url);
            console.log('hasMore: ', hasMore);
            if (!hasMore) {
              console.log('!hasMore: ', hasMore);
              contacts.push(info);
              fs.writeFile(__dirname + '/data/contacts.json', JSON.stringify(contacts), err => {
                if (err) {
                  reject(err => console.log('err in writeFile with contacts'));
                }
                readJSONFile(__dirname + '/data/contacts.json')
                  .then(json => resolve(res.send(json)))
                  .catch(err => reject(console.log('file written err: ', err)))
              })
            }
            return request(options, callback);
          }, 100);
        } else {
          reject(res.sendStatus(404))
        }
      })
    }
    request(options, callback)
  })

app.route('/hubToken')
  .get((req, res) => {
    console.log('request for hubspot_token route /hubToken');
    if (fs.existsSync('./data/token.json')) {
      readJSONFile('./data/token.json')
        .then(json => res.send(json))
        .catch(err => console.error(err));
    } else {
      res.status(404).send('Not authorized, no token in data/token.json')
    }
  })

app.route('/hubLogout')
  .get((req, res) => {
    console.log('logout requested');
    fs.rmdir(__dirname + '/data', (err) => {
      if (err && err.code === 'ENOENT') {
        console.log('unlink err: ENOENT ', err);
        res.sendStatus(204);
      } else {
        console.log('successfully logged out');
        res.sendStatus(202);
      }
    })
  })

app.get('/hubAuth', passport.authenticate('hubspot', { session: false, scope: ['contacts'] }), (err, req, res) => {
  console.log('im being used!');
  if (!err) {
    console.log('initial success');
  } else {
    console.log('/hubAuth err: ', err);
  }
});

app.get('/auth/hubspot/callback', passport.authenticate('hubspot', { session: false }), (req, res) => {
  if (req.user) {
    // Save req.user to a local json file to cache
    fs.writeFile('data/token.json', JSON.stringify(req.user), err => {
      if (err) throw err;
      console.log('saved token: ', JSON.parse(fs.readFileSync('data/token.json')));
      res.redirect(303, (serverEnv === 'dev') ? 'http://localhost:3000/#/token' : 'http://magfam.surge.sh/#/token');
    });
  } else {
    console.log('callback err: ', err);
  }
}
);

//Dev information can be accessed here: https://app.hubspot.com/developers-beta/2313987/application/38196
passport.use('hubspot', new OAuth2Strategy({
  authorizationURL: hubAuthInit,
  tokenURL: hubAPI + hubAuthToken,
  clientID,
  clientSecret,
  callbackURL
},
  function (accessToken, refreshToken, profile, done) {
    // console.log('accessToken',accessToken)
    // console.log('profile', profile)
    var authInfo = {
      accessToken,
      refreshToken
    }
    request('https://app.hubspot.com/oauth/authorize/' + accessToken, function (error, response, body, authInfo) {
      if (!error) {
        console.log('successful Oauth 2.0 connection')
        //console.log(JSON.parse(body))
        // json_response = JSON.stringify(body)
        // console.log('json_response: ', json_response)
        // console.log(json_response.hub_id)
        // var accessToken = this.authInfo.accessToken
        // var refreshToken = this.authInfo.refreshToken
        // User.findOrCreate({ email: json_response.user, hub_id:json_response.hub_id, access_token:accessToken, refresh_token: refreshToken }, function (err, user,created) {
        //   return done(err, user);
        // });
        return done(null, this.authInfo);
      } else {
        return done(error);
      }
    }.bind({ authInfo }))
  }
));

app.post('/hubDeals', (req, res) => {

  // if(fs.existsSync(__dirname + '/data/deals.json')) {
  //   console.log('deals.json already exists, sending file');
  //   res.status(200).send(fs.readFileSync(__dirname + '/data/deals.json'));
  //   return
  // }
  console.log('req bearer: ', req.body.authorization[0]);
  let token = req.body.authorization[0];
  let offset = '';
  let options = {
    url: hubAPI + HUBDEALSALL + '?limit=250',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${token}`,
      'User-Agent': 'request',
      Accept: 'application/json',
    }
  }

  let deals = [];
  let tempDealIDsArray = [];
  var callback = (error, response, body) => {
    return new Promise((resolve, reject) => {
      let hasMore = body['has-more'];
      var info = JSON.parse(body);
      if (!error && response.statusCode == 200) {
        deals.push(info);
        // console.log('successful callback to get deals, deals: ', deals);
        setTimeout(function () {
          offset = info['offset'];
          hasMore = info['has-more'];
          options.url = hubAPI + HUBDEALSALL + '?&offset=' + offset;
          console.log('in callback new offset: ', options.url);
          console.log('hasMore: ', hasMore);
          if (!hasMore) {
            console.log('!hasMore: ', hasMore);
            deals.push(info);
            fs.writeFile(__dirname + '/data/deals.json', JSON.stringify(deals), err => {
              if (err) {
                reject(err => console.log('err in writeFile with deals'));
              }
              readJSONFile(__dirname + '/data/deals.json')
                // .then(json => resolve(res.send(json)))
                .then(json => {
                  let tempJsonObj = JSON.parse(json);
                  // console.log(tempJsonObj.length);
                  _.forEach(tempJsonObj, val => {
                    // console.log('deals val: ', val.deals)
                    _.forEach(val.deals, (obj) => {
                      // console.log('obj: ', obj);
                      tempDealIDsArray.push(obj.dealId);
                    }) 
                  })
                })
                .catch(err => reject(console.log('file written err: ', err)))
            })
          }
          return request(options, callback);
        }, 100);
      } else {
        reject(res.sendStatus(404))
      }
    })
  }
  request(options, callback)
})

app.post('/hubDeal/:id', (req, res) => {
  console.log('req bearer: ', req.body.authorization[0]);
  let token = req.body.authorization[0];
  let offset = '';
  let options = {
    url: hubAPI + HUBDEAL + req.params.id + '?limit=250',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${token}`,
      'User-Agent': 'request',
      Accept: 'application/json',
    }
  }

  var callback = (error, response, body) => {
    return new Promise((resolve, reject) => {
      let hasMore = body['has-more'];
      var info = JSON.parse(body);
      if (!error && response.statusCode == 200) {
        resolve(res.status(200).send(info));
      } else {
        reject(res.sendStatus(404))
      }
    })
  }
  request(options, callback)
})

