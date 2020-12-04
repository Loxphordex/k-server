const ImagesServices = require('../images/images-services');

async function mapCartToLineItems(req) {
  const { cart, currency } = req.body;

  if (cart && currency) {
    const lineItems = await Promise.all(cart.map(async (item) => {
      const image = await ImagesServices.getById(req.app.get('db'), item.id);
      return {
        price_data: {
          currency,
          product_data: {
            name: image.name,
            images: [image.url]
          },
          unit_amount: image.price
        },
        quantity: item.count
      };
    }));

    return lineItems;
  }
}

module.exports = mapCartToLineItems;
