exports.get404 = async (req, res) => {
    res.status(404).render('404', {
        pageTitle: 'Page Not Found',
        isAuthenticated: req.session.isLoggedIn
      });
  };

  exports.get500 = async (req, res) => {
    res.status(500).render('500', {
        pageTitle: 'Internal server error',
        isAuthenticated: req.session.isLoggedIn
      });
  };