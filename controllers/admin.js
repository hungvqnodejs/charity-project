exports.dashboard = async (req, res) => {
    res.render("admin/dashboard", { pageTitle: "Dashboard"});
  };

  exports.getListUser = async (req, res) => {
    res.render("admin/list-user", { pageTitle: "Danh sách người dùng"});
  };  

  exports.getListProject = async (req, res) => {
    res.render("admin/list-project", { pageTitle: "Danh sách dự án"});
  };

  exports.getDetailUser = async (req, res) => {
    res.render("admin/detail-user", { pageTitle: "Thông tin người dùng"});
  }; 

  exports.getAddProject = async (req, res) => {
    res.render("admin/add-project", { pageTitle: "Thêm dự án"});
  }; 
 

  