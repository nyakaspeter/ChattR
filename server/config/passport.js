import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
// eslint-disable-next-line node/no-unpublished-import
import MockStrategy from 'passport-mock-strategy';
import User from '../models/user.js';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(null, user);
  }).lean();
});

if (process.env.NODE_ENV !== 'test') {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
        proxy: true,
      },
      (accessToken, refreshToken, profile, done) => {
        User.findOneAndUpdate(
          {
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0]?.value,
            picture: profile.photos[0]?.value,
          },
          {},
          { new: true, upsert: true },
          (err, user) => {
            return done(err, user);
          }
        );
      }
    )
  );
} else {
  const getMockStrategy = name =>
    new MockStrategy(
      {
        name: name,
        user: {
          googleId: (+new Date()).toString(),
          name: name,
          email: `${name}@example.com`,
          picture: '',
        },
      },
      (user, done) => {
        User.findOneAndUpdate(
          user,
          {},
          { new: true, upsert: true },
          (err, user) => {
            return done(err, user);
          }
        );
      }
    );

  passport.use(getMockStrategy('mock1'));
  passport.use(getMockStrategy('mock2'));
}

export default passport;
