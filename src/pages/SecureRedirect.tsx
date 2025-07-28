
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import SecureRedirect from '@/components/SecureRedirect';

const SecureRedirectPage = () => {
  const [searchParams] = useSearchParams();
  const message = searchParams.get('message') || 'Securely redirecting you';
  const redirectTo = searchParams.get('redirectTo') || '/';

  return <SecureRedirect message={message} redirectTo={redirectTo} />;
};

export default SecureRedirectPage;
