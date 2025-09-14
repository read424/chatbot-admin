'use client';

import { connectionsService } from '@/lib/api/services/connections';
import { Connection, CreateConnectionRequest, UpdateConnectionRequest } from '@/types/connections';
import { Camera, ChevronDown, MessageCircle, MessageSquare, Phone, Plus, QrCode, Send, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ConnectionModal } from './ConnectionModal';
import { QRModal } from './QRModal';

const connectionTypes = [
  { 
    id: 'whatsapp', 
    name: 'WhatsApp', 
    icon: MessageCircle, 
    color: 'text-green-600 dark:text-green-400' 
  },
  { 
    id: 'facebook', 
    name: 'Facebook', 
    icon: MessageSquare, 
    color: 'text-blue-600 dark:text-blue-400' 
  },
  { 
    id: 'instagram', 
    name: 'Instagram', 
    icon: Camera, 
    color: 'text-pink-600 dark:text-pink-400' 
  },
  { 
    id: 'chat', 
    name: 'Chat Web', 
    icon: MessageCircle, 
    color: 'text-purple-600 dark:text-purple-400' 
  },
  { 
    id: 'whatsapp_api', 
    name: 'WhatsApp Business API', 
    icon: Phone, 
    color: 'text-green-700 dark:text-green-300' 
  },
  { 
    id: 'telegram', 
    name: 'Telegram', 
    icon: Send, 
    color: 'text-blue-500 dark:text-blue-300' 
  }
];

export const ConnectionsPage = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedConnectionType, setSelectedConnectionType] = useState<string>('');
    const [editingConnection, setEditingConnection] = useState<Connection | null>(null);
    const [qrConnection, setQRConnection] = useState<Connection | null>(null);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(()=>{
        const fetchConnections = async () => {
            try {
                setLoading(true);
                const connections = await connectionsService.getConnections();
                setConnections(connections);
            }catch(error){
                console.error('Error loading connections:', error);
            }finally {
                setLoading(false);
            }
        }
        
        fetchConnections();
    }, []);

    const handleConnectionTypeClick = (type: string) => {
        setSelectedConnectionType(type);
        setEditingConnection(null);
        setShowDropdown(false);
        setShowModal(true);
    };

    const handleConfigureConnection = (connection: Connection) => {
        setEditingConnection(connection);
        setSelectedConnectionType(connection.providerType);
        setShowModal(true);
    };

    const handleConnectQR = async (connection: Connection) => {
        // Solo permitir conexiones de WhatsApp
        if (connection.providerType !== 'whatsapp' && connection.providerType !== 'whatsapp_api') {
            console.error('Solo se pueden conectar conexiones de WhatsApp');
            return;
        }

        setQRConnection(connection);
        setShowQRModal(true);
    };

    const handleSaveConnection = async (connectionData: CreateConnectionRequest) => {
        try {
            if (editingConnection) {
                const updateData: UpdateConnectionRequest = {
                    ...connectionData,
                    id: editingConnection.id
                }
                await connectionsService.updateConnection(updateData);
            }else {
                await connectionsService.createConnection(connectionData);
            }

            const updatedConnection = await connectionsService.getConnections();
            setConnections(updatedConnection);
    
            setShowModal(false);
            setEditingConnection(null);    
        } catch (error) {
            console.error('Error saving connection:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
            case 'inactive': return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
            case 'error': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getConnectionIcon = (type: string) => {
        const connectionType = connectionTypes.find(ct => ct.id === type);
        if (!connectionType) return MessageCircle;
        return connectionType.icon;
    };

    const getConnectionColor = (type: string) => {
        const connectionType = connectionTypes.find(ct => ct.id === type);
        return connectionType?.color || 'text-gray-600';
    };

    // Determinar si mostrar botón QR (para WhatsApp) o conexión regular
    const showQRButton = (connection: Connection) => {
        return (connection.providerType === 'whatsapp' || connection.providerType === 'whatsapp_api') && 
            connection.status === 'inactive';
    };

    const getActionButton = (connection: Connection) => {
        if (showQRButton(connection)) {
          return (
            <button 
              onClick={() => handleConnectQR(connection)}
              className="flex-1 px-3 py-2 text-sm bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-md hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors flex items-center justify-center space-x-1"
            >
              <QrCode className="w-4 h-4" />
              <span>Conectar</span>
            </button>
          );
        }
    
        if (connection.status === 'active') {
          return (
            <button className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-center space-x-1">
              <Wifi className="w-4 h-4" />
              <span>Desconectar</span>
            </button>
          );
        }
    
        return (
          <button className="flex-1 px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
            Conectar
          </button>
        );
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-900 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                    Conexiones
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Gestiona las integraciones con plataformas de mensajería
                </p>
                </div>

                {/* Botón Agregar con Dropdown */}
                <div className="relative">
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>Agregar</span>
                    <ChevronDown className="w-4 h-4" />
                </button>

                {showDropdown && (
                    <>
                    {/* Overlay */}
                    <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowDropdown(false)}
                    />
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-20">
                        {connectionTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                            <button
                            key={type.id}
                            onClick={() => handleConnectionTypeClick(type.id)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors first:rounded-t-lg last:rounded-b-lg"
                            >
                            <Icon className={`w-5 h-5 ${type.color}`} />
                            <span className="text-gray-700 dark:text-gray-300">{type.name}</span>
                            </button>
                        );
                        })}
                    </div>
                    </>
                )}
                </div>
            </div>

            {/* Connections Grid */}
            <div suppressHydrationWarning className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {connections.map((connection) => {
                    const Icon = getConnectionIcon(connection.providerType);
                    return (
                        <div
                            key={connection.id}
                            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <Icon className={`w-6 h-6 ${getConnectionColor(connection.providerType)}`} />
                                    <div>
                                        <h3 className="font-medium text-gray-900 dark:text-white">
                                            {connection.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {connection.department}
                                        </p>
                                    </div>
                                </div>
                                
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(connection.status)}`}>
                                    {connection.status === 'active' ? 'Activo' : 
                                    connection.status === 'inactive' ? 'Inactivo' : 'Error'}
                                </span>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex justify-between">
                                    <span>Último mensaje:</span>
                                    <span>{connection.lastMessage}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Creado:</span>
                                    <span>{connection.createdAt}</span>
                                </div>
                            </div>

                            <div className="flex space-x-2 mt-4">
                                <button 
                                    onClick={() => handleConfigureConnection(connection)}
                                    className="flex-1 px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                >
                                    Configurar
                                </button>
                                {getActionButton(connection)}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal para nueva conexión */}
            {showModal && (
                <ConnectionModal
                    isOpen={showModal}
                    onClose={() => {
                        setShowModal(false);
                        setEditingConnection(null);
                    }}
                    connectionType={selectedConnectionType}
                    editingConnection={editingConnection}
                    onSave={handleSaveConnection}
                />
            )}

            {/* Modal QR */}
            {showQRModal && qrConnection && (
                <QRModal
                    isOpen={showQRModal}
                    onClose={() => {
                        setShowQRModal(false);
                        setQRConnection(null);
                    }}
                    connectionId={qrConnection.id}
                    connectionName={qrConnection.name}
                    connectionType={qrConnection.providerType}
                    tenantId="1"
                />
            )}
        </div>
    );
};