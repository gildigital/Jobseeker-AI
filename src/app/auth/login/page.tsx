'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FaGoogle, FaLinkedin } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await signIn('google', {
        redirect: false,
        callbackUrl: '/main/dashboard'
      });
      
      if (result?.error) {
        setError(result.error);
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (err) {
      setError('An error occurred during sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLinkedInLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await signIn('linkedin', {
        redirect: false,
        callbackUrl: '/main/dashboard'
      });
      
      if (result?.error) {
        setError(result.error);
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (err) {
      setError('An error occurred during sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl: '/main/dashboard'
      });
      
      if (result?.error) {
        setError(result.error);
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (err) {
      setError('An error occurred during sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center pixel-text">Sign In</h1>
        
        <Card className="p-6 border-2 pixel-card">
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold mb-2 pixel-text">Welcome Back!</h2>
              <p className="text-gray-600">Sign in to access your job search tools</p>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <Button 
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 pixel-btn"
              >
                <FaGoogle className="h-5 w-5" />
                <span>Sign in with Google</span>
              </Button>
              
              <Button 
                onClick={handleLinkedInLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 pixel-btn pixel-btn-secondary"
              >
                <FaLinkedin className="h-5 w-5" />
                <span>Sign in with LinkedIn</span>
              </Button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>
            
            <form className="space-y-4" onSubmit={handleEmailLogin}>
              <div>
                <Label htmlFor="email" className="block text-sm font-medium">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  className="mt-1 pixel-input" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="block text-sm font-medium">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  className="mt-1 pixel-input" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <Label htmlFor="remember-me" className="ml-2 block text-sm">Remember me</Label>
                </div>
                
                <a href="#" className="text-sm text-primary hover:text-primary/80">Forgot password?</a>
              </div>
              
              <Button 
                type="submit" 
                className="w-full pixel-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
            
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a href="#" className="text-primary hover:text-primary/80 font-medium">Sign up</a>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
