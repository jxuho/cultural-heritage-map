import React from 'react';
import useAuthStore from '@/store/authStore';
import AdminView from '../components/Dashboard/AdminView';
import UserView from '../components/Dashboard/UserView';
import { Skeleton } from '../components/ui/skeleton';

const DashboardPage: React.FC = () => {
  const { user, loading, isAuthenticated } = useAuthStore();

  // 1. Handle when loading (using shadcn skeleton)
  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-12 w-62.5" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-100 w-full" />
      </div>
    );
  }

  // 2. When not authenticated (usually handled by Middleware or PrivateRoute, but double defense)
  if (!isAuthenticated || !user) {
    return (
      <div className="p-8 text-center">
        Please sign in to access the dashboard.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* 3. Branch processing according to role */}
      {user.role === 'admin' ? <AdminView /> : <UserView />}
    </div>
  );
};

export default DashboardPage;
