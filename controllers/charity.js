const Donate = require("../models/donate");
const Project = require("../models/project");
const User = require("../models/user");
const Contact = require("../models/contact");
const { validationResult } = require("express-validator");
var paypal = require('paypal-rest-sdk');

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'Abx6gUixJn7EjcWmYLBZW8hmcYxeVqDXB4aH2O8t_baUqamnryfYYqCTn4152q9BNuDAKDQEi0t_Kxt6',
  'client_secret': 'EKwpo9oIVTFpL7VxxY2CqNTGsHkPLxQL4-9aH3xYNagN3FXXAtAoVQDJDod6VJkfhwa0ciR5NScW4NRa'
});



exports.getIndex = async (req, res) => {
  let user = null;
  if (typeof req.session.user != "undefined") {
    user = await User.findById(req.session.user._id);
  }
  const project = await Project.find({})
 
  res.render("charity/index", {
    pageTitle: "Trang Chủ",
    projects: project,
    user,
    notify: null
  });
};

exports.postIndex = async (req, res) => {
  let user = null;
  if (typeof req.session.user != "undefined") {
    user = await User.findById(req.session.user._id);
  }
  const project = await Project.find({})

  const { userName, email, numberPhone, message } = req.body;
  const contact = new Contact({
    userName,
    email,
    numberPhone,
    message,
  });
  contact
    .save()
    .then((result) => {
      res.render("charity/index", {
        pageTitle: "Trang Chủ",
        projects: project,
        user,
        notify: "Gửi tin nhắn thành công. Cảm ơn bạn đã đóng góp ý kiến"
      });;
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getDetailProject = async (req, res, next) => {
  let user = null;
  let countDonateUserWait = null
  if (typeof req.session.user != "undefined") {
    user = await User.findById(req.session.user._id);
    countDonateUserWait = await Donate.find({ "user.userId": req.session.user._id, "status": false }).count()
  }
  let notify = req.flash("notify");
  if (notify.length > 0) {
    notify = notify[0];
  } else {
    notify = null;
  }
  const projectId = req.params.id;
  const project = await Project.findById(projectId);
  const donateSuccess = await Donate.find({ "project.projectId": projectId, "status": true });
  const countDonateWait = await Donate.find({ "project.projectId": projectId, "status": false }).count()
 

  const projectUpdate = await Project.findById(projectId).then((proj) => {
    proj.donate.countDonateWait = countDonateWait;
    return proj.save();
  })
  .catch((err) => {
    console.log(err)
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });

  res.render("charity/detail-project", {
    pageTitle: project.title,
    project: projectUpdate,
    donate: donateSuccess,
    user,
    notify,
    countDonateUserWait
  });
};

exports.postDetailProject = async (req, res, next) => {
  const user = await User.findById({ _id: req.session.user._id });
  const projId = req.body.projId;
  const project = await Project.findById(projId);

  const donate = new Donate({
    payments: 'ATM',
    status: false,
    bank: req.body.bank,
    tradingCode: req.body.tradingCode,
    money: req.body.money,
    user: {
      userId: user._id,
      userName: user.userName,
      email: user.email,
      numberPhone: user.numberPhone,
    },
    project: {
      projectId: projId,
      title: project.title,
    },
  });      
  donate
    .save()
    .then((result) => {
      req.flash("notify", "Quyên góp thành công");
      res.redirect(`detail-project/${req.body.projId}`);
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


exports.getDetailUser = async (req, res) => {
  let notify = req.flash("notify");
  if (notify.length > 0) {
    notify = notify[0];
  } else {
    notify = null;
  }

  const user = await User.findById(req.session.user._id);
  res.render("charity/detail-user", {
    pageTitle: "Thông tin cá nhân",
    user,
    notify,
    errorMessage: false,
    errorMessageEV: []
  });
};

exports.postDetailUser = async (req, res) => {
  const user = await User.findById(req.session.user._id);
  const {numberPhone, address} = req.body
  const image = req.file

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("charity/detail-user", {
      pageTitle: "Thông tin cá nhân",
      user,
      notify: null,
      errorMessage : false,
      errorMessageEV: errors.array(),
    });
  } else {
    
    await User.findById(req.session.user._id).then(user => {
      if(image) {
        user.image = image.path
      }
      user.numberPhone = numberPhone,
      user.address = address
      return user.save().then(result => {
        req.flash("notify", "Cập nhập thông tin thành công");
        res.redirect("detail-user");
      })
    })

    
    
  }
};

exports.getDonateUser = async (req, res) => {
  const user = await User.findById(req.session.user._id);
  const donate = await Donate.find({ 'user.userId' : req.session.user._id, 'status': true });
  res.render("charity/donate-user", {
    pageTitle: "Lịch sử quyên góp",
    user: user,
    donate: donate,
  });
};

exports.postPay = async function(req, res){
  const user = await User.findById({ _id: req.session.user._id });
  const projId = req.body.projId;
  const project = await Project.findById(projId);
  const money = req.body.money
    
  var create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": 'http://localhost:5000/pay',
        "cancel_url": `http://localhost:5000/detail-project/${projId}`
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": 'Dự án quyên góp',
                "sku": "Project",
                "price": money,
                "currency": "USD",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "USD",
            "total": money
        },
        "description": `${project.title}.`
    }]
  };

    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
          throw error;
      } else {
          console.log("Create Payment Response");
          for (let i=0; i< payment.links.length; i++)
          {
            if(payment.links[i].rel === 'approval_url') {
              res.redirect(payment.links[i].href)
            }
          }
          const token = payment.links.filter(e => e.method === 'REDIRECT').map(e => e.href)[0].split("token=")[1]
          
          const donate = new Donate({
            payments: 'Paypal',
            status: false,
            bank: '',
            tradingCode: token,
            money: (money * 23000),
            user: {
              userId: user._id,
              userName: user.userName,
              email: user.email,
              numberPhone: user.numberPhone,
            },
            project: {
              projectId: projId,
              title: project.title,
            },
          });      
          return donate.save()           
      }
    });

}
exports.getPaySuccess = async (req, res) => {

  const token = req.query.token
  const payerId = req.query.PayerID

  const paypalDonate = await Donate.findOne({'tradingCode': token}).then(donate => {
    if (!donate) {
      console.log(' Thanh toán thất bại')

      res.render("charity/pay-success", {
        pageTitle: "Thanh toán Thât bại",
        projectId: donate.project.projectId,
        message: "Thanh toán Thât bại"
      });
    }
    donate.status = true,
    donate.tradingCode = payerId
    return donate.save()
  }).catch(err => {
    console.log(err)
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  })

  const projectId = paypalDonate.project.projectId

  const donateSuccess = await Donate.find({ "project.projectId": projectId, "status": true });
  const project = await Project.findById(projectId);

  const countDonateSuccess = await Donate.find({ "project.projectId": projectId, "status": true  }).count(); // Lượt quyên góp
  const countDonateWait = await Donate.find({ "project.projectId": projectId, "status": false  }).count()

    let donateData = [];
    donateSuccess.map((x) => donateData.push({ ...x.user, money: x.money }));
    
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
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }); 

    User.findById(req.session.user._id).then(user => {
      if(user.active === false){
        user.active === true
      }
      return user.save()
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }); 

  res.render("charity/pay-success", {
    pageTitle: "Thanh toán thành công",
    projectId,
    message: "Thanh toán thành công"
  });
}