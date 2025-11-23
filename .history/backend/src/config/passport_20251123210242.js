const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { pool } = require('./database');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    done(null, rows[0]);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const fullName = profile.displayName;
        const googleId = profile.id;

        // Check if user exists
        const [existingUsers] = await pool.query(
          'SELECT * FROM users WHERE email = ?',
          [email]
        );

        if (existingUsers.length > 0) {
          // User exists - update Google ID if not set
          const user = existingUsers[0];
          if (!user.google_id) {
            await pool.query(
              'UPDATE users SET google_id = ? WHERE id = ?',
              [googleId, user.id]
            );
          }
          return done(null, user);
        }

        // Create new user with Requester role by default
        const loginId = email.split('@')[0] + '_' + Date.now();
        const [result] = await pool.query(
          'INSERT INTO users (login_id, full_name, email, role, google_id) VALUES (?, ?, ?, ?, ?)',
          [loginId, fullName, email, 'Requester', googleId]
        );

        const [newUser] = await pool.query(
          'SELECT * FROM users WHERE id = ?',
          [result.insertId]
        );

        return done(null, newUser[0]);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;