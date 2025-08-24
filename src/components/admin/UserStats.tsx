'use client';

import { BarChart, Headphones, Shield, UserCheck, Users, UserX } from 'lucide-react';
import React from 'react';

interface UserStatsProps {
  stats: {
    total: number;
    active: number;
    inactive: number;
    byRole: Record<string, number>;
  };
}

export const UserStats: React.FC<UserStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Usuarios',
      value: stats.total,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Usuarios Activos',
      value: stats.active,
      icon: UserCheck,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Usuarios Inactivos',
      value: stats.inactive,
      icon: UserX,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    },
    {
      title: 'Administradores',
      value: stats.byRole.admin || 0,
      icon: Shield,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Supervisores',
      value: stats.byRole.supervisor || 0,
      icon: BarChart,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Agentes',
      value: stats.byRole.agent || 0,
      icon: Headphones,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600'
    }
  ];

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <div
              key={index}
              className={`${stat.bgColor} rounded-lg p-4 border border-opacity-20`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.textColor} mt-1`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              
              {/* Percentage change (opcional) */}
              <div className="mt-3">
                <div className="flex items-center text-sm">
                  <span className="text-green-600 font-medium">
                    +{Math.round((stat.value / stats.total) * 100)}%
                  </span>
                  <span className="text-gray-500 ml-1">del total</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};