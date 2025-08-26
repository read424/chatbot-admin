'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ConnectionsPage } from "@/components/connections/ConnectionsPage";
import { Header } from '@/components/inbox/Header';
import { useAuth } from '@/hooks/useAuth';

export default function ConnectionsPageRoute(){
    const { userName } = useAuth();

    return (
        <ProtectedRoute requiredRole="supervisor">
            <div className="h-screen bg-gray-50 flex flex-col">
                <Header user={userName} />
                <div className="flex-1 overflow-hidden">
                    <ConnectionsPage />
                </div>
            </div>
        </ProtectedRoute>
    );
}