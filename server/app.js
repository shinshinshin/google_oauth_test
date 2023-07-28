const express = require('express')
const app = express()
const cors = require('cors');
const bodyParser = require('body-parser')
const config = require('../config.json')

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(cors())

const {google} = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  config.client_id,
  config.client_secret,
  "http://localhost:8081/next.html"
)

const scopes = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
]

const authorizationUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
  include_granted_scopes: true
})

app.post('/login',(req,res) =>{
  res.send({authorizationUrl})
})

app.post('/info',async (req,res) => {
  const code = req.body.code
  oauth2Client.getToken(code, function(err,token){
    if (err) {
      console.log('Error while trying to retrieve access token', err);
      return;
    }
    // oauthインスタンスにトークンをセットする
    oauth2Client.credentials = token;
    // googleからユーザー情報を取得する
    const oauth2 = google.oauth2({
      auth:oauth2Client,
      version:'v2'
    });
    oauth2.userinfo.get(
      function(err,resp){
        if(err){
          console.log(err)
        } else {
          console.log(resp.data)
          return res.send({info:resp.data})
        }
      }
    )
  })
})

const server = app.listen(3000)
