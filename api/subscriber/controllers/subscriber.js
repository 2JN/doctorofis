'use strict'
const { parseMultipartData, sanitizeEntity } = require('strapi-utils')
const { v4 } = require('uuid')

const r2co = require('../../../lib/2checkout')

module.exports = {
  async create(ctx) {
    let entity
    let data
    let files

    if (ctx.is('multipart')) {
      parsedData = parseMultipartData(ctx)
      data = parsedData.data
      files = parsedData.files
    } else {
      data = ctx.request.body
    }

    const res = await r2co({
      url: '/orders',
      method: 'POST',
      data: {
        Country: data.state.country.code,
        Currency: 'GTQ',
        CustomerIP: ctx.request.ip,
        Language: 'es',
        Source: ctx.request.hostname,
        Items: [
          {
            Code: data.productCode,
            Quantity: 1,
          },
        ],
        BillingDetails: {
          FirstName: data.firstName,
          LastName: data.lastName,
          CountryCode: 'GT',
          State: data.state.name,
          City: data.city,
          Address1: data.address,
          Zip: data.zip,
          Email: data.email,
        },
        PaymentDetails: {
          Type: 'TEST',
          Currency: 'GTQ',
          PaymentMethod: {
            EesToken: data.eesToken,
            Vendor3DSReturnURL: ctx.request.hostname,
            Vendor3DSCancelURL: ctx.request.hostname,
          },
          Type: 'TEST',
        },
      },
    }).catch((err) => {
      console.error(err)
    })

    if (!res || res.status !== 201 || res.data.Errors)
      throw strapi.errors.badRequest(
        'No se pudo completar el pago, intentalo más tarde'
      )

    data.uuid = v4()
    data.phone = [{ number: data.phone }, { number: data.phone2 }]
    data.address = [
      {
        state: data.state.id,
        country: data.state.country.id,
        address: `${data.address}, ${data.city}`,
      },
    ]

    if (files) entity = await strapi.services.subscriber.create(data, { files })
    else entity = await strapi.services.subscriber.create(data)

    return sanitizeEntity(entity, { model: strapi.models.subscriber })
  },
}
