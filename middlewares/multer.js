const multer = require('multer');

const storage = multer.memoryStorage();

const multipleUpload = multer({ storage }).array('files', 5); // 'files' is the field name and 5 is the maximum number of files

module.exports = multipleUpload;