export const getUser = (req, res) => {
  return res.send(req.user);
};
