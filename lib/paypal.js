const axios = require('axios')

const BASE_URL = process.env.PAYPAL_API_URL
let access_token

async function auth() {
  const res = await axios.post(
    BASE_URL + '/oauth2/token',
    'grant_type=client_credentials',
    {
      auth: {
        username: process.env.PAYPAL_CLIENT_ID,
        password: process.env.PAYPAL_SECRET,
      },
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  )

  access_token = res.data.access_token
  setTimeout(auth, res.data.expires_in)
}

function request({ url, headers = {}, ...rest }) {
  return axios({
    url: BASE_URL + url,
    timeout: 15000,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
      ...headers,
    },
    ...rest,
  })
}

module.exports = {
  auth,
  request,
}
