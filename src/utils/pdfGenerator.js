import { jsPDF } from 'jspdf';
import { logoBase64 } from './logoBase64';
import { logoTatBase64 } from './logoTatBase64';

export const generateCertificatePDF = (certificateData) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const { 
    name, nit, year, type, details, period,
    companyName, companyNit, companyAddress, companyId, date
  } = certificateData;

  const formatCurrency = (val) => {
    const num = Math.abs(parseFloat(val));
    if (isNaN(num)) return '0';
    return new Intl.NumberFormat('es-CO', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  const getPeriodDates = (p, y) => {
    const periods = {
      '1': { desde: `01/01/${y}`, hasta: `28/02/${y}` },
      '2': { desde: `01/03/${y}`, hasta: `30/04/${y}` },
      '3': { desde: `01/05/${y}`, hasta: `30/06/${y}` },
      '4': { desde: `01/07/${y}`, hasta: `31/08/${y}` },
      '5': { desde: `01/09/${y}`, hasta: `31/10/${y}` },
      '6': { desde: `01/11/${y}`, hasta: `31/12/${y}` }
    };
    // Handle leap year for Feb
    if (p === '1' && (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0))) {
      periods['1'].hasta = `29/02/${y}`;
    }
    return periods[p] || { desde: `01/01/${y}`, hasta: `31/12/${y}` };
  };

  doc.setDrawColor(0);
  doc.setLineWidth(0.3);

  // --- BOX 1: Header ---
  doc.roundedRect(10, 10, 190, 20, 2, 2);
  
  const currentLogo = companyId === 'TAT' ? logoTatBase64 : logoBase64;
  
  if (currentLogo && currentLogo.trim() !== '') {
    try {
      doc.addImage(currentLogo, 'PNG', 15, 11, 18, 18);
    } catch (e) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('LOGO', 25, 20);
    }
  }

  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  const typeTitle = type.toUpperCase() === 'RETEIVA' ? 'RETENCION EN EL IVA' : 
                   type.toUpperCase() === 'RETEFUENTE' ? 'RETENCION EN LA FUENTE' : 
                   type.toUpperCase() === 'RETEICA' ? 'RETENCION EN EL ICA' : type.toUpperCase();
  doc.text(`CERTIFICADO DE ${typeTitle}`, 110, 18, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const dates = getPeriodDates(period, year);
  const dateText = (type.toUpperCase() === 'RETEIVA' || type.toUpperCase() === 'RETEICA')
    ? `Año Gravable  ${year}  Desde : ${dates.desde} - Hasta : ${dates.hasta}`
    : `Año Gravable  ${year}`;
  doc.text(dateText, 110, 24, { align: 'center' });

  // --- BOX 2: Agente Retenedor ---
  doc.roundedRect(10, 32, 190, 18, 2, 2);
  doc.setFontSize(9);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Agente', 13, 38);
  doc.text('Retenedor :', 13, 42);
  doc.text('Identificación :', 13, 46);

  doc.setFont('helvetica', 'bold');
  doc.text(companyName || 'TIENDAS & MARCAS DEL EJE CAFETERO S.A.S', 45, 38);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nit: ${companyNit || '900973932-9'}`, 45, 42);
  doc.text(companyAddress || 'CR 16 CALLE 77 BODEGA 3 LA ROMELIA LOTE PARQ.', 45, 46);

  // --- BOX 3: Retuvo a ---
  doc.roundedRect(10, 52, 190, 12, 2, 2);
  doc.setFont('helvetica', 'bold');
  doc.text('Retuvo a :', 13, 58);
  doc.text('Identificación :', 13, 62);
  
  doc.setFont('helvetica', 'bold');
  doc.text(name.toUpperCase(), 45, 58);
  doc.setFont('helvetica', 'normal');
  doc.text(nit, 45, 62);

  // --- BOX 4: Data Table ---
  const tableStartY = 66;
  const tableHeight = 60;
  doc.roundedRect(10, tableStartY, 190, tableHeight, 2, 2);

  // Table Headers
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('CONCEPTO RETENCIÓN', 15, 71);
  doc.text('MONTO SUJETO A RETENCIÓN', 130, 71, { align: 'center' });
  doc.text('VALOR TOTAL RETENCIÓN', 178, 71, { align: 'center' });
  doc.line(10, 73, 200, 73);

  // Data Rows
  let currentY = 78;
  doc.setFontSize(9);
  details.forEach(d => {
    doc.text(d.concept, 15, currentY);
    doc.text(formatCurrency(d.baseAmount), 130, currentY, { align: 'center' });
    doc.text(formatCurrency(d.retainedAmount), 178, currentY, { align: 'center' });
    currentY += 6;
  });

  // Total Row
  const totalRetained = details.reduce((sum, d) => sum + (parseFloat(d.retainedAmount) || 0), 0);
  doc.setFont('helvetica', 'bold');
  doc.text('VALOR TOTAL RETENIDO :', 145, currentY, { align: 'right' });
  doc.text(formatCurrency(totalRetained), 178, currentY, { align: 'center' });

  // --- BOX 5: City ---
  const cityY = tableStartY + tableHeight + 2;
  doc.roundedRect(10, cityY, 190, 8, 2, 2);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  
  let cityText = 'Ciudad donde se consignó :  PEREIRA - RISARALDA';
  if (type.toUpperCase() === 'RETEICA') {
    cityText = 'Valor que fue consignado en la Unidad de Rentas del municipio de: PEREIRA - RISARALDA';
  } else if (companyId === 'TAT') {
    cityText = 'Ciudad donde se consignó :  Administración de Impuestos Nacionales de DOSQUEBRADAS - RISARALDA';
  }
  
  doc.text(cityText, 13, cityY + 5);

  // --- BOX 6: Legal Text ---
  const legalY = cityY + 10;
  doc.roundedRect(10, legalY, 190, 10, 2, 2);
  doc.text('Se expide este certificado para dar cumplimiento a lo previsto en el artículo 381 del Estatuto Tributario.', 13, legalY + 4);
  doc.text('No necesita firma autógrafa (Art. 10 D R 836/91)', 13, legalY + 8);

  // --- Footer Signature & Date ---
  const footerY = legalY + 15;
  doc.line(13, footerY + 8, 80, footerY + 8);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('FIRMA', 46, footerY + 12, { align: 'center' });
  doc.setFontSize(7);
  doc.text('CONTADOR Y/O AUDITOR', 46, footerY + 15, { align: 'center' });

  // Current Date/Time
  const now = new Date();
  const isRetefuente = type.toUpperCase() === 'RETEFUENTE';
  
  // Usar la fecha del registro si existe, de lo contrario usar la lógica anterior
  const dateStr = date || (isRetefuente ? '30/03/2026' : now.toLocaleDateString('es-CO'));
  const timeStr = (date || isRetefuente) ? '' : ` - ${now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}`;
  
  const label = (date || isRetefuente) ? 'Fecha de expedición' : 'Fecha y hora de expedición';
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`${label}   ${dateStr}${timeStr}`, 198, footerY + 12, { align: 'right' });

  // Bottom Watermark
  doc.setFontSize(6);
  doc.setTextColor(100);
  const watermark = 'Sw.Mekano E.R.P. Apolo Ingeniería (0#6-8814800 - 312 8504813) - ventas@apolosoft.com - www.apolosoft.com';
  doc.text(watermark, 198, footerY + 25, { align: 'right' });

  const filename = `Certificado_${type}_${nit}_${year}${period ? `_P${period}` : ''}.pdf`;
  doc.save(filename);
};
