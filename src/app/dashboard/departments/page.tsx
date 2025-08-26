'use client';

import { DepartmentManagement } from '@/components/admin/DepartmentManagement';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/inbox/Header';
import { useAuth } from '@/hooks/useAuth';

export default function DepartmentPage() {
    const { userName } = useAuth();

    return (
        <ProtectedRoute requiredRole="supervisor">
            <div className="h-screen bg-gray-50 flex flex-col">
                <Header user={userName} />
                <div className="flex-1 overflow-hidden">
                    <DepartmentManagement />
                </div>
            </div>
        </ProtectedRoute>
    );
}