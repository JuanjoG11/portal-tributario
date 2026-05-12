import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { logoBase64 } from './logoBase64';

export const generateCertificatePDF = (certificateData) => {
  // Using landscape could be an option, but the image fits well in portrait A4 width. 
  // We'll use portrait A4 and adjust coordinates to match the wide look.
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const { name, nit, year, type, details } = certificateData;

  // Helper to format currency without decimals if not needed, or with decimals. 
  // The image shows "63,760" and "$64". Let's format as integers.
  const formatCurrency = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return '$ 0';
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(num));
  };
  
  const formatNumber = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return '0';
    return new Intl.NumberFormat('es-CO', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(num));
  };

  doc.setDrawColor(0); // Black lines
  doc.setLineWidth(0.3);

  // --- BOX 1: Header ---
  doc.roundedRect(10, 10, 190, 20, 2, 2);
  
  // Logo Logic
  if (logoBase64 && logoBase64.trim() !== '') {
    try {
      // Ajusta los valores de x (15), y (11), ancho (18), alto (18) según las proporciones de tu logo
      doc.addImage(logoBase64, 'PNG', 15, 11, 18, 18);
    } catch (e) {
      console.warn("No se pudo cargar el logo base64. Usando texto de respaldo.");
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 58, 138);
      doc.text('T&M', 25, 18, { align: 'center' });
      doc.setFontSize(6);
      doc.text('EJE CAFETERO', 25, 21, { align: 'center' });
    }
  } else {
    // Placeholder Text if no logo is provided
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 58, 138); // Blueish logo color
    doc.text('T&M', 25, 18, { align: 'center' });
    doc.setFontSize(6);
    doc.text('EJE CAFETERO', 25, 21, { align: 'center' });
  }
  
  // Header Text
  doc.setTextColor(0);
  doc.setFontSize(14);
  const typeDisplay = type.toUpperCase() === 'RETEFUENTE' ? 'RETENCIÓN EN LA FUENTE' : type.toUpperCase();
  doc.text(`CERTIFICADO DE ${typeDisplay}`, 110, 18, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`AÑO GRAVABLE ${year}`, 110, 25, { align: 'center' });

  // --- BOX 2: Agente Retenedor ---
  doc.roundedRect(10, 32, 190, 20, 2, 2);
  doc.setFontSize(9);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Agente Retenedor :', 13, 38);
  doc.setFont('helvetica', 'normal');
  doc.text('TIENDAS & MARCAS DEL EJE CAFETERO S.A.S', 45, 38);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Identificación :', 13, 44);
  doc.setFont('helvetica', 'normal');
  doc.text('900973932-9', 45, 44);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Dirección :', 13, 50);
  doc.setFont('helvetica', 'normal');
  doc.text('CR 16 CALLE 77 BODEGA 3 LA ROMELIA LOTE PARQ.', 45, 50);

  // --- BOX 3: Retuvo a ---
  doc.roundedRect(10, 54, 190, 14, 2, 2);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Retuvo a :', 13, 60);
  doc.setFont('helvetica', 'normal');
  // Truncate name if too long to fit
  const safeName = name.length > 60 ? name.substring(0, 60) + '...' : name;
  doc.text(safeName, 45, 60);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Identificación :', 13, 66);
  doc.setFont('helvetica', 'normal');
  doc.text(nit, 45, 66);

  // --- BOX 4: Data Table & Footer ---
  // We need to calculate dynamic height based on rows
  const tableStartY = 70;
  const rowStartY = 85;
  const rowHeight = 6;
  const dataHeight = details.length * rowHeight;
  
  // Calculate footer position (at least 130mm from top to look good)
  const footerStartY = Math.max(rowStartY + dataHeight + 15, 120); 
  const box4Height = (footerStartY + 40) - tableStartY; // 40 is the height of the footer section
  
  doc.roundedRect(10, tableStartY, 190, box4Height, 2, 2);

  // Table Headers
  doc.line(10, 78, 200, 78);
  doc.setFontSize(8);
  doc.text('CONCEPTO RETENCIÓN', 45, 75, { align: 'center' });
  doc.text('MONTO SUJETO A RETENCIÓN', 130, 75, { align: 'center' });
  doc.text('VALOR RETENCIÓN', 175, 75, { align: 'center' });

  // Table Rows
  let currentY = rowStartY;
  doc.setFont('helvetica', 'normal');
  details.forEach(d => {
    // Truncate concept if it's too long
    const conceptText = d.concept.length > 50 ? d.concept.substring(0, 50) + '...' : d.concept;
    doc.text(conceptText, 12, currentY);
    doc.text(formatNumber(d.baseAmount), 130, currentY, { align: 'center' });
    doc.text(formatNumber(d.retainedAmount), 175, currentY, { align: 'center' });
    currentY += rowHeight;
  });

  // Totals
  currentY += 5;
  const totalRetained = details.reduce((sum, d) => sum + Math.abs(parseFloat(d.retainedAmount) || 0), 0);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('VALOR TOTAL RETENIDO :', 145, currentY, { align: 'right' });
  doc.text(formatCurrency(totalRetained), 175, currentY, { align: 'center' });

  // Inside Box Footer Elements
  doc.line(10, footerStartY, 200, footerStartY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Ciudad donde se consignó : Administración de Impuestos Nacionales de PEREIRA - RISARALDA', 12, footerStartY + 5);
  
  doc.line(10, footerStartY + 7, 200, footerStartY + 7);
  doc.text('Se expide este certificado para dar cumplimiento a lo previsto en el artículo 381 del Estatuto Tributario.', 12, footerStartY + 12);
  doc.text('No necesita firma autógrafa (Art. 10 D R 836/91)', 12, footerStartY + 16);
  
  doc.line(10, footerStartY + 19, 200, footerStartY + 19);
  
  // Date and Signature
  doc.text('Fecha de expedición:', 12, footerStartY + 27);
  doc.text(`D:  31  / M:  03  / A:  2026`, 45, footerStartY + 27);
  
  // Underlines for date
  doc.line(48, footerStartY + 28, 55, footerStartY + 28);
  doc.line(61, footerStartY + 28, 68, footerStartY + 28);
  doc.line(74, footerStartY + 28, 85, footerStartY + 28);

  // Signature
  doc.line(125, footerStartY + 27, 185, footerStartY + 27);
  doc.text('JULIANA GUTIERREZ', 155, footerStartY + 31, { align: 'center' });
  doc.text('CONTADOR Y/O AUDITOR', 155, footerStartY + 35, { align: 'center' });

  // Outside Box Footer
  const finalY = tableStartY + box4Height + 5;
  doc.setFontSize(6);
  doc.text('Sistema Mekano ERP (cel 312 8504813) www.mekanoerp.co - www.apolosoft.com', 10, finalY);
  doc.text('AUXILIAR', 190, finalY, { align: 'right' });

  // Download
  doc.save(`Certificado_${type}_${nit}_${year}.pdf`);
};
