'use client';

import { useUserStore, type UserProfile } from '@/stores/userStore';
import {
  Activity,
  Clock,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  BarChart3,
  PieChart,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Star,
  Timer,
  CheckCircle,
  AlertCircle,
  UserCheck,
  UserX
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  description: string;
  timestamp: string;
  type: 'login' | 'logout' | 'chat' | 'system' | 'error';
  metadata?: Record<string, any>;
}

interface UserMetrics {
  userId: string;
  userName: string;
  loginCount: number;
  totalChatTime: number;
  avgResponseTime: number;
  satisfaction: number;
  chatsHandled: number;
  lastActivity: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  availability: number; // percentage
}

interface ActivityFilters {
  dateRange: 'today' | 'week' | 'month' | 'custom';
  userIds: string[];
  activityTypes: string[];
  customDateFrom?: string;
  customDateTo?: string;
}

export const UserActivityDashboard: React.FC = () => {
  const { users, getUserStats } = useUserStore();
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [userMetrics, setUserMetrics] = useState<UserMetrics[]>([]);
  const [filters, setFilters] = useState<ActivityFilters>({
    dateRange: 'today',
    userIds: [],
    activityTypes: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedView, setSelectedView] = useState<'overview' | 'activity' | 'performance' | 'availability'>('overview');

  // Mock data generation
  useEffect(() => {
    generateMockData();
  }, [users, filters]);

  const generateMockData = () => {
    setIsLoading(true);
    
    // Generate mock activity logs
    const mockLogs: ActivityLog[] = [];
    const actions = [
      { action: 'login', description: 'Inicio de sesión', type: 'login' as const },
      { action: 'logout', description: 'Cierre de sesión', type: 'logout' as const },
      { action: 'chat_start', description: 'Inició conversación con cliente', type: 'chat' as const },
      { action: 'chat_end', description: 'Finalizó conversación', type: 'chat' as const },
      { action: 'status_change', description: 'Cambió estado de disponibilidad', type: 'system' as const },
      { action: 'profile_update', description: 'Actualizó perfil', type: 'system' as const }
    ];

    users.forEach(user => {
      for (let i = 0; i < Math.floor(Math.random() * 10) + 5; i++) {
        const action = actions[Math.floor(Math.random() * actions.length)];
        const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
        
        mockLogs.push({
          id: `${user.id}-${i}`,
          userId: user.id,
          userName: user.name,
          action: action.action,
          description: action.description,
          timestamp: timestamp.toISOString(),
          type: action.type,
          metadata: {
            ip: '192.168.1.' + Math.floor(Math.random() * 255),
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
      }
    });

    // Generate mock user metrics
    const mockMetrics: UserMetrics[] = users.map(user => ({
      userId: user.id,
      userName: user.name,
      loginCount: Math.floor(Math.random() * 30) + 5,
      totalChatTime: Math.floor(Math.random() * 480) + 60, // minutes
      avgResponseTime: Math.random() * 5 + 0.5, // minutes
      satisfaction: Math.random() * 2 + 3, // 3-5 stars
      chatsHandled: user.stats.totalChats,
      lastActivity: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      status: ['online', 'offline', 'away', 'busy'][Math.floor(Math.random() * 4)] as any,
      availability: Math.floor(Math.random() * 40) + 60 // 60-100%
    }));

    setActivityLogs(mockLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    setUserMetrics(mockMetrics);
    setIsLoading(false);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return <UserCheck className="w-4 h-4 text-green-600" />;
      case 'logout': return <UserX className="w-4 h-4 text-gray-600" />;
      case 'chat': return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'system': return <Activity className="w-4 h-4 text-purple-600" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      online: { color: 'bg-green-100 text-green-800', label: 'En línea' },
      offline: { color: 'bg-gray-100 text-gray-800', label: 'Desconectado' },
      away: { color: 'bg-yellow-100 text-yellow-800', label: 'Ausente' },
      busy: { color: 'bg-red-100 text-red-800', label: 'Ocupado' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.offline;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString();
  };

  const exportActivityReport = () => {
    const csvContent = [
      ['Usuario', 'Acción', 'Descripción', 'Fecha', 'Tipo'].join(','),
      ...activityLogs.map(log => [
        log.userName,
        log.action,
        log.description,
        new Date(log.timestamp).toLocaleString(),
        log.type
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `actividad-usuarios-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Monitoreo de Actividad</h1>
            <p className="text-gray-600 mt-1">
              Seguimiento de actividad y rendimiento de usuarios
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={generateMockData}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
            
            <button
              onClick={exportActivityReport}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Resumen', icon: BarChart3 },
              { id: 'activity', label: 'Actividad', icon: Activity },
              { id: 'performance', label: 'Rendimiento', icon: TrendingUp },
              { id: 'availability', label: 'Disponibilidad', icon: Clock }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedView(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedView === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {selectedView === 'overview' && (
          <div className="p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {userMetrics.filter(m => m.status === 'online').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600">+12%</span>
                  <span className="text-gray-500 ml-1">vs ayer</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Chats Manejados</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {userMetrics.reduce((sum, m) => sum + m.chatsHandled, 0)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600">+8%</span>
                  <span className="text-gray-500 ml-1">vs ayer</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(userMetrics.reduce((sum, m) => sum + m.avgResponseTime, 0) / userMetrics.length).toFixed(1)}m
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Timer className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600">-5%</span>
                  <span className="text-gray-500 ml-1">vs ayer</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Satisfacción</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(userMetrics.reduce((sum, m) => sum + m.satisfaction, 0) / userMetrics.length).toFixed(1)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600">+3%</span>
                  <span className="text-gray-500 ml-1">vs ayer</span>
                </div>
              </div>
            </div>

            {/* Top Performers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Mejores Agentes</h3>
                <div className="space-y-4">
                  {userMetrics
                    .filter(m => users.find(u => u.id === m.userId)?.role === 'agent')
                    .sort((a, b) => b.satisfaction - a.satisfaction)
                    .slice(0, 5)
                    .map((metric, index) => (
                      <div key={metric.userId} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{metric.userName}</p>
                            <p className="text-xs text-gray-500">{metric.chatsHandled} chats</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium">{metric.satisfaction.toFixed(1)}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Actividad Reciente</h3>
                <div className="space-y-4">
                  {activityLogs.slice(0, 5).map(log => (
                    <div key={log.id} className="flex items-start space-x-3">
                      {getActivityIcon(log.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{log.userName}</span> {log.description}
                        </p>
                        <p className="text-xs text-gray-500">{formatTimestamp(log.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedView === 'activity' && (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Registro de Actividad</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acción
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descripción
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activityLogs.slice(0, 50).map(log => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{log.userName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getActivityIcon(log.type)}
                            <span className="text-sm text-gray-900">{log.action}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{log.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            log.type === 'login' ? 'bg-green-100 text-green-800' :
                            log.type === 'logout' ? 'bg-gray-100 text-gray-800' :
                            log.type === 'chat' ? 'bg-blue-100 text-blue-800' :
                            log.type === 'system' ? 'bg-purple-100 text-purple-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {log.type}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {selectedView === 'performance' && (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Métricas de Rendimiento</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Chats Manejados
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tiempo Promedio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Satisfacción
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tiempo Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Última Actividad
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userMetrics.map(metric => (
                      <tr key={metric.userId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{metric.userName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{metric.chatsHandled}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{metric.avgResponseTime.toFixed(1)}m</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm text-gray-900">{metric.satisfaction.toFixed(1)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDuration(metric.totalChatTime)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{formatTimestamp(metric.lastActivity)}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {selectedView === 'availability' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {userMetrics.map(metric => (
                <div key={metric.userId} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">{metric.userName}</h4>
                    {getStatusBadge(metric.status)}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Disponibilidad</span>
                        <span className="font-medium">{metric.availability}%</span>
                      </div>
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${metric.availability}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Inicios de sesión</p>
                        <p className="font-medium text-gray-900">{metric.loginCount}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Tiempo total</p>
                        <p className="font-medium text-gray-900">{formatDuration(metric.totalChatTime)}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-gray-600 text-sm">Última actividad</p>
                      <p className="font-medium text-gray-900 text-sm">{formatTimestamp(metric.lastActivity)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};