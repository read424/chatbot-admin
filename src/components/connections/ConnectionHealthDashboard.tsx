'use client';

import { Connection } from '@/types/connections';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Wifi, 
  WifiOff,
  RefreshCw,
  AlertTriangle,
  Info,
  ExternalLink
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface ConnectionHealthDashboardProps {
  connections: Connection[];
  onRefresh?: () => void;
}

interface HealthMetrics {
  totalConnections: number;
  healthyConnections: number;
  degradedConnections: number;
  unhealthyConnections: number;
  averageResponseTime: number;
  totalMessages: number;
  errorRate: number;
}

interface TroubleshootingGuide {
  provider: string;
  issue: string;
  solution: string;
  documentation?: string;
}

const troubleshootingGuides: TroubleshootingGuide[] = [
  {
    provider: 'whatsapp',
    issue: 'Conexión perdida',
    solution: 'Verificar que el teléfono esté conectado a internet y que WhatsApp Web esté activo.',
    documentation: 'https://faq.whatsapp.com/web'
  },
  {
    provider: 'whatsapp_api',
    issue: 'Token expirado',
    solution: 'Renovar el token de acceso en Facebook Developer Console.',
    documentation: 'https://developers.facebook.com/docs/whatsapp'
  },
  {
    provider: 'facebook',
    issue: 'Permisos insuficientes',
    solution: 'Verificar que la aplicación tenga permisos de pages_messaging.',
    documentation: 'https://developers.facebook.com/docs/messenger-platform'
  },
  {
    provider: 'instagram',
    issue: 'Cuenta no verificada',
    solution: 'La cuenta de Instagram debe estar verificada para usar la API.',
    documentation: 'https://developers.facebook.com/docs/instagram-api'
  },
  {
    provider: 'telegram',
    issue: 'Webhook no configurado',
    solution: 'Configurar correctamente la URL del webhook en la configuración del bot.',
    documentation: 'https://core.telegram.org/bots/api#setwebhook'
  }
];

