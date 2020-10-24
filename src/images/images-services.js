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
      .then(([ image ]) => image)
      .then(image => ImagesServices.getById(db ,image.id));
  },
  renameImage(db, id, newName) {
    return db('images')
      .where('images.id', id)
      .update({
        name: newName,
        thisKeyIsSkipped: undefined,
      })
      .returning('*')
      .then(([ image ]) => image)
      .then(image => ImagesServices.getById(db, image.id));
  },
  alterLink(db, id, newLink) {
    return db('images')
      .where('images.id', id)
      .update({
        link: newLink,
        thisKeyIsSkipped: undefined,
      })
      .returning('*')
      .then(([ image ]) => image)
      .then(image => ImagesServices.getById(db, image.id));
  },
  alterDescription(db, id, newDescription) {
    return db('images')
      .where('images.id', id)
      .update({
        description: newDescription,
        thisKeyIsSkipped: undefined,
      })
      .returning('*')
      .then(([ image ]) => image)
      .then(image => ImagesServices.getById(db, image.id));
  },
  alterType(db, id, newType) {
    return db('images')
      .where('images.id', id)
      .update({
        type: newType,
        thisKeyIsSkipped: undefined,
      })
      .returning('*')
      .then(([ image ]) => image)
      .then(image => ImagesServices.getById(db, image.id));
  },
  alterPrice(db, id, newPrice) {
    return db('images')
      .where('images.id', id)
      .update({
        price: newPrice,
        thisKeyIsSkipped: undefined,
      })
      .returning('*')
      .then(([ image ]) => image)
      .then(image => ImagesServices.getById(db, image.id));
  },
  updateSizeSmall(db, id, sizeCount) {
    return db('images')
      .where('images.id', id)
      .update({
        small: sizeCount,
        thisKeyIsSkipped: undefined,
      })
      .returning('*')
      .then(([ image ]) => image)
      .then(image => ImagesServices.getById(db, image.id));
  },
  updateSizeMedium(db, id, sizeCount) {
    return db('images')
      .where('images.id', id)
      .update({
        medium: sizeCount,
        thisKeyIsSkipped: undefined,
      })
      .returning('*')
      .then(([ image ]) => image)
      .then(image => ImagesServices.getById(db, image.id));
  },
  updateSizeLarge(db, id, sizeCount) {
    return db('images')
      .where('images.id', id)
      .update({
        large: sizeCount,
        thisKeyIsSkipped: undefined,
      })
      .returning('*')
      .then(([ image ]) => image)
      .then(image => ImagesServices.getById(db, image.id));
  },
  updateSizeXLarge(db, id, sizeCount) {
    return db('images')
      .where('images.id', id)
      .update({
        xlarge: sizeCount,
        thisKeyIsSkipped: undefined,
      })
      .returning('*')
      .then(([ image ]) => image)
      .then(image => ImagesServices.getById(db, image.id));
  },
  updateSizeXXLarge(db, id, sizeCount) {
    return db('images')
      .where('images.id', id)
      .update({
        xxlarge: sizeCount,
        thisKeyIsSkipped: undefined,
      })
      .returning('*')
      .then(([ image ]) => image)
      .then(image => ImagesServices.getById(db, image.id));
  },
  deleteImage(db, id) {
    return db('images')
      .where('images.id', id)
      .del()
      .returning('*');
  }
};

module.exports = ImagesServices;