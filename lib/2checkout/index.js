const axios = require('axios')
const hmacMD5 = require('crypto-js/hmac-md5')

const merchantCode = process.env['2CHECKOUT_MERCHANT_CODE']

function hashToken(date) {
  const unhashed = merchantCode.length + merchantCode + date.length + date

  return hmacMD5(unhashed, process.env['2CHECKOUT_SECRET_KEY'])
}

function test() {
  const apiVersion = '6.0'
  const resource = 'leads'
  const date = new Date().toUTCString()
  const hash = hashToken(date)
  const host = `https://api.2checkout.com/rest/${apiVersion}${resource}/`

  const { data } = await axios.get(host, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Avangate-Authentication': `code="${merchantCode}" date="${date}" hash="${hash}"`,
    },
  })
}
