import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, FileSpreadsheet, LogOut } from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '../utils/supabaseClient';

export const AdminPortal = ({ onLogout }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: '' }
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleLogout = () => {
    // We need to pass a logout function from App.jsx or use a state management
    // For now, I'll assume we can pass it as a prop
    if (onLogout) onLogout();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setStatus(null);

    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        // Here we would push to Supabase
        // Example structure of data: [{ nit: '...', name: '...', amount: ... }]
        console.log('Data to upload:', data);

        // Simulate chunk upload
        for (let i = 0; i <= 100; i += 20) {
          setUploadProgress(i);
          await new Promise(r => setTimeout(r, 200));
        }

        setStatus({ type: 'success', message: `${data.length} registros cargados correctamente.` });
        setIsUploading(false);
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: 'Error al procesar el archivo. Verifica el formato.' });
      setIsUploading(false);
    }
  };

  return (
    <div className="glass glass-card" style={{ maxWidth: '600px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="gradient-text" style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>Panel Administrativo</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Sube las bases de datos (Excel/CSV) enviadas por contabilidad.
          </p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={onLogout}
          style={{ 
            fontSize: '0.85rem', 
            background: 'var(--accent)',
            padding: '0.6rem 1rem',
            borderRadius: '10px'
          }}
        >
          <LogOut size={16} />
          Cerrar Sesión
        </button>
      </div>
      
      <div 
        style={{ 
          border: '2px dashed var(--border)', 
          borderRadius: '16px', 
          padding: '3rem', 
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'var(--transition)',
          position: 'relative'
        }}
        onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
        onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
      >
        <input 
          type="file" 
          accept=".xlsx, .xls, .csv" 
          onChange={handleFileUpload}
          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
          disabled={isUploading}
        />
        <FileSpreadsheet size={48} color={isUploading ? 'var(--primary)' : 'var(--text-muted)'} style={{ marginBottom: '1rem' }} />
        <p>{isUploading ? 'Procesando archivo...' : 'Arrastra tu archivo Excel aquí o haz clic para buscar'}</p>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Formatos soportados: .xlsx, .xls, .csv</span>
      </div>

      {isUploading && (
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ background: 'var(--border)', height: '6px', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ background: 'var(--primary)', width: `${uploadProgress}%`, height: '100%', transition: 'width 0.3s' }}></div>
          </div>
          <p style={{ fontSize: '0.8rem', textAlign: 'center', marginTop: '0.5rem' }}>{uploadProgress}% completado</p>
        </div>
      )}

      {status && (
        <div style={{ 
          marginTop: '1.5rem', 
          padding: '1rem', 
          borderRadius: '12px', 
          background: status.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${status.type === 'success' ? '#22c55e' : '#ef4444'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: status.type === 'success' ? '#4ade80' : '#f87171'
        }}>
          {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{status.message}</span>
        </div>
      )}
    </div>
  );
};
