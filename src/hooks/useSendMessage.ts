import { inboxService } from '@/lib/api/services/inbox';
import type { Message, SendMessageRequest, SendMessageWithAttachmentsRequest } from '@/types/inbox';
import { useCallback, useState } from 'react';

interface UseSendMessageOptions {
  onSuccess?: (message: Message) => void;
  onError?: (error: Error) => void;
}

interface UseSendMessageReturn {
  sendMessage: (request: SendMessageRequest) => Promise<Message | null>;
  sendMessageWithAttachments: (request: SendMessageWithAttachmentsRequest) => Promise<Message | null>;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook para enviar mensajes
 * Maneja tanto mensajes de texto como mensajes con archivos adjuntos
 *
 * @example
 * ```tsx
 * const { sendMessage, isLoading, error } = useSendMessage({
 *   onSuccess: (message) => console.log('Message sent:', message),
 *   onError: (error) => console.error('Error:', error)
 * });
 *
 * // Enviar mensaje de texto
 * await sendMessage({
 *   conversationId: '123',
 *   content: 'Hello!',
 *   type: 'text'
 * });
 * ```
 */
export const useSendMessage = (options?: UseSendMessageOptions): UseSendMessageReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Envía un mensaje de texto
   */
  const sendMessage = useCallback(async (request: SendMessageRequest): Promise<Message | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // 🔍 DEBUG: Ver qué se está enviando
      console.log('🔍 DEBUG useSendMessage - Request:', request);
      console.log('🔍 DEBUG useSendMessage - Token exists:', !!localStorage.getItem('token'));
      console.log('🔍 DEBUG useSendMessage - TenantId:', localStorage.getItem('tenantId'));
      console.log('💡 TIP: Open DevTools → Network tab to verify headers (Authorization & X-Tenant-Id) are sent');

      // Validaciones básicas
      if (!request.conversationId) {
        throw new Error('conversationId es requerido');
      }

      if (!request.content?.trim()) {
        throw new Error('El contenido del mensaje no puede estar vacío');
      }

      // Enviar mensaje usando el endpoint /api/chat/send-message
      console.log('📤 Enviando mensaje al backend...');
      const message = await inboxService.sendChatMessage(request);

      console.log('✅ DEBUG useSendMessage - Response:', message);

      // Callback de éxito
      options?.onSuccess?.(message);

      return message;
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error('Error desconocido al enviar mensaje');

      console.error('❌ DEBUG useSendMessage - Error completo:', err);
      console.error('❌ DEBUG useSendMessage - Error status:', err?.status);
      console.error('❌ DEBUG useSendMessage - Error details:', err?.details);

      setError(error);

      // Callback de error
      options?.onError?.(error);

      return null;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  /**
   * Envía un mensaje con archivos adjuntos
   */
  const sendMessageWithAttachments = useCallback(async (
    request: SendMessageWithAttachmentsRequest
  ): Promise<Message | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // Validaciones básicas
      if (!request.conversationId) {
        throw new Error('conversationId es requerido');
      }

      if (!request.content?.trim() && (!request.attachments || request.attachments.length === 0)) {
        throw new Error('Debes proporcionar contenido o archivos adjuntos');
      }

      // Validar tamaño de archivos
      if (request.attachments) {
        const maxFileSize = 10 * 1024 * 1024; // 10MB
        const invalidFiles = request.attachments.filter(file => file.size > maxFileSize);

        if (invalidFiles.length > 0) {
          throw new Error(`Los siguientes archivos exceden el tamaño máximo de 10MB: ${invalidFiles.map(f => f.name).join(', ')}`);
        }
      }

      // Enviar mensaje con archivos adjuntos
      const message = await inboxService.sendMessageWithAttachments(request);

      // Callback de éxito
      options?.onSuccess?.(message);

      return message;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido al enviar mensaje');
      setError(error);

      // Callback de error
      options?.onError?.(error);

      console.error('Error sending message with attachments:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  return {
    sendMessage,
    sendMessageWithAttachments,
    isLoading,
    error
  };
};