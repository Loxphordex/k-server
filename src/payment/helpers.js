const ImagesServices = require('../images/images-services');

async function mapCartToLineItems(req) {
  const { cart, currency } = req.body;

  if (cart && currency) {
    const lineItems = await Promise.all(cart.map(async (item) => {
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
      }
      else {
        console.log('No image found', item.id);
      }
    }));

    return lineItems;
  }
}

module.exports = mapCartToLineItems;
