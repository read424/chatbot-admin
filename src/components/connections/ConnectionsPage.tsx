'use client';

import { useConnectionsV2 } from '@/hooks/useConnectionsV2';
import type { ChannelType, ConnectionV2 } from '@/types/connectionsV2';
import { Camera, ChevronDown, MessageCircle, MessageSquare, Phone, Plus, QrCode, Send, Wifi, Activity, Globe, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ConnectionModal } from './ConnectionModal';
import { QRModal } from './QRModal';
import { ConnectionHealthDashboard } from './ConnectionHealthDashboard';
import { WebhookConfigModal } from './WebhookConfigModal';

const connectionTypes = [
    {
        id: 'whatsapp_web' as ChannelType,
        name: 'WhatsApp Web',
        icon: MessageCircle,
        color: 'text-green-600 dark:text-green-400'
    },
    {
        id: 'whatsapp_api' as ChannelType,
        name: 'WhatsApp Business API',
        icon: Phone,
        color: 'text-green-700 dark:text-green-300'
    },
    {
        id: 'instagram_direct' as ChannelType,
        name: 'Instagram Direct',
        icon: Camera,
        color: 'text-pink-600 dark:text-pink-400'
    },
    {
        id: 'facebook_messenger' as ChannelType,
        name: 'Facebook Messenger',
        icon: MessageSquare,
        color: 'text-blue-600 dark:text-blue-400'
    },
    {
        id: 'telegram' as ChannelType,
        name: 'Telegram',
        icon: Send,
        color: 'text-blue-500 dark:text-blue-300'
    },
    {
        id: 'webchat' as ChannelType,
        name: 'Chat Web',
        icon: Globe,
        color: 'text-purple-600 dark:text-purple-400'
    }
];

