const dayjs = require('dayjs')
module.exports = {
  currentYear: () => dayjs().year(),
  ifCond: function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this)
  },
  eq: (arg1, arg2) => {
    return arg1 === arg2
  }
}
