'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import {  Card,  CardContent,  CardDescription,  CardHeader,  CardTitle,} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import logoname from "../../../public/Frame 1984080200.png";
import Image from 'next/image';

// import { useNotification } from '../ui/NotificationContext';

const  CreateNewPasswordForm = ({ className, ...props }: React.ComponentProps<'div'>) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { token } = useParams(); // Extract token from URL path
//   const { addNotification } = useNotification();

 useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token');
    //   addNotification({
    //     title: 'Error',
    //     description: 'Invalid or missing reset token',
    //     variant: 'destructive',
    //   });
    }
  }, [token]);
//   }, [token, addNotification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Client-side password validation
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError('Password must be at least 8 characters, with one uppercase letter, one number, and one special character');
    //   addNotification({
    //     title: 'Error',
    //     description: 'Password must be at least 8 characters, with one uppercase letter, one number, and one special character',
    //     variant: 'destructive',
    //   });
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
    //   addNotification({
    //     title: 'Error',
    //     description: 'Passwords do not match',
    //     variant: 'destructive',
    //   });
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.post(
        `/admin/reset-password/${token}`, 
        { newPassword },
        { withCredentials: true }
      );

    //   addNotification({
    //     title: 'Success',
    //     description: response.data.message || 'Password reset successful!',
    //     variant: 'default',
    //   });
      setNewPassword('');
      setConfirmPassword('');
      router.push('/');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to reset password';
      setError(errorMessage);
    //   addNotification({
    //     title: 'Error',
    //     description: errorMessage,
    //     variant: 'destructive',
    //   });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="hidden lg:w-1/2 bg-primary lg:flex items-center justify-center">
        <Image src={logoname} alt="Logo" className="" />
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">

            <CardTitle className="text-2xl">Reset Your Password</CardTitle>
            <CardDescription>Enter your email to receive a password reset link.</CardDescription>
          </CardHeader>
          <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3 relative">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={loading || !token}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="grid gap-3 relative">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading || !token}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              {error && (
                <p className="text-sm text-red-500 text-center -mt-3">{error}</p>
              )}
              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || !token}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Back to{' '}
                <a
                  href="/"
                  className="underline underline-offset-4 bg-gradient-to-br from-blue-500 to-pink-400 bg-clip-text text-transparent"
                >
                  Login
                </a>
              </div>
            </div>
          </form>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CreateNewPasswordForm;