export const ConnectionsPage = () => {
    // Hook de conexiones v2
    const {
        connections,
        isLoading: loading,
        error,
        fetchConnections,
        createConnection,
        updateConnection,
        deleteConnection,
        activateConnection,
        deactivateConnection,
        selectConnection,
        selectedConnection,
        clearError
    } = useConnectionsV2({ autoFetch: true });

    // Estados locales del componente
    const [showDropdown, setShowDropdown] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedConnectionType, setSelectedConnectionType] = useState<ChannelType>('whatsapp_web');
    const [editingConnection, setEditingConnection] = useState<ConnectionV2 | null>(null);
    const [qrConnection, setQRConnection] = useState<ConnectionV2 | null>(null);
    const [activeTab, setActiveTab] = useState<'connections' | 'health'>('connections');
    const [showWebhookModal, setShowWebhookModal] = useState(false);
    const [webhookConnection, setWebhookConnection] = useState<ConnectionV2 | null>(null);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [isLoadingConnection, setIsLoadingConnection] = useState(false);

    const handleConnectionTypeClick = (type: ChannelType) => {
        setSelectedConnectionType(type);
        setEditingConnection(null);
        setShowDropdown(false);
        setShowModal(true);
    };

    const handleConfigureConnection = (connection: ConnectionV2) => {
        setEditingConnection(connection);
        setSelectedConnectionType(connection.channelType);
        setShowModal(true);
    };

    const handleConnectQR = async (connection: ConnectionV2) => {
        // Solo permitir conexiones de WhatsApp
        if (connection.channelType !== 'whatsapp_web' && connection.channelType !== 'whatsapp_api') {
            console.error('Solo se pueden conectar conexiones de WhatsApp');
            return;
        }

        setQRConnection(connection);
        setShowQRModal(true);
    };

    const handleConfigureWebhook = (connection: ConnectionV2) => {
        setWebhookConnection(connection);
        setShowWebhookModal(true);
    };

    const handleSaveWebhook = async (webhookConfig: any) => {
        if (!webhookConnection) return;

        try {
            // Actualizar conexión con webhook config
            await updateConnection(webhookConnection.id, {
                // Aquí puedes agregar los campos del webhook si el API lo soporta
            });

            setShowWebhookModal(false);
            setWebhookConnection(null);
            fetchConnections(); // Refrescar la lista
        } catch (error) {
            console.error('Error saving webhook config:', error);
        }
    };

    const handleSaveConnection = async (connectionData: any) => {
        try {
            // Usar selectedConnection si existe (viene del backend), sino editingConnection
            const connectionToEdit = selectedConnection || editingConnection;

            if (connectionToEdit) {
                // Actualizar conexión existente
                await updateConnection(connectionToEdit.id, connectionData);
            } else {
                // Crear nueva conexión
                await createConnection(connectionData);
            }

            setShowModal(false);
            setEditingConnection(null);
        } catch (error) {
            console.error('Error saving connection:', error);
        }
    };

    const handleEditConnection = async (connection: ConnectionV2) => {
        setOpenMenuId(null);
        setIsLoadingConnection(true);

        try {
            // Cargar datos completos desde el backend
            await selectConnection(connection.id);

            // selectedConnection se actualiza automáticamente por el hook
            // Esperar un tick para que se actualice el estado
            setTimeout(() => {
                setSelectedConnectionType(connection.channelType);
                setShowModal(true);
                setIsLoadingConnection(false);
            }, 100);
        } catch (error) {
            console.error('Error loading connection details:', error);
            alert('Error al cargar los detalles de la conexión');
            setIsLoadingConnection(false);
        }
    };

    const handleDeleteConnection = async (connection: ConnectionV2) => {
        if (!confirm(`¿Estás seguro de eliminar la conexión "${connection.connectionName}"?`)) {
            return;
        }

        try {
            const success = await deleteConnection(connection.id);
            if (success) {
                alert('Conexión eliminada exitosamente');
            }
        } catch (error) {
            console.error('Error deleting connection:', error);
            alert('Error al eliminar la conexión');
        } finally {
            setOpenMenuId(null);
        }
    };

    const toggleMenu = (connectionId: number) => {
        setOpenMenuId(openMenuId === connectionId ? null : connectionId);
    };

    // Determinar si mostrar botón de webhook (NO para WhatsApp Web)
    const shouldShowWebhookButton = (connection: ConnectionV2) => {
        return connection.channelType !== 'whatsapp_web' && connection.channelType !== 'webchat';
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
    const showQRButton = (connection: ConnectionV2) => {
        return (connection.channelType === 'whatsapp_web' || connection.channelType === 'whatsapp_api') &&
            connection.status === 'inactive';
    };

    const getActionButton = (connection: ConnectionV2) => {
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

            {/* Tabs */}
            <div className="mb-6">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('connections')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'connections'
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            <div className="flex items-center space-x-2">
                                <Wifi className="w-4 h-4" />
                                <span>Conexiones</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('health')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'health'
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            <div className="flex items-center space-x-2">
                                <Activity className="w-4 h-4" />
                                <span>Monitor de Salud</span>
                            </div>
                        </button>
                    </nav>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'connections' && (
                <>
                    {/* Error Banner */}
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex justify-between items-center">
                            <span>{error}</span>
                            <button onClick={clearError} className="text-red-900 font-bold text-xl">×</button>
                        </div>
                    )}

                    {/* Connections Grid */}
                    <div suppressHydrationWarning className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {connections.map((connection) => {
                            const Icon = getConnectionIcon(connection.channelType);
                            const createdDate = new Date(connection.createdAt).toLocaleDateString('es-ES');
                            const lastSeenDate = connection.lastSeen
                                ? new Date(connection.lastSeen).toLocaleDateString('es-ES')
                                : 'Nunca';

                            return (
                                <div
                                    key={connection.id}
                                    className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow relative"
                                >
                                    {/* Header con menú de 3 puntos */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <Icon className={`w-6 h-6 ${getConnectionColor(connection.channelType)}`} />
                                            <div>
                                                <h3 className="font-medium text-gray-900 dark:text-white">
                                                    {connection.connectionName}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {connection.departmentId ? `Depto: ${connection.departmentId}` : 'Sin departamento'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(connection.status)}`}>
                                                {connection.status === 'active' || connection.status === 'authenticated' ? 'Activo' :
                                                    connection.status === 'inactive' ? 'Inactivo' :
                                                    connection.status === 'connecting' ? 'Conectando' : 'Error'}
                                            </span>

                                            {/* Menú de 3 puntos */}
                                            <div className="relative">
                                                <button
                                                    onClick={() => toggleMenu(connection.id)}
                                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                                                    title="Opciones"
                                                >
                                                    <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                                </button>

                                                {/* Dropdown Menu */}
                                                {openMenuId === connection.id && (
                                                    <>
                                                        {/* Overlay para cerrar el menú */}
                                                        <div
                                                            className="fixed inset-0 z-10"
                                                            onClick={() => setOpenMenuId(null)}
                                                        />

                                                        {/* Menú */}
                                                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-20">
                                                            <button
                                                                onClick={() => handleEditConnection(connection)}
                                                                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors first:rounded-t-lg"
                                                            >
                                                                <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                                <span className="text-gray-700 dark:text-gray-300">Editar</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteConnection(connection)}
                                                                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors last:rounded-b-lg"
                                                            >
                                                                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                                                <span className="text-gray-700 dark:text-gray-300">Eliminar</span>
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex justify-between">
                                            <span>Última actividad:</span>
                                            <span>{lastSeenDate}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Creado:</span>
                                            <span>{createdDate}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Canal:</span>
                                            <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                                                {connection.channelType}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Botones de acción */}
                                    <div className="flex space-x-2 mt-4">
                                        {/* Botón Configurar - siempre visible pero solo para editar metadata, no credenciales */}
                                        {connection.channelType !== 'whatsapp_web' && (
                                            <button
                                                onClick={() => handleConfigureConnection(connection)}
                                                className="flex-1 px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                            >
                                                Configurar
                                            </button>
                                        )}

                                        {/* Botón Webhook - solo para canales que NO sean WhatsApp Web ni WebChat */}
                                        {shouldShowWebhookButton(connection) && (
                                            <button
                                                onClick={() => handleConfigureWebhook(connection)}
                                                className="px-3 py-2 text-sm bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                                                title="Configurar Webhook"
                                            >
                                                <Globe className="w-4 h-4" />
                                            </button>
                                        )}

                                        {/* Botón de acción principal (Conectar/Desconectar) */}
                                        {getActionButton(connection)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {activeTab === 'health' && (
                <ConnectionHealthDashboard
                    connections={connections}
                    onRefresh={fetchConnections}
                />
            )}

            {loading && (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            )}

            {/* Indicador de carga al obtener detalles de conexión */}
            {isLoadingConnection && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="text-gray-700 dark:text-gray-300">Cargando detalles de la conexión...</p>
                    </div>
                </div>
            )}

            {/* Modal para nueva/editar conexión */}
            {showModal && (
                <ConnectionModal
                    isOpen={showModal}
                    onClose={() => {
                        setShowModal(false);
                        setEditingConnection(null);
                    }}
                    connectionType={selectedConnectionType}
                    editingConnection={selectedConnection || editingConnection}
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
                    connectionName={qrConnection.connectionName}
                    connectionType={qrConnection.channelType}
                    tenantId="1"
                />
            )}

            {/* Webhook Configuration Modal */}
            {showWebhookModal && webhookConnection && (
                <WebhookConfigModal
                    isOpen={showWebhookModal}
                    onClose={() => {
                        setShowWebhookModal(false);
                        setWebhookConnection(null);
                    }}
                    providerType={webhookConnection.channelType as any}
                    connectionId={String(webhookConnection.id)}
                    connectionName={webhookConnection.connectionName}
                    webhookConfig={undefined}
                    onSave={handleSaveWebhook}
                />
            )}
        </div>
    );
};