/**
 * Here we create an a function which return another function to let know the
 * fn argument the later value of 'req', 'res' and 'next'. In other way
 * express doesn't know the values of that arguments. And event eslint throw
 * and error
 **/
module.exports = (fn) => (req, res, next) => {
  fn(req, res, next).catch((err) => next(err))
}
