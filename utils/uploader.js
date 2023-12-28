const multer = require('multer');
const path = require('path');
const mkdirp = require('mkdirp')
const moment = require("moment");
const uploader = {};

uploader.single = (fieldName = 'file') => {
  const uploadPath = `uploads/${moment().format("YYYYMMDD")}/`;
  let fileName = '';
  const oldMask = process.umask(0);
  mkdirp(uploadPath, '0777', function (err) {
    process.umask(oldMask);
    if (err) {

    }
  });

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      fileName = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
      cb(null, fileName);
    },
    fileFilter: function (req, file, cb) {

    }
  });

  // Treat posted file
  return multer({storage: storage}).fields([
    {name: fieldName, maxCount: 1,},
  ]);
}

module.exports = uploader;