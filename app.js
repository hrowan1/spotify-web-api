const express = require('express')
const request = require('request')
const cors = require('cors')
const querystring = require('querystring')
const session = require('express-session')
const app = express()
const SpotifyWebApi = require('spotify-web-api-node')
const { nextTick } = require('process')
const port = process.env.PORT || 3000

var client_id =  // Your client id
var client_secret =  // Your secret
var redirect_uri =  // Your redirect uri


app.use(session({
    secret: 'spotiSecret',
    resave: true,
    saveUninitialized: true,
}))

app.use(express.static(__dirname+'/public'))
app.use(cors())

var spotifyApi = new SpotifyWebApi({
    clientId: client_id,
    clientSecret: client_secret,
    redirectUri: redirect_uri
})

var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

app.listen(port, () => console.log(`Listening on port ${port}`))


app.get('/getTracks', async function(req, res) {
    let token = req.session.access
    if(!token) {
        res.send({
            topTracks: {error: 'No tracks'},
            recentTracks: {error: 'No tracks'}
        })
    }
    else {
        spotifyApi.setAccessToken(token)

        let tracks = {
            topTracks: await getTopTracks(),
            recentTracks: await getRecentTracks(),
        }
        res.send(tracks)
    }
})

app.get('/login', function(req, res) {
    var state = generateRandomString(16)
    var scope = 'user-read-private user-read-email user-top-read user-read-recently-played'

    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }))
})

app.get('/callback', function(req, res) {

    var code = req.query.code || null
    var state = req.query.state || null

    if (state === null) {
        res.redirect('/#' + querystring.stringify({
            error: 'state_mismatch'
        }))
    } else {
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
            },
            json: true
        }
        request.post(authOptions, async function(error,response,body) {
            if(!error && response.statusCode === 200) {
                req.session.access = body.access_token
                res.redirect('/trackpage.html')
            }
            else {
                res.redirect('/#' +
                querystring.stringify({
                    error: 'invalid_token'
                }));
            }
        })
    }
})

async function getRecentTracks() {
    let recentTracks = []
    let data = await spotifyApi.getMyRecentlyPlayedTracks({
        limit: 10
    })
    for(let i in data.body.items) {
        recentTracks.push(data.body.items[i].track.name)
    }
    return recentTracks
}

async function getTopTracks() {
    let topTracks = []
    let data = await spotifyApi.getMyTopTracks({
        limit: 20,
        time_range: 'short_term'
    })
    for(let i in data.body.items) {
        topTracks.push(data.body.items[i].name)
    }
    return topTracks
}