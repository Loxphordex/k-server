const ImagesServices = {
  getById(db, id) {
    return db('images')
      .select('*')
      .where('images.id', id)
      .first();
  },
  getAllImages(db) {
    return db('images')
      .select('*')
      .orderBy('id', 'desc');
  },
  insertImage(db, image) {
    return db
      .insert(image)
      .into('images')
      .returning('*')
      .then(([image]) => image)
      .then((image) => ImagesServices.getById(db, image.id));
  },
  renameImage(db, id, newName) {
    return db('images')
      .where('images.id', id)
      .update({
        name: newName,
        thisKeyIsSkipped: undefined
      })
      .returning('*')
      .then(([image]) => image)
      .then((image) => ImagesServices.getById(db, image.id));
  },
  alterLink(db, id, newLink) {
    return db('images')
      .where('images.id', id)
      .update({
        link: newLink,
        thisKeyIsSkipped: undefined
      })
      .returning('*')
      .then(([image]) => image)
      .then((image) => ImagesServices.getById(db, image.id));
  },
  alterDescription(db, id, newDescription) {
    return db('images')
      .where('images.id', id)
      .update({
        description: newDescription,
        thisKeyIsSkipped: undefined
      })
      .returning('*')
      .then(([image]) => image)
      .then((image) => ImagesServices.getById(db, image.id));
  },
  alterType(db, id, newType) {
    return db('images')
      .where('images.id', id)
      .update({
        type: newType,
        thisKeyIsSkipped: undefined
      })
      .returning('*')
      .then(([image]) => image)
      .then((image) => ImagesServices.getById(db, image.id));
  },
  alterPrice(db, id, newPrice) {
    return db('images')
      .where('images.id', id)
      .update({
        price: newPrice,
        thisKeyIsSkipped: undefined
      })
      .returning('*')
      .then(([image]) => image)
      .then((image) => ImagesServices.getById(db, image.id));
  },
  // alterCategory(db, id, newCategory) {
  //   return db('images')
  //     .where('images.id', id)
  //     .update({
  //       category: newCategory,
  //       thisKeyIsSkipped: undefined
  //     })
  //     .returning('*')
  //     .then(([image]) => image)
  //     .then((image) => ImagesServices.getById(db, image.id));
  // },
  // alterNewArrival(db, id, newArrival) {
  //   return db('images')
  //     .where('images.id', id)
  //     .update({
  //       new_arrival: newArrival,
  //       thisKeyIsSkipped: undefined
  //     })
  //     .returning('*')
  //     .then(([image]) => image)
  //     .then((image) => ImagesServices.getById(db, image.id));
  // },
  // alterSaleEnabled(db, id, saleEnabled) {
  //   return db('images')
  //     .where('images.id', id)
  //     .update({
  //       sale_enabled: saleEnabled,
  //       thisKeyIsSkipped: undefined
  //     })
  //     .returning('*')
  //     .then(([image]) => image)
  //     .then((image) => ImagesServices.getById(db, image.id));
  // },
  // alterSalePrice(db, id, newSalePrice) {
  //   return db('images')
  //     .where('images.id', id)
  //     .update({
  //       sale_price: newSalePrice,
  //       thisKeyIsSkipped: undefined
  //     })
  //     .returning('*')
  //     .then(([image]) => image)
  //     .then((image) => ImagesServices.getById(db, image.id));
  // },
  updateSize(db, id, size, count) {
    return db('images')
      .where('images.id', id)
      .update({
        [size]: count,
        thisKeyIsSkipped: undefined
      })
      .returning('*')
      .then(([image]) => image)
      .then((image) => ImagesServices.getById(db, image.id));
  },
  deleteImage(db, id) {
    return db('images')
      .where('images.id', id)
      .del()
      .returning('*');
  }
};

module.exports = ImagesServices;
