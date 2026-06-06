'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    router.push('/dashboard');
                }else{
                    router.push('/login');
                }

            }catch (error) {
                console.error('Error checking auth:', error);
                router.push('/login');
            }finally{
                setIsChecking(false);
            }
        };
        checkAuth();
    }, [router]);

    if(isChecking){
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando...</p>
                </div>
            </div>            
        )
    }
    
    return null;
}