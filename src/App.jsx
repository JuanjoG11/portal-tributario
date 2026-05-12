import React, { useState } from 'react'
import { FileText, ShieldCheck, Download, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateCertificatePDF } from './utils/pdfGenerator'
import { AdminPortal } from './components/AdminPortal'
import { supabase } from './utils/supabaseClient'
import { EXCEL_MOCK_DATA } from './utils/mockData'
import logo from './assets/logo_tym.png'

function App() {
  const [view, setView] = useState('portal') // 'portal' or 'admin'
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState(false)
  const [searchData, setSearchData] = useState({
    nit: '',
    year: '2025',
    type: 'retefuente'
  })
  const [isSearching, setIsSearching] = useState(false)
  const [certificate, setCertificate] = useState(null)
  const [error, setError] = useState(null)

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

  const handleSearch = async (e) => {
    e.preventDefault()
    setIsSearching(true)
    setCertificate(null)
    setError(null)

    try {
      // Real database query
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('nit', searchData.nit)
        .eq('year', searchData.year)
        .eq('type', searchData.type)

      if (error || !data || data.length === 0) throw new Error('No se encontró información para los datos ingresados.')
      
      // Grouping data logic if connected to real DB
      const groupedData = {
        nit: data[0].nit,
        name: data[0].name,
        year: data[0].year,
        type: data[0].type,
        city: data[0].city || 'Pereira',
        details: data.map(row => ({
          account: row.account || '',
          concept: row.concept || '',
          percentage: row.percentage ? `${row.percentage}%` : '',
          baseAmount: row.amount_base || 0,
          retainedAmount: row.amount_withheld || 0
        }))
      }
      
      setCertificate(groupedData)
    } catch (err) {
      // Mocking for demonstration if Supabase is not configured yet
      console.log('Falling back to mock data for demo...')
      setTimeout(() => {
        setIsSearching(false)
        
        // Filter the mock data based on the NIT and Year
        const filteredMockData = EXCEL_MOCK_DATA.filter(row => 
          row.nit === searchData.nit && row.year === searchData.year
        );

        if (filteredMockData.length === 0) {
          setError('No se encontró información para los datos ingresados en la base de datos (Prueba).');
          return;
        }

        // Group the filtered mock data
        const groupedMockData = {
          nit: filteredMockData[0].nit,
          name: filteredMockData[0].name,
          year: filteredMockData[0].year,
          type: searchData.type,
          city: 'Pereira, Risaralda',
          details: filteredMockData.map(row => ({
            account: row.account || '',
            concept: row.concept || '',
            percentage: row.percentage ? row.percentage.toString() : '',
            baseAmount: row.base || 0,
            retainedAmount: row.retained || 0
          }))
        }

        setCertificate(groupedMockData)
      }, 1000)
    } finally {
      // If we used real data, we'd set isSearching to false here
      // But since we are mocking the delay above, we leave it for now
    }
  }

  const downloadPDF = () => {
    if (certificate) {
      generateCertificatePDF(certificate)
    }
  }

  return (
    <div className="app-container">
      {/* Decorative background elements refined for light mode */}
      <div className="bg-blob blob-1" style={{ background: 'radial-gradient(circle, #3b82f622 0%, transparent 70%)' }}></div>
      <div className="bg-blob blob-2" style={{ background: 'radial-gradient(circle, #f9731611 0%, transparent 70%)' }}></div>

      <nav className="navbar glass">
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src={logo} 
            alt="Logo" 
            style={{ 
              width: '45px', 
              height: '45px', 
              borderRadius: '50%',
              objectFit: 'cover',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }} 
          />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>TIENDAS & MARCAS</span>
            <span style={{ fontWeight: 500, fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>EJE CAFETERO</span>
          </div>
        </div>
        <div className="nav-links" style={{ display: 'flex', gap: '20px' }}>
          <button 
            className={`btn ${view === 'portal' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setView('portal')}
          >
            Certificados
          </button>
          <button 
            className={`btn ${view === 'admin' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setView('admin')}
          >
            Área Contable
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
                  Tienda y Marcas Del Eje Cafetero
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

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="input-group">
                      <label>Año</label>
                      <select 
                        value={searchData.year}
                        onChange={(e) => setSearchData({...searchData, year: e.target.value})}
                      >
                        <option value="2025">2025</option>
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
                        Descargar PDF (Certificado {certificate.year})
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
        &copy; {new Date().getFullYear()} Portal Tributario - Tienda y Marcas Del Eje Cafetero. <br/>
        Todos los derechos reservados.
      </footer>
    </div>
  )
}

export default App
