import express from 'express';
import passport from '../config/passport.js';

const router = express.Router();

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

if (process.env.NODE_ENV !== 'test') {
  router.get(
    '/google',
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      prompt: 'select_account',
    })
  );

  router.get(
    '/google/callback',
    passport.authenticate('google'),
    (req, res) => {
      res.redirect('/');
    }
  );
} else {
  router.get('/mock1', passport.authenticate('mock1'), (req, res) =>
    res.status(200).end()
  );

  router.get('/mock2', passport.authenticate('mock2'), (req, res) =>
    res.status(200).end()
  );
}

export default router;
