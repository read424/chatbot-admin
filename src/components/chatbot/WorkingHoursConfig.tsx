'use client';

import React, { useState, useEffect } from 'react';
import { ChatbotConfig, WorkingHours } from '@/types/chatbot';

interface WorkingHoursConfigProps {
  config: ChatbotConfig;
  onUpdate: (updates: Partial<ChatbotConfig>) => void;
}

const DAYS_OF_WEEK = [
  { id: 0, name: 'Domingo', short: 'Dom' },
  { id: 1, name: 'Lunes', short: 'Lun' },
  { id: 2, name: 'Martes', short: 'Mar' },
  { id: 3, name: 'Miércoles', short: 'Mié' },
  { id: 4, name: 'Jueves', short: 'Jue' },
  { id: 5, name: 'Viernes', short: 'Vie' },
  { id: 6, name: 'Sábado', short: 'Sáb' }
];

const TIMEZONES = [
  { value: 'America/Mexico_City', label: 'México (GMT-6)' },
  { value: 'America/New_York', label: 'Nueva York (GMT-5)' },
  { value: 'America/Los_Angeles', label: 'Los Ángeles (GMT-8)' },
  { value: 'Europe/Madrid', label: 'Madrid (GMT+1)' },
  { value: 'UTC', label: 'UTC (GMT+0)' }
];

export const WorkingHoursConfig: React.FC<WorkingHoursConfigProps> = ({ 
  config, 
  onUpdate 
}) => {
  const [workingHours, setWorkingHours] = useState<WorkingHours>(() => {
    return config.workingHours || {
      enabled: false,
      timezone: 'America/Mexico_City',
      schedule: DAYS_OF_WEEK.map(day => ({
        day: day.id,
        isActive: day.id >= 1 && day.id <= 5, // Monday to Friday by default
        startTime: '09:00',
        endTime: '18:00'
      })),
      outsideHoursMessage: 'Gracias por contactarnos. Nuestro horario de atención es de lunes a viernes de 9:00 AM a 6:00 PM. Un agente se pondrá en contacto contigo durante nuestro horario de atención.',
      outsideHoursAction: 'message_only'
    };
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setHasChanges(JSON.stringify(workingHours) !== JSON.stringify(config.workingHours));
  }, [workingHours, config.workingHours]);

  const handleToggleEnabled = (enabled: boolean) => {
    setWorkingHours(prev => ({ ...prev, enabled }));
  };

  const handleTimezoneChange = (timezone: string) => {
    setWorkingHours(prev => ({ ...prev, timezone }));
  };

  const handleDayToggle = (dayId: number, isActive: boolean) => {
    setWorkingHours(prev => ({
      ...prev,
      schedule: prev.schedule.map(day => 
        day.day === dayId ? { ...day, isActive } : day
      )
    }));
  };

  const handleTimeChange = (dayId: number, field: 'startTime' | 'endTime', value: string) => {
    setWorkingHours(prev => ({
      ...prev,
      schedule: prev.schedule.map(day => 
        day.day === dayId ? { ...day, [field]: value } : day
      )
    }));
  };

  const handleOutsideHoursMessageChange = (outsideHoursMessage: string) => {
    setWorkingHours(prev => ({ ...prev, outsideHoursMessage }));
  };

  const handleOutsideHoursActionChange = (outsideHoursAction: WorkingHours['outsideHoursAction']) => {
    setWorkingHours(prev => ({ ...prev, outsideHoursAction }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onUpdate({ workingHours });
      setHasChanges(false);
    } catch (err) {
      console.error('Error saving working hours:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setWorkingHours(config.workingHours || {
      enabled: false,
      timezone: 'America/Mexico_City',
      schedule: DAYS_OF_WEEK.map(day => ({
        day: day.id,
        isActive: day.id >= 1 && day.id <= 5,
        startTime: '09:00',
        endTime: '18:00'
      })),
      outsideHoursMessage: 'Gracias por contactarnos. Nuestro horario de atención es de lunes a viernes de 9:00 AM a 6:00 PM.',
      outsideHoursAction: 'message_only'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-gray-900">Horarios de Atención</h4>
        {hasChanges && (
          <div className="flex space-x-3">
            <button
              onClick={handleReset}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        )}
      </div>

      {/* Enable/Disable Toggle */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-sm font-medium text-gray-900">Activar Horarios de Atención</h5>
            <p className="text-sm text-gray-500">
              Cuando está activado, el chatbot solo responderá durante los horarios configurados
            </p>
          </div>
          <button
            onClick={() => handleToggleEnabled(!workingHours.enabled)}
            className={`${
              workingHours.enabled ? 'bg-blue-600' : 'bg-gray-200'
            } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            <span
              className={`${
                workingHours.enabled ? 'translate-x-5' : 'translate-x-0'
              } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
            />
          </button>
        </div>
      </div>

      {workingHours.enabled && (
        <>
          {/* Timezone Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zona Horaria
            </label>
            <select
              value={workingHours.timezone}
              onChange={(e) => handleTimezoneChange(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          {/* Schedule Configuration */}
          <div>
            <h5 className="text-sm font-medium text-gray-900 mb-4">Horario Semanal</h5>
            <div className="space-y-3">
              {DAYS_OF_WEEK.map((day) => {
                const daySchedule = workingHours.schedule.find(s => s.day === day.id);
                return (
                  <div key={day.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={daySchedule?.isActive || false}
                        onChange={(e) => handleDayToggle(day.id, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm font-medium text-gray-900 w-20">
                        {day.name}
                      </label>
                    </div>
                    
                    {daySchedule?.isActive && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">de</span>
                        <input
                          type="time"
                          value={daySchedule.startTime}
                          onChange={(e) => handleTimeChange(day.id, 'startTime', e.target.value)}
                          className="block w-24 px-3 py-1 text-sm border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        <span className="text-sm text-gray-500">a</span>
                        <input
                          type="time"
                          value={daySchedule.endTime}
                          onChange={(e) => handleTimeChange(day.id, 'endTime', e.target.value)}
                          className="block w-24 px-3 py-1 text-sm border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Outside Hours Configuration */}
          <div className="space-y-4">
            <h5 className="text-sm font-medium text-gray-900">Configuración Fuera de Horario</h5>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Acción Fuera de Horario
              </label>
              <select
                value={workingHours.outsideHoursAction}
                onChange={(e) => handleOutsideHoursActionChange(e.target.value as WorkingHours['outsideHoursAction'])}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="message_only">Solo enviar mensaje</option>
                <option value="transfer">Transferir a agente</option>
                <option value="queue">Poner en cola</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensaje Fuera de Horario
              </label>
              <textarea
                value={workingHours.outsideHoursMessage}
                onChange={(e) => handleOutsideHoursMessageChange(e.target.value)}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Mensaje que se enviará cuando el usuario escriba fuera del horario de atención"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};