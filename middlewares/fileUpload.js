const multer = require("multer")
const { v4: uuidv4 } = require("uuid")
const path = require("path");


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads"); // ✅ Save to 'uploads' folder
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // safer than splitting by `.`
    cb(null, `${file.fieldname}-${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")|| file.mimetype.startsWith("audio")) {
    cb(null, true);
  } else {
    cb(new Error("Only image  and audio files are allowed!"), false);
  }
};
const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 5 mb optional
    fileFilter // optional
})

module.exports = {
    single: (fieldname) => upload.single(
        fieldname),
    array: (fieldname, maxCount) =>
        upload.array(
            fieldname, maxCount
        ),
    fields: (fieldsArray) => upload.fields(
        fieldsArray
    )
}