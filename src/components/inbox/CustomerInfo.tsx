'use client';

import { ProviderType } from '@/types/connections';
import { Contact } from '@/types/contact';
import {
    Conversation,
    ConversationAgent,
    ConversationPriority
} from '@/types/inbox';
import {
    Archive,
    Building,
    Clock,
    Edit2,
    Mail,
    MessageSquare,
    Phone,
    Plus,
    Save,
    Tag,
    User,
    X
} from 'lucide-react';
import React, { useCallback, useState } from 'react';

interface CustomerInfoProps {
    conversation?: Conversation | null;
    contact?: Contact;
    agents?: ConversationAgent[];
    availableTags?: string[];
    isLoading?: boolean;
    onUpdateContact?: (contactId: string, updates: Partial<Contact>) => Promise<void>;
    onAddNote?: (conversationId: string, content: string, isInternal: boolean) => Promise<void>;
    onAssignAgent?: (conversationId: string, agentId: string) => Promise<void>;
    onUpdatePriority?: (conversationId: string, priority: ConversationPriority) => Promise<void>;
    onAddTag?: (conversationId: string, tag: string) => Promise<void>;
    onRemoveTag?: (conversationId: string, tag: string) => Promise<void>;
    onCloseConversation?: (conversationId: string) => Promise<void>;
}

const PRIORITY_COLORS: Record<ConversationPriority, string> = {
    low: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',
    normal: 'text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400',
    high: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400',
    urgent: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
};

const PRIORITY_LABELS: Record<ConversationPriority, string> = {
    low: 'Baja',
    normal: 'Normal',
    high: 'Alta',
    urgent: 'Urgente'
};
  
const CHANNEL_LABELS: Record<ProviderType, string> = {
    whatsapp: 'WhatsApp',
    whatsapp_api: 'WhatsApp Business',
    instagram: 'Instagram',
    facebook: 'Facebook Messenger',
    telegram: 'Telegram'
};

