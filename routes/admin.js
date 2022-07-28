const express = require("express");

const adminController = require("../controllers/admin");
const { body, check } = require("express-validator");
const isAdmin = require("../middleware/is-admin");

const router = express.Router();

router.get("/", isAdmin, adminController.dashboard);
router.get("/list-user", isAdmin, adminController.getListUser);
router.get("/list-project", isAdmin, adminController.getListProject);
router.get("/list-project/:id", isAdmin, adminController.getDonateProject);
router.get("/detail-user/:id", isAdmin, adminController.getDetailUser);
router.get("/detail-user/:id/reset", isAdmin, adminController.getResetPassword);

router.get("/detail-user/:id/donate", isAdmin, adminController.getDonateUser);
router.get("/add-project", isAdmin, adminController.getAddProject);
router.get("/edit-project/:id", isAdmin, adminController.getEditProject);

router.post(
  "/add-project",
  isAdmin,
  [
    body("title", " Tên dự án phải từ 3 kỳ tự trở lên")
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body("maxMoney", "Số tiền không hợp lệ").isFloat(),
    body("description", "Phần mô tả phải từ 5 ký tự trở lên")
      .isLength({ min: 5 })
      .trim(),
    body("content", "Phần nội dung phải từ 5 ký tự trở lên")
      .isLength({ min: 5 })
      .trim(),
  ],
  adminController.postAddProject
);
router.post(
  "/edit-project",
  isAdmin,
  [
    body("title", " Tên dự án phải từ 3 kỳ tự trở lên")
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body("maxMoney", "Số tiền không hợp lệ").isFloat(),
    body("description", "Phần mô tả phải từ 5 ký tự trở lên")
      .isLength({ min: 5 })
      .trim(),
    body("content", "Phần nội dung phải từ 5 ký tự trở lên")
      .isLength({ min: 5 })
      .trim(),
  ],
  adminController.postEditProject
);
router.post("/list-project", isAdmin, adminController.postListProject);
router.post("/list-project/:id", isAdmin, adminController.postDonateProject);
router.post("/list-project/:id/delete", isAdmin, adminController.postDeleteDonateProject);
router.post(
  "/detail-user/:id",
  [
    body("userName", " Tên người dùng phải từ 3 kỳ tự trở lên")
      .isString()
      .isLength({ min: 3 })
      .trim(),
    check("email").isEmail().withMessage("Email không hợp lệ hãy kiểm tra lại"),
    body("numberPhone", " Số điện thoại không hợp lệ")
      .isNumeric()
      .isLength({ min: 10, max: 10 }),
  ],
  isAdmin,
  adminController.postDetailUser
);

router.post("/list-user", isAdmin, adminController.postListUser);
router.post(
  "/detail-user/:id/reset",
  isAdmin,
  adminController.postResetPassword
);

module.exports = router;
