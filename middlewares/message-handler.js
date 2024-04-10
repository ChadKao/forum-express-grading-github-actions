module.exports = (req, res, next) => {
  const successMessages = req.flash('success_msg')[0]

  res.locals.success_messages = successMessages || req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.warning_msg = req.flash('warning_msg')
  next()
}
