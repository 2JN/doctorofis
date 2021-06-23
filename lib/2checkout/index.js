const axios = require('axios')
const hmacMD5 = require('crypto-js/hmac-md5')
const formatDate = require('date-fns/format')

const merchantCode = process.env['2CHECKOUT_MERCHANT_CODE']

function hashToken(date) {
  const unhashed = merchantCode.length + merchantCode + date.length + date

  return hmacMD5(unhashed, process.env['2CHECKOUT_SECRET_KEY'])
}

module.exports = function request({ url, ...rest }) {
  const apiVersion = '6.0'

  const now = new Date()
  const date = formatDate(
    new Date(now.toISOString().slice(0, -1)),
    'yyyy-MM-dd HH:mm:ss'
  )
  const hash = hashToken(date)
  const baseURL = `https://api.2checkout.com/rest/${apiVersion}`

  return axios({
    url: baseURL + url,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Avangate-Authentication': `code="${merchantCode}" date="${date}" hash="${hash}"`,
    },
    ...rest,
  })
}
