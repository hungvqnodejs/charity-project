const Project = require("../models/project");
const User = require("../models/user");
const Donate = require('../models/donate')
const fileHelper = require('../util/file');
const { validationResult } = require('express-validator/check');

exports.dashboard = async (req, res) => {
  res.render("admin/dashboard", { pageTitle: "Dashboard" });
};

exports.getListUser = async (req, res) => {
  const user = await User.find({});

  res.render("admin/list-user", {
    pageTitle: "Danh sách người dùng",
    users: user,
  });
};

exports.getDetailUser = async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById({ _id: userId });
  res.render("admin/detail-user", {
    pageTitle: "Thông tin người dùng",
    user: user
  });
};

exports.postDetailUser = async (req, res) => {
  const userId = req.params.id;
  try {
    const response = await User.findByIdAndUpdate(userId, req.body, {
      new: true,
    });

    res.redirect(`/admin/detail-user/${response._id}`);
  } catch (error) {
    console.log(error);
  }
};

exports.getAddProject = async (req, res) => {
  res.render("admin/add-project", { pageTitle: "Thêm dự án", errorMessage: null });
};

exports.postAddProject = async (req, res) => {
  const image = req.file;

  const { title, startTime, endTime, maxMoney, description, content } = req.body;

  const errors = validationResult(req);

  if (!image || !errors.isEmpty() ) {
    return res.status(422).render('admin/add-project', {
      pageTitle: 'Thêm dự án',
      errorMessage: 'Đây không phải hình ảnh',
      errorMessageEV: errors.array(),
    });
  }
  
  const project = new Project({
    title,
    startTime,
    endTime,
    maxMoney,
    image: image.path,
    description,
    content
  });
  project
    .save()
    .then((result) => {
      res.redirect("/admin/list-project");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getListProject = async (req, res) => {
  const project = await Project.find({});
  res.render("admin/list-project", {
    pageTitle: "Danh sách dự án",
    projects: project,
    message: null,
    styleAlert: null
  });
};

exports.postListProject = async (req, res) => {
  const { projectDeleteId , projectId } = req.body;
  const project = await Project.find({});
  
//  Delete Project 
 const donates = await Donate.find({projectId : projectDeleteId})
  try {

    if(donates.length === 0) {
     const projectDelete = await Project.findByIdAndRemove(projectDeleteId);

     const projectUpdate = await Project.find({});
     fileHelper.deleteFile(projectDelete.image);

      res.render('admin/list-project', {
        pageTitle: "Danh sách dự án",
        projects: projectUpdate,
        message:  "Xóa thành công dự án",
        styleAlert: "alert-success"
      });
      res.redirect("/admin/list-project");
    }
    else {    
      return res.status(422).render('admin/list-project', {
        pageTitle: "Danh sách dự án",
        projects: project,
        message:  "Dự án đã có người Donate không thể xóa",
        styleAlert: "alert-danger"
      });
    }
    
  } catch (error) {
    console.log(error);
  }

// Edit Project
   try {
    const editproject = await Project.findByIdAndUpdate(projectId, req.body, {
      new: true,
    });
    // if (image) {
    //   fileHelper.deleteFile(editproject.image);
    //   editproject.image = req.file.path;
    // }

    res.redirect("/admin/list-project");
  } catch (error) {
    console.log(error);
  }
};
