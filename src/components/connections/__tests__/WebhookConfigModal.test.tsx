import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WebhookConfigModal } from '../WebhookConfigModal';
import { ProviderType, WebhookConfig } from '@/types/connections';

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

const mockWebhookConfig: WebhookConfig = {
  url: 'https://example.com/webhook',
  secret: 'test-secret',
  events: ['messages', 'message_status'],
  isActive: true,
  failureCount: 0
};

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  providerType: 'whatsapp_api' as ProviderType,
  connectionId: 'test-connection-id',
  connectionName: 'Test Connection',
  onSave: jest.fn()
};

describe('WebhookConfigModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when open', () => {
    render(<WebhookConfigModal {...defaultProps} />);
    
    expect(screen.getByText('Configuración de Webhook')).toBeInTheDocument();
    expect(screen.getByText('Test Connection - WHATSAPP_API')).toBeInTheDocument();
    expect(screen.getByLabelText(/URL del Webhook/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Secreto del Webhook/)).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<WebhookConfigModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Configuración de Webhook')).not.toBeInTheDocument();
  });

  it('populates form with existing webhook config', () => {
    render(
      <WebhookConfigModal 
        {...defaultProps} 
        webhookConfig={mockWebhookConfig}
      />
    );
    
    expect(screen.getByDisplayValue('https://example.com/webhook')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test-secret')).toBeInTheDocument();
  });

  it('generates webhook URL suggestion', () => {
    render(<WebhookConfigModal {...defaultProps} />);
    
    const generateButton = screen.getByTitle('Generar URL sugerida');
    fireEvent.click(generateButton);
    
    const urlInput = screen.getByLabelText(/URL del Webhook/) as HTMLInputElement;
    expect(urlInput.value).toContain('/api/webhooks/whatsapp-api/test-connection-id');
  });

  it('generates secure secret', () => {
    render(<WebhookConfigModal {...defaultProps} />);
    
    const generateSecretButton = screen.getByTitle('Generar secreto seguro');
    fireEvent.click(generateSecretButton);
    
    const secretInput = screen.getByLabelText(/Secreto del Webhook/) as HTMLInputElement;
    expect(secretInput.value).toHaveLength(32);
  });

  it('validates required fields', async () => {
    const mockOnSave = jest.fn().mockRejectedValue(new Error('Validation failed'));
    
    render(<WebhookConfigModal {...defaultProps} onSave={mockOnSave} />);
    
    // Try to submit with empty URL
    const saveButton = screen.getByText('Guardar Configuración');
    
    // Remove the required attribute to bypass browser validation
    const urlInput = screen.getByLabelText(/URL del Webhook/);
    urlInput.removeAttribute('required');
    
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('La URL del webhook es requerida')).toBeInTheDocument();
      expect(screen.getByText('Debe seleccionar al menos un evento')).toBeInTheDocument();
    });
  });

  it('validates HTTPS URL requirement', async () => {
    render(<WebhookConfigModal {...defaultProps} />);
    
    const urlInput = screen.getByLabelText(/URL del Webhook/);
    fireEvent.change(urlInput, { target: { value: 'http://example.com/webhook' } });
    
    const saveButton = screen.getByText('Guardar Configuración');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('La URL debe usar HTTPS')).toBeInTheDocument();
    });
  });

  it('shows provider-specific events for WhatsApp API', () => {
    render(<WebhookConfigModal {...defaultProps} providerType="whatsapp_api" />);
    
    expect(screen.getByText('Mensajes')).toBeInTheDocument();
    expect(screen.getByText('Estado de mensajes')).toBeInTheDocument();
    expect(screen.getByText('Alertas de cuenta')).toBeInTheDocument();
  });

  it('shows provider-specific events for Telegram', () => {
    render(<WebhookConfigModal {...defaultProps} providerType="telegram" />);
    
    expect(screen.getByText('Mensajes')).toBeInTheDocument();
    expect(screen.getByText('Mensajes editados')).toBeInTheDocument();
    expect(screen.getByText('Callback queries')).toBeInTheDocument();
  });

  it('allows selecting and deselecting events', () => {
    render(<WebhookConfigModal {...defaultProps} />);
    
    const messagesCheckbox = screen.getByRole('checkbox', { name: /Mensajes/ });
    
    expect(messagesCheckbox).not.toBeChecked();
    
    fireEvent.click(messagesCheckbox);
    expect(messagesCheckbox).toBeChecked();
    
    fireEvent.click(messagesCheckbox);
    expect(messagesCheckbox).not.toBeChecked();
  });

  it('toggles webhook active state', () => {
    render(<WebhookConfigModal {...defaultProps} />);
    
    const activeToggle = screen.getByRole('checkbox', { name: '' }); // The toggle doesn't have a label
    
    expect(activeToggle).toBeChecked(); // Default is active
    
    fireEvent.click(activeToggle);
    expect(activeToggle).not.toBeChecked();
  });

  it('calls onSave with correct data when form is submitted', async () => {
    const mockOnSave = jest.fn().mockResolvedValue(undefined);
    
    render(
      <WebhookConfigModal 
        {...defaultProps} 
        onSave={mockOnSave}
      />
    );
    
    // Fill form
    const urlInput = screen.getByLabelText(/URL del Webhook/);
    fireEvent.change(urlInput, { target: { value: 'https://example.com/webhook' } });
    
    const secretInput = screen.getByLabelText(/Secreto del Webhook/);
    fireEvent.change(secretInput, { target: { value: 'test-secret' } });
    
    const messagesCheckbox = screen.getByRole('checkbox', { name: /Mensajes/ });
    fireEvent.click(messagesCheckbox);
    
    // Submit form
    const saveButton = screen.getByText('Guardar Configuración');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        url: 'https://example.com/webhook',
        secret: 'test-secret',
        events: ['messages'],
        isActive: true,
        failureCount: 0
      });
    });
  });

  it('calls onClose when cancel button is clicked', () => {
    const mockOnClose = jest.fn();
    
    render(
      <WebhookConfigModal 
        {...defaultProps} 
        onClose={mockOnClose}
      />
    );
    
    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows loading state when saving', async () => {
    const mockOnSave = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(
      <WebhookConfigModal 
        {...defaultProps} 
        onSave={mockOnSave}
      />
    );
    
    // Fill required fields
    const urlInput = screen.getByLabelText(/URL del Webhook/);
    fireEvent.change(urlInput, { target: { value: 'https://example.com/webhook' } });
    
    const messagesCheckbox = screen.getByRole('checkbox', { name: /Mensajes/ });
    fireEvent.click(messagesCheckbox);
    
    // Submit form
    const saveButton = screen.getByText('Guardar Configuración');
    fireEvent.click(saveButton);
    
    expect(screen.getByText('Guardando...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText('Guardando...')).not.toBeInTheDocument();
    });
  });

  it('copies URL to clipboard when copy button is clicked', async () => {
    const mockWriteText = jest.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });
    
    render(<WebhookConfigModal {...defaultProps} />);
    
    const urlInput = screen.getByLabelText(/URL del Webhook/);
    fireEvent.change(urlInput, { target: { value: 'https://example.com/webhook' } });
    
    const copyButton = screen.getByTitle('Copiar URL');
    fireEvent.click(copyButton);
    
    expect(mockWriteText).toHaveBeenCalledWith('https://example.com/webhook');
  });
});