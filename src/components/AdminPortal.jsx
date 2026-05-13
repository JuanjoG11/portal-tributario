import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, FileSpreadsheet, LogOut } from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '../utils/supabaseClient';

export const AdminPortal = ({ onLogout }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: '' }
  const [uploadProgress, setUploadProgress] = useState(0);
  const [config, setConfig] = useState({
    type: 'retefuente',
    year: '2025',
    period: '1'
  });

  const handleLogout = () => {
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

        // Map data to include the selected metadata and handle specific Excel headers
        const preparedData = data.map(row => {
          // Helper to clean currency strings like "-$ 457.836,00"
          const cleanAmount = (val) => {
            if (typeof val === 'number') return val;
            if (!val) return 0;
            // Remove $, whitespace, and dots (thousands separator), then replace comma with dot (decimal)
            const cleaned = val.toString().replace(/[\$\s\.]/g, '').replace(',', '.');
            return parseFloat(cleaned) || 0;
          };

          return {
            nit: row['TERCERO']?.toString() || '',
            name: row['NOMBRE TERCERO'] || '',
            year: row['AÑO GRAVABLE']?.toString() || config.year,
            type: config.type,
            period: (config.type === 'reteiva' || config.type === 'reteica') ? config.period : null,
            account: row['CUENTA']?.toString() || '',
            concept: row['CONCEPTO'] || '',
            percentage: row['PORCENTAJE']?.toString() || '',
            amount_base: cleanAmount(row['BASE']),
            amount_withheld: cleanAmount(row['VALOR RETENIDO']),
            city: 'Pereira' // Default city
          };
        });

        console.log('Data mapped with specific Excel headers:', preparedData);

        // Here we would push to Supabase
        // const { error } = await supabase.from('certificates').insert(preparedData);

        // Simulate chunk upload
        for (let i = 0; i <= 100; i += 20) {
          setUploadProgress(i);
          await new Promise(r => setTimeout(r, 200));
        }

        setStatus({ type: 'success', message: `${data.length} registros de ${config.type.toUpperCase()} (${config.year}) cargados correctamente.` });
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

      <div style={{ display: 'grid', gridTemplateColumns: (config.type === 'reteiva' || config.type === 'reteica') ? '1fr 1fr 1fr' : '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <div className="input-group">
          <label>Tipo de Base</label>
          <select 
            value={config.type}
            onChange={(e) => setConfig({...config, type: e.target.value})}
          >
            <option value="retefuente">ReteFuente</option>
            <option value="reteiva">ReteIVA</option>
            <option value="reteica">ReteICA</option>
          </select>
        </div>
        <div className="input-group">
          <label>Año</label>
          <select 
            value={config.year}
            onChange={(e) => setConfig({...config, year: e.target.value})}
          >
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>
        {(config.type === 'reteiva' || config.type === 'reteica') && (
          <div className="input-group">
            <label>Periodo</label>
            <select
              value={config.period}
              onChange={(e) => setConfig({...config, period: e.target.value})}
            >
              <option value="1">1 (Ene-Feb)</option>
              <option value="2">2 (Mar-Abr)</option>
              <option value="3">3 (May-Jun)</option>
              <option value="4">4 (Jul-Ago)</option>
              <option value="5">5 (Sep-Oct)</option>
              <option value="6">6 (Nov-Dic)</option>
            </select>
          </div>
        )}
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
