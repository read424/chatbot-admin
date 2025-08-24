'use client';

import { Building, Pause, Play, Users } from 'lucide-react';
import React from 'react';

interface DepartmentStatsProps {
  stats: {
    total: number;
    active: number;
    inactive: number;
    totalUsers: number;
  };
}

export const DepartmentStats: React.FC<DepartmentStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Departamentos',
      value: stats.total,
      icon: Building,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Departamentos Activos',
      value: stats.active,
      icon: Play,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    {
      title: 'Departamentos Inactivos',
      value: stats.inactive,
      icon: Pause,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      borderColor: 'border-red-200'
    },
    {
      title: 'Total Usuarios Asignados',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      borderColor: 'border-purple-200'
    }
  ];

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <div
              key={index}
              className={`${stat.bgColor} rounded-xl p-6 border-2 ${stat.borderColor} transition-all hover:shadow-md`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                  <p className={`text-3xl font-bold ${stat.textColor}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-xl`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              
              {/* Progress indicator */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className={`${stat.textColor} font-medium`}>
                    {stats.total > 0 ? Math.round((stat.value / stats.total) * 100) : 0}%
                  </span>
                  <span className="text-gray-500">del total</span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${stat.color} transition-all duration-500`}
                    style={{ 
                      width: `${stats.total > 0 ? (stat.value / stats.total) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};