'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import apiClient from '@/lib/apiClient';
import Image from 'next/image';
import logoname from "../../../public/Frame 1984080200.png";


const ForgotPasswordForm = ({ className, ...props }: React.ComponentProps<'div'>) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setSuccess(''); // Clear previous success message
    setLoading(true);

    try {
      const response = await apiClient.post(
        '/v1/admin/forgot-password',
        { email },
        { withCredentials: true }
      );

      // If successful, show success message and clear email field
      setSuccess(response.data.message || 'Reset link sent to your email!');
      setEmail('');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to send reset link';
      setError(errorMessage);
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
          <CardContent className="space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // handleLogin();
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                disabled={!email || loading}
                className="w-full"
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ForgotPasswordForm
