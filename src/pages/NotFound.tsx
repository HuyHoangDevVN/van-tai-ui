import React from 'react';
import { Link } from '@tanstack/react-router';

const NotFound: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full">
    <h2 className="text-3xl font-bold text-red-600 mb-2">404 - Page Not Found</h2>
    <Link to="/" className="mt-4 px-4 py-2 bg-primary text-white rounded">
      Go Home
    </Link>
  </div>
);

export default NotFound;
