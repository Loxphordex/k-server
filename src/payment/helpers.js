const ImagesServices = require('../images/images-services');

function formatUnitAmount(price) {
  // Stripe requires prices to be formatted with integers,
  // so $27.99 will have to be 2799
  const priceWithoutDecimal = String(price).replace('.', '');
  const formattedPriceString = `${priceWithoutDecimal}00`;
  const formattedPriceInt = parseInt(formattedPriceString, 10);
  return formattedPriceInt;
}

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
          unit_amount: formatUnitAmount(image.price)
        },
        quantity: item.count
      };
    }));

    return lineItems;
  }
}

module.exports = mapCartToLineItems;
