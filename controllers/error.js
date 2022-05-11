exports.get404 = async (req, res) => {
    res.status(404).render('404', {
        pageTitle: 'Page Not Found',
      });
  };