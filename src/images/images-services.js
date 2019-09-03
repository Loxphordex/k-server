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
};

module.exports = ImagesServices;