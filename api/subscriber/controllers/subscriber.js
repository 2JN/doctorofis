'use strict'
const { parseMultipartData, sanitizeEntity } = require('strapi-utils')
const generatePassword = require('password-generator')
const { v4 } = require('uuid')

const r2co = require('../../../lib/2checkout')
const confirmSubscriberTemplate = require('../../../config/email-templates/confirm-subscriber')

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

    data.email = data.email.toLowerCase()

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
        },
      },
    }).catch((err) => {
      console.error(err)
    })

    if (!res || res.status !== 201 || res.data.Errors)
      throw strapi.errors.badRequest(
        'No se pudo completar el pago, intentalo más tarde'
      )

    const password = generatePassword(12, false)

    const user = await strapi.plugins['users-permissions'].services.user.add({
      email: data.email,
      username: data.email,
      confirmed: true,
      blocked: false,
      provider: 'local',
      role: 1,
      password,
    })

    data.users_permissions_user = user.id

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

    await strapi.plugins.email.services.email
      .sendTemplatedEmail(
        {
          to: data.email,
        },
        confirmSubscriberTemplate,
        {
          firstName: data.firstName,
          lastName: data.lastName,
          password,
        }
      )
      .catch((err) => {
        console.error(`Email confirmation error for user ${data.email}`)
        console.error(err)
      })

    return sanitizeEntity(entity, { model: strapi.models.subscriber })
  },

  async update(ctx) {
    const { id } = ctx.params

    let entity

    const [subscriber] = await strapi.services.subscriber.find({
      id,
      'users_permissions_user.id': ctx.state.user.id,
    })

    if (!subscriber) {
      return ctx.unauthorized("You can't update this entry")
    }

    if (ctx.is('multipart')) {
      const { data, files } = parseMultipartData(ctx)
      entity = await strapi.services.subscriber.update({ id }, data, {
        files,
      })
    } else {
      entity = await strapi.services.subscriber.update({ id }, ctx.request.body)
    }

    return sanitizeEntity(entity, { model: strapi.models.subscriber })
  },
}
