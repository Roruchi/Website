const { DateTime } = require("luxon");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const readingTime = require("eleventy-plugin-reading-time");
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

function absoluteUrl(value, siteUrl) {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized || ["undefined", "null"].includes(normalized.toLowerCase())) {
    return `${siteUrl}/assets/images/og-default.png`;
  }
  if (/^https?:\/\//i.test(normalized)) return normalized;
  return `${siteUrl}${normalized.startsWith("/") ? normalized : `/${normalized}`}`;
}

function isoDate(value) {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.valueOf()) ? undefined : date.toISOString().slice(0, 10);
}

function seoSchema(title, description, url, image, article, date, pillar, tags, site) {
  const personId = `${site.url}/#person`;
  const websiteId = `${site.url}/#website`;
  const person = {
    "@type": "Person",
    "@id": personId,
    name: site.author,
    url: site.url,
    jobTitle: "Software engineer, coach and speaker",
    sameAs: [site.linkedin, site.sessionize, site.medium, site.github],
  };
  const website = {
    "@type": "WebSite",
    "@id": websiteId,
    url: site.url,
    name: site.title,
    description: site.description,
    inLanguage: "en",
    publisher: { "@id": personId },
  };
  const page = article
    ? {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        mainEntityOfPage: { "@id": url },
        headline: title,
        description,
        image,
        datePublished: isoDate(date),
        dateModified: isoDate(date),
        articleSection: pillar,
        keywords: (Array.isArray(tags) ? tags : [])
          .filter((tag) => tag !== "post")
          .join(", "),
        inLanguage: "en",
        author: { "@id": personId },
        publisher: { "@id": personId },
        isPartOf: { "@id": websiteId },
      }
    : {
        "@type": "WebPage",
        "@id": url,
        url,
        name: title,
        description,
        inLanguage: "en",
        isPartOf: { "@id": websiteId },
        about: { "@id": personId },
      };
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [person, website, page],
  }).replace(/</g, "\\u003c");
}

module.exports = function(eleventyConfig) {
  // Plugins
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(pluginTOC, { tags: ['h2', 'h3'] });
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(readingTime);

  // Image shortcode
  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);

  // Passthrough
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/CNAME");
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
  eleventyConfig.addFilter("absoluteUrl", absoluteUrl);
  eleventyConfig.addFilter("seoSchema", seoSchema);
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
      .filter(p => p.url !== currentUrl && p.data.status !== "draft" && !p.data.draft)
      .map(p => {
        const sharedTags = (p.data.tags || []).filter(t => safeTags.includes(t));
        return { post: p, score: sharedTags.length };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ post }) => post);
  });

  eleventyConfig.addFilter("publicTalksBySlugs", (talks, slugs) => {
    const wanted = new Set(Array.isArray(slugs) ? slugs : []);
    return (Array.isArray(talks) ? talks : []).filter((talk) => wanted.has(talk.slug));
  });

  eleventyConfig.addFilter("postsBySlugs", (posts, slugs) => {
    const wanted = new Set(Array.isArray(slugs) ? slugs : []);
    return (Array.isArray(posts) ? posts : []).filter((post) =>
      wanted.has(post.data.slug || post.fileSlug),
    );
  });

  // New content uses status; draft remains supported for imported legacy posts.
  const isLive = (item) => item.data.status !== "draft" && !item.data.draft;

  eleventyConfig.addCollection("post", (api) =>
    api.getFilteredByTag("post").filter(isLive)
  );
  eleventyConfig.addCollection("training", (api) =>
    api.getFilteredByTag("training").filter(isLive)
  );

  eleventyConfig.addGlobalData("interactions", {
    apiUrl: process.env.INTERACTIONS_API_URL || "",
  });

  const repo = process.env.GITHUB_REPOSITORY;
  const pathPrefix = repo ? `/${repo.split('/')[1]}/` : '/';

  return {
    pathPrefix,
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
    },
  };
};
