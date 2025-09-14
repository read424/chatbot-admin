'use client';

import { useEffect, useState } from 'react';
import { Search, Plus, Filter, Download, Upload, MoreVertical } from 'lucide-react';
import { useContactStore } from '@/stores/contactStore';
import { ContactTable, ContactModal, ContactFilters } from './index';
import type { ContactFilters as ContactFiltersType } from '@/lib/api/types';

interface ContactsPageProps {
    initialFilters?: ContactFiltersType;
}

export function ContactsPage({ initialFilters = {} }: ContactsPageProps) {
    const {
        contacts,
        loading,
        error,
        currentPage,
        totalPages,
        totalContacts,
        pageSize,
        filters,
        searchQuery,
        selectedContactIds,
        fetchContacts,
        setSearchQuery,
        setFilters,
        clearSelection,
        deleteSelectedContacts,
        bulkUpdateSelectedContacts,
        fetchContactStats,
    } = useContactStore();

    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [searchInput, setSearchInput] = useState(searchQuery);

    // Initialize filters and fetch data
    useEffect(() => {
        if (Object.keys(initialFilters).length > 0) {
            setFilters(initialFilters);
        }
        fetchContacts(1, initialFilters);
        fetchContactStats();
    }, []);

    // Handle search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== searchQuery) {
                setSearchQuery(searchInput);
                fetchContacts(1, { ...filters, search: searchInput });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchInput, searchQuery, filters]);

    const handlePageChange = (page: number) => {
        fetchContacts(page, filters);
    };

    const handleFiltersChange = (newFilters: Partial<ContactFiltersType>) => {
        const updatedFilters = { ...filters, ...newFilters };
        setFilters(updatedFilters);
        fetchContacts(1, updatedFilters);
    };

    const handleCreateContact = () => {
        setSelectedContact(null);
        setIsContactModalOpen(true);
    };

    const handleEditContact = (contact: any) => {
        setSelectedContact(contact);
        setIsContactModalOpen(true);
    };

    const handleBulkDelete = async () => {
        if (selectedContactIds.size === 0) return;

        if (confirm(`¿Estás seguro de que quieres eliminar ${selectedContactIds.size} contacto(s)?`)) {
            const success = await deleteSelectedContacts();
            if (success) {
                clearSelection();
            }
        }
    };

    const handleBulkStatusUpdate = async (status: 'active' | 'inactive' | 'blocked') => {
        if (selectedContactIds.size === 0) return;

        const success = await bulkUpdateSelectedContacts({ status });
        if (success) {
            clearSelection();
        }
    };

    const handleExport = async () => {
        try {
            // This would trigger the export functionality
            // For now, we'll just show a placeholder
            alert('Función de exportación en desarrollo');
        } catch (error) {
            console.error('Error exporting contacts:', error);
        }
    };

    const handleImport = () => {
        // This would trigger the import functionality
        alert('Función de importación en desarrollo');
    };

    const selectedCount = selectedContactIds.size;
    const hasSelection = selectedCount > 0;

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Contactos</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            {totalContacts} contacto{totalContacts !== 1 ? 's' : ''} total
                            {hasSelection && ` • ${selectedCount} seleccionado${selectedCount !== 1 ? 's' : ''}`}
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        {hasSelection && (
                            <div className="flex items-center space-x-2 mr-4">
                                <button
                                    onClick={() => handleBulkStatusUpdate('active')}
                                    className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                                >
                                    Activar
                                </button>
                                <button
                                    onClick={() => handleBulkStatusUpdate('inactive')}
                                    className="px-3 py-1.5 text-sm bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors"
                                >
                                    Desactivar
                                </button>
                                <button
                                    onClick={() => handleBulkStatusUpdate('blocked')}
                                    className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                                >
                                    Bloquear
                                </button>
                                <button
                                    onClick={handleBulkDelete}
                                    className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                                >
                                    Eliminar
                                </button>
                            </div>
                        )}

                        <button
                            onClick={handleImport}
                            className="flex items-center px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Importar
                        </button>

                        <button
                            onClick={handleExport}
                            className="flex items-center px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Exportar
                        </button>

                        <button
                            onClick={handleCreateContact}
                            className="flex items-center px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Nuevo Contacto
                        </button>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center space-x-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar contactos por nombre, teléfono o email..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Filter Toggle */}
                    <button
                        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                        className={`flex items-center px-3 py-2 text-sm border rounded-md transition-colors ${isFiltersOpen || Object.keys(filters).length > 0
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Filtros
                        {Object.keys(filters).length > 0 && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                                {Object.keys(filters).length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Filters Panel */}
                {isFiltersOpen && (
                    <div className="mt-4">
                        <ContactFilters
                            filters={filters}
                            onFiltersChange={handleFiltersChange}
                            onClose={() => setIsFiltersOpen(false)}
                        />
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                <ContactTable
                    contacts={contacts}
                    loading={loading}
                    onEdit={handleEditContact}
                    onView={handleEditContact}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </div>

            {/* Contact Modal */}
            {isContactModalOpen && (
                <ContactModal
                    isOpen={isContactModalOpen}
                    onClose={() => setIsContactModalOpen(false)}
                    contact={selectedContact}
                />
            )}
        </div>
    );
}