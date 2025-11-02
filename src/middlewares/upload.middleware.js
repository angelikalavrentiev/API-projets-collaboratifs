const fs = require("fs");
const path = require("path");
const multer = require("multer");

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
// On va créer le dossier s'il n'existe pas
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// --- Stockage temporaire Multer --- //
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    // Nom d'origine du fichier "sécurisé" ( il remplace les espaces par des underscore _)
    const base = path.basename(file.originalname).replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${base}`);
  },
});


// --- Middleware de base Multer --- //
exports.uploadSingleFileMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo max
  fileFilter: (req, file, cb) => {
    // Vérifie le mimetype PDF
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Seuls les fichiers PDF sont autorisés"));
    }
    cb(null, true);
  },
}).single("specFile"); 


// --- Middleware pour renommer le fichier correctement --- //
exports.renameUploadedSpecFile = (req, res, next) => {
  try {
    const uploadedFile = req.file;
    const name = req.body.name;

    if (!uploadedFile || !name) return next();

    // Nettoyer le nom du projet pour générer le fichier PDF (ex: my-project-spec.pdf)
    const previousName = String(name)
      .trim()                           // Supprime espaces avant/après
      .toLowerCase()                     // Minuscule
      .normalize("NFD")                  // Sépare lettres et accents
      .replace(/[\u0300-\u036f]/g, "")   // Supprime accents
      .replace(/[^a-z0-9\s-]/g, "")      // Supprime caractères spéciaux
      .split(/\s+/);                     // sépare en mots

    // on prend seulement les 2 premiers mots
    const cleanName = previousName.slice(0, 2).join("-");

    // Nom final du fichier
    const specFile = `${cleanName}-${Date.now()}-spec.pdf`;

    // Renommer le fichier dans le dossier uploads
    const oldPath = path.join(UPLOAD_DIR, uploadedFile.filename);
    const newPath = path.join(UPLOAD_DIR, specFile);
    fs.renameSync(oldPath, newPath);

    // On met à jour req.file pour project controller
    req.file.filename = specFile;
    req.file.path = newPath;

    next();
  } catch (err) {
    console.error("Erreur lors du renommage du fichier :", err);
    next(err);
  }
};
