exports.getIndex = async (req, res) => {
    res.render("charity/index", { pageTitle: "Trang Chủ"});
};

exports.getDetailProject = async (req, res) => {
    res.render("charity/detail-project", { pageTitle: "Dự án"});
};

exports.getDetailUser = async (req, res) => {
    res.render("charity/detail-user", { pageTitle: "Thông tin cá nhân"});
};