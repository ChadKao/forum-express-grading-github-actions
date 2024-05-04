const dayjs = require('dayjs')
const relativeTime = require('dayjs/plugin/relativeTime')
require('dayjs/locale/zh-tw')

dayjs.extend(relativeTime)
dayjs.locale('zh-tw')

module.exports = {
  currentYear: () => dayjs().year(),
  ifCond: function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this)
  },
  eq: (arg1, arg2) => {
    return arg1 === arg2
  },
  relativeTimeFromNow: a => dayjs(a).fromNow()
}
