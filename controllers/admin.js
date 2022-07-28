const Project = require("../models/project");
const User = require("../models/user");
const Donate = require("../models/donate");
const fileHelper = require("../util/file");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");;
const newPassword = require("../util/newPassword");
const authEmail = require('../util/authEmail')

var transporter = nodemailer.createTransport(authEmail);


exports.dashboard = async (req, res) => {
  const countProject = await Project.find().count()
  const countDonate = await Donate.find().count()
  const countDonateSuccess = await Donate.find({ "status": true  }).count();
  const countDonateWait = await Donate.find({ "status": false  }).count()
  const totalDonate = await Donate.aggregate([
    { $match: { 'status': true }},
    { $group: { _id: "$status", total:{$sum:'$money'}}},
  ])

  const countUser = await User.find({'decentralization': 'USER'}).count()
  res.render("admin/dashboard", { pageTitle: "Bảng điều khiển", path: "/", countProject, countDonate, countDonateSuccess, countDonateWait, totalDonate, countUser });
};

exports.getListUser = async (req, res) => {
  const user = await User.find({});

  res.render("admin/list-user", {
    pageTitle: "Danh sách người dùng",
    path: "/list-user",
    users: user,
    message: null,
    styleAlert: null,
  });
};

exports.postListUser = async (req, res, next) => {
  const users = await User.find({});
  const userDeleteId = req.body.userDeleteId;
  const user = await User.findById(userDeleteId);
  const donates = await Donate.find({ "user.userId": userDeleteId });

  try {
    if (donates.length === 0 && user.decentralization !== "ADMIN") {
      await User.findByIdAndRemove(userDeleteId);
      const usersUpdate = await User.find();
      res.render("admin/list-user", {
        pageTitle: "Danh sách người dùng",
        path: "/list-user",
        users: usersUpdate,
        message: "Xóa thành công người dùng",
        styleAlert: "alert-success",
      });
    } else if (donates.length > 0) {
      const usersUpdate2 = await User.find({});

      return res.status(422).render("admin/list-user", {
        pageTitle: "Danh sách người dùng",
        path: "/list-user",
        users: usersUpdate2,
        message:
          "Người dùng đã quyên góp không thể xóa",
        styleAlert: "alert-danger",
      });
    } else {
      return res.status(422).render("admin/list-user", {
        pageTitle: "Danh sách người dùng",
        path: "/list-user",
        users: users,
        message: "Không thể xóa Admin",
        styleAlert: "alert-danger",
      });
    }
  } catch (err) {
    console.log(err)
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getResetPassword = async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId);

  res.render("admin/reset-password", {
    pageTitle: "Thông tin người dùng",
    path: "/reset",
    user: user,
  });
};

exports.postResetPassword = async (req, res) => {
  const password = newPassword(8);
  User.findOne({ email: req.body.email })
    .then((user) => {
      return bcrypt.hash(password, 12).then((hashPassword) => {
        user.password = hashPassword;
        return user.save();
      });
    })
    .then((result) => {
      console.log("Mật khẩu mới:", password);
      transporter.sendMail({
        to: req.body.email,
        from: "charity.nodejs@gmail.com",
        subject: "Mật khẩu mới ",
        html: `<p>Mật khẩu mới của bạn là ${password}"></p>`,
      });
      res.redirect(`/admin/detail-user/${result._id}`);
    })
    .catch((err) => {
      console.log(err)
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);;
    });
};

exports.getDonateUser = async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId);
  const donate = await Donate.find({'user.userId': userId, 'status': true}) 

  res.render("admin/donate-user", {
    pageTitle: "Thông tin người dùng",
    path: "/donate",
    user,
    donate
  });
};

exports.getDetailUser = async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId);
 
  res.render("admin/detail-user", {
    pageTitle: "Thông tin người dùng",
    path: "/detail-user",
    user: user,
  });
};

exports.postDetailUser = async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId);
  const errors = validationResult(req);

  try {
    if (!errors.isEmpty()) {
      return res.status(422).render("admin/detail-user", {
        pageTitle: "Thông tin người dùng",
        path: "/detail-user",
        styleAlert: "alert-danger",
        user,
        errorMessageEV: errors.array(),
      });
    }
    const response = await User.findByIdAndUpdate(userId, req.body, {
      new: true,
    });
    res.redirect(`/admin/detail-user/${response._id}`);
  } catch (err) {
    console.log(err)
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);;
  }
};

