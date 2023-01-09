const express = require("express");
const authService = require("../services/authService");
const router = express.Router();

router.post("/login", authService.login);
router.post("/signup", authService.signup);
module.exports = router;
