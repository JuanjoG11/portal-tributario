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
    const currentLogo = companyId === 'TAT' ? logoTatBase64 : logoBase64;
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
    doc.text(companyNit || (companyId === 'TAT' ? '901.568.117-1' : '900.973.932-9'), 45, 42);
    doc.text(companyAddress || '', 45, 46);

    // --- BOX 3: Conductor / Propietario ---
    doc.roundedRect(10, 52, 190, 12, 2, 2);
    doc.setFont('helvetica', 'bold');
    doc.text('Pagado a :', 13, 58);
    doc.text('Identificación :', 13, 62);
    
    doc.text(String(name).toUpperCase(), 45, 58);
    doc.setFont('helvetica', 'normal');
    const platesList = certificateData.fleteDetails.map(f => f.placa).join(', ');
    doc.text(`${nit}    -    PLACA(S): ${platesList}`, 45, 62);

    // --- BOX 4: Data Table ---
    const tableStartY = 66;
    const tableHeight = 60;
    doc.roundedRect(10, tableStartY, 190, tableHeight, 2, 2);

    // Table Headers
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('CONCEPTO DE LIQUIDACIÓN / PLACA', 15, 71);
    doc.text('VALOR', 180, 71, { align: 'right' });
    doc.line(10, 73, 200, 73);

    // Data Rows
    let currentY = 78;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    // List each plate's value
    certificateData.fleteDetails.forEach(f => {
      doc.text(`Valor Total Generado - Placa: ${f.placa}`, 15, currentY);
      doc.text(`$ ${formatCurrency(f.valorGenerado)}`, 180, currentY, { align: 'right' });
      currentY += 6;
    });

    // Consolidated Deductions
    const items = [
      { label: '(-) Retención en la Fuente (1%)', value: retefuente },
      { label: '(-) Retención ICA', value: reteica },
      { label: '(-) Descuentos Adicionales', value: adicionales || 0 },
      { label: '(-) Seguridad Social', value: seguridadSocial || 0 },
    ];

    items.forEach(item => {
      if (item.value > 0) {
        doc.text(item.label, 15, currentY);
        doc.text(`$ ${formatCurrency(item.value)}`, 180, currentY, { align: 'right' });
        currentY += 6;
      }
    });

    // Total Row
    doc.line(15, currentY - 2, 185, currentY - 2);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL NETO PAGADO :', 145, currentY + 2, { align: 'right' });
    doc.text(`$ ${formatCurrency(totalPagado)}`, 180, currentY + 2, { align: 'right' });

    // --- BOX 5: Footer Text / Observation ---
    const footerTextY = tableStartY + tableHeight + 2;
    doc.roundedRect(10, footerTextY, 190, 14, 2, 2);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Este documento es de caracter informativo bajo la figura de contrato de prestacion de servicios.', 13, footerTextY + 5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('OBSERVACIÓN: Cualquier novedad con el valor de los fletes comunicarse con el jefe logístico.', 13, footerTextY + 10);

    // --- Signature ---
    const signY = footerTextY + 20;
    doc.line(13, signY + 8, 80, signY + 8);
    doc.setFont('helvetica', 'bold');
    doc.text('FIRMA AUTORIZADA', 46, signY + 12, { align: 'center' });
    doc.setFontSize(7);
    doc.text(companyId === 'TAT' ? 'T.A.T. DISTRIBUCIONES' : 'TIENDAS & MARCAS DEL EJE CAFETERO', 46, signY + 15, { align: 'center' });

    // Watermark & Date
    doc.setFontSize(7);
    doc.setTextColor(100);
    doc.text(`Fecha de expedición: ${new Date().toLocaleString('es-CO')}`, 198, signY + 12, { align: 'right' });
    doc.text(`Generado por el Portal Tributario ${companyId}`, 198, signY + 25, { align: 'right' });

    doc.save(`Relacion_Fletes_${nit}_2026.pdf`);
    return;
  }

  // --- SPECIAL LAYOUT FOR CERTIFICADO DE ACCIONISTAS ---
  if (type === 'accionistas') {
    const { accionista, porcentaje } = certificateData;
    const pageW = 210;
    const margin = 18;
    const contentW = pageW - margin * 2;

    // ── helpers ──────────────────────────────────────────────────────────────

    // Formatea un número como moneda colombiana: 50000000 → "50.000.000"
    const fmtMoney = (n) =>
      new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

    // Convierte un número a palabras (millones / miles / unidades) en español
    const numberToWords = (n) => {
      if (n === 0) return 'cero';
      const unidades  = ['','un','dos','tres','cuatro','cinco','seis','siete','ocho','nueve',
                         'diez','once','doce','trece','catorce','quince','dieciséis',
                         'diecisiete','dieciocho','diecinueve'];
      const decenas   = ['','diez','veinte','treinta','cuarenta','cincuenta',
                         'sesenta','setenta','ochenta','noventa'];
      const centenas  = ['','ciento','doscientos','trescientos','cuatrocientos','quinientos',
                         'seiscientos','setecientos','ochocientos','novecientos'];

      const toWords = (num) => {
        if (num === 0) return '';
        if (num === 100) return 'cien';
        if (num < 20) return unidades[num];
        if (num < 100) {
          const d = Math.floor(num / 10);
          const u = num % 10;
          return u === 0 ? decenas[d] : `${decenas[d]} y ${unidades[u]}`;
        }
        const c = Math.floor(num / 100);
        const resto = num % 100;
        return resto === 0 ? centenas[c] : `${centenas[c]} ${toWords(resto)}`;
      };

      const millones = Math.floor(n / 1_000_000);
      const miles    = Math.floor((n % 1_000_000) / 1_000);
      const resto    = n % 1_000;
      let resultado  = '';

      if (millones > 0) {
        resultado += millones === 1 ? 'un millón' : `${toWords(millones)} millones`;
      }
      if (miles > 0) {
        if (resultado) resultado += ' ';
        resultado += miles === 1 ? 'mil' : `${toWords(miles)} mil`;
      }
      if (resto > 0) {
        if (resultado) resultado += ' ';
        resultado += toWords(resto);
      }
      return resultado;
    };

    // Determina tratamiento gramatical: persona jurídica o natural (género)
    // Para personas naturales intentamos detectar género por el nombre
    const esPJ = accionista.td === 31;
    const nombreCompleto = esPJ
      ? accionista.razonSocial
      : [accionista.nombre1, accionista.otrosNombres, accionista.apellido1, accionista.apellido2]
          .filter(Boolean).join(' ');

    // Heurística simple de género: nombres que terminan en 'a' → femenino
    const primerNombre = (accionista.nombre1 || '').trim().toLowerCase();
    const esFemenino = !esPJ && primerNombre.endsWith('a');

    const tratamiento = esPJ
      ? 'la sociedad'
      : esFemenino ? 'La señora' : 'El señor';

    // Formatea un número de identificación con puntos de miles: 66866189 → "66.866.189"
    const fmtId = (id) =>
      String(id).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    const identificadoCon = esPJ
      ? `identificada con NIT No. ${fmtId(accionista.nit)}${accionista.dv ? `-${accionista.dv}` : ''}`
      : `identificad${esFemenino ? 'a' : 'o'} con cédula de ciudadanía No. ${fmtId(accionista.nit)}`;

    // Número de acciones: vrPatrimonial / 1000 (valor nominal por acción = $1.000)
    const numAcciones = accionista.vrPatrimonial / 1000;
    const numAccionesStr = fmtMoney(numAcciones);
    const numAccionesLetras = numberToWords(numAcciones);

    const vrPatrimonialStr   = fmtMoney(accionista.vrPatrimonial);
    const vrPatrimonialLetras = numberToWords(accionista.vrPatrimonial);

    // Año fiscal = año seleccionado en el formulario
    const yearFiscal = year || '2025';

    // Fecha de firma: fija según instrucción
    const diaStr  = 31;
    const mesStr  = 'julio';
    const anioStr = 2026;

    // ── ENCABEZADO INSTITUCIONAL (tabla FOR-SST-055) ─────────────────────────
    doc.setDrawColor(80, 80, 80);
    doc.setLineWidth(0.4);

    // Borde exterior de la tabla de encabezado
    // Columna izq: código/versión/fecha  (55mm)
    // Columna centro: COMUNICACIÓN EXTERNA (95mm)
    // Columna der: logo (40mm)
    const hX = margin;       // 18
    const hY = 10;
    const colA = 55;         // ancho col izquierda
    const colB = 95;         // ancho col centro
    const colC = 40;         // ancho col derecha
    const hTotal = colA + colB + colC; // 190
    const rowH = 7;

    // Marco exterior
    doc.rect(hX, hY, hTotal, rowH * 3);

    // Divisores verticales
    doc.line(hX + colA,          hY, hX + colA,          hY + rowH * 3);
    doc.line(hX + colA + colB,   hY, hX + colA + colB,   hY + rowH * 3);

    // Divisores horizontales col izquierda
    doc.line(hX, hY + rowH,     hX + colA, hY + rowH);
    doc.line(hX, hY + rowH * 2, hX + colA, hY + rowH * 2);

    // Fila 1 izquierda: Código
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('Código: ', hX + 2, hY + 5);
    doc.setFont('helvetica', 'normal');
    doc.text('FOR-SST-055', hX + 16, hY + 5);

    // Fila 2 izquierda: Versión (fondo naranja)
    doc.setFillColor(220, 80, 20);
    doc.rect(hX, hY + rowH, colA, rowH, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Versión: ', hX + 2, hY + rowH + 5);
    doc.setFont('helvetica', 'normal');
    doc.text('01', hX + 18, hY + rowH + 5);

    // Fila 3 izquierda: Fecha
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text('Fecha: ', hX + 2, hY + rowH * 2 + 5);
    doc.setFont('helvetica', 'normal');
    doc.text('01-08-2017', hX + 15, hY + rowH * 2 + 5);

    // Columna centro: COMUNICACIÓN EXTERNA (centrado vertical)
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('COMUNICACIÓN EXTERNA', hX + colA + colB / 2, hY + rowH * 1.5 + 1.5, { align: 'center' });

    // Columna derecha: logo TYM — cuadrado y centrado en la celda
    const currentLogo = companyId === 'TAT' ? logoTatBase64 : logoBase64;
    if (currentLogo && currentLogo.trim() !== '') {
      try {
        const logoSize = rowH * 3 - 4;  // cuadrado, margen de 2px arriba y abajo
        const logoX = hX + colA + colB + (colC - logoSize) / 2;
        const logoY = hY + (rowH * 3 - logoSize) / 2;
        doc.addImage(currentLogo, 'PNG', logoX, logoY, logoSize, logoSize);
      } catch (e) {}
    }

    // ── CUERPO ────────────────────────────────────────────────────────────────
    let y = hY + rowH * 3 + 14;
    const lineH = 6.5;

    // Imprime un bloque de texto justificado (simula justificado distribuyendo palabras)
    const printJustified = (text, startY, fontSize = 10, bold = false) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setTextColor(0);
      const lines = doc.splitTextToSize(text, contentW);
      lines.forEach((line, i) => {
        const isLast = i === lines.length - 1;
        if (isLast) {
          // Última línea: alineada a la izquierda (no justificar)
          doc.text(line, margin, startY);
        } else {
          // Líneas completas: justificar manualmente
          const words = line.trim().split(/\s+/);
          if (words.length <= 1) {
            doc.text(line, margin, startY);
          } else {
            const totalTextWidth = words.reduce((s, w) => s + doc.getTextWidth(w), 0);
            const gap = (contentW - totalTextWidth) / (words.length - 1);
            let x = margin;
            words.forEach(w => {
              doc.text(w, x, startY);
              x += doc.getTextWidth(w) + gap;
            });
          }
        }
        startY += lineH;
      });
      return startY;
    };

    // Título centrado
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text('CERTIFICADO DE ACCIONISTA', pageW / 2, y, { align: 'center' });
    y += lineH + 2;

    // Párrafo 1 — identificación del firmante
    y = printJustified(
      'El suscrito, Marco Aurelio Parra Ávila, mayor de edad, identificado con cédula de ciudadanía ' +
      'No. 16.774.226, en calidad de Representante Legal Suplente de la sociedad TIENDAS Y ' +
      'MARCAS DEL EJE CAFETERO S.A.S., identificada con NIT No. 900.973.932-9, con domicilio en ' +
      'Dosquebradas - Risaralda,',
      y
    );

    // Título CERTIFICA QUE (centrado, negrita)
    y += 3;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('CERTIFICA QUE:', pageW / 2, y, { align: 'center' });
    y += lineH + 1;

    // Párrafo 2 — descripción del accionista (dinámico, justificado)
    y = printJustified(
      `${tratamiento} ${nombreCompleto}, ${identificadoCon}, es accionista de esta sociedad y posee ` +
      `${numAccionesStr} (${numAccionesLetras}) acciones a un valor nominal de $1.000 (mil pesos m/c) ` +
      `c/u, equivalentes al ${porcentaje}% del capital social.`,
      y
    );

    // Párrafo 3 — valor patrimonial (dinámico, justificado)
    y += 2;
    y = printJustified(
      `A la fecha de 31 de diciembre de ${yearFiscal}, dicha participación tiene un valor patrimonial ` +
      `de $${vrPatrimonialStr}, (${vrPatrimonialLetras} pesos m/c.)`,
      y
    );

    // Párrafo 4 — cuenta por pagar (dinámico)
    y += 2;
    if (accionista.cuentaPorPagar) {
      const cppStr    = fmtMoney(accionista.cuentaPorPagar);
      const cppLetras = numberToWords(accionista.cuentaPorPagar);
      y = printJustified(
        `A la fecha de 31 de diciembre de ${yearFiscal}, Tiene una cuenta por pagar a TIENDAS Y MARCAS ` +
        `DEL EJE CAFETERO SAS por valor de $${cppStr} (${cppLetras} pesos m/c).`,
        y
      );
      y += 2;
    }

    // Párrafo 5 — finalidad (justificado)
    y += 2;
    y = printJustified(
      'Este certificado se expide a solicitud del interesado para efectos de su declaración de renta ' +
      'y para los demás usos legales a que haya lugar.',
      y
    );

    // Párrafo 5 — lugar y fecha (justificado)
    y += 2;
    y = printJustified(
      `En constancia se firma en Dosquebradas, a los ${diaStr} días del mes de ${mesStr} de ${anioStr}.`,
      y
    );

    // ── NOTA ELECTRÓNICA ──────────────────────────────────────────────────────
    y += 6;
    doc.setDrawColor(180);
    doc.setLineWidth(0.3);
    doc.rect(margin, y, contentW, 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(60);
    const notaLines = doc.splitTextToSize(
      'Certificado generado electrónicamente a través del Portal Tributario de Tiendas y Marcas del ' +
      'Eje Cafetero S.A.S, no necesita firma autógrafa.',
      contentW - 6
    );
    notaLines.forEach((line, i) => {
      doc.text(line, margin + 3, y + 5 + i * 5);
    });
    y += 18;

    // ── FIRMAS ────────────────────────────────────────────────────────────────
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text('Atentamente,', margin, y);
    y += lineH * 3.5;

    // Líneas de firma
    const firmaIzqX  = margin;
    const firmaDerX  = pageW - margin - 60;

    doc.setLineWidth(0.4);
    doc.line(firmaIzqX, y, firmaIzqX + 60, y);
    doc.line(firmaDerX, y, firmaDerX + 60, y);

    y += 4;
    // Datos firma izquierda
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Marco Aurelio Parra Ávila', firmaIzqX, y);
    doc.setFont('helvetica', 'normal');
    doc.text('C.C. 16.774.226', firmaIzqX, y + lineH);
    doc.text('Representante Legal S.', firmaIzqX, y + lineH * 2);

    // Datos firma derecha
    doc.setFont('helvetica', 'bold');
    doc.text('Juliana Gutiérrez Granada', firmaDerX, y);
    doc.setFont('helvetica', 'normal');
    doc.text('Contadora Pública', firmaDerX, y + lineH);
    doc.text('T.P.230937-T', firmaDerX, y + lineH * 2);

    // ── PIE DE PÁGINA ─────────────────────────────────────────────────────────
    const footerY = 272;
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY, pageW - margin, footerY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(0);
    doc.text(
      'CR 16 CL 77 LC 1 A AV SIMON BOLIVAR PARQ. DE LAS MULAS BRR LA ROMELIA  Cel: 3165885003',
      pageW / 2, footerY + 5, { align: 'center' }
    );
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 180);
    doc.text('E-mail: contabilidad@tiendasymarcasejecafetero.com', pageW / 2, footerY + 10, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('Dosquebradas - Risaralda', pageW / 2, footerY + 15, { align: 'center' });

    const safeName = nombreCompleto.replace(/\s+/g, '_').replace(/[^A-Za-z0-9_]/g, '');
    doc.save(`Certificado_Accionista_${safeName}_${yearFiscal}.pdf`);
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