exports.getAddProject = async (req, res) => {
  res.render("admin/add-project", {
    pageTitle: "Thêm dự án",
    path: "/add-project",
    editing: false,
    errorMessage: null,
    errorMessageEV: []
  });
};


exports.postAddProject = async (req, res) => {
  const image = req.file;
  const { title, startTime, endTime, maxMoney, numberBank, nameBank, userBank, description, content } =
    req.body;

  const errors = validationResult(req);

  if (!image) {
    return res.status(422).render("admin/add-project", {
      pageTitle: "Thêm dự án",
      path: "/add-project",
      editing: false,
      errorMessage: "Đây không phải hình ảnh",
      errorMessageEV: []
    });
  }

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/add-project", {
      pageTitle: "Thêm dự án",
      path: "/add-project",
      editing: false,
      errorMessageEV: errors.array(),
      errorMessage: null,
    });
  }

  const project = new Project({
    title,
    startTime,
    endTime,
    maxMoney,
    image: image.path,
    numberBank,
    nameBank,
    userBank,
    description,
    content,
    donate: {
      totalDonate: 0,
      totalMoney: 0,
      percentageDonate: 0,
      countDonateWait: 0
    },
  });
  project
    .save()
    .then((result) => {
      res.redirect("/admin/list-project");
    })
    .catch((err) => {
      console.log(err)
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);;
    });
};

exports.getEditProject = async (req, res) => {
  const projectId = req.params.id;

  Project.findById(projectId).then((proj) => {

    res.render("admin/add-project", {
      pageTitle: "Cập nhật dự án",
      path: "/edit-project",
      editing: true,
      project: proj,
      errorMessage: null,
      errorMessageEV: []
    });
  }).catch(err => {
    console.log(err)
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.postEditProject = async (req, res) => {
  const {projectId, title, startTime, endTime, maxMoney, numberBank, nameBank, userBank, description, content } = req.body;
  const image = req.file;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/add-project", {
      pageTitle: "Cập nhật dự án",
      path: "/edit-project",
      editing: true,
      project: {
        title,
        startTime, 
        endTime,
        maxMoney, 
        numberBank,
        nameBank,
        userBank,
        description, 
        content,
        _id: projectId
      },
      errorMessage: null,
      errorMessageEV: errors.array(),
    });
  }
  Project.findById(projectId).then(project => {
    project.title = title,
    project.endTime = endTime,
    project.maxMoney = maxMoney,
    project.description = description,
    project.content = content
    if(image){
      fileHelper.deleteFile(project.image);
      project.image = image.path;
    }
    return project.save().then(result => {
    res.redirect('/admin/list-project');
    })
  }).catch(err => {
    console.log(err)
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
}

exports.getListProject = async (req, res) => {
  const project = await Project.find({});
  
  res.render("admin/list-project", {
    pageTitle: "Danh sách dự án",
    path: "/list-project",
    projects: project,
    message: null,
    styleAlert: null,
  });
};

exports.postListProject = async (req, res) => {
  const { projectDeleteId, projectId } = req.body;
  const project = await Project.find({});

  //  Delete Project
  const donates = await Donate.find({ "project.projectId": projectDeleteId });

  try {
    if (donates.length === 0) {
      const projectDelete = await Project.findByIdAndRemove(projectDeleteId);
      fileHelper.deleteFile(projectDelete.image);
      const projectUpdate = await Project.find({});
      return res.render("admin/list-project", {
        pageTitle: "Danh sách dự án",
        path: "/list-project",
        projects: projectUpdate,
        message: "Xóa thành công dự án",
        styleAlert: "alert-success",
      });
    }
    return res.status(422).render("admin/list-project", {
      pageTitle: "Danh sách dự án",
      path: "/list-project",
      projects: project,
      message: "Dự án đã có người quyên góp không thể xóa",
      styleAlert: "alert-danger",
    });
  } catch (err) {
    console.log(err)
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);;
  }
};

exports.getDonateProject = async (req, res) => {
  const projectId = req.params.id;
  const donate = await Donate.find({ "project.projectId": projectId });
  const countDonateSuccess = await Donate.find({ "project.projectId": projectId, "status": true  }).count(); // Lượt quyên góp
  const countDonateWait = await Donate.find({ "project.projectId": projectId, "status": false  }).count()

  res.render("admin/donate-project", {
    pageTitle: "Danh sách quyên góp",
    path: "/list-project",
    donate,
    projectId,
    notify: null,
    countDonateSuccess,
    countDonateWait
  });
};

exports.postDonateProject = async (req, res) => {
  const projectId = req.params.id;

  try {
    await Donate.findById(req.body.donateId).then(donate => {
      donate.status = true
      return donate.save()
    }).then(result => {
        User.findById(result.user.userId).then(user => {
          user.active = true
          return user.save()
        })
    }).catch(err => console.log(err))
    const donate = await Donate.find({ "project.projectId": projectId });
    const donateSuccess = await Donate.find({ "project.projectId": projectId, "status": true });
    const project = await Project.findById(projectId);
 
    const countDonateSuccess = await Donate.find({ "project.projectId": projectId, "status": true  }).count(); // Lượt quyên góp
    const countDonateWait = await Donate.find({ "project.projectId": projectId, "status": false  }).count()
  
      // Danh sách nhà hảo tâm
      let donateData = [];
      donateSuccess.map((x) => donateData.push({ ...x.user, money: x.money }));
      
      // Tính số tiền quyên góp
    
      let totalMoney = 0;
      for (let i = 0; i < donateData.length; i++) {
        totalMoney += donateData[i].money;
      }
      const percentageDonate = ((totalMoney / project.maxMoney) * 100).toFixed(1); // Tỷ lệ phần trăm quyên góp dự án

      Project.findById(projectId)
      .then((proj) => {
        proj.donate.totalDonate = countDonateSuccess,
        proj.donate.totalMoney = totalMoney,
        proj.donate.percentageDonate = percentageDonate,
        proj.donate.countDonateWait = countDonateWait;
        return proj.save();
      })
      .catch((err) => {
        console.log(err)
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);;
      }); 
    res.render("admin/donate-project", {
      pageTitle: "Danh sách quyên góp",
      path: "/list-project",
      donate,
      projectId,
      notify: 'Cập nhật lần quyên góp thành công',
      countDonateSuccess,
      countDonateWait
    });
   } catch (err) {
    console.log(err)
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
   } 
};

