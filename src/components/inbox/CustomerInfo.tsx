'use client';

import { salespeople } from '@/data/mockData';
import type { Chat, Conversation } from '@/types/chat';
import type { Contact } from '@/types/contact';
import type { ProviderType } from '@/types/connections';
import {
  Mail,
  Phone,
  User as UserIcon,
  Edit3,
  Save,
  X,
  Plus,
  Tag,
  MessageSquare,
  Send,
  Building,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
  Star,
  History,
  FileText,
  Settings
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface CustomerInfoProps {
  chat: Chat | null;
  conversation?: Conversation | null;
  contact?: Contact | null;
  onAssignSalesperson: (chatId: string, salesperson: string) => void;
  onUpdateContact?: (contactId: string, updates: Partial<Contact>) => void;
  onAddNote?: (contactId: string, note: string, isInternal?: boolean) => void;
  onAddTag?: (conversationId: string, tag: string) => void;
  onRemoveTag?: (conversationId: string, tag: string) => void;
  onUpdatePriority?: (conversationId: string, priority: 'low' | 'normal' | 'high' | 'urgent') => void;
}

// Helper functions
const getChannelIcon = (channel: ProviderType) => {
  switch (channel) {
    case 'whatsapp':
    case 'whatsapp_api':
      return <MessageSquare className="w-4 h-4 text-green-500" />;
    case 'instagram':
      return <MessageSquare className="w-4 h-4 text-pink-500" />;
    case 'facebook':
      return <MessageSquare className="w-4 h-4 text-blue-500" />;
    case 'telegram':
      return <Send className="w-4 h-4 text-blue-400" />;
    default:
      return <MessageSquare className="w-4 h-4 text-gray-500" />;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'inactive':
      return <XCircle className="w-4 h-4 text-gray-500" />;
    case 'blocked':
      return <Shield className="w-4 h-4 text-red-500" />;
    case 'online':
      return <div className="w-3 h-3 bg-green-500 rounded-full" />;
    case 'offline':
      return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
    default:
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
  }
};

export const CustomerInfo: React.FC<CustomerInfoProps> = ({
  chat,
  conversation,
  contact,
  onAssignSalesperson,
  onUpdateContact,
  onAddNote,
  onAddTag,
  onRemoveTag,
  onUpdatePriority
}) => {
  const [selectedSalesperson, setSelectedSalesperson] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newTag, setNewTag] = useState('');
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [editedContact, setEditedContact] = useState<Partial<Contact>>({});
  const [activeTab, setActiveTab] = useState<'info' | 'notes' | 'history' | 'settings'>('info');
  const [showAddNote, setShowAddNote] = useState(false);
  const [isInternalNote, setIsInternalNote] = useState(false);

  useEffect(() => {
    if (chat) {
      setSelectedSalesperson(chat.assignedTo || '');
    }
    if (conversation?.assignedAgent) {
      setSelectedSalesperson(conversation.assignedAgent.name || '');
    }
  }, [chat, conversation]);

  const handleAssign = () => {
    if (chat && selectedSalesperson) {
      onAssignSalesperson(chat.id, selectedSalesperson);
    }
  };

  const handleSaveContact = () => {
    if (contact && onUpdateContact && Object.keys(editedContact).length > 0) {
      onUpdateContact(contact.id, editedContact);
      setIsEditingContact(false);
      setEditedContact({});
    }
  };

  const handleAddNote = () => {
    if (newNote.trim() && contact && onAddNote) {
      onAddNote(contact.id, newNote.trim(), isInternalNote);
      setNewNote('');
      setShowAddNote(false);
      setIsInternalNote(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && conversation && onAddTag) {
      onAddTag(conversation.id, newTag.trim());
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    if (conversation && onRemoveTag) {
      onRemoveTag(conversation.id, tag);
    }
  };

  const handlePriorityChange = (priority: 'low' | 'normal' | 'high' | 'urgent') => {
    if (conversation && onUpdatePriority) {
      onUpdatePriority(conversation.id, priority);
    }
  };

  if (!chat && !conversation) return null;

  const displayContact = contact || (conversation?.contact);
  const displayName = displayContact?.name || chat?.name || 'Cliente';
  const displayPhone = displayContact?.phone || chat?.phone;
  const displayEmail = displayContact?.email || chat?.email;

  return (
    <div className="w-1/5 bg-white dark:bg-gray-800 border-l border-gray-300 dark:border-gray-600 flex flex-col">
      {/* Header with tabs */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Información del Cliente</h2>
          {displayContact && (
            <button
              onClick={() => setIsEditingContact(!isEditingContact)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Editar contacto"
            >
              {isEditingContact ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {[
            { id: 'info', label: 'Info', icon: UserIcon },
            { id: 'notes', label: 'Notas', icon: FileText },
            { id: 'history', label: 'Historial', icon: History },
            { id: 'settings', label: 'Config', icon: Settings }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex-1 flex items-center justify-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-colors ${activeTab === id
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
            >
              <Icon className="w-3 h-3" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'info' && (
          <div className="space-y-6">
            {/* Contact Information */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900 dark:text-white">Datos de Contacto</h3>
                {displayContact?.status && (
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(displayContact.status)}
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {displayContact.status}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {/* Name */}
                <div className="flex items-center space-x-2">
                  <UserIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  {isEditingContact ? (
                    <input
                      type="text"
                      value={editedContact.name || displayName}
                      onChange={(e) => setEditedContact(prev => ({ ...prev, name: e.target.value }))}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:outline-none focus:border-green-500"
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

                {/* Additional phones for legacy chat */}
                {chat?.additionalPhones && chat.additionalPhones.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Teléfonos adicionales:</div>
                    {chat.additionalPhones.map((phone, index) => (
                      <div key={index} className="flex items-center space-x-2 ml-6">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{phone}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Channels */}
                {displayContact?.channels && displayContact.channels.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Canales de comunicación:</div>
                    <div className="space-y-1">
                      {displayContact.channels.map((channel, index) => (
                        <div key={index} className="flex items-center space-x-2 ml-2">
                          {getChannelIcon(channel.type)}
                          <span className="text-sm text-gray-700 dark:text-gray-300">{channel.identifier}</span>
                          {channel.isPrimary && (
                            <div title="Canal principal">
                              <Star className="w-3 h-3 text-yellow-500" />
                            </div>
                          )}
                          {channel.isVerified && (
                            <div title="Verificado">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Save button for editing */}
                {isEditingContact && (
                  <button
                    onClick={handleSaveContact}
                    className="w-full px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Save className="w-4 h-4 inline mr-2" />
                    Guardar Cambios
                  </button>
                )}
              </div>
            </div>

            {/* Tags */}
            {(displayContact?.tags || conversation?.tags) && (
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Etiquetas</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(displayContact?.tags || conversation?.tags || []).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 text-xs rounded-full"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                      {conversation && onRemoveTag && (
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>

                {conversation && onAddTag && (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Nueva etiqueta"
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:outline-none focus:border-green-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <button
                      onClick={handleAddTag}
                      disabled={!newTag.trim()}
                      className="px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Assignment */}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">Asignación</h3>
              <select
                value={selectedSalesperson}
                onChange={(e) => setSelectedSalesperson(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:border-green-500"
              >
                <option value="">Sin asignar</option>
                {salespeople.map((person) => (
                  <option key={person} value={person}>{person}</option>
                ))}
              </select>
              <button
                onClick={handleAssign}
                disabled={selectedSalesperson === (chat?.assignedTo || conversation?.assignedAgent?.name)}
                className="w-full mt-2 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Asignar
              </button>
            </div>

            {/* Priority (for conversations) */}
            {conversation && onUpdatePriority && (
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Prioridad</h3>
                <select
                  value={conversation.priority}
                  onChange={(e) => handlePriorityChange(e.target.value as any)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:border-green-500"
                >
                  <option value="low">Baja</option>
                  <option value="normal">Normal</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
            )}

            {/* Quick Stats */}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">Estadísticas</h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Mensajes totales:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {chat?.messages?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Último contacto:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {conversation?.updatedAt
                      ? new Date(conversation.updatedAt).toLocaleDateString('es-ES')
                      : chat?.timestamp
                    }
                  </span>
                </div>
                {conversation && (
                  <div className="flex justify-between">
                    <span>No leídos:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {conversation.unreadCount}
                    </span>
                  </div>
                )}
                {displayContact?.createdAt && (
                  <div className="flex justify-between">
                    <span>Cliente desde:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(displayContact.createdAt).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-4">
            {/* Add Note Button */}
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-900 dark:text-white">Notas</h3>
              <button
                onClick={() => setShowAddNote(!showAddNote)}
                className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
              >
                <Plus className="w-4 h-4 inline mr-1" />
                Agregar
              </button>
            </div>

            {/* Add Note Form */}
            {showAddNote && (
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Escribe una nota..."
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded text-sm resize-none focus:outline-none focus:border-green-500"
                  rows={3}
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <input
                      type="checkbox"
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span>Nota interna</span>
                  </label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setShowAddNote(false);
                        setNewNote('');
                        setIsInternalNote(false);
                      }}
                      className="px-3 py-1 text-gray-600 dark:text-gray-400 text-sm hover:text-gray-800 dark:hover:text-gray-200"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddNote}
                      disabled={!newNote.trim()}
                      className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notes List */}
            <div className="space-y-3">
              {(displayContact?.notes || []).map((note) => (
                <div key={note.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {note.authorName}
                      </span>
                      {(note as any).isInternal && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 text-xs rounded">
                          Interno
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(note.createdAt).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {note.content}
                  </p>
                </div>
              ))}

              {(!displayContact?.notes || displayContact.notes.length === 0) && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay notas disponibles</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 dark:text-white">Historial de Conversaciones</h3>
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Historial no disponible</p>
              <p className="text-xs mt-1">Esta funcionalidad se implementará próximamente</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 dark:text-white">Configuración</h3>
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Configuración no disponible</p>
              <p className="text-xs mt-1">Esta funcionalidad se implementará próximamente</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};