'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Edit, 
  Eye, 
  Trash2, 
  Phone, 
  Mail, 
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  UserCheck,
  UserX,
  Shield,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useContactStore } from '@/stores/contactStore';
import type { Contact, ProviderType } from '@/lib/api/types';

const CHANNEL_OPTIONS: { value: ProviderType; label: string }[] = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'whatsapp_api', label: 'WhatsApp API' },
  { value: 'chatweb', label: 'Chat Web' },
];

interface ContactTableProps {
  contacts: Contact[];
  loading: boolean;
  onEdit: (contact: Contact) => void;
  onView: (contact: Contact) => void;
  onDelete?: (contact: Contact) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const CHANNEL_ICONS = {
  whatsapp: '📱',
  facebook: '📘',
  instagram: '📷',
  telegram: '✈️',
  whatsapp_api: '📱',
  chatweb: '💬',
};

const STATUS_STYLES = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-yellow-100 text-yellow-800',
  blocked: 'bg-red-100 text-red-800',
};

const STATUS_LABELS = {
  active: 'Activo',
  inactive: 'Inactivo',
  blocked: 'Bloqueado',
};

export function ContactTable({
  contacts,
  loading,
  onEdit,
  onView,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
}: ContactTableProps) {
  const {
    selectedContactIds,
    toggleContactSelection,
    selectAllContacts,
    clearSelection,
    deleteContact,
    updateContact,
  } = useContactStore();

  const [sortField, setSortField] = useState<keyof Contact>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActionMenuOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSort = (field: keyof Contact) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedContactIds.size === contacts.length) {
      clearSelection();
    } else {
      selectAllContacts();
    }
  };

  const handleDeleteContact = async (contact: Contact) => {
    if (confirm(`¿Estás seguro de que quieres eliminar el contacto "${contact.name}"?`)) {
      const success = await deleteContact(contact.id);
      if (success && onDelete) {
        onDelete(contact);
      }
    }
  };

  const handleStatusChange = async (contact: Contact, status: 'active' | 'inactive' | 'blocked') => {
    await updateContact(contact.id, { id: contact.id, status });
    setActionMenuOpen(null);
  };

  const handleCopyContactInfo = (contact: Contact) => {
    const info = [
      `Nombre: ${contact.name}`,
      contact.phone && `Teléfono: ${contact.phone}`,
      contact.email && `Email: ${contact.email}`,
      `Departamento: ${contact.department}`,
    ].filter(Boolean).join('\n');
    
    navigator.clipboard.writeText(info);
    setActionMenuOpen(null);
  };

  const handleOpenChannel = (contact: Contact, channelType: string) => {
    const channel = contact.channels.find(ch => ch.type === channelType);
    if (!channel) return;

    let url = '';
    switch (channelType) {
      case 'whatsapp':
      case 'whatsapp_api':
        url = `https://wa.me/${channel.identifier.replace(/[^\d]/g, '')}`;
        break;
      case 'facebook':
        url = `https://facebook.com/${channel.identifier}`;
        break;
      case 'instagram':
        url = `https://instagram.com/${channel.identifier}`;
        break;
      case 'telegram':
        url = `https://t.me/${channel.identifier}`;
        break;
      default:
        return;
    }
    
    window.open(url, '_blank');
    setActionMenuOpen(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getChannelIcons = (channels: Contact['channels']) => {
    return channels.slice(0, 3).map((channel, index) => (
      <span key={index} title={channel.type} className="text-sm">
        {CHANNEL_ICONS[channel.type as keyof typeof CHANNEL_ICONS] || '💬'}
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Cargando contactos...</p>
        </div>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay contactos</h3>
          <p className="text-sm text-gray-500">
            No se encontraron contactos que coincidan con los filtros aplicados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedContactIds.size === contacts.length && contacts.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                Nombre
                {sortField === 'name' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Canales
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('department')}
              >
                Departamento
                {sortField === 'department' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                Estado
                {sortField === 'status' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('createdAt')}
              >
                Creado
                {sortField === 'createdAt' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contacts.map((contact) => (
              <tr
                key={contact.id}
                className={`hover:bg-gray-50 ${
                  selectedContactIds.has(contact.id) ? 'bg-blue-50' : ''
                }`}
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedContactIds.has(contact.id)}
                    onChange={() => toggleContactSelection(contact.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {contact.avatar ? (
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="w-8 h-8 rounded-full mr-3"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <span className="text-xs font-medium text-gray-600">
                          {contact.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {contact.name}
                      </div>
                      {contact.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {contact.tags.slice(0, 2).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {tag}
                            </span>
                          ))}
                          {contact.tags.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{contact.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {contact.phone && (
                      <div className="flex items-center mb-1">
                        <Phone className="w-3 h-3 mr-1 text-gray-400" />
                        {contact.phone}
                      </div>
                    )}
                    {contact.email && (
                      <div className="flex items-center">
                        <Mail className="w-3 h-3 mr-1 text-gray-400" />
                        {contact.email}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-1">
                    {getChannelIcons(contact.channels)}
                    {contact.channels.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{contact.channels.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {contact.department}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      STATUS_STYLES[contact.status]
                    }`}
                  >
                    {STATUS_LABELS[contact.status]}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatDate(contact.createdAt)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onView(contact)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(contact)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    {/* Action Menu */}
                    <div className="relative" ref={menuRef}>
                      <button
                        onClick={() => setActionMenuOpen(actionMenuOpen === contact.id ? null : contact.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="Más acciones"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {actionMenuOpen === contact.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                          <div className="py-1">
                            {/* Status Actions */}
                            <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                              Estado
                            </div>
                            {contact.status !== 'active' && (
                              <button
                                onClick={() => handleStatusChange(contact, 'active')}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <UserCheck className="w-4 h-4 mr-2 text-green-600" />
                                Activar
                              </button>
                            )}
                            {contact.status !== 'inactive' && (
                              <button
                                onClick={() => handleStatusChange(contact, 'inactive')}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <UserX className="w-4 h-4 mr-2 text-yellow-600" />
                                Desactivar
                              </button>
                            )}
                            {contact.status !== 'blocked' && (
                              <button
                                onClick={() => handleStatusChange(contact, 'blocked')}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Shield className="w-4 h-4 mr-2 text-red-600" />
                                Bloquear
                              </button>
                            )}
                            
                            {/* Communication Actions */}
                            {contact.channels.length > 0 && (
                              <>
                                <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100 border-t border-gray-100 mt-1">
                                  Comunicación
                                </div>
                                {contact.channels.slice(0, 3).map((channel, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => handleOpenChannel(contact, channel.type)}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <ExternalLink className="w-4 h-4 mr-2 text-blue-600" />
                                    Abrir {CHANNEL_OPTIONS.find(opt => opt.value === channel.type)?.label || channel.type}
                                  </button>
                                ))}
                              </>
                            )}
                            
                            {/* Utility Actions */}
                            <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100 border-t border-gray-100 mt-1">
                              Utilidades
                            </div>
                            <button
                              onClick={() => handleCopyContactInfo(contact)}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Copy className="w-4 h-4 mr-2 text-gray-600" />
                              Copiar información
                            </button>
                            
                            {/* Danger Zone */}
                            <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100 border-t border-gray-100 mt-1">
                              Zona de peligro
                            </div>
                            <button
                              onClick={() => handleDeleteContact(contact)}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar contacto
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Página {currentPage} de {totalPages}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {/* Page numbers */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`px-3 py-1 text-sm rounded-md ${
                      pageNum === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}