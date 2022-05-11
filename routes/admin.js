const express = require('express');

const adminController = require('../controllers/admin')
const { body } = require('express-validator/check');

const router = express.Router();

router.get('/', adminController.dashboard)
router.get('/list-user', adminController.getListUser)
router.get('/list-project', adminController.getListProject)
router.get('/detail-user/:id', adminController.getDetailUser)
router.get('/add-project', adminController.getAddProject)

router.post('/add-project',[
    body('title', " Tên dự án phải từ 3 kỳ tự trở lên")
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body('maxMoney').isFloat(),
    body('description', 'Phần mô tả phải từ 5 ký tự trở lên')
      .isLength({ min: 5})
      .trim(),
    body('content', 'Phần mô tả phải từ 5 ký tự trở lên')
      .isLength({ min: 5})
      .trim()
  ], adminController.postAddProject)
router.post('/list-project', adminController.postListProject)
router.post('/detail-user/:id', adminController.postDetailUser)


module.exports = router;