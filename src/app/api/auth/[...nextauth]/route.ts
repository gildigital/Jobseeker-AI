import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import LinkedInProvider from 'next-auth/providers/linkedin';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'mock-google-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock-google-client-secret',
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID || 'mock-linkedin-client-id',
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || 'mock-linkedin-client-secret',
      authorization: {
        params: { scope: 'openid profile email' }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
        
        if (profile) {
          // Store additional profile information if needed
          token.name = profile.name;
          token.email = profile.email;
          token.image = profile.picture || profile.avatar_url;
          
          if (account.provider === 'linkedin') {
            token.linkedinId = profile.sub;
          } else if (account.provider === 'google') {
            token.googleId = profile.sub;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken;
      session.provider = token.provider;
      
      // Add user ID from provider
      if (token.provider === 'linkedin') {
        session.user.linkedinId = token.linkedinId;
      } else if (token.provider === 'google') {
        session.user.googleId = token.googleId;
      }
      
      return session;
    },
    async signIn({ user, account, profile }) {
      // Create or update user in database
      if (user && account) {
        try {
          // In a real implementation, we would store the user in our database
          // const dbUser = await createOrUpdateUser({
          //   name: user.name,
          //   email: user.email,
          //   image: user.image,
          //   provider: account.provider,
          //   providerId: profile.sub,
          // });
          
          return true;
        } catch (error) {
          console.error('Error saving user to database:', error);
          return false;
        }
      }
      
      return true;
    },
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-for-development',
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
