import React, { useState } from 'react';

interface GoogleOAuthButtonProps {
  onError: (error: string) => void;
  className?: string;
}

const GoogleOAuthButton: React.FC<GoogleOAuthButtonProps> = ({ onError, className = '' }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/google');
      const data = await response.json();
      
      console.log('Google OAuth URL:', data.auth_url);
      console.log('Redirect URI:', data.redirect_uri);
      
      // Try popup approach first
      const popup = window.open(
        data.auth_url,
        'googleAuth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );
      
      if (!popup) {
        // Fallback to same window if popup is blocked
        console.log('Popup blocked, trying same window redirect');
        window.location.href = data.auth_url;
        return;
      }
      
      // Listen for popup close or message
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          // Check if user is now logged in
          window.location.reload();
        }
      }, 1000);
      
      // Set timeout to close popup if needed
      setTimeout(() => {
        if (!popup.closed) {
          popup.close();
          clearInterval(checkClosed);
        }
      }, 300000); // 5 minutes timeout
      
    } catch (error) {
      console.error('Google OAuth error:', error);
      onError('Google login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className={`w-full bg-white text-gray-700 border border-gray-300 py-2 px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center disabled:opacity-50 ${className}`}
    >
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      {isLoading ? 'Loading...' : 'Continue with Google'}
    </button>
  );
};

export default GoogleOAuthButton;