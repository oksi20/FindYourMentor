const logger = console;

export default (err, req, res, next) => {
  logger.error(err);
  res.status(500).render('error');
};