export const CustomerInfo: React.FC<CustomerInfoProps> = ({
    conversation,
    contact,
    agents = [],
    availableTags = [],
    isLoading = false,
    onUpdateContact,
    onAddNote,
    onAssignAgent,
    onUpdatePriority,
    onAddTag,
    onRemoveTag,
    onCloseConversation
}) => {
    // State
    const [isEditingContact, setIsEditingContact] = useState(false);
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [isAddingTag, setIsAddingTag] = useState(false);
    const [editedContact, setEditedContact] = useState<Partial<Contact>>({});
    const [newNote, setNewNote] = useState('');
    const [newNoteIsInternal, setNewNoteIsInternal] = useState(false);
    const [newTag, setNewTag] = useState('');
    const [selectedAgentId, setSelectedAgentId] = useState(conversation?.assignedAgentId || '');
    const [selectedPriority, setSelectedPriority] = useState<ConversationPriority>(
        conversation?.priority || 'normal'
    );

    // Handle
    const handleSaveContact = useCallback(async () => {
        if (!contact || !onUpdateContact) return;
    
        try {
          await onUpdateContact(contact.id, editedContact);
          setIsEditingContact(false);
          setEditedContact({});
        } catch (error) {
          console.error('Error updating contact:', error);
        }
    }, [contact, editedContact, onUpdateContact]);

    const handleCancelEditContact = useCallback(() => {
        setIsEditingContact(false);
        setEditedContact({});
    }, []);

    const handleAddNote = useCallback(async () => {
        if (!conversation || !newNote.trim() || !onAddNote) return;
    
        try {
          await onAddNote(conversation.id, newNote.trim(), newNoteIsInternal);
          setNewNote('');
          setNewNoteIsInternal(false);
          setIsAddingNote(false);
        } catch (error) {
          console.error('Error adding note:', error);
        }
    }, [conversation, newNote, newNoteIsInternal, onAddNote]);

    const handleAssignAgent = useCallback(async (agentId: string) => {
        if (!conversation || !onAssignAgent) return;
    
        try {
          await onAssignAgent(conversation.id, agentId);
          setSelectedAgentId(agentId);
        } catch (error) {
          console.error('Error assigning agent:', error);
        }
    }, [conversation, onAssignAgent]);

    const handleUpdatePriority = useCallback(async (priority: ConversationPriority) => {
        if (!conversation || !onUpdatePriority) return;
    
        try {
          await onUpdatePriority(conversation.id, priority);
          setSelectedPriority(priority);
        } catch (error) {
          console.error('Error updating priority:', error);
        }
    }, [conversation, onUpdatePriority]);

    const handleAddTag = useCallback(async () => {
        if (!conversation || !newTag.trim() || !onAddTag) return;
    
        try {
          await onAddTag(conversation.id, newTag.trim());
          setNewTag('');
          setIsAddingTag(false);
        } catch (error) {
          console.error('Error adding tag:', error);
        }
    }, [conversation, newTag, onAddTag]);

    const handleRemoveTag = useCallback(async (tag: string) => {
        if (!conversation || !onRemoveTag) return;
    
        try {
          await onRemoveTag(conversation.id, tag);
        } catch (error) {
          console.error('Error removing tag:', error);
        }
    }, [conversation, onRemoveTag]);
    
    const handleCloseConversation = useCallback(async () => {
        if (!conversation || !onCloseConversation) return;
    
        if (window.confirm('¿Estás seguro de que quieres cerrar esta conversación?')) {
          try {
            await onCloseConversation(conversation.id);
          } catch (error) {
            console.error('Error closing conversation:', error);
          }
        }
    }, [conversation, onCloseConversation]);        
    
    // Early return if no data
    if (!conversation && !contact) {
        return (
          <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Selecciona una conversación para ver los detalles</p>
            </div>
          </div>
        );
    }

    // Get display data (prefer conversation's contact data if available)
    const displayContact = conversation?.contact || contact;
    const displayName = displayContact?.name || 'Sin nombre';
    const displayPhone = displayContact?.phone;
    const displayEmail = displayContact?.email;

    return (
        <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Información del Cliente
                </h3>
                {conversation && (
                <div className="flex items-center space-x-1">
                    <span className={`px-2 py-1 text-xs rounded-full ${PRIORITY_COLORS[selectedPriority]}`}>
                    {PRIORITY_LABELS[selectedPriority]}
                    </span>
                </div>
                )}
            </div>
            </div>
    
            {/* Loading State */}
            {isLoading && (
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
            )}
    
            {/* Empty State */}
            {!conversation && !contact && !isLoading && (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Selecciona una conversación para ver los detalles</p>
                </div>
            </div>
            )}
    
            {/* Content */}
            {!isLoading && (conversation || contact) && (
            <div className="flex-1 overflow-y-auto">
                {/* Contact Information */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Información de Contacto
                    </h4>
                    {onUpdateContact && (
                    <button
                        onClick={() => setIsEditingContact(!isEditingContact)}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        title={isEditingContact ? 'Cancelar edición' : 'Editar contacto'}
                    >
                        {isEditingContact ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                    </button>
                    )}
                </div>
        
                <div className="space-y-3">
                    {/* Name */}
                    <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    {isEditingContact ? (
                        <input
                        type="text"
                        value={editedContact.name || displayName}
                        onChange={(e) => setEditedContact(prev => ({ ...prev, name: e.target.value }))}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:outline-none focus:border-green-500"
                        placeholder="Nombre del contacto"
                        />
                    ) : (
                        <span className="text-sm text-gray-700 dark:text-gray-300">{displayName}</span>
                    )}
                    </div>
        
                    {/* Phone */}
                    {displayPhone && (
                    <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        {isEditingContact ? (
                        <input
                            type="tel"
                            value={editedContact.phone || displayPhone}
                            onChange={(e) => setEditedContact(prev => ({ ...prev, phone: e.target.value }))}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:outline-none focus:border-green-500"
                            placeholder="Teléfono"
                        />
                        ) : (
                        <span className="text-sm text-gray-700 dark:text-gray-300">{displayPhone}</span>
                        )}
                    </div>
                    )}
        
                    {/* Email */}
                    {displayEmail && (
                    <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        {isEditingContact ? (
                        <input
                            type="email"
                            value={editedContact.email || displayEmail}
                            onChange={(e) => setEditedContact(prev => ({ ...prev, email: e.target.value }))}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:outline-none focus:border-green-500"
                            placeholder="Email"
                        />
                        ) : (
                        <span className="text-sm text-gray-700 dark:text-gray-300">{displayEmail}</span>
                        )}
                    </div>
                    )}
        
                    {/* Department */}
                    {displayContact?.department && (
                    <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{displayContact.department}</span>
                    </div>
                    )}
        
                    {/* Additional Contact Channels */}
                    {displayContact?.channels && displayContact.channels.length > 0 && (
                        <div className="space-y-2">
                            <div className="text-xs text-gray-500 dark:text-gray-400">Canales adicionales:</div>
                                {displayContact.channels.map((channel, index) => (
                                    <div key={index} className="flex items-center space-x-2 ml-6">
                                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                                        {CHANNEL_LABELS[channel.type as ProviderType || channel.type]}
                                        </span>
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{channel.identifier}</span>
                                    </div>
                                ))}
                        </div>
                    )}
        
                    {/* Save/Cancel buttons for editing */}
                    {isEditingContact && (
                    <div className="flex space-x-2 pt-2">
                        <button
                            onClick={handleSaveContact}
                            className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                        >
                            <Save className="w-3 h-3" />
                            <span>Guardar</span>
                        </button>
                        <button
                            onClick={handleCancelEditContact}
                            className="flex items-center space-x-1 px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                        >
                            <X className="w-3 h-3" />
                            <span>Cancelar</span>
                        </button>
                    </div>
                    )}
                </div>
                </div>
        
                {/* Conversation Details */}
                {conversation && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                    Detalles de Conversación
                    </h4>
        
                    <div className="space-y-3">
                    {/* Channel */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Canal:</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                        {CHANNEL_LABELS[conversation.channel as ProviderType || conversation.channel]}
                        </span>
                    </div>
        
                    {/* Status */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Estado:</span>
                        <span className={`text-sm px-2 py-1 rounded ${
                        conversation.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        conversation.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                        {conversation.status === 'active' ? 'Activa' :
                        conversation.status === 'pending' ? 'Pendiente' :
                        conversation.status === 'closed' ? 'Cerrada' : 'Archivada'}
                        </span>
                    </div>
        
                    {/* Priority */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Prioridad:</span>
                        {onUpdatePriority ? (
                        <select
                            value={selectedPriority}
                            onChange={(e) => handleUpdatePriority(e.target.value as ConversationPriority)}
                            className="text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded px-2 py-1"
                        >
                            <option value="low">Baja</option>
                            <option value="normal">Normal</option>
                            <option value="high">Alta</option>
                            <option value="urgent">Urgente</option>
                        </select>
                        ) : (
                        <span className={`text-sm px-2 py-1 rounded ${PRIORITY_COLORS[conversation.priority]}`}>
                            {PRIORITY_LABELS[conversation.priority]}
                        </span>
                        )}
                    </div>
        
                    {/* Assigned Agent */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Asignado a:</span>
                        {onAssignAgent ? (
                        <select
                            value={selectedAgentId}
                            onChange={(e) => handleAssignAgent(e.target.value)}
                            className="text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded px-2 py-1"
                        >
                            <option value="">Sin asignar</option>
                            {agents.map(agent => (
                            <option key={agent.id} value={agent.id}>{agent.name}</option>
                            ))}
                        </select>
                        ) : (
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            {conversation.assignedAgent?.name || 'Sin asignar'}
                        </span>
                        )}
                    </div>
        
                    {/* Department */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Departamento:</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{conversation.department}</span>
                    </div>
        
                    {/* Unread Count */}
                    {conversation.unreadCount > 0 && (
                        <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Mensajes sin leer:</span>
                        <span className="text-sm bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 px-2 py-1 rounded">
                            {conversation.unreadCount}
                        </span>
                        </div>
                    )}
        
                    {/* Created/Updated dates */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Creada:</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                        {new Date(conversation.createdAt).toLocaleDateString('es-ES')}
                        </span>
                    </div>
        
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Última actividad:</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                        {new Date(conversation.updatedAt).toLocaleDateString('es-ES')}
                        </span>
                    </div>
                    </div>
                </div>
                )}
        
                {/* Tags */}
                {conversation && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Etiquetas</h4>
                    {onAddTag && (
                        <button
                        onClick={() => setIsAddingTag(true)}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        title="Agregar etiqueta"
                        >
                        <Plus className="w-4 h-4" />
                        </button>
                    )}
                    </div>
        
                    {/* Add tag form */}
                    {isAddingTag && (
                    <div className="mb-3 space-y-2">
                        <div className="flex space-x-2">
                        <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="Nueva etiqueta"
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:outline-none focus:border-green-500"
                            onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleAddTag();
                            } else if (e.key === 'Escape') {
                                setIsAddingTag(false);
                                setNewTag('');
                            }
                            }}
                        />
                        </div>
                        {availableTags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {availableTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => {
                                setNewTag(tag);
                                handleAddTag();
                                }}
                                className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                                {tag}
                            </button>
                            ))}
                        </div>
                        )}
                        <div className="flex space-x-2">
                        <button
                            onClick={handleAddTag}
                            disabled={!newTag.trim()}
                            className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Agregar
                        </button>
                        <button
                            onClick={() => {
                            setIsAddingTag(false);
                            setNewTag('');
                            }}
                            className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                        >
                            Cancelar
                        </button>
                        </div>
                    </div>
                    )}
        
                    {/* Tags list */}
                    <div className="flex flex-wrap gap-2">
                    {conversation.tags.length > 0 ? (
                        conversation.tags.map(tag => (
                        <div key={tag} className="flex items-center space-x-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 px-2 py-1 rounded text-sm">
                            <Tag className="w-3 h-3" />
                            <span>{tag}</span>
                            {onRemoveTag && (
                            <button
                                onClick={() => handleRemoveTag(tag)}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                title="Eliminar etiqueta"
                            >
                                <X className="w-3 h-3" />
                            </button>
                            )}
                        </div>
                        ))
                    ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">Sin etiquetas</span>
                    )}
                    </div>
                </div>
                )}
        
                {/* Notes */}
                {conversation && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Notas</h4>
                    {onAddNote && (
                        <button
                        onClick={() => setIsAddingNote(true)}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        title="Agregar nota"
                        >
                        <Plus className="w-4 h-4" />
                        </button>
                    )}
                    </div>
        
                    {/* Add note form */}
                    {isAddingNote && (
                    <div className="mb-4 space-y-3">
                        <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Escribir una nota..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:outline-none focus:border-green-500 resize-none"
                        rows={3}
                        />
                        <div className="flex items-center space-x-3">
                        <label className="flex items-center space-x-2">
                            <input
                            type="checkbox"
                            checked={newNoteIsInternal}
                            onChange={(e) => setNewNoteIsInternal(e.target.checked)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Nota interna</span>
                        </label>
                        </div>
                        <div className="flex space-x-2">
                        <button
                            onClick={handleAddNote}
                            disabled={!newNote.trim()}
                            className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Guardar
                        </button>
                        <button
                            onClick={() => {
                            setIsAddingNote(false);
                            setNewNote('');
                            setNewNoteIsInternal(false);
                            }}
                            className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                        >
                            Cancelar
                        </button>
                        </div>
                    </div>
                    )}
        
                    {/* Notes list */}
                    <div className="space-y-3">
                    {conversation.notes && conversation.notes.length > 0 ? (
                        conversation.notes.map((note) => (
                        <div key={note.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {note.authorName}
                                </span>
                                {note.isInternal && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 text-xs rounded">
                                    Interno
                                </span>
                                )}
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(note.createdAt).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                                })}
                            </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{note.content}</p>
                        </div>
                        ))
                    ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">Sin notas</span>
                    )}
                    </div>
                </div>
                )}
        
                {/* Contact History */}
                {displayContact && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Historial de Interacciones
                    </h4>
                    <div className="space-y-2">
                    {displayContact.lastInteraction ? (
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                        <div className="flex items-center space-x-1 mb-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span>Última interacción:</span>
                        </div>
                        <span className="text-gray-500 dark:text-gray-400">
                            {new Date(displayContact.lastInteraction).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                            })}
                        </span>
                        </div>
                    ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                        Primera interacción
                        </span>
                    )}
        
                    {displayContact.totalInteractions && (
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-gray-500 dark:text-gray-400">
                            Total de interacciones: {displayContact.totalInteractions}
                        </span>
                        </div>
                    )}
                    </div>
                </div>
                )}
        
                {/* Actions */}
                {conversation && conversation.status === 'active' && (
                <div className="p-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Acciones</h4>
                    <div className="space-y-2">
                    {onCloseConversation && (
                        <button
                        onClick={handleCloseConversation}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                        >
                        <X className="w-4 h-4" />
                        <span>Cerrar Conversación</span>
                        </button>
                    )}
        
                    <button
                        onClick={() => {
                        console.log('Archive conversation:', conversation.id);
                        }}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                    >
                        <Archive className="w-4 h-4" />
                        <span>Archivar Conversación</span>
                    </button>
        
                    <button
                        onClick={() => {
                        console.log('Transfer conversation:', conversation.id);
                        }}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                    >
                        <User className="w-4 h-4" />
                        <span>Transferir Conversación</span>
                    </button>
                    </div>
                </div>
                )}
        
                {/* Conversation Stats */}
                {conversation && (
                <div className="p-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Estadísticas
                    </h4>
                    <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Mensajes totales:</span>
                        <span className="text-gray-700 dark:text-gray-300">-</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Tiempo de respuesta promedio:</span>
                        <span className="text-gray-700 dark:text-gray-300">-</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Estado de la conversación:</span>
                        <span className={`text-sm px-2 py-1 rounded ${
                        conversation.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        conversation.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                        {conversation.status === 'active' ? 'Activa' :
                        conversation.status === 'pending' ? 'Pendiente' :
                        conversation.status === 'closed' ? 'Cerrada' : 'Archivada'}
                        </span>
                    </div>
                    </div>
                </div>
                )}
            </div>
            )}
        </div>
    );
};