const fs = require("fs");
const path = require("path");
const multer = require("multer");

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const base = path.basename(file.originalname).replace(/\s+/g, "_");
        cb(null, `${Date.now()}-${base}`);
    }
});

exports.uploadSingleFileMiddleware = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MO max
    fileFilter: (req, file, cb) => {
        if(file.mimetype !== 'application/pdf') {
            return cb(new Error('Seuls les fichiers PDF sont autorisés'));
        }
        cb(null, true);
    }
}).single("specFile"); // nom du champ attendu "spec"
