'use strict'
const { v4 } = require('uuid')
const r2co = require('../../../lib/2checkout')

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
  lifecycles: {
    beforeCreate: async (data) => {
      const res = await r2co({
        url: '/orders',
        method: 'POST',
        data: {
          Country: 'GT',
          Currency: 'GTQ',
          CustomerIP: '10.10.10.10', //Shopper IP
          Language: 'es',
          Source: 'website host',
          Items: [
            {
              Code: 'UEZ4SB85SD',
              Quantity: 1,
            },
          ],
          BillingDetails: {
            FirstName: 'Customer First Name',
            LastName: 'Customer Last Name',
            CountryCode: 'US',
            State: 'California',
            City: 'San Francisco',
            Address1: 'Example Street',
            Zip: '90210',
            Email: 'example@email.com',
          },
          PaymentDetails: {
            Type: 'TEST',
            Currency: 'GTQ',
            PaymentMethod: {
              EesToken: data.eesToken,
              Vendor3DSReturnURL: 'www.site.com',
              Vendor3DSCancelURL: 'www.site.com',
            },
            Type: 'TEST',
          },
        },
      })

      console.log(res)

      throw strapi.errors.badRequest(
        'Some message you want to show in the admin UI'
      )
      data.uuid = v4()
    },
  },
}
