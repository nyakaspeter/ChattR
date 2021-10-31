export const authenticate = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.status(401).end();
};
