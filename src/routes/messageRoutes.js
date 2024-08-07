const express = require("express");
const messageController = require("../controllers/messageController");
const {
  isAuthenticated,
  isMember,
  isAdmin,
} = require("../middlewares/auth");


const router = express.Router();

router.get("/create", isAuthenticated, messageController.getCreateMessage);

router.post("/", isAuthenticated, messageController.createMessage);

router.get("/", messageController.getHomePage);

router.delete("/:id", isAdmin, messageController.deleteMessage);

module.exports = router;
