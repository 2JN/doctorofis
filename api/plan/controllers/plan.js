'use strict'
const paypal = require('../../../lib/paypal')
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async paypalSync(ctx) {
    const {
      data: { plans },
    } = await paypal.request({
      url: '/billing/plans',
      headers: {
        Prefer: 'return=representation',
      },
    })

    await Promise.all(
      plans.map((plan) => {
        if (plan.status !== 'ACTIVE')
          return strapi.services.plan.update(
            { paypalID: plan.id },
            {
              name: plan.name,
              cost: Number.parseFloat(
                plan.billing_cycles[1].pricing_scheme.fixed_price
              ).toFixed(2),
            }
          )
      })
    ).catch((err) => console.error(err))
  },
}
