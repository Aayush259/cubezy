/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://cubezy.in",
  generateRobotsTxt: true,
  sitemapSize: 5000,
  exclude: ["/chat", "/api/*"],
  changefreq: "weekly",
  priority: 0.7,
}
