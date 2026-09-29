const multer = require("multer")

// Store the uploaded resume in memory as a Buffer so it can be
// parsed directly (pdf-parse) without writing to disk.
const storage = multer.memoryStorage()

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== "application/pdf") {
            return cb(new Error("Only PDF files are allowed for resume upload"))
        }
        cb(null, true)
    }
})

module.exports = { upload }
