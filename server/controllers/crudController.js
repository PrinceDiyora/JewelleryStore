const express = require('express');
const { ah, httpError } = require('../utils/helpers');
const { removeFile } = require('../utils/storage');

/**
 * Returns an Express Router with basic CRUD endpoints for a given Mongoose model.
 * @param {import('mongoose').Model} Model
 * @param {{ sort?: object, beforeDelete?: Function }} options
 */
function makeCrud(Model, { sort = { createdAt: -1 }, beforeDelete } = {}) {
  const r = express.Router();

  r.get('/', ah(async (req, res) => res.json(await Model.find().sort(sort))));

  r.post('/', ah(async (req, res) => res.status(201).json(await Model.create(req.body))));

  r.put(
    '/:id',
    ah(async (req, res) => {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!doc) throw httpError(404, 'Not found');
      res.json(doc);
    })
  );

  r.delete(
    '/:id',
    ah(async (req, res) => {
      const doc = await Model.findById(req.params.id);
      if (!doc) throw httpError(404, 'Not found');
      if (beforeDelete) await beforeDelete(doc);
      await doc.deleteOne();
      if (doc.image) removeFile(doc.image);
      res.json({ message: 'Deleted' });
    })
  );

  return r;
}

module.exports = makeCrud;
