import React, { useState } from 'react';


import { Upload, CheckCircle, AlertCircle, FileSpreadsheet, LogOut } from 'lucide-react';
import * as XLSX from 'xlsx';


export const AdminPortal = ({ onLogout }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fleteConfig, setFleteConfig] = useState({
    type: 'fletes',
    year: new Date().getFullYear().toString(),
  });
  const [company, setCompany] = useState('TYM');
  const [config, setConfig] = useState({
    type: 'retefuente',
    year: new Date().getFullYear().toString(),
    period: '1',
    month: String(new Date().getMonth() + 1),
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
          // Use current config for type and year
          const type = config.type;
          const year = config.year;
          // Helper to clean currency strings like "-$ 457.836,00"
          const cleanAmount = (val) => {
            if (typeof val === 'number') return val;
            if (!val) return 0;
            // Remove $, whitespace, and dots (thousands separator), then replace comma with dot (decimal)
            const cleaned = val.toString().replace(/[\$\s\.]/g, '').replace(',', '.');
            return parseFloat(cleaned) || 0;
          };

          // Common headers for fletes/relacion pagos
          const placa = row['PLACA'] || row['PLACAS'] || row['PLACA(S)'] || row['placa'] || row['placas'] || '';
          const valor = row['VALOR'] || row['VALOR_FLETE'] || row['TOTAL_FLETE'] || row['TOTAL FLETE'] || row['TOTAL'] || row['valor'] || row['total'] || '';
          const mes = row['MES'] || row['Mes'] || row['mes'] || config.month || '1';
          const quincena = row['QUINCENA'] || row['QUINCENA'] || row['quincena'] || config.period || '1';

          return {
            nit: row['TERCERO']?.toString() || row['NIT']?.toString() || row['Cedula']?.toString() || row['ID']?.toString() || row['Id']?.toString() || '',
            name: row['NOMBRE TERCERO'] || row['NOMBRE'] || row['NOMBRE_COMPLETO'] || row['NOMBRE PARA PAGAR CXP (DUEÑO VEHÍCULO)'] || '',
            year: row['AÑO GRAVABLE']?.toString() || row['YEAR']?.toString() || year,
            type: type,
            period: quincena,
            account: row['CUENTA']?.toString() || '',
            concept: row['CONCEPTO'] || '',
            percentage: row['PORCENTAJE']?.toString() || '',
            amount_base: cleanAmount(row['BASE']) || 0,
            amount_withheld: cleanAmount(row['VALOR RETENIDO']) || 0,
            placa: placa,
            month: mes,
            quincena: quincena,
            totalFlete: cleanAmount(valor) || 0,
            city: 'Pereira' // Default city
          };
        });

        // Persist uploaded records in localStorage so Portal can read them
        try {
          const existing = JSON.parse(localStorage.getItem('uploaded_data') || '[]');
          const normalized = preparedData.map(d => ({
            ...d,
            company: company || 'TYM',
            month: d.month || config.month || '1',
            quincena: d.period || d.quincena || config.period || '1',
            placa: d.placa || d.account || '',
            totalFlete: d.totalFlete || d.totalFlete === 0 ? d.totalFlete : (d.amount_base || d.amount_withheld || 0),
            totalPagado: d.totalPagado || (d.totalFlete || d.amount_withheld || 0),
            date: d.date || new Date().toLocaleDateString('es-CO')
          }));
          const merged = existing.concat(normalized);
          localStorage.setItem('uploaded_data', JSON.stringify(merged));
          console.log('Saved uploaded_data to localStorage, records:', merged.length);
        } catch (e) {
          console.error('Failed to persist uploaded data', e);
        }

        console.log('Data mapped with specific Excel headers:', preparedData);

        // Here we would push to Supabase
        // const { error } = await supabase.from('certificates').insert(preparedData);

        // Upload file to server (demo endpoint)
        const formData = new FormData();
        formData.append('file', file);
        try {
          const uploadResponse = await fetch('https://httpbin.org/post', {
            method: 'POST',
            body: formData,
          });
          if (!uploadResponse.ok) throw new Error('Upload failed');
          // You could handle response data here
          setUploadProgress(100);
          setStatus({ type: 'success', message: `${data.length} registros de ${config.type.toUpperCase()} (${config.year}) cargados correctamente.` });
        } catch (uploadError) {
          console.error(uploadError);
          setStatus({ type: 'error', message: 'Error al subir el archivo al servidor.' });
        }
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="input-group">
          <label>Tipo de Base</label>
          <select 
            value={config.type}
            onChange={(e) => setConfig({...config, type: e.target.value})}
          >
            <option value="retefuente">ReteFuente</option>
            <option value="reteiva">ReteIVA</option>
            <option value="reteica">ReteICA</option>
            <option value="fletes">Relación de pago de fletes</option>
          </select>
        </div>
        <div className="input-group">
          <label>Empresa</label>
          <select value={company} onChange={(e) => setCompany(e.target.value)}>
            <option value="TYM">TYM</option>
            <option value="TAT">TAT</option>
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

        {config.type === 'fletes' && (
          <div className="input-group">
            <label>Quincena</label>
            <select
              value={config.period}
              onChange={(e) => setConfig({...config, period: e.target.value})}
            >
              <option value="1">1ra quincena (1-15)</option>
              <option value="2">2da quincena (16-31)</option>
            </select>
          </div>
        )}

        {config.type === 'fletes' && (
          <div className="input-group">
            <label>Mes</label>
            <select
              value={config.month || '1'}
              onChange={(e) => setConfig({...config, month: e.target.value})}
            >
              <option value="1">Enero</option>
              <option value="2">Febrero</option>
              <option value="3">Marzo</option>
              <option value="4">Abril</option>
              <option value="5">Mayo</option>
              <option value="6">Junio</option>
              <option value="7">Julio</option>
              <option value="8">Agosto</option>
              <option value="9">Septiembre</option>
              <option value="10">Octubre</option>
              <option value="11">Noviembre</option>
              <option value="12">Diciembre</option>
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
