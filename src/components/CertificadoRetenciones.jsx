import React, { useState } from 'react';
import { Search, Download, FileText, X, ChevronDown, ChevronUp } from 'lucide-react';
import { generateFormulario220PDF } from '../utils/pdfGenerator';
import { buscarEmpleadoTAT, getNombreCompletoTAT } from '../utils/retencionesTATData';

const fmt = (n) => {
  const num = parseFloat(n) || 0;
  if (num === 0) return '-';
  return new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
};

export const CertificadoRetenciones = () => {
  const [cedula, setCedula] = useState('');
  const [empleado, setEmpleado] = useState(null);
  const [error, setError] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleBuscar = (e) => {
    e.preventDefault();
    if (!cedula.trim()) return;
    setBuscando(true);
    setError(null);
    setEmpleado(null);
    setDetailOpen(false);

    setTimeout(() => {
      const found = buscarEmpleadoTAT(cedula.trim());
      setBuscando(false);
      if (!found) {
        setError('No se encontró ningún empleado con ese número de identificación para el año gravable 2025.');
      } else {
        setEmpleado(found);
      }
    }, 400);
  };

  const handleDownload = () => {
    if (empleado) generateFormulario220PDF(empleado);
  };

  const handleLimpiar = () => {
    setCedula('');
    setEmpleado(null);
    setError(null);
    setDetailOpen(false);
  };

  const totalIngresos = empleado
    ? [empleado.c36,empleado.c37,empleado.c38,empleado.c39,empleado.c40,
       empleado.c41,empleado.c42,empleado.c43,empleado.c44,empleado.c45,
       empleado.c46,empleado.c47,empleado.c48,empleado.c49,empleado.c50,empleado.c51]
        .reduce((a,b)=>(a||0)+(b||0),0)
    : 0;

  return (
    <div style={{ width: '100%', maxWidth: '860px', margin: '0 auto' }}>

      {/* ── HEADER ── */}
      <div className="glass" style={{
        borderRadius: '20px',
        padding: '2rem',
        marginBottom: '1.5rem',
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '12px',
            background: 'linear-gradient(135deg, #006633, #009933)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <FileText size={22} color="white" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
              Certificado de Ingresos y Retenciones
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Formulario 220 · Año gravable 2025 · TAT Distribuciones del Eje Cafetero S.A.S.
            </p>
          </div>
        </div>
      </div>

      {/* ── BUSCADOR ── */}
      <div className="glass" style={{
        borderRadius: '20px',
        padding: '1.75rem',
        marginBottom: '1.5rem',
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.5)',
      }}>
        <form onSubmit={handleBuscar} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div className="input-group" style={{ flex: 1, margin: 0 }}>
            <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Número de identificación (cédula)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={cedula}
                onChange={e => setCedula(e.target.value)}
                placeholder="Ej: 42013533"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.75rem',
                  borderRadius: '12px',
                  border: '1.5px solid rgba(0,0,0,0.1)',
                  fontSize: '1rem',
                  background: 'white',
                  boxSizing: 'border-box',
                }}
              />
              <Search size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
              {cedula && (
                <button type="button" onClick={handleLimpiar}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 0 }}>
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={buscando || !cedula.trim()}
            style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', flexShrink: 0, fontSize: '0.95rem' }}
          >
            {buscando ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div style={{
            marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: '10px',
            background: '#fff0f0', border: '1px solid #ffcccc', color: '#cc0000',
            fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <X size={15} /> {error}
          </div>
        )}
      </div>

      {/* ── RESULTADO ── */}
      {empleado && (
        <div className="glass" style={{
          borderRadius: '20px',
          overflow: 'hidden',
          background: 'rgba(255,255,255,0.85)',
          border: '1px solid rgba(255,255,255,0.5)',
          backdropFilter: 'blur(20px)',
        }}>
          {/* Header del resultado */}
          <div style={{
            background: 'linear-gradient(135deg, #004d99, #006633)',
            padding: '1.25rem 1.5rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>
                Empleado encontrado
              </p>
              <h3 style={{ margin: '0.15rem 0 0', color: 'white', fontSize: '1.2rem', fontWeight: 800 }}>
                {getNombreCompletoTAT(empleado)}
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
                C.C. {empleado.id} &nbsp;·&nbsp; {empleado.fechaInicial} al {empleado.fechaFinal}
              </p>
            </div>
            <button
              onClick={handleDownload}
              className="btn"
              style={{
                background: 'white', color: '#004d99', fontWeight: 700,
                border: 'none', borderRadius: '12px', padding: '0.65rem 1.25rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                fontSize: '0.9rem', flexShrink: 0,
              }}
            >
              <Download size={16} />
              Descargar PDF
            </button>
          </div>

          {/* Resumen rápido */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1px', background: 'rgba(0,0,0,0.06)',
          }}>
            {[
              { label: 'Pagos por salarios (36)', val: empleado.c36 },
              { label: 'Comisiones (41)', val: empleado.c41 },
              { label: 'Prestaciones sociales (42)', val: empleado.c42 },
              { label: 'Otros pagos (46)', val: empleado.c46 },
              { label: 'Total Ingresos Brutos (52)', val: totalIngresos, highlight: true },
              { label: 'Retención en la fuente (60)', val: empleado.c60, accent: true },
            ].map((item, i) => (
              <div key={i} style={{
                padding: '0.9rem 1rem',
                background: item.highlight ? '#eef6ff' : item.accent ? '#fff3e0' : 'white',
                display: 'flex', flexDirection: 'column', gap: '0.25rem',
              }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>{item.label}</span>
                <span style={{
                  fontSize: '1rem', fontWeight: 800,
                  color: item.highlight ? '#004d99' : item.accent ? '#e65100' : 'var(--text)',
                }}>
                  {item.val ? `$ ${new Intl.NumberFormat('es-CO').format(item.val)}` : '-'}
                </span>
              </div>
            ))}
          </div>

          {/* Detalle expandible */}
          <div>
            <button
              onClick={() => setDetailOpen(v => !v)}
              style={{
                width: '100%', padding: '0.75rem 1.5rem',
                background: 'rgba(0,0,0,0.03)', border: 'none', borderTop: '1px solid rgba(0,0,0,0.06)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600,
              }}
            >
              {detailOpen ? <><ChevronUp size={14} /> Ocultar detalle completo</> : <><ChevronDown size={14} /> Ver detalle completo del formulario</>}
            </button>

            {detailOpen && (
              <div style={{ padding: '1.25rem 1.5rem' }}>
                <DetailTable emp={empleado} totalIngresos={totalIngresos} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Sub-componente tabla detalle ──────────────────────────────────────────────
const SectionHeader = ({ title }) => (
  <tr>
    <td colSpan={3} style={{
      background: 'linear-gradient(90deg, #004d99, #006633)',
      color: 'white', fontWeight: 700, fontSize: '0.75rem',
      padding: '0.4rem 0.75rem',
    }}>{title}</td>
  </tr>
);

const DataRow = ({ label, casilla, value }) => (
  <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
    <td style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', color: '#333', width: '60%' }}>
      <span style={{ color: '#888', marginRight: '0.4rem', fontSize: '0.7rem' }}>{casilla}.</span>{label}
    </td>
    <td style={{ padding: '0.3rem 0.75rem', textAlign: 'right', fontSize: '0.8rem',
      fontWeight: value ? 700 : 400, color: value ? '#222' : '#bbb', whiteSpace: 'nowrap' }}>
      {value ? `$ ${new Intl.NumberFormat('es-CO').format(value)}` : '-'}
    </td>
  </tr>
);

const TotalRow = ({ label, casilla, value }) => (
  <tr style={{ background: '#ddeeff' }}>
    <td style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem', fontWeight: 700, color: '#004d99', width: '60%' }}>
      <span style={{ marginRight: '0.4rem' }}>{casilla}.</span>{label}
    </td>
    <td style={{ padding: '0.4rem 0.75rem', textAlign: 'right', fontSize: '0.88rem',
      fontWeight: 800, color: '#004d99', whiteSpace: 'nowrap' }}>
      {value ? `$ ${new Intl.NumberFormat('es-CO').format(value)}` : '-'}
    </td>
  </tr>
);

const RetRow = ({ label, casilla, value }) => (
  <tr style={{ background: '#004d99' }}>
    <td style={{ padding: '0.45rem 0.75rem', fontSize: '0.78rem', fontWeight: 700, color: 'white', width: '60%' }}>
      <span style={{ marginRight: '0.4rem' }}>{casilla}.</span>{label}
    </td>
    <td style={{ padding: '0.45rem 0.75rem', textAlign: 'right', fontSize: '0.88rem',
      fontWeight: 800, color: 'white', whiteSpace: 'nowrap' }}>
      {value ? `$ ${new Intl.NumberFormat('es-CO').format(value)}` : '-'}
    </td>
  </tr>
);

const DetailTable = ({ emp, totalIngresos }) => (
  <div style={{ overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}>
      <tbody>
        <SectionHeader title="Concepto de los Ingresos" />
        <DataRow casilla="36" label="Pagos por salarios" value={emp.c36} />
        <DataRow casilla="37" label="Pagos con bonos electrónicos, cheques, tarjetas, vales, etc." value={emp.c37} />
        <DataRow casilla="38" label="Exceso de pagos por alimentación mayores a 41 UVT, art. 387-1 E.T." value={emp.c38} />
        <DataRow casilla="39" label="Pagos por honorarios" value={emp.c39} />
        <DataRow casilla="40" label="Pagos por servicios" value={emp.c40} />
        <DataRow casilla="41" label="Pagos por Comisiones" value={emp.c41} />
        <DataRow casilla="42" label="Pagos por Prestaciones sociales" value={emp.c42} />
        <DataRow casilla="43" label="Pagos por Viáticos" value={emp.c43} />
        <DataRow casilla="44" label="Pagos por Gastos de representación" value={emp.c44} />
        <DataRow casilla="45" label="Pagos por Compensación por trabajo asociado cooperativo" value={emp.c45} />
        <DataRow casilla="46" label="Otros pagos" value={emp.c46} />
        <DataRow casilla="47" label="Auxilio de Cesantías e intereses efectivamente pagados" value={emp.c47} />
        <DataRow casilla="48" label="Auxilio de cesantía (régimen tradicional CST, Cap. VII Tít. VIII Parte Primera)" value={emp.c48} />
        <DataRow casilla="49" label="Auxilio de Cesantías consignadas al fondo de cesantías" value={emp.c49} />
        <DataRow casilla="50" label="Pensiones de jubilación, vejez o invalidez" value={emp.c50} />
        <DataRow casilla="51" label="Apoyos económicos educativos no reembolsables o condonados" value={emp.c51} />
        <TotalRow casilla="52" label="Total de Ingresos brutos (Sume 36 a 51)" value={totalIngresos} />

        <SectionHeader title="Concepto de los aportes" />
        <DataRow casilla="53" label="Aportes obligatorios por salud a cargo del trabajador" value={emp.c53} />
        <DataRow casilla="54" label="Aportes obligatorios a fondos de pensiones y solidaridad pensional" value={emp.c54} />
        <DataRow casilla="55" label="Cotizaciones voluntarias al RAIS" value={emp.c55} />
        <DataRow casilla="56" label="Aportes voluntarios a fondos de pensiones" value={emp.c56} />
        <DataRow casilla="57" label="Aportes a cuentas AFC" value={emp.c57} />
        <DataRow casilla="58" label="Aportes a cuentas AVC" value={emp.c58} />
        <DataRow casilla="59" label="Ingreso laboral promedio últimos 6 meses (num. 4 art. 206 E.T.)" value={emp.c59} />
        <RetRow casilla="60" label="Valor de la retención en la fuente por ingresos laborales y de pensiones" value={emp.c60} />
      </tbody>
    </table>
  </div>
);
