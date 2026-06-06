/**
 * Connections V2 Service
 * Service for managing channel connections via API v2
 *
 * Base URL: /api/v2/connections
 * Documentation: documentation/API_V2_CHANNEL_CONNECTIONS.md
 */

import { apiClient } from '../client';
import type {
  ConnectionV2Response,
  ConnectionsListResponse,
  ConnectionDetailResponse,
  QRCodeResponse,
  ActivateConnectionResponse,
  DeactivateConnectionResponse,
  DeleteConnectionResponse,
  TestConnectionResponse,
  ConnectionStatsResponse,
  ConnectionsSummaryResponse,
  CreateConnectionRequest,
  UpdateConnectionRequest,
  TestConnectionRequest,
  DeactivateConnectionRequest,
  ConnectionsQueryParams,
  ConnectionStatsQueryParams,
} from '@/types/connectionsV2';

const BASE_PATH = '/v2/connections';

/**
 * Connections V2 Service
 * Gestión completa de conexiones de canales
 */
export class ConnectionsV2Service {
  /**
   * 1. Crear una nueva conexión
   * POST /api/v2/connections
   *
   * @param data - Datos de la nueva conexión
   * @returns Conexión creada con información adicional (QR/Webhook)
   *
   * @example
   * // WhatsApp Web
   * const connection = await connectionsV2Service.createConnection({
   *   connectionName: "WhatsApp Ventas",
   *   channelType: "whatsapp_web",
   *   departmentId: 1,
   *   welcomeMessage: "¡Hola!",
   *   chatbotTimeout: 30
   * });
   *
   * @example
   * // Instagram Direct
   * const connection = await connectionsV2Service.createConnection({
   *   connectionName: "Instagram Soporte",
   *   channelType: "instagram_direct",
   *   channelCredentials: {
   *     accessToken: "EAAD...",
   *     verifyToken: "instagram_verify_token_123",
   *     pageId: "123456789",
   *     instagramAccountId: "17841234567890"
   *   }
   * });
   */
  async createConnection(
    data: CreateConnectionRequest
  ): Promise<ConnectionV2Response> {
    const response = await apiClient.post<ConnectionV2Response>(
      BASE_PATH,
      data
    );
    return response.data;
  }

  /**
   * 2. Listar conexiones con filtros y paginación
   * GET /api/v2/connections
   *
   * @param params - Parámetros de filtro y paginación
   * @returns Lista de conexiones con paginación
   *
   * @example
   * // Todas las conexiones
   * const { data } = await connectionsV2Service.getConnections();
   *
   * @example
   * // Filtrar por tipo de canal
   * const { data } = await connectionsV2Service.getConnections({
   *   channelType: 'whatsapp_web'
   * });
   *
   * @example
   * // Filtrar conexiones activas con paginación
   * const { data } = await connectionsV2Service.getConnections({
   *   status: 'active',
   *   isActive: true,
   *   page: 1,
   *   limit: 20
   * });
   */
  async getConnections(
    params?: ConnectionsQueryParams
  ): Promise<ConnectionsListResponse> {
    const queryParams = new URLSearchParams();

    if (params?.channelType) {
      queryParams.append('channelType', params.channelType);
    }
    if (params?.status) {
      queryParams.append('status', params.status);
    }
    if (params?.isActive !== undefined) {
      queryParams.append('isActive', String(params.isActive));
    }
    if (params?.departmentId) {
      queryParams.append('departmentId', String(params.departmentId));
    }
    if (params?.page) {
      queryParams.append('page', String(params.page));
    }
    if (params?.limit) {
      queryParams.append('limit', String(params.limit));
    }

    const queryString = queryParams.toString();
    const url = queryString ? `${BASE_PATH}?${queryString}` : BASE_PATH;

    const response = await apiClient.get<ConnectionsListResponse>(url);
    return response.data;
  }

  /**
   * 3. Obtener detalles de una conexión específica
   * GET /api/v2/connections/:id
   *
   * @param connectionId - ID de la conexión
   * @returns Detalles completos de la conexión
   *
   * @example
   * const { data } = await connectionsV2Service.getConnection(1);
   * console.log(data.connectionName, data.status);
   */
  async getConnection(connectionId: number): Promise<ConnectionDetailResponse> {
    const response = await apiClient.get<ConnectionDetailResponse>(
      `${BASE_PATH}/${connectionId}`
    );
    return response.data;
  }

  /**
   * 4. Obtener código QR para WhatsApp Web
   * GET /api/v2/connections/:id/qr
   *
   * @param connectionId - ID de la conexión WhatsApp Web
   * @returns Código QR en base64 o información de autenticación
   *
   * @example
   * const { data } = await connectionsV2Service.getQRCode(1);
   * if (data.qrCode) {
   *   // Mostrar imagen: <img src={data.qrCode} />
   * } else if (data.message) {
   *   // Ya está autenticado
   *   console.log(data.message, data.phoneNumber);
   * }
   */
  async getQRCode(connectionId: number): Promise<QRCodeResponse> {
    const response = await apiClient.get<QRCodeResponse>(
      `${BASE_PATH}/${connectionId}/qr`
    );
    return response.data;
  }

