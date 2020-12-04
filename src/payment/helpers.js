const ImagesServices = require('../images/images-services');

async function mapCartToLineItems(req) {
  const lineItems = [];
  const { cart, currency } = req.body;

  if (cart) {
    await cart.forEach(async (item) => {
      const image = await ImagesServices.getById(req.app.get('db'), item.id);
      console.log('image: ', image);
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

        console.log('itemObj', itemObj);
        lineItems.push(itemObj);
      }
      else {
        console.log('No image found', item.id);
      }
    });
  }

  console.log('lineItems: ', lineItems);
  return lineItems;
}

module.exports = mapCartToLineItems;
