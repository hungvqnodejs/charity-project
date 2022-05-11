const Donate = require("../models/donate");
const Project = require("../models/project");
const User = require("../models/user");

exports.getIndex = async (req, res) => {
  const project = await Project.find({});

  res.render("charity/index", { pageTitle: "Trang Chủ", projects: project });
};

exports.getDetailProject = async (req, res) => {
  const projectId = req.params.id;
  const project = await Project.findById({ _id: projectId });
  const donate = await Donate.find({ projectId });

  let userData = [];
  donate.map((x) => userData.push({ ...x.user, money: x.money }));

  res.render("charity/detail-project", {
    pageTitle: "Dự án",
    project: project,
    users: userData,
  });
};

exports.postDetailProject = async (req, res) => {

  const user = await User.findById({ _id: "626c2c05c0701eedb174ad31" });

  const donate = new Donate({
    money: req.body.money,
    projectId: req.body.projId,
    user: {
      userId: user._id,
      userName: user.userName,
      numberPhone: user.numberPhone,
    },
  });
  donate
    .save()
    .then((result) => {
      res.redirect(`detail-project/${req.body.projId}`);
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getDetailUser = async (req, res) => {
  res.render("charity/detail-user", { pageTitle: "Thông tin cá nhân" });
};
