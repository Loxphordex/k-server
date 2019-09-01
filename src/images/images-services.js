const ImagesServices = {
  getById(db, id) {
    return db('images')
      .select('*')
      .where('images.id', id)
      .first();
  },
  getAllImages(db) {
    return db('images')
      .select('*');
  },
  insertImage(db, image) {
    return db
      .insert(image)
      .into('images')
      .returning('*')
      .then(([ image ]) => image)
      .then(image => ImagesServices.getById(db ,image.id));
  },
};

module.exports = ImagesServices;