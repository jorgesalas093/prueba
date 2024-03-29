const Rider = require("../models/Rider.model");
const Comment = require("../models/Comment.model");
const User = require('../models/User.model');

module.exports.list = function (req, res, next) {
  const query = {};

  query.legend = !!req.query.legend;

  if (req.query.search) {
    const regex = new RegExp(req.query.search, "i");

    query.name = { $regex: regex };
  }

  Rider.find(query)
    .populate('likes')
    .then((riders) => {
      res.render("riders/list", { riders, isLegendView: riders[0]?.legend })
    })
    .catch((error) => next(error));
};

module.exports.details = function (req, res, next) {
  const { id } = req.params;

  Rider.findById(id)
    .populate({
      path: "comments",
      populate: {
        path: "user",
      },
    })
    .then((rider) => {
      if (rider) {

        res.render("riders/details", { rider });
      } else {
        res.redirect("/riders");
      }
    })
    .catch(next);
};

//aqui get
module.exports.create = (req, res, next) => {

  const { id } = req.params;
  Rider.findById(id)
    .then(() => {
      const flagEnumValues = Rider.schema.path('flag').enumValues;
      console.log(flagEnumValues);
      res.render("riders/form", { flagEnumValues })
    })
    .catch((error) => next(error));

};

//aqui post
module.exports.doCreate = function (req, res, next) {
  console.log("esto lleva la req", req);
  // Si existe un archivo en la solicitud, es la imagen principal
  if (req.files.image) {
    console.log("Este es el path de la imagen", req.files.image[0].path)
    req.body.image = req.files.image[0].path;
    console.log("imagen principal", req.file)
  }
  // Si existen archivos en la solicitud con el campo 'gallery', son las imágenes de la galería
  if (req.files.gallery) {
    console.log("Files -> ", req.files)
    req.body.gallery = req.files.gallery.map(file => file.path);
    console.log("galeriaaa", req.files.gallery)
  }
  Rider.create(req.body)
    .then((riderDB) => {

      res.redirect(`/riders/${riderDB.id}`);
    })
    .catch((err) => {
      // Comprobar err instanceof mongoose.ValidationError
      next(err);
    });
};

module.exports.update = (req, res, next) => {
  const { id } = req.params;
  Rider.findById(id)
    .then((rider) => {
      const flagEnumValues = Rider.schema.path('flag').enumValues;
      console.log(flagEnumValues);
      res.render("riders/form", { rider, flagEnumValues })
    }) // meter un condicional de errores
    .catch((error) => next(error));
};
//REVISAR QUE DA FALLO EN EL UPDATE SI NO PASAS FOTOS
module.exports.doUpdate = function (req, res, next) {
  const { id } = req.params;
  const updates = { ...req.body };

  if (req.files.image) {
    updates.image = req.files.image[0].path;
  }

  if (req.files.gallery) {
    updates.gallery = req.files.gallery.map(galery => galery.path);
  }

  Rider.findByIdAndUpdate(id, updates, { new: true })
    .then((riderDB) => res.redirect(`/riders/${riderDB.id}`))
    .catch((err) => {
      next(err);
    });
};

module.exports.delete = (req, res, next) => {
  const { id } = req.params;
  Rider.findByIdAndDelete(id)
    .then((rider) => res.redirect("/riders"))
    .catch((error) => next(error));
};


module.exports.gallery = (req, res, next) => {
  const { id } = req.params;
  console.log("que es lo que recibo ", id)
  Rider.findById(id)
    .then((rider) => {
      console.log("este es mi rider", rider)
      const arrGallery = rider.gallery;
      res.render('riders/gallery', { arrGallery, rider });
    })
    .catch((err) => {
      next(err)
    })
};