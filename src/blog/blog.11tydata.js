function isDraft(data) {
  return data.status === "draft" || data.draft === true;
}

module.exports = {
  eleventyComputed: {
    permalink: (data) => {
      if (data.page.fileSlug === "blog") return "/blog/index.html";
      return isDraft(data) ? false : `/blog/${data.page.fileSlug}/index.html`;
    },
  },
};
