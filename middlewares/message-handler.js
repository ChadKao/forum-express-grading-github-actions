module.exports = (req, res, next) => {
  res.locals.success_messages = req.flash('success_msg')[0] || req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.warning_msg = req.flash('warning_msg')
  next()
}
