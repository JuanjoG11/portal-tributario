import { jsPDF } from 'jspdf';
import { logoBase64 } from './logoBase64';
import { logoTatBase64 } from './logoTatBase64';

export const generateCertificatePDF = (certificateData) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const { 
    name, nit, year, type, details, period,
    companyName, companyNit, companyAddress, companyId, date,
    placa, totalFlete, retefuente, reteica, adicionales, seguridadSocial, totalPagado, periodRange
  } = certificateData;

  const formatCurrency = (val) => {
    const num = Math.abs(parseFloat(val));
    if (isNaN(num)) return '0';
    return new Intl.NumberFormat('es-CO', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  // --- SPECIAL LAYOUT FOR FREIGHT (FLETES) ---
  if (type === 'fletes') {
    doc.setDrawColor(0);
    doc.setLineWidth(0.3);

    // --- BOX 1: Header ---
    doc.roundedRect(10, 10, 190, 20, 2, 2);
    const currentLogo = logoTatBase64;
    if (currentLogo) {
      try { doc.addImage(currentLogo, 'PNG', 15, 11, 18, 18); } catch (e) {}
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('RELACIÓN DE PAGO DE FLETES', 110, 18, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(periodRange || '2026', 110, 25, { align: 'center' });

    // --- BOX 2: Empresa (Agente) ---
    doc.roundedRect(10, 32, 190, 18, 2, 2);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Empresa :', 13, 38);
    doc.text('Nit :', 13, 42);
    doc.text('Dirección :', 13, 46);

    doc.text(companyName.toUpperCase(), 45, 38);
    doc.setFont('helvetica', 'normal');
    doc.text(companyNit || '901.568.117-1', 45, 42);
    doc.text(companyAddress || '', 45, 46);

    // --- BOX 3: Conductor / Propietario ---
    doc.roundedRect(10, 52, 190, 12, 2, 2);
    doc.setFont('helvetica', 'bold');
    doc.text('Pagado a :', 13, 58);
    doc.text('Identificación :', 13, 62);
    
    doc.text(String(name).toUpperCase(), 45, 58);
    doc.setFont('helvetica', 'normal');
    doc.text(`${nit}    -    PLACA: ${placa || 'N/A'}`, 45, 62);

    // --- BOX 4: Data Table ---
    const tableStartY = 66;
    const tableHeight = 60;
    doc.roundedRect(10, tableStartY, 190, tableHeight, 2, 2);

    // Table Headers
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('CONCEPTO DE LIQUIDACIÓN', 15, 71);
    doc.text('VALOR', 180, 71, { align: 'right' });
    doc.line(10, 73, 200, 73);

    // Data Rows
    let currentY = 78;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    const items = [
      { label: 'Valor Total Generado', value: totalFlete },
      { label: '(-) Retención en la Fuente (1%)', value: retefuente },
      { label: '(-) Retención ICA', value: reteica },
      { label: '(-) Descuentos Adicionales', value: adicionales || 0 },
      { label: '(-) Seguridad Social', value: seguridadSocial || 0 },
    ];

    items.forEach(item => {
      doc.text(item.label, 15, currentY);
      doc.text(`$ ${formatCurrency(item.value)}`, 180, currentY, { align: 'right' });
      currentY += 6;
    });

    // Total Row
    doc.line(15, currentY - 2, 185, currentY - 2);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL NETO PAGADO :', 145, currentY + 2, { align: 'right' });
    doc.text(`$ ${formatCurrency(totalPagado)}`, 180, currentY + 2, { align: 'right' });

    // --- BOX 5: Footer Text / Observation ---
    const footerTextY = tableStartY + tableHeight + 2;
    doc.roundedRect(10, footerTextY, 190, 12, 2, 2);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Este documento es una relación detallada de los fletes y descuentos aplicados para el periodo mencionado.', 13, footerTextY + 5);
    doc.setFont('helvetica', 'bold');
    doc.text('OBSERVACIÓN: Cualquier novedad con el valor de los fletes comunicarse con el jefe logístico.', 13, footerTextY + 9);

    // --- Signature ---
    const signY = footerTextY + 20;
    doc.line(13, signY + 8, 80, signY + 8);
    doc.setFont('helvetica', 'bold');
    doc.text('FIRMA AUTORIZADA', 46, signY + 12, { align: 'center' });
    doc.setFontSize(7);
    doc.text('T.A.T. DISTRIBUCIONES', 46, signY + 15, { align: 'center' });

    // Watermark & Date
    doc.setFontSize(7);
    doc.setTextColor(100);
    doc.text(`Fecha de expedición: ${new Date().toLocaleString('es-CO')}`, 198, signY + 12, { align: 'right' });
    doc.text('Generado por el Portal Tributario TAT', 198, signY + 25, { align: 'right' });

    doc.save(`Relacion_Fletes_${nit}_2026.pdf`);
    return;
  }

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
                   type.toUpperCase() === 'RETEICA' ? 'RETEICA' : type.toUpperCase();
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
    const cityName = companyId === 'TAT' ? 'DOSQUEBRADAS - RISARALDA' : 'PEREIRA - RISARALDA';
    cityText = `Valor que fue consignado en la Unidad de Rentas del municipio de: ${cityName}`;
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
