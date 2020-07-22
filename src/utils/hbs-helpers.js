const hbs = require("hbs");

hbs.registerHelper("loud", (val) => {
  return val.toUpperCase();
});

hbs.registerHelper("isnt", (a, b, opts) => {
  if (a != b) {
    return opts.fn(this);
  } else {
    return opts.inverse(this);
  }
});

hbs.registerHelper("ifstreq", (str1, str2, opts) => {
  return str1 == str2 ? opts.fn(this) : opts.inverse(this);
});
