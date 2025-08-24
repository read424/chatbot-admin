'use client';

import { UserManagement } from '@/components/admin/UserManagement';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/inbox/Header';
import { useAuth } from '@/hooks/useAuth';

export default function UsersPage() {
  const { userName } = useAuth();

  return (
    <ProtectedRoute requiredRole="supervisor">
      <div className="h-screen bg-gray-50 flex flex-col">
        <Header user={userName} />
        <div className="flex-1 overflow-hidden">
          <UserManagement />
        </div>
      </div>
    </ProtectedRoute>
  );
}