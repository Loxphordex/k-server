const ImagesServices = {
  getById(db, id) {
    return db
      .select('*')
      .from('images')
      .where('images.id', id)
      .first();
  },
  getAllImages(db) {
    return db
      .select('*')
      .from('images');
  },
  insertImage(db, image) {
    return db
      .insert(image)
      .into('images')
      .returning('*')
      .then(([ image ]) => image)
      .then(image => ImagesServices.getById(image.id));
  },
};

module.exports = ImagesServices;