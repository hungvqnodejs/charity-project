const User = require("../models/user");

module.exports = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    if(typeof (req.session.user) != 'undefined'){
        User.findById(req.session.user._id)
     if (req.session.user.decentralization !== "ADMIN") {
         return res.redirect('/');
     }
    }
    
    next();
}