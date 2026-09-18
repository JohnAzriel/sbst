const router = require("express").Router();
const mainCon = require("../controller/mainController");

router.get("/", mainCon.getHome);
router.get("/sbst-home", mainCon.getHome);
router.get("/sbst-sched", mainCon.getSched);
router.get("/sbst-about", mainCon.getAbout);
router.get("/sbst-apply", mainCon.getApply);
router.get("/courses", mainCon.getCourses);
router.get("/sbst-enroll", mainCon.getEnroll);
router.get("/sbst-admin", mainCon.getAdmin);
router.get("/sbst-user", mainCon.getUser);

// Enrollment Form
router.post("/sbst-add-enroll", mainCon.addEnroll);

module.exports = router;
