const ImagesServices = require('../images/images-services');

async function mapCartToLineItems(req) {
  const lineItems = [];
  const { cart, currency } = req.body;

  if (cart) {
    cart.forEach(async (item) => {
      console.log(item);
      const image = await ImagesServices.getById(req.app.get('db'), item.id);
      if (image) {
        const itemObj = {
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

        lineItems.push(itemObj);
      }
    });
  }

  console.log(lineItems);
  return lineItems;
}

module.exports = mapCartToLineItems;