  /**
   * 5. Actualizar una conexión existente
   * PUT /api/v2/connections/:id
   *
   * @param connectionId - ID de la conexión
   * @param data - Datos a actualizar
   * @returns Conexión actualizada
   *
   * @example
   * const { data } = await connectionsV2Service.updateConnection(1, {
   *   connectionName: "WhatsApp Ventas Actualizado",
   *   welcomeMessage: "Nuevo mensaje de bienvenida",
   *   chatbotTimeout: 45
   * });
   */
  async updateConnection(
    connectionId: number,
    data: UpdateConnectionRequest
  ): Promise<ConnectionV2Response> {
    const response = await apiClient.put<ConnectionV2Response>(
      `${BASE_PATH}/${connectionId}`,
      data
    );
    return response.data;
  }

  /**
   * 6. Activar una conexión
   * POST /api/v2/connections/:id/activate
   *
   * @param connectionId - ID de la conexión
   * @returns Estado de la conexión después de activar
   *
   * @example
   * const { data } = await connectionsV2Service.activateConnection(1);
   * if (data.nextStep?.action === 'scan_qr') {
   *   // Redirigir al usuario a escanear QR
   *   console.log(data.nextStep.endpoint);
   * }
   */
  async activateConnection(
    connectionId: number
  ): Promise<ActivateConnectionResponse> {
    const response = await apiClient.post<ActivateConnectionResponse>(
      `${BASE_PATH}/${connectionId}/activate`
    );
    return response.data;
  }

  /**
   * 7. Desactivar una conexión
   * POST /api/v2/connections/:id/deactivate
   *
   * @param connectionId - ID de la conexión
   * @param data - Razón opcional de desactivación
   * @returns Estado de la conexión después de desactivar
   *
   * @example
   * const { data } = await connectionsV2Service.deactivateConnection(1, {
   *   reason: "Mantenimiento programado"
   * });
   */
  async deactivateConnection(
    connectionId: number,
    data?: DeactivateConnectionRequest
  ): Promise<DeactivateConnectionResponse> {
    const response = await apiClient.post<DeactivateConnectionResponse>(
      `${BASE_PATH}/${connectionId}/deactivate`,
      data
    );
    return response.data;
  }

  /**
   * 8. Eliminar una conexión
   * DELETE /api/v2/connections/:id
   *
   * @param connectionId - ID de la conexión
   * @param permanent - Si true, elimina permanentemente (sin recuperación)
   * @returns Información sobre la eliminación
   *
   * @example
   * // Soft delete (recuperable)
   * await connectionsV2Service.deleteConnection(1);
   *
   * @example
   * // Hard delete (permanente)
   * await connectionsV2Service.deleteConnection(1, true);
   */
  async deleteConnection(
    connectionId: number,
    permanent: boolean = false
  ): Promise<DeleteConnectionResponse> {
    const url = permanent
      ? `${BASE_PATH}/${connectionId}?permanent=true`
      : `${BASE_PATH}/${connectionId}`;

    const response = await apiClient.delete<DeleteConnectionResponse>(url);
    return response.data;
  }

  /**
   * 9. Probar una conexión
   * POST /api/v2/connections/:id/test
   *
   * @param connectionId - ID de la conexión
   * @param data - Datos de prueba (número y mensaje)
   * @returns Resultado del test
   *
   * @example
   * const { data } = await connectionsV2Service.testConnection(1, {
   *   testPhoneNumber: "5551234567",
   *   testMessage: "Mensaje de prueba"
   * });
   * console.log(data.status); // 'sent'
   */
  async testConnection(
    connectionId: number,
    data: TestConnectionRequest
  ): Promise<TestConnectionResponse> {
    const response = await apiClient.post<TestConnectionResponse>(
      `${BASE_PATH}/${connectionId}/test`,
      data
    );
    return response.data;
  }

  /**
   * 10. Obtener estadísticas de una conexión
   * GET /api/v2/connections/:id/stats
   *
   * @param connectionId - ID de la conexión
   * @param params - Parámetros de período y timezone
   * @returns Estadísticas de uso y rendimiento
   *
   * @example
   * const { data } = await connectionsV2Service.getConnectionStats(1, {
   *   period: 'week',
   *   timezone: 'America/Mexico_City'
   * });
   * console.log(data.stats.totalMessages);
   */
  async getConnectionStats(
    connectionId: number,
    params?: ConnectionStatsQueryParams
  ): Promise<ConnectionStatsResponse> {
    const queryParams = new URLSearchParams();

    if (params?.period) {
      queryParams.append('period', params.period);
    }
    if (params?.timezone) {
      queryParams.append('timezone', params.timezone);
    }

    const queryString = queryParams.toString();
    const url = queryString
      ? `${BASE_PATH}/${connectionId}/stats?${queryString}`
      : `${BASE_PATH}/${connectionId}/stats`;

    const response = await apiClient.get<ConnectionStatsResponse>(url);
    return response.data;
  }

  /**
   * 11. Obtener resumen de todas las conexiones del tenant
   * GET /api/v2/connections/summary
   *
   * @returns Resumen con métricas agregadas
   *
   * @example
   * const { data } = await connectionsV2Service.getConnectionsSummary();
   * console.log(data.summary.totalConnections);
   * console.log(data.summary.byChannelType);
   */
  async getConnectionsSummary(): Promise<ConnectionsSummaryResponse> {
    const response = await apiClient.get<ConnectionsSummaryResponse>(
      `${BASE_PATH}/summary`
    );
    return response.data;
  }
}

// Exportar instancia singleton del servicio
export const connectionsV2Service = new ConnectionsV2Service();
