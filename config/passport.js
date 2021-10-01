import dotenv from "dotenv";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.js";

dotenv.config();

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/login/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      User.findOneAndUpdate(
        {
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0]?.value,
          picture: profile.photos[0]?.value,
        },
        {},
        { new: true, upsert: true },
        function (err, user) {
          return done(err, user);
        }
      );
    }
  )
);

export default passport;
