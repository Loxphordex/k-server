const ImagesServices = require('../images/images-services');

async function mapCartToLineItems(req) {
  const lineItems = [];
  req.forEach(async (item) => {
    const image = await ImagesServices.getById(req.app.get('db'), item.id);
    const itemObj = {
      price_data: {
        currency: req.currency,
        product_data: {
          name: image.name,
          images: [image.url]
        },
        unit_amount: image.price
      },
      quantity: item.count
    };

    lineItems.push(itemObj);
  });

  return lineItems;
}

module.exports = mapCartToLineItems;
