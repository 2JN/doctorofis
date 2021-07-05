'use strict'
const r2co = require('../../../lib/2checkout')

module.exports = {
  async find(ctx) {
    const res = await r2co({
      url: '/products',
    })

    ctx.send(res.data)
  },
  async findOne(ctx) {
    ctx.send('Hello World!')
  },
}
