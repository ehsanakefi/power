import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { env } from './env';
import { prisma } from './database';
// Import UserRole constants
import { UserRoleType } from '@/constants/userRoles';

// JWT Strategy options
const jwtOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: env.JWT_SECRET,
  algorithms: ['HS256'],
};

// JWT payload interface
export interface JwtPayload {
  id: number;
  phone: string;
  role: UserRoleType;
  iat?: number;
  exp?: number;
}

// User interface for passport
export interface AuthenticatedUser {
  id: number;
  phone: string;
  role: UserRoleType;
  createdAt: Date;
  updatedAt: Date;
}

// JWT Strategy
passport.use(
  new JwtStrategy(jwtOptions, async (payload: JwtPayload, done) => {
    try {
      // Find user by ID from JWT payload
      const user = await prisma.user.findUnique({
        where: { id: payload.id },
        select: {
          id: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return done(null, false, { message: 'User not found' });
      }

      // Verify that the phone number in the token matches the user
      if (user.phone !== payload.phone) {
        return done(null, false, { message: 'Token phone mismatch' });
      }

      return done(null, user as AuthenticatedUser);
    } catch (error) {
      return done(error, false);
    }
  })
);

// Serialize user for session (not used with JWT but required by passport)
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session (not used with JWT but required by passport)
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    done(null, user as AuthenticatedUser | null);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