exports.postDeleteDonateProject = async (req, res) => {

  const projectId = req.params.id;

  try {
    await Donate.findByIdAndDelete(req.body.donateId)
    const donate = await Donate.find({ "project.projectId": projectId });
    const donateSuccess = await Donate.find({ "project.projectId": projectId, "status": true });
    const project = await Project.findById(projectId);
 
    const countDonateSuccess = await Donate.find({ "project.projectId": projectId, "status": true  }).count(); // Lượt quyên góp
    const countDonateWait = await Donate.find({ "project.projectId": projectId, "status": false  }).count()
  
      // Danh sách nhà hảo tâm
      let donateData = [];
      donateSuccess.map((x) => donateData.push({ ...x.user, money: x.money }));  
      // Tính số tiền quyên góp
      let totalMoney = 0;
      for (let i = 0; i < donateData.length; i++) {
        totalMoney += donateData[i].money;
      }
      const percentageDonate = ((totalMoney / project.maxMoney) * 100).toFixed(1); // Tỷ lệ phần trăm quyên góp dự án

      Project.findById(projectId)
      .then((proj) => {
        proj.donate.totalDonate = countDonateSuccess,
        proj.donate.totalMoney = totalMoney,
        proj.donate.percentageDonate = percentageDonate,
        proj.donate.countDonateWait = countDonateWait;
        return proj.save();
      })  
    
      res.render("admin/donate-project", {
       pageTitle: "Danh sách quyên góp",
        path: "/list-project",
        donate,
        projectId,
        notify: ' Xóa lân quyên góp thành công',
        countDonateSuccess,
        countDonateWait
      })

   } catch (err) {
    console.log(err)
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
   } 
};
