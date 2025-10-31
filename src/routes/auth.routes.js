const {Router} = require("express");
const { login, verifyToken, logout } = require("../controllers/auth.controller");

const router = Router();

router.post("/auth/login", login);
router.get("/auth/verifyToken", verifyToken);
router.post("/auth/logout", logout);

module.exports = router;