const http = {
  pageNotFound({ req, res }) {
    res.status(404).json({
      status: false,
      message: 'page not found',
    });
  },
};
module.exports = http;
