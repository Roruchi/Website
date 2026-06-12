module.exports = {
  eleventyComputed: {
    permalink: (data) =>
      data.localDashboard.enabled ? "/dashboard/index.html" : false,
  },
};
