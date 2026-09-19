const slugify = require("slugify");

function makeSlug(value) {
  return slugify(String(value || ""), {
    lower: true,
    strict: true,
    locale: "fr",
    trim: true,
  });
}

module.exports = makeSlug;
