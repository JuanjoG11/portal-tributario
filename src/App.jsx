import React, { useState } from 'react'
import { FileText, ShieldCheck, Download, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateCertificatePDF } from './utils/pdfGenerator'
import { AdminPortal } from './components/AdminPortal'

import { EXCEL_MOCK_DATA } from './utils/mockData'
import logo from './assets/logo_tym.png'
import logoTat from './assets/logo_tat.png'
import heroSelection from './assets/hero_selection.jpg'

function App() {
  const [selectedCompany, setSelectedCompany] = useState(null) // 'TYM' or 'TAT'
  const [view, setView] = useState('selection') // 'selection', 'portal', or 'admin'
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState(false)
  const [searchData, setSearchData] = useState({
    nit: '',
    year: '2025',
    type: 'retefuente',
    period: '1'
  })
  const [isSearching, setIsSearching] = useState(false)
  const [certificate, setCertificate] = useState(null)
  const [error, setError] = useState(null)

  React.useEffect(() => {
    if (window.location.hash === '#admin') {
      setView('admin')
    }
  }, [])

  const companies = {
    TYM: {
      id: 'TYM',
      name: 'TIENDAS & MARCAS DEL EJE CAFETERO S.A.S',
      displayName: 'TYM',
      logo: logo,
      nit: '900973932-9',
      address: 'CR 16 CALLE 77 BODEGA 3 LA ROMELIA LOTE PARQ.'
    },
    TAT: {
      id: 'TAT',
      name: 'T.A.T. DISTRIBUCIONES DEL EJE CAFETERO S.A.S.',
      displayName: 'TAT',
      logo: logoTat,
      nit: '901568117-1',
      address: 'CR 16 CALLE 77 BODEGA 3 LA ROMELIA LOTE PARQ.'
    }
  }

  const handleSelectCompany = (companyId) => {
    setSelectedCompany(companies[companyId])
    setView('portal')
  }

  const handleAdminLogin = (e) => {
    e.preventDefault()
    // Simple password check - using '1234' as requested/suggested
    if (password === '1234') {
      setIsAdminAuthenticated(true)
      setLoginError(false)
    } else {
      setLoginError(true)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setIsSearching(true)
    setCertificate(null)
    setError(null)

    // Sanitize search NIT (remove dots, dashes, spaces)
    const cleanSearchNit = searchData.nit.replace(/[\.\-\s]/g, '');

    setTimeout(() => {
      console.log('--- DEBUG BÚSQUEDA ---');
      console.log('NIT buscado:', cleanSearchNit);
      console.log('Año buscado:', searchData.year);
      console.log('Tipo buscado:', searchData.type);
      console.log('Empresa seleccionada:', selectedCompany.id);

      const filteredData = EXCEL_MOCK_DATA.filter(row => {
        // 1. Determine real tax type from 'type' field or account number
        let rowType = row.type;
        if (!rowType) {
          const acc = String(row.account || '');
          if (acc.startsWith('2365')) rowType = 'retefuente';
          else if (acc.startsWith('2367')) rowType = 'reteiva';
          else if (acc.startsWith('2368')) rowType = 'reteica';
          else rowType = 'retefuente'; // Default for untagged legacy data
        }

        // 2. Sanitize and prepare data for comparison
        const rowNit = String(row.nit).replace(/[\.\-\s]/g, '');
        const rowYear = String(row.year);
        const rowCompany = row.company || 'TYM'; // Default untagged data to TYM
        
        // 3. Core matching
        const matchNit = rowNit === cleanSearchNit;
        const matchYear = rowYear === String(searchData.year);
        const matchType = rowType === searchData.type;
        const matchCompany = rowCompany === selectedCompany.id;
        
        // 4. Period matching (only for periodic taxes like IVA/ICA)
        let matchPeriod = true;
        if (searchData.type === 'reteiva' || searchData.type === 'reteica') {
          matchPeriod = String(row.period) === String(searchData.period);
        } else {
          // If searching for Retefuente, ignore rows that have a period (usually ICA/IVA)
          matchPeriod = !row.period;
        }

        return matchNit && matchYear && matchType && matchCompany && matchPeriod;
      });

      console.log('Resultados encontrados:', filteredData.length);
      setIsSearching(false)

      if (filteredData.length === 0) {
        setError('No se encontró información para los datos ingresados.');
        return;
      }

      const grouped = {
        companyId: selectedCompany.id,
        nit: filteredData[0].nit,
        name: filteredData[0].name,
        year: filteredData[0].year,
        type: searchData.type,
        period: (searchData.type === 'reteiva' || searchData.type === 'reteica') ? searchData.period : null,
        date: filteredData[0].date, // Capturar la fecha específica de emisión
        city: 'Pereira, Risaralda',
        companyName: selectedCompany.name,
        companyNit: selectedCompany.nit,
        companyAddress: selectedCompany.address,
        companyLogo: selectedCompany.logo,
        details: filteredData.map(row => ({
          account: row.account || '',
          concept: row.concept || '',
          percentage: row.percentage ? row.percentage.toString() : '',
          baseAmount: row.base || 0,
          retainedAmount: row.retained || 0
        }))
      }

      setCertificate(grouped)
    }, 600)
  }

  const downloadPDF = () => {
    if (certificate) {
      generateCertificatePDF(certificate)
    }
  }

  const CompanySelection = () =>    <motion.section 
      key="selection"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="hero"
      style={{ 
        minHeight: '100vh',
        height: 'auto', // Allow expansion
        background: `url(${heroSelection})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed', // Keeps bg still while scrolling
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start', // Start from top for scrolling
        padding: '2rem 0', // Add some vertical padding
        overflowY: 'auto', // Enable vertical scroll
        filter: 'saturate(1.2) contrast(1.1)'
      }}
    >
      {/* Intense Background Animations (Keep fixed if possible) */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }}>
        <motion.div 
          animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.5, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          style={{ 
            position: 'absolute', top: '-10%', left: '-5%', width: '80%', height: '80%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.7) 0%, transparent 70%)',
            filter: 'blur(50px)', willChange: 'transform, opacity'
          }}
        />
        <motion.div 
          animate={{ opacity: [0.6, 0.9, 0.6], scale: [1.5, 1, 1.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          style={{ 
            position: 'absolute', bottom: '-10%', right: '-5%', width: '80%', height: '80%',
            background: 'radial-gradient(circle, rgba(249,115,22,0.6) 0%, transparent 70%)',
            filter: 'blur(50px)', willChange: 'transform, opacity'
          }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.3)' }}></div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 5vh, 4rem)', zIndex: 3, position: 'relative', padding: '0 1.5rem', marginTop: 'clamp(1rem, 5vh, 4rem)' }}>
        <motion.h1 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ 
            fontSize: 'clamp(2.5rem, 10vw, 5.5rem)', 
            fontWeight: 900, 
            marginBottom: '0.5rem', 
            background: 'linear-gradient(90deg, #3b82f6, #f97316)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 4px 15px rgba(0,0,0,0.5))',
            letterSpacing: '-0.04em',
            lineHeight: 1.1
          }}
        >
          Portal Tributario
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ 
            color: 'rgba(255,255,255,0.95)', 
            fontSize: 'clamp(1rem, 4vw, 1.5rem)', 
            fontWeight: 500, 
            textShadow: '0 2px 10px rgba(0,0,0,0.4)',
            maxWidth: '500px',
            margin: '0 auto'
          }}
        >
          Bienvenido, selecciona la empresa que deseas consultar
        </motion.p>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: 'clamp(1.5rem, 4vw, 3rem)', 
        flexWrap: 'wrap', 
        justifyContent: 'center', 
        zIndex: 3, 
        position: 'relative',
        padding: '0 1.5rem 4rem 1.5rem', // Bottom padding for scroll space
        width: '100%',
        maxWidth: '1200px'
      }}>
        {Object.values(companies).map((company, index) => (
          <motion.div
            key={company.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + (index * 0.1) }}
            whileHover={{ scale: 1.05, translateY: -10 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelectCompany(company.id)}
            className="glass"
            style={{ 
              width: 'clamp(140px, 45vw, 300px)', 
              height: 'clamp(200px, 50vh, 350px)',
              padding: 'clamp(1rem, 5vw, 2.5rem)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'clamp(1rem, 4vw, 2rem)',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(20px)', // Reduced for performance
              borderRadius: 'clamp(20px, 5vw, 40px)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ 
              width: 'clamp(80px, 25vw, 130px)', 
              height: 'clamp(80px, 25vw, 130px)', 
              background: 'white', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: 'clamp(8px, 3vw, 15px)',
              boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
              overflow: 'hidden',
              border: '2px solid rgba(255,255,255,0.5)'
            }}>
              <img 
                src={company.logo} 
                alt={company.displayName} 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain',
                  padding: '2px'
                }} 
              />
            </div>
            <h3 style={{ 
              color: 'white', 
              fontSize: 'clamp(1.2rem, 5vw, 2rem)', 
              fontWeight: 800, 
              letterSpacing: '0.05em' 
            }}>{company.displayName}</h3>
          </motion.div>
        ))}
      </div>
    </motion.section>

  return (
    <div className="app-container">
      <AnimatePresence>
        {view === 'selection' && <CompanySelection />}
      </AnimatePresence>

      {/* Decorative background elements refined for light mode */}
      <div className="bg-blob blob-1" style={{ background: 'radial-gradient(circle, #3b82f622 0%, transparent 70%)' }}></div>
      <div className="bg-blob blob-2" style={{ background: 'radial-gradient(circle, #f9731611 0%, transparent 70%)' }}></div>

      {selectedCompany && (
        <>
          <nav className="navbar glass" style={{ padding: '0 1.5rem' }}>
            <div 
              className="logo" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                background: 'white',
                padding: '4px 12px 4px 4px',
                borderRadius: '30px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                overflow: 'hidden',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #eee'
              }}>
                <img 
                  src={selectedCompany.logo} 
                  alt="Logo" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'contain',
                    padding: '2px'
                  }} 
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary)' }}>
                  {selectedCompany.id === 'TYM' ? 'TIENDAS & MARCAS' : 'TAT DISTRIBUCIONES'}
                </span>
                <span style={{ fontWeight: 500, fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                  {selectedCompany.id === 'TYM' ? 'EJE CAFETERO' : 'PORTAL TRIBUTARIO'}
                </span>
              </div>
            </div>
            
            <div className="nav-links" style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn btn-ghost"
                style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                onClick={() => {
                  setView('selection')
                  setSelectedCompany(null)
                  setCertificate(null)
                  setError(null)
                }}
              >
                Cambiar Empresa
              </button>
              <button 
                className={`btn ${view === 'portal' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                onClick={() => setView('portal')}
              >
                Certificados
              </button>
            </div>
          </nav>

          <main className="container">
            <AnimatePresence mode="wait">
              {view === 'portal' ? (
                <motion.section 
                  key="portal"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="hero"
                >
                  <div className="glass glass-card" style={{ maxWidth: '500px', width: '100%', marginTop: '-5vh' }}>
                    <h2 className="gradient-text" style={{ marginBottom: '0.5rem', fontSize: '1.8rem' }}>Descarga tu Certificado</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                      {selectedCompany.name}
                    </p>

                    <form onSubmit={handleSearch}>
                      <div className="input-group">
                        <label>NIT (Sin dígito de verificación)</label>
                        <input 
                          type="text" 
                          placeholder="Ej: 900123456" 
                          required 
                          value={searchData.nit}
                          onChange={(e) => setSearchData({...searchData, nit: e.target.value})}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: (searchData.type === 'reteiva' || searchData.type === 'reteica') ? '1fr 1fr 1fr' : '1fr 1fr', gap: '1rem' }}>
                        <div className="input-group">
                          <label>Año</label>
                          <select 
                            value={searchData.year}
                            onChange={(e) => setSearchData({...searchData, year: e.target.value})}
                          >
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                          </select>
                        </div>
                        <div className="input-group">
                          <label>Tipo</label>
                          <select
                            value={searchData.type}
                            onChange={(e) => setSearchData({...searchData, type: e.target.value})}
                          >
                            <option value="retefuente">ReteFuente</option>
                            <option value="reteiva">ReteIVA</option>
                            <option value="reteica">ReteICA</option>
                          </select>
                        </div>
                        {(searchData.type === 'reteiva' || searchData.type === 'reteica') && (
                          <div className="input-group">
                            <label>Periodo</label>
                            <select
                              value={searchData.period}
                              onChange={(e) => setSearchData({...searchData, period: e.target.value})}
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

                      <button 
                        className="btn btn-primary" 
                        style={{ width: '100%', marginTop: '1rem', height: '54px' }}
                        disabled={isSearching}
                      >
                        {isSearching ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          >
                            <Search size={20} />
                          </motion.div>
                        ) : (
                          <>
                            <Search size={20} />
                            Consultar Información
                          </>
                        )}
                      </button>
                    </form>

                    {error && (
                      <p style={{ color: '#f87171', fontSize: '0.85rem', marginTop: '1rem', textAlign: 'center' }}>
                        {error}
                      </p>
                    )}

                    <AnimatePresence>
                      {certificate && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                              <h4 style={{ fontSize: '1rem' }}>{certificate.name}</h4>
                              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>NIT: {certificate.nit}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ 
                                padding: '4px 12px', 
                                background: '#dcfce7', 
                                color: '#15803d', 
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                textTransform: 'uppercase'
                              }}>Disponible</span>
                            </div>
                          </div>
                          
                          <button 
                            className="btn btn-primary" 
                            style={{ width: '100%', background: 'var(--primary)' }}
                            onClick={downloadPDF}
                          >
                            <Download size={18} />
                            Descargar PDF (Certificado {certificate.year} {certificate.period ? `- Periodo ${certificate.period}` : ''})
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.section>
              ) : (
                <motion.section 
                  key="admin"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="hero"
                >
                  {!isAdminAuthenticated ? (
                    <div className="glass glass-card" style={{ maxWidth: '400px', width: '100%' }}>
                      <h2 className="gradient-text" style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Acceso Restringido</h2>
                      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                        Ingresa la contraseña para acceder al panel administrativo.
                      </p>
                      <form onSubmit={handleAdminLogin}>
                        <div className="input-group">
                          <label>Contraseña</label>
                          <input 
                            type="password" 
                            placeholder="••••••••" 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoFocus
                          />
                        </div>
                        {loginError && (
                          <p style={{ color: '#f87171', fontSize: '0.8rem', marginBottom: '1rem', textAlign: 'center' }}>
                            Contraseña incorrecta. Intenta de nuevo.
                          </p>
                        )}
                        <button className="btn btn-primary" style={{ width: '100%' }}>
                          Entrar al Panel
                        </button>
                      </form>
                    </div>
                  ) : (
                    <AdminPortal onLogout={() => {
                      setIsAdminAuthenticated(false)
                      setPassword('')
                    }} />
                  )}
                </motion.section>
              )}
            </AnimatePresence>
          </main>

          <footer style={{ 
            textAlign: 'center', 
            padding: '3rem', 
            color: 'var(--text-muted)', 
            fontSize: '0.85rem'
          }}>
            <p>&copy; {new Date().getFullYear()} Portal Tributario - {selectedCompany.name}.</p>
            <p style={{ marginTop: '0.5rem' }}>Todos los derechos reservados.</p>
            
            {/* Hidden admin link */}
            <button 
              onClick={() => setView('admin')}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'transparent', 
                cursor: 'default',
                fontSize: '1px',
                marginTop: '2rem'
              }}
              title="Acceso Administrativo"
            >
              .
            </button>
          </footer>
        </>
      )}
    </div>
  )
}

export default App
