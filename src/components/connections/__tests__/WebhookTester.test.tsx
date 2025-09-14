import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WebhookTester } from '../WebhookTester';
import { ProviderType } from '@/types/connections';

// Mock fetch
global.fetch = jest.fn();

const defaultProps = {
  providerType: 'whatsapp_api' as ProviderType,
  connectionId: 'test-connection-id',
  webhookUrl: 'https://example.com/webhook',
  webhookSecret: 'test-secret'
};

describe('WebhookTester', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  it('renders correctly', () => {
    render(<WebhookTester {...defaultProps} />);
    
    expect(screen.getByText('Probar Webhook')).toBeInTheDocument();
    expect(screen.getByText('Enviar Prueba')).toBeInTheDocument();
    expect(screen.getByText(/Usar payload de ejemplo para WHATSAPP_API/)).toBeInTheDocument();
  });

  it('disables test button when webhook URL is not provided', () => {
    render(<WebhookTester {...defaultProps} webhookUrl="" />);
    
    const testButton = screen.getByRole('button', { name: /Enviar Prueba/ });
    expect(testButton).toBeDisabled();
  });

  it('sends test webhook with default payload', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'content-type': 'application/json' }),
      text: jest.fn().mockResolvedValue('{"status": "ok"}')
    };
    
    (fetch as jest.Mock).mockResolvedValue(mockResponse);
    
    render(<WebhookTester {...defaultProps} />);
    
    const testButton = screen.getByText('Enviar Prueba');
    fireEvent.click(testButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'https://example.com/webhook',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Hub-Signature-256': expect.any(String)
          }),
          body: expect.stringContaining('whatsapp_business_account')
        })
      );
    });
    
    await waitFor(() => {
      expect(screen.getByText('Webhook respondió correctamente')).toBeInTheDocument();
    });
  });

  it('sends test webhook with custom payload', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      text: jest.fn().mockResolvedValue('')
    };
    
    (fetch as jest.Mock).mockResolvedValue(mockResponse);
    
    render(<WebhookTester {...defaultProps} />);
    
    // Switch to custom payload
    const customPayloadRadio = screen.getByLabelText(/Usar payload personalizado/);
    fireEvent.click(customPayloadRadio);
    
    // Enter custom payload
    const customPayloadTextarea = screen.getByPlaceholderText(/Ingresa tu payload JSON personalizado/);
    fireEvent.change(customPayloadTextarea, { 
      target: { value: '{"test": "custom payload"}' } 
    });
    
    const testButton = screen.getByText('Enviar Prueba');
    fireEvent.click(testButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'https://example.com/webhook',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'User-Agent': 'WebhookTester/1.0'
          }),
          body: expect.stringContaining('"test"')
        })
      );
    });
  });

  it('handles invalid JSON in custom payload', async () => {
    render(<WebhookTester {...defaultProps} />);
    
    // Switch to custom payload
    const customPayloadRadio = screen.getByLabelText(/Usar payload personalizado/);
    fireEvent.click(customPayloadRadio);
    
    // Enter invalid JSON
    const customPayloadTextarea = screen.getByPlaceholderText(/Ingresa tu payload JSON personalizado/);
    fireEvent.change(customPayloadTextarea, { 
      target: { value: 'invalid json' } 
    });
    
    const testButton = screen.getByText('Enviar Prueba');
    fireEvent.click(testButton);
    
    await waitFor(() => {
      expect(screen.getByText('Payload JSON inválido')).toBeInTheDocument();
    });
  });

  it('handles webhook error response', async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: new Headers(),
      text: jest.fn().mockResolvedValue('Not found')
    };
    
    (fetch as jest.Mock).mockResolvedValue(mockResponse);
    
    render(<WebhookTester {...defaultProps} />);
    
    const testButton = screen.getByText('Enviar Prueba');
    fireEvent.click(testButton);
    
    await waitFor(() => {
      expect(screen.getByText('Error 404: Not Found')).toBeInTheDocument();
    });
  });

  it('handles network error', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    render(<WebhookTester {...defaultProps} />);
    
    const testButton = screen.getByText('Enviar Prueba');
    fireEvent.click(testButton);
    
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('shows loading state during test', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      text: jest.fn().mockResolvedValue('')
    };
    
    (fetch as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockResponse), 100))
    );
    
    render(<WebhookTester {...defaultProps} />);
    
    const testButton = screen.getByText('Enviar Prueba');
    fireEvent.click(testButton);
    
    expect(screen.getByText('Enviando...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText('Enviando...')).not.toBeInTheDocument();
    });
  });

  it('shows payload preview when requested', () => {
    render(<WebhookTester {...defaultProps} />);
    
    const showPayloadButton = screen.getByText('Ver payload que se enviará');
    fireEvent.click(showPayloadButton);
    
    expect(screen.getByText('Payload que se enviará:')).toBeInTheDocument();
    expect(screen.getByText('Ocultar payload que se enviará')).toBeInTheDocument();
  });

  it('uses correct signature header for different providers', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      text: jest.fn().mockResolvedValue('')
    };
    
    (fetch as jest.Mock).mockResolvedValue(mockResponse);
    
    // Test WhatsApp API
    const { rerender } = render(<WebhookTester {...defaultProps} providerType="whatsapp_api" />);
    
    let testButton = screen.getByText('Enviar Prueba');
    fireEvent.click(testButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Hub-Signature-256': expect.any(String)
          })
        })
      );
    });
    
    (fetch as jest.Mock).mockClear();
    
    // Test Telegram
    rerender(<WebhookTester {...defaultProps} providerType="telegram" />);
    
    testButton = screen.getByText('Enviar Prueba');
    fireEvent.click(testButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Telegram-Bot-Api-Secret-Token': 'test-secret'
          })
        })
      );
    });
  });

  it('calls onTest callback when provided', async () => {
    const mockOnTest = jest.fn();
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      text: jest.fn().mockResolvedValue('')
    };
    
    (fetch as jest.Mock).mockResolvedValue(mockResponse);
    
    render(<WebhookTester {...defaultProps} onTest={mockOnTest} />);
    
    const testButton = screen.getByText('Enviar Prueba');
    fireEvent.click(testButton);
    
    await waitFor(() => {
      expect(mockOnTest).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Webhook respondió correctamente'
        })
      );
    });
  });

  it('generates correct payload for different providers', () => {
    const { rerender } = render(<WebhookTester {...defaultProps} providerType="telegram" />);
    
    const showPayloadButton = screen.getByText('Ver payload que se enviará');
    fireEvent.click(showPayloadButton);
    
    expect(screen.getByText(/"update_id"/)).toBeInTheDocument();
    expect(screen.getByText(/"message"/)).toBeInTheDocument();
    
    rerender(<WebhookTester {...defaultProps} providerType="facebook" />);
    
    expect(screen.getByText(/"object": "page"/)).toBeInTheDocument();
    expect(screen.getByText(/"messaging"/)).toBeInTheDocument();
  });
});