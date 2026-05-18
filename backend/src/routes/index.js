const express = require("express");

const { register, login } = require("../controllers/authController");
const { getMe, listUsers, updateUser, deleteUser } = require("../controllers/userController");
const { createItem, listItems, updateItem, deleteItem } = require("../controllers/itemController");
const { listPersons, createPerson, updatePerson, deletePerson } = require("../controllers/personController");
const { createActivity, getActivities, updateActivity, updateActivityStatus, deleteActivity } = require("../controllers/activityController");
const { listPricings, createPricing, updatePricing, deletePricing } = require("../controllers/pricingController");
const { getActivityReport, exportExcel, exportPDF } = require("../controllers/reportController");
const { getConfig, updateConfig } = require("../controllers/configController");
const { auth } = require("../middlewares/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", auth, getMe);
router.get("/users", auth, listUsers);
router.put("/users/:id", auth, updateUser);
router.delete("/users/:id", auth, deleteUser);

router.get("/items", auth, listItems);
router.post("/items", auth, createItem);
router.put("/items/:id", auth, updateItem);
router.delete("/items/:id", auth, deleteItem);

router.get("/persons", auth, listPersons);
router.post("/persons", auth, createPerson);
router.put("/persons/:id", auth, updatePerson);
router.delete("/persons/:id", auth, deletePerson);

router.get("/activities", auth, getActivities);
router.post("/activities", auth, createActivity);
router.put("/activities/:id", auth, updateActivity);
router.patch("/activities/:id/status", auth, updateActivityStatus);
router.delete("/activities/:id", auth, deleteActivity);

router.get("/pricings", auth, listPricings);
router.post("/pricings", auth, createPricing);
router.put("/pricings/:id", auth, updatePricing);
router.delete("/pricings/:id", auth, deletePricing);

router.get("/report/activities", auth, getActivityReport);
router.get("/export/excel", auth, exportExcel);
router.get("/export/pdf", auth, exportPDF);

router.get("/config", getConfig);
router.put("/config", auth, updateConfig);

module.exports = router;
