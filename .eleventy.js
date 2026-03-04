const { DateTime } = require("luxon");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const readingTime = require("eleventy-plugin-reading-time");
const pluginSitemap = require("@quasibit/eleventy-plugin-sitemap");
const pluginTOC = require("eleventy-plugin-toc");
const Image = require("@11ty/eleventy-img");
const path = require("path");

async function imageShortcode(src, alt, sizes = "100vw") {
  // Handle both local and remote images
  let imgSrc = src;
  if (!src.startsWith("http") && !src.startsWith("/")) {
    imgSrc = path.join("src", src);
  } else if (src.startsWith("/")) {
    imgSrc = path.join("src", src);
  }

  let metadata = await Image(imgSrc, {
    widths: [400, 800, 1200],
    formats: ["avif", "webp", "jpeg"],
    outputDir: "./_site/assets/images/",
    urlPath: "/assets/images/",
  });

  let imageAttributes = {
    alt,
    sizes,
    loading: "lazy",
    decoding: "async",
  };

  return Image.generateHTML(metadata, imageAttributes);
}

module.exports = function(eleventyConfig) {
  // Plugins
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(pluginTOC, { tags: ['h2', 'h3'] });
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(readingTime);
  eleventyConfig.addPlugin(pluginSitemap, {
    sitemap: {
      hostname: "https://example.com",
    },
  });

  // Image shortcode
  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);

  // Passthrough
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy({
    "node_modules/prismjs/themes/prism-tomorrow.css": "assets/prism-tomorrow.css"
  });

  // Filters
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("dd LLL yyyy");
  });
  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd");
  });
  eleventyConfig.addFilter("head", (array, n) => {
    if (!Array.isArray(array) || array.length === 0) return [];
    if (n < 0) return array.slice(n);
    return array.slice(0, n);
  });

  // relatedPosts filter — finds posts sharing tags with the current post.
  // Usage in templates: collections.post | relatedPosts(page.url, tags, 3)
  eleventyConfig.addFilter("relatedPosts", function(allPosts, currentUrl, currentTags, limit = 3) {
    const safeTags = (Array.isArray(currentTags) ? currentTags : []).filter(t => t !== "post");
    return allPosts
      .filter(p => p.url !== currentUrl && !p.data.draft)
      .map(p => {
        const sharedTags = (p.data.tags || []).filter(t => safeTags.includes(t));
        return { post: p, score: sharedTags.length };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ post }) => post);
  });

  // Draft filtering — exclude items with draft: true from collections.
  // Set draft: true in a post's frontmatter to hide it from production builds.
  const isLive = (item) => !item.data.draft;

  eleventyConfig.addCollection("post", (api) =>
    api.getFilteredByTag("post").filter(isLive)
  );
  eleventyConfig.addCollection("talk", (api) =>
    api.getFilteredByTag("talk").filter(isLive)
  );
  eleventyConfig.addCollection("training", (api) =>
    api.getFilteredByTag("training").filter(isLive)
  );

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
    },
  };
};
