const DiscoverServices = {
  getById(db, id) {
    return db('discover')
      .select('*')
      .where('discover.id', id)
      .first();
  },
  getAllEntries(db) {
    return db('discover')
      .select('*')
      .orderBy('id', 'desc');
  },
  postEntry(db, entry) {
    return db('discover')
      .insert(entry)
      .into('discover')
      .returning('*')
      .then(([newEntry]) => newEntry)
      .then((newEntry) => DiscoverServices.getById(db, newEntry.id));
  }
};

module.exports = DiscoverServices;
