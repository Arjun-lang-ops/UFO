import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/userModel.js";


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      passReqToCallback: false
    },
    async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;

    if (!email) {
      return done(new Error("Google account has no email"), null);
    }

    let user = await User.findOne({ email });

    // If user exists but no googleId → link account
    if (user && !user.googleId) {
      user.googleId = profile.id;
      user.isVerified = true;
      await user.save();
    }

    // If user does not exist → create new
    if (!user) {
      user = await User.create({
        fullname: profile.displayName,
        email,
        googleId: profile.id,
        isVerified: true
      });
    }

    return done(null, user);

  } catch (error) {
    return done(error, null);
  }
}
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

export default passport;