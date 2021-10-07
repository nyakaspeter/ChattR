export const authenticate = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).end();
};