export const ConnectionHealthDashboard = ({ connections, onRefresh }: ConnectionHealthDashboardProps) => {
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  // Calculate health metrics from connections
  const calculateHealthMetrics = (connections: Connection[]): HealthMetrics => {
    const totalConnections = connections.length;
    let healthyConnections = 0;
    let degradedConnections = 0;
    let unhealthyConnections = 0;
    let totalResponseTime = 0;
    let totalMessages = 0;
    let totalErrors = 0;

    connections.forEach(connection => {
      if (connection.health) {
        if (connection.health.isHealthy && connection.health.errorRate < 5) {
          healthyConnections++;
        } else if (connection.health.isHealthy && connection.health.errorRate < 15) {
          degradedConnections++;
        } else {
          unhealthyConnections++;
        }

        totalResponseTime += connection.health.responseTime;
        totalMessages += connection.health.metrics.messagesSent + connection.health.metrics.messagesReceived;
        totalErrors += connection.health.metrics.errors;
      } else {
        unhealthyConnections++;
      }
    });

    return {
      totalConnections,
      healthyConnections,
      degradedConnections,
      unhealthyConnections,
      averageResponseTime: totalConnections > 0 ? totalResponseTime / totalConnections : 0,
      totalMessages,
      errorRate: totalMessages > 0 ? (totalErrors / totalMessages) * 100 : 0
    };
  };

  useEffect(() => {
    const metrics = calculateHealthMetrics(connections);
    setHealthMetrics(metrics);
  }, [connections]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await onRefresh?.();
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error refreshing connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthStatusColor = (connection: Connection) => {
    if (!connection.health) return 'text-gray-500 bg-gray-100';
    
    if (connection.health.isHealthy && connection.health.errorRate < 5) {
      return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
    } else if (connection.health.isHealthy && connection.health.errorRate < 15) {
      return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
    } else {
      return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
    }
  };

  const getHealthStatusIcon = (connection: Connection) => {
    if (!connection.health) return AlertCircle;
    
    if (connection.health.isHealthy && connection.health.errorRate < 5) {
      return CheckCircle;
    } else if (connection.health.isHealthy && connection.health.errorRate < 15) {
      return AlertTriangle;
    } else {
      return AlertCircle;
    }
  };

  const getHealthStatusText = (connection: Connection) => {
    if (!connection.health) return 'Sin datos';
    
    if (connection.health.isHealthy && connection.health.errorRate < 5) {
      return 'Saludable';
    } else if (connection.health.isHealthy && connection.health.errorRate < 15) {
      return 'Degradado';
    } else {
      return 'No saludable';
    }
  };

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(1)}%`;
  };

  const formatResponseTime = (responseTime: number) => {
    return `${responseTime}ms`;
  };

  const getTroubleshootingForConnection = (connection: Connection) => {
    return troubleshootingGuides.filter(guide => 
      guide.provider === connection.providerType ||
      (connection.health?.lastError && guide.issue.toLowerCase().includes(connection.health.lastError.message.toLowerCase()))
    );
  };

  if (!healthMetrics) {
    return (
      <div className="p-6 bg-white dark:bg-gray-900">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Monitor de Salud de Conexiones
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Estado en tiempo real de todas las conexiones
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Última actualización: {lastUpdate.toLocaleTimeString()}
          </span>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Health Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Conexiones</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {healthMetrics.totalConnections}
              </p>
            </div>
            <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Saludables</p>
              <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
                {healthMetrics.healthyConnections}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tiempo Respuesta</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formatResponseTime(healthMetrics.averageResponseTime)}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tasa de Error</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {healthMetrics.errorRate.toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </div>

      {/* Connections Health Table */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Estado Detallado de Conexiones
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Conexión
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Uptime
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Respuesta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Mensajes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Errores
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {connections.map((connection) => {
                const HealthIcon = getHealthStatusIcon(connection);
                const guides = getTroubleshootingForConnection(connection);
                
                return (
                  <tr key={connection.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {connection.status === 'active' ? (
                            <Wifi className="w-5 h-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <WifiOff className="w-5 h-5 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {connection.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {connection.providerType} • {connection.department}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <HealthIcon className="w-4 h-4 mr-2" />
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthStatusColor(connection)}`}>
                          {getHealthStatusText(connection)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {connection.health ? formatUptime(connection.health.uptime) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {connection.health ? formatResponseTime(connection.health.responseTime) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {connection.health ? 
                        (connection.health.metrics.messagesSent + connection.health.metrics.messagesReceived) : 
                        'N/A'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {connection.health ? connection.health.metrics.errors : 'N/A'}
                        </span>
                        {connection.health?.lastError && (
                          <AlertCircle className="w-4 h-4 ml-2 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedConnection(connection)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                        >
                          Ver detalles
                        </button>
                        {guides.length > 0 && (
                          <button
                            onClick={() => {
                              setSelectedConnection(connection);
                              setShowTroubleshooting(true);
                            }}
                            className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300"
                          >
                            Solucionar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Connection Details Modal */}
      {selectedConnection && !showTroubleshooting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Detalles de {selectedConnection.name}
              </h3>
              <button
                onClick={() => setSelectedConnection(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedConnection.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Proveedor</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedConnection.providerType}</p>
                </div>
              </div>
              
              {selectedConnection.health && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Uptime</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formatUptime(selectedConnection.health.uptime)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tiempo de Respuesta</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formatResponseTime(selectedConnection.health.responseTime)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mensajes Enviados</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedConnection.health.metrics.messagesSent}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mensajes Recibidos</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedConnection.health.metrics.messagesReceived}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Errores</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedConnection.health.metrics.errors}
                      </p>
                    </div>
                  </div>
                  
                  {selectedConnection.health.lastError && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Último Error</label>
                      <div className="mt-1 p-3 bg-red-50 dark:bg-red-900/30 rounded-md">
                        <p className="text-sm text-red-800 dark:text-red-200">
                          {selectedConnection.health.lastError.message}
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          {new Date(selectedConnection.health.lastError.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Troubleshooting Modal */}
      {selectedConnection && showTroubleshooting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Guía de Solución de Problemas - {selectedConnection.name}
              </h3>
              <button
                onClick={() => {
                  setSelectedConnection(null);
                  setShowTroubleshooting(false);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              {getTroubleshootingForConnection(selectedConnection).map((guide, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        {guide.issue}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {guide.solution}
                      </p>
                      {guide.documentation && (
                        <a
                          href={guide.documentation}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          Ver documentación
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {selectedConnection.health?.lastError && (
                <div className="border border-red-200 dark:border-red-600 rounded-lg p-4 bg-red-50 dark:bg-red-900/30">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-red-900 dark:text-red-200 mb-2">
                        Error Actual
                      </h4>
                      <p className="text-sm text-red-800 dark:text-red-300 mb-2">
                        {selectedConnection.health.lastError.message}
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400">
                        Ocurrido el: {new Date(selectedConnection.health.lastError.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};