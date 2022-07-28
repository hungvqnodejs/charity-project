module.exports = (req, res, next) => {

    const url = req.headers.referer.split("0/")[1]
    if (!req.session.isLoggedIn) {
        return res.redirect('/login?histoty='+ url);
  
    }
    next();
}