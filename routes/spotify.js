const express = require('express');
const router = express.Router();
const SpotifyWebApi = require('spotify-web-api-node');
const handleErrorAsync = require('../service/handleErrorAsync');
const handleSuccess = require('../service/handleSuccess');

const credentials = {
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
};

router.post(
  '/login',
  handleErrorAsync(async (req, res) => {
    const code = req.body.code;
    const spotifyApi = new SpotifyWebApi(credentials);
    const data = await spotifyApi.authorizationCodeGrant(code);
    handleSuccess(res, {
      accessToken: data.body.access_token,
      refreshToken: data.body.refresh_token,
      expiresIn: data.body.expires_in,
    });
  })
);

router.post(
  '/refresh',
  handleErrorAsync(async (req, res) => {
    const refreshToken = req.body.refreshToken;
    const spotifyApi = new SpotifyWebApi(credentials);
    spotifyApi._credentials.refreshToken = refreshToken;

    // clientId, clientSecret and refreshToken has been set on the api object previous to this call.
    const data = await spotifyApi.refreshAccessToken();
    spotifyApi.setAccessToken(data.body.access_token);

    res.send({ refresh: spotifyApi });
  })
);

module.exports = router;
