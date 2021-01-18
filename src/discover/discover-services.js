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
  },
  deleteEntry(db, id) {
    return db('discover')
      .where('discover.id', id)
      .del()
      .returning('*');
  }
};

module.exports = DiscoverServices;
