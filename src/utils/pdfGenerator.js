import { jsPDF } from 'jspdf';
import { logoBase64 } from './logoBase64';
import { logoTatBase64 } from './logoTatBase64';
import { logoDianBase64 } from './logoDianBase64';

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
    doc.text('RELACIÃ“N DE PAGO DE FLETES', 110, 18, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(periodRange || '2026', 110, 25, { align: 'center' });

    // --- BOX 2: Empresa (Agente) ---
    doc.roundedRect(10, 32, 190, 18, 2, 2);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Empresa :', 13, 38);
    doc.text('Nit :', 13, 42);
    doc.text('DirecciÃ³n :', 13, 46);

    doc.text(companyName.toUpperCase(), 45, 38);
    doc.setFont('helvetica', 'normal');
    doc.text(companyNit || (companyId === 'TAT' ? '901.568.117-1' : '900.973.932-9'), 45, 42);
    doc.text(companyAddress || '', 45, 46);

    // --- BOX 3: Conductor / Propietario ---
    doc.roundedRect(10, 52, 190, 12, 2, 2);
    doc.setFont('helvetica', 'bold');
    doc.text('Pagado a :', 13, 58);
    doc.text('IdentificaciÃ³n :', 13, 62);
    
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
    doc.text('CONCEPTO DE LIQUIDACIÃ“N / PLACA', 15, 71);
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
      { label: '(-) RetenciÃ³n en la Fuente (1%)', value: retefuente },
      { label: '(-) RetenciÃ³n ICA', value: reteica },
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
    doc.text('OBSERVACIÃ“N: Cualquier novedad con el valor de los fletes comunicarse con el jefe logÃ­stico.', 13, footerTextY + 10);

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
    doc.text(`Fecha de expediciÃ³n: ${new Date().toLocaleString('es-CO')}`, 198, signY + 12, { align: 'right' });
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

    // â”€â”€ helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    // Formatea un nÃºmero como moneda colombiana: 50000000 â†’ "50.000.000"
    const fmtMoney = (n) =>
      new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

    // Convierte un nÃºmero a palabras (millones / miles / unidades) en espaÃ±ol
    const numberToWords = (n) => {
      if (n === 0) return 'cero';
      const unidades  = ['','un','dos','tres','cuatro','cinco','seis','siete','ocho','nueve',
                         'diez','once','doce','trece','catorce','quince','diecisÃ©is',
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
        resultado += millones === 1 ? 'un millÃ³n' : `${toWords(millones)} millones`;
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

    // Determina tratamiento gramatical: persona jurÃ­dica o natural (gÃ©nero)
    // Para personas naturales intentamos detectar gÃ©nero por el nombre
    const esPJ = accionista.td === 31;
    const nombreCompleto = esPJ
      ? accionista.razonSocial
      : [accionista.nombre1, accionista.otrosNombres, accionista.apellido1, accionista.apellido2]
          .filter(Boolean).join(' ');

    // HeurÃ­stica simple de gÃ©nero: nombres que terminan en 'a' â†’ femenino
    const primerNombre = (accionista.nombre1 || '').trim().toLowerCase();
    const esFemenino = !esPJ && primerNombre.endsWith('a');

    const tratamiento = esPJ
      ? 'la sociedad'
      : esFemenino ? 'La seÃ±ora' : 'El seÃ±or';

    // Formatea un nÃºmero de identificaciÃ³n con puntos de miles: 66866189 â†’ "66.866.189"
    const fmtId = (id) =>
      String(id).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    const identificadoCon = esPJ
      ? `identificada con NIT No. ${fmtId(accionista.nit)}${accionista.dv ? `-${accionista.dv}` : ''}`
      : `identificad${esFemenino ? 'a' : 'o'} con cÃ©dula de ciudadanÃ­a No. ${fmtId(accionista.nit)}`;

    // NÃºmero de acciones: vrPatrimonial / 1000 (valor nominal por acciÃ³n = $1.000)
    const numAcciones = accionista.vrPatrimonial / 1000;
    const numAccionesStr = fmtMoney(numAcciones);
    const numAccionesLetras = numberToWords(numAcciones);

    const vrPatrimonialStr   = fmtMoney(accionista.vrPatrimonial);
    const vrPatrimonialLetras = numberToWords(accionista.vrPatrimonial);

    // AÃ±o fiscal = aÃ±o seleccionado en el formulario
    const yearFiscal = year || '2025';

    // Fecha de firma: fija segÃºn instrucciÃ³n
    const diaStr  = 31;
    const mesStr  = 'julio';
    const anioStr = 2026;

    // â”€â”€ ENCABEZADO INSTITUCIONAL (tabla FOR-SST-055) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    doc.setDrawColor(80, 80, 80);
    doc.setLineWidth(0.4);

    // Borde exterior de la tabla de encabezado
    // Columna izq: cÃ³digo/versiÃ³n/fecha  (55mm)
    // Columna centro: COMUNICACIÃ“N EXTERNA (95mm)
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

    // Fila 1 izquierda: CÃ³digo
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('CÃ³digo: ', hX + 2, hY + 5);
    doc.setFont('helvetica', 'normal');
    doc.text('FOR-SST-055', hX + 16, hY + 5);

    // Fila 2 izquierda: VersiÃ³n (fondo naranja)
    doc.setFillColor(220, 80, 20);
    doc.rect(hX, hY + rowH, colA, rowH, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('VersiÃ³n: ', hX + 2, hY + rowH + 5);
    doc.setFont('helvetica', 'normal');
    doc.text('01', hX + 18, hY + rowH + 5);

    // Fila 3 izquierda: Fecha
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text('Fecha: ', hX + 2, hY + rowH * 2 + 5);
    doc.setFont('helvetica', 'normal');
    doc.text('01-08-2017', hX + 15, hY + rowH * 2 + 5);

    // Columna centro: COMUNICACIÃ“N EXTERNA (centrado vertical)
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('COMUNICACIÃ“N EXTERNA', hX + colA + colB / 2, hY + rowH * 1.5 + 1.5, { align: 'center' });

    // Columna derecha: logo TYM â€” cuadrado y centrado en la celda
    const currentLogo = companyId === 'TAT' ? logoTatBase64 : logoBase64;
    if (currentLogo && currentLogo.trim() !== '') {
      try {
        const logoSize = rowH * 3 - 4;  // cuadrado, margen de 2px arriba y abajo
        const logoX = hX + colA + colB + (colC - logoSize) / 2;
        const logoY = hY + (rowH * 3 - logoSize) / 2;
        doc.addImage(currentLogo, 'PNG', logoX, logoY, logoSize, logoSize);
      } catch (e) {}
    }

    // â”€â”€ CUERPO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
          // Ãšltima lÃ­nea: alineada a la izquierda (no justificar)
          doc.text(line, margin, startY);
        } else {
          // LÃ­neas completas: justificar manualmente
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

    // TÃ­tulo centrado
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text('CERTIFICADO DE ACCIONISTA', pageW / 2, y, { align: 'center' });
    y += lineH + 2;

    // PÃ¡rrafo 1 â€” identificaciÃ³n del firmante
    y = printJustified(
      'El suscrito, Marco Aurelio Parra Ãvila, mayor de edad, identificado con cÃ©dula de ciudadanÃ­a ' +
      'No. 16.774.226, en calidad de Representante Legal Suplente de la sociedad TIENDAS Y ' +
      'MARCAS DEL EJE CAFETERO S.A.S., identificada con NIT No. 900.973.932-9, con domicilio en ' +
      'Dosquebradas - Risaralda,',
      y
    );

    // TÃ­tulo CERTIFICA QUE (centrado, negrita)
    y += 3;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('CERTIFICA QUE:', pageW / 2, y, { align: 'center' });
    y += lineH + 1;

    // PÃ¡rrafo 2 â€” descripciÃ³n del accionista (dinÃ¡mico, justificado)
    y = printJustified(
      `${tratamiento} ${nombreCompleto}, ${identificadoCon}, es accionista de esta sociedad y posee ` +
      `${numAccionesStr} (${numAccionesLetras}) acciones a un valor nominal de $1.000 (mil pesos m/c) ` +
      `c/u, equivalentes al ${porcentaje}% del capital social.`,
      y
    );

    // PÃ¡rrafo 3 â€” valor patrimonial (dinÃ¡mico, justificado)
    y += 2;
    y = printJustified(
      `A la fecha de 31 de diciembre de ${yearFiscal}, dicha participaciÃ³n tiene un valor patrimonial ` +
      `de $${vrPatrimonialStr}, (${vrPatrimonialLetras} pesos m/c.)`,
      y
    );

    // PÃ¡rrafo 4 â€” cuenta por pagar (dinÃ¡mico)
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

    // PÃ¡rrafo 5 â€” finalidad (justificado)
    y += 2;
    y = printJustified(
      'Este certificado se expide a solicitud del interesado para efectos de su declaraciÃ³n de renta ' +
      'y para los demÃ¡s usos legales a que haya lugar.',
      y
    );

    // PÃ¡rrafo 5 â€” lugar y fecha (justificado)
    y += 2;
    y = printJustified(
      `En constancia se firma en Dosquebradas, a los ${diaStr} dÃ­as del mes de ${mesStr} de ${anioStr}.`,
      y
    );

    // â”€â”€ NOTA ELECTRÃ“NICA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    y += 6;
    doc.setDrawColor(180);
    doc.setLineWidth(0.3);
    doc.rect(margin, y, contentW, 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(60);
    const notaLines = doc.splitTextToSize(
      'Certificado generado electrÃ³nicamente a travÃ©s del Portal Tributario de Tiendas y Marcas del ' +
      'Eje Cafetero S.A.S, no necesita firma autÃ³grafa.',
      contentW - 6
    );
    notaLines.forEach((line, i) => {
      doc.text(line, margin + 3, y + 5 + i * 5);
    });
    y += 18;

    // â”€â”€ FIRMAS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text('Atentamente,', margin, y);
    y += lineH * 3.5;

    // LÃ­neas de firma
    const firmaIzqX  = margin;
    const firmaDerX  = pageW - margin - 60;

    doc.setLineWidth(0.4);
    doc.line(firmaIzqX, y, firmaIzqX + 60, y);
    doc.line(firmaDerX, y, firmaDerX + 60, y);

    y += 4;
    // Datos firma izquierda
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Marco Aurelio Parra Ãvila', firmaIzqX, y);
    doc.setFont('helvetica', 'normal');
    doc.text('C.C. 16.774.226', firmaIzqX, y + lineH);
    doc.text('Representante Legal S.', firmaIzqX, y + lineH * 2);

    // Datos firma derecha
    doc.setFont('helvetica', 'bold');
    doc.text('Juliana GutiÃ©rrez Granada', firmaDerX, y);
    doc.setFont('helvetica', 'normal');
    doc.text('Contadora PÃºblica', firmaDerX, y + lineH);
    doc.text('T.P.230937-T', firmaDerX, y + lineH * 2);

    // â”€â”€ PIE DE PÃGINA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    ? `AÃ±o Gravable  ${year}  Desde : ${dates.desde} - Hasta : ${dates.hasta}`
    : `AÃ±o Gravable  ${year}`;
  doc.text(dateText, 110, 24, { align: 'center' });

  // --- BOX 2: Agente Retenedor ---
  doc.roundedRect(10, 32, 190, 18, 2, 2);
  doc.setFontSize(9);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Agente', 13, 38);
  doc.text('Retenedor :', 13, 42);
  doc.text('IdentificaciÃ³n :', 13, 46);

  doc.setFont('helvetica', 'bold');
  doc.text(companyName || 'TIENDAS & MARCAS DEL EJE CAFETERO S.A.S', 45, 38);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nit: ${companyNit || '900973932-9'}`, 45, 42);
  doc.text(companyAddress || 'CR 16 CALLE 77 BODEGA 3 LA ROMELIA LOTE PARQ.', 45, 46);

  // --- BOX 3: Retuvo a ---
  doc.roundedRect(10, 52, 190, 12, 2, 2);
  doc.setFont('helvetica', 'bold');
  doc.text('Retuvo a :', 13, 58);
  doc.text('IdentificaciÃ³n :', 13, 62);
  
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
  doc.text('CONCEPTO RETENCIÃ“N', 15, 71);
  doc.text('MONTO SUJETO A RETENCIÃ“N', 130, 71, { align: 'center' });
  doc.text('VALOR TOTAL RETENCIÃ“N', 178, 71, { align: 'center' });
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
  
  let cityText = 'Ciudad donde se consignÃ³ :  PEREIRA - RISARALDA';
  if (type.toUpperCase() === 'RETEICA') {
    const cityName = companyId === 'TAT' ? 'DOSQUEBRADAS - RISARALDA' : 'PEREIRA - RISARALDA';
    cityText = `Valor que fue consignado en la Unidad de Rentas del municipio de: ${cityName}`;
  } else if (companyId === 'TAT') {
    cityText = 'Ciudad donde se consignÃ³ :  AdministraciÃ³n de Impuestos Nacionales de DOSQUEBRADAS - RISARALDA';
  }
  
  doc.text(cityText, 13, cityY + 5);

  // --- BOX 6: Legal Text ---
  const legalY = cityY + 10;
  doc.roundedRect(10, legalY, 190, 10, 2, 2);
  doc.text('Se expide este certificado para dar cumplimiento a lo previsto en el artÃ­culo 381 del Estatuto Tributario.', 13, legalY + 4);
  doc.text('No necesita firma autÃ³grafa (Art. 10 D R 836/91)', 13, legalY + 8);

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
  
  // Usar la fecha del registro si existe, de lo contrario usar la lÃ³gica anterior
  const dateStr = date || (isRetefuente ? '30/03/2026' : now.toLocaleDateString('es-CO'));
  const timeStr = (date || isRetefuente) ? '' : ` - ${now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}`;
  
  const label = (date || isRetefuente) ? 'Fecha de expediciÃ³n' : 'Fecha y hora de expediciÃ³n';
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`${label}   ${dateStr}${timeStr}`, 198, footerY + 12, { align: 'right' });

  // Bottom Watermark
  doc.setFontSize(6);
  doc.setTextColor(100);
  const watermark = 'Sw.Mekano E.R.P. Apolo IngenierÃ­a (0#6-8814800 - 312 8504813) - ventas@apolosoft.com - www.apolosoft.com';
  doc.text(watermark, 198, footerY + 25, { align: 'right' });

  const filename = `Certificado_${type}_${nit}_${year}${period ? `_P${period}` : ''}.pdf`;
  doc.save(filename);
};

// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// FORMULARIO 220 — Una sola página A4
// ─────────────────────────────────────────────────────────────────────────────
export const generateFormulario220PDF = (emp) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const DIAN_GREEN = [0, 121, 52];
  const DIAN_DARK  = [0,  70, 30];
  const BLUE       = [0,  80,160];
  const ROW_A      = [255,255,255];
  const ROW_B      = [242,248,255];
  const ROW_GA     = [255,255,255];
  const ROW_GB     = [242,252,246];
  const BORDER     = [190,205,220];
  const TEXT       = [25, 25, 25];
  const MUTED      = [120,120,120];
  const GOLD       = [255,200, 30];
  const WHITE      = [255,255,255];

  const PW = 210, PH = 297;
  const ML = 9, MR = 9, CW = PW - ML - MR;

  // ── helpers ───────────────────────────────────────────────────────────────
  const fc  = (...c) => doc.setFillColor(...c);
  const tc  = (...c) => doc.setTextColor(...c);
  const dc  = (...c) => doc.setDrawColor(...c);
  const lw  = (w)    => doc.setLineWidth(w);
  const fn  = (f, s) => { doc.setFont('helvetica', f); doc.setFontSize(s); };

  const money = (n) => {
    const v = parseFloat(n) || 0;
    return v === 0 ? '-' : new Intl.NumberFormat('es-CO').format(v);
  };

  const pill = (x, y, w, h, col) => {
    fc(...col); doc.roundedRect(x, y, w, h, 1, 1, 'F');
  };

  // fila de tabla: fondo + badge casilla + label + valor
  const drawRow = (x, y, w, h, bg, badgeCol, cas, label, val, valCol) => {
    fc(...bg); doc.rect(x, y, w, h, 'F');
    dc(...BORDER); lw(0.15); doc.line(x, y, x + w, y);
    // badge
    pill(x + 1.2, y + 0.8, 7.5, h - 1.6, badgeCol);
    tc(...(cas === '52' || cas === '60' ? WHITE : (badgeCol[0] < 150 ? BLUE : DIAN_GREEN)));
    fn('bold', 5); doc.text(cas, x + 5, y + h - 1.2, { align: 'center' });
    // label
    tc(...TEXT); fn('normal', 6);
    doc.text(label, x + 10, y + h - 1.5);
    // valor
    const hv = parseFloat(val) > 0;
    fn(hv ? 'bold' : 'normal', 6.5);
    tc(...(hv ? valCol : MUTED));
    doc.text(money(val), PW - MR - 1.5, y + h - 1.5, { align: 'right' });
  };

  let y = 0;

  // ══════════════════════════════════════════════════════════════════════════
  // CABECERA  (0 → 26mm)
  // ══════════════════════════════════════════════════════════════════════════
  fc(...DIAN_GREEN); doc.rect(0, 0, PW, 26, 'F');
  fc(...GOLD);       doc.rect(0, 23.5, PW, 2.5, 'F');

  // caja DIAN izquierda
  fc(...WHITE); doc.roundedRect(ML, 2.5, 28, 19, 2, 2, 'F');
  try {
    doc.addImage(logoDianBase64, 'JPEG', ML + 1, 3.5, 26, 17);
  } catch(e) {
    tc(...DIAN_DARK); fn('bold', 13);
    doc.text('DIAN', ML + 14, 10.5, { align: 'center' });
    fn('normal', 4.8);
    const ds = doc.splitTextToSize('Dirección de Impuestos\ny Aduanas Nacionales', 24);
    ds.forEach((l, i) => doc.text(l, ML + 14, 14 + i * 3, { align: 'center' }));
  }

  // título central
  tc(...WHITE); fn('bold', 10);
  doc.text('Certificado de Ingresos y Retenciones', PW / 2, 8.5, { align: 'center' });
  fn('normal', 8);
  doc.text('por Rentas de Trabajo y de Pensiones  ·  Año gravable 2025', PW / 2, 14, { align: 'center' });

  // caja TAT derecha
  fc(...WHITE); doc.roundedRect(PW - MR - 28, 2.5, 28, 19, 2, 2, 'F');
  try { doc.addImage(logoTatBase64, 'PNG', PW - MR - 26, 3.5, 24, 17); } catch(e) {
    tc(...DIAN_DARK); fn('bold', 8); doc.text('TAT', PW - MR - 14, 13, { align: 'center' });
  }

  // badge 220
  fc(...DIAN_DARK); doc.roundedRect(PW/2 - 9, 20, 18, 8, 1.5, 1.5, 'F');
  tc(...WHITE); fn('bold', 11); doc.text('220', PW / 2, 26.5, { align: 'center' });

  y = 28;

  // ══════════════════════════════════════════════════════════════════════════
  // BANDA INSTRUCCIÓN  (28 → 33)
  // ══════════════════════════════════════════════════════════════════════════
  fc(255,255,215); dc(...BORDER); lw(0.15);
  doc.rect(ML, y, CW, 5, 'FD');
  tc(80,60,0); fn('normal', 5.5);
  doc.text('Antes de diligenciar este formulario lea cuidadosamente las instrucciones', ML + 2, y + 3.5);
  fn('bold', 5.5); doc.text('Digite número de cédula >>', ML + 112, y + 3.5);
  tc(...TEXT); fn('bold', 6.5); doc.text(emp.id, PW - MR - 2, y + 3.5, { align: 'right' });
  y += 5;

  // ══════════════════════════════════════════════════════════════════════════
  // RETENEDOR  (33 → 55)
  // ══════════════════════════════════════════════════════════════════════════
  fc(...BLUE); doc.roundedRect(ML, y, 17, 4.5, 1, 1, 'F');
  tc(...WHITE); fn('bold', 5.5); doc.text('Retenedor', ML + 8.5, y + 3.2, { align: 'center' });
  y += 5;

  // fila NIT/DV/apellidos/nombres
  const rCols = [
    { l:'5. NIT', v:'901.568.117', w:52 },
    { l:'6. DV', v:'1', w:11 },
    { l:'7. Primer Apellido', v:'', w:30 },
    { l:'8. Segundo Apellido', v:'', w:28 },
    { l:'9. Primer Nombre', v:'', w:28 },
    { l:'10. Otros Nombres', v:'', w: CW-52-11-30-28-28 },
  ];
  let cx = ML;
  rCols.forEach(c => {
    fc(...ROW_A); dc(...BORDER); lw(0.15); doc.rect(cx, y, c.w, 8, 'FD');
    tc(...MUTED); fn('normal', 4); doc.text(c.l, cx + 1.2, y + 2.5);
    tc(...TEXT); fn('bold', 6.5); doc.text(c.v, cx + c.w/2, y + 6.5, { align:'center' });
    cx += c.w;
  });
  y += 8;

  // razón social
  fc(...ROW_B); dc(...BORDER); lw(0.15); doc.rect(ML, y, CW, 6.5, 'FD');
  tc(...MUTED); fn('normal', 4); doc.text('11. Razón Social', ML + 1.5, y + 2.5);
  tc(...TEXT); fn('bold', 7.5); doc.text('TAT DISTRIBUCIONES DEL EJE CAFETERO S.A.S.', ML + CW/2, y + 5.5, { align:'center' });
  y += 6.5;

  y += 2;

  // ══════════════════════════════════════════════════════════════════════════
  // EMPLEADO  (y → y+22)
  // ══════════════════════════════════════════════════════════════════════════
  fc(...DIAN_GREEN); doc.roundedRect(ML, y, 17, 4.5, 1, 1, 'F');
  tc(...WHITE); fn('bold', 5.5); doc.text('Empleado', ML + 8.5, y + 3.2, { align: 'center' });
  y += 5;

  const eCols = [
    { l:'24. Cód.Tipo', v:'13', w:15 },
    { l:'25. Número de documento', v:emp.id, w:46 },
    { l:'26. Primer apellido', v:emp.apellido1, w:32 },
    { l:'27. Segundo apellido', v:emp.apellido2, w:29 },
    { l:'28. Primer Nombre', v:emp.nombre1, w:29 },
    { l:'29. Otros Nombres', v:emp.nombre2||'', w: CW-15-46-32-29-29 },
  ];
  cx = ML;
  eCols.forEach(c => {
    fc(...ROW_A); dc(...BORDER); lw(0.15); doc.rect(cx, y, c.w, 8, 'FD');
    tc(...MUTED); fn('normal', 4); doc.text(c.l, cx + 1.2, y + 2.5);
    tc(...TEXT); fn('bold', c.w < 20 ? 6 : 6.5);
    doc.text(String(c.v), cx + c.w/2, y + 6.5, { align:'center' });
    cx += c.w;
  });
  y += 8;

  // fila período/fecha/lugar/dpto/municipio
  const pCols = [{w:54},{w:37},{w:59},{w:16},{w:CW-54-37-59-16}];
  cx = ML;
  pCols.forEach((c, i) => {
    fc(...(i%2===0 ? ROW_A : ROW_B)); dc(...BORDER); lw(0.15); doc.rect(cx, y, c.w, 8, 'FD');
    cx += c.w;
  });
  tc(...MUTED); fn('normal', 4);
  doc.text('Periodo de la Certificación', ML+1.5, y+2.5);
  doc.text('30. de:', ML+1.5, y+5.5);
  tc(...TEXT); fn('bold', 6); doc.text(emp.fechaInicial, ML+15, y+5.8);
  tc(...MUTED); fn('normal', 4); doc.text('31. A:', ML+31, y+5.5);
  tc(...TEXT); fn('bold', 6); doc.text(emp.fechaFinal, ML+40, y+5.8);
  tc(...MUTED); fn('normal', 4); doc.text('32. Fecha Expedición', ML+55.5, y+2.5);
  tc(...TEXT); fn('bold', 6.5); doc.text('28/03/2026', ML+54+18.5, y+6.2, { align:'center' });
  tc(...MUTED); fn('normal', 4); doc.text('33. Lugar retención', ML+92.5, y+2.5);
  tc(...TEXT); fn('bold', 6.5); doc.text('Dosquebradas', ML+92.5+29.5, y+6.2, { align:'center' });
  tc(...MUTED); fn('normal', 4); doc.text('34. Dpto.', ML+152.5, y+2.5);
  tc(...TEXT); fn('bold', 6.5); doc.text('66', ML+160, y+6.2, { align:'center' });
  tc(...MUTED); fn('normal', 4); doc.text('35. Municipio', ML+169.5, y+2.5);
  tc(...TEXT); fn('bold', 6.5); doc.text('001', ML+177, y+6.2, { align:'center' });
  y += 8;

  y += 2;

  // ══════════════════════════════════════════════════════════════════════════
  // TABLA INGRESOS  16 filas × 4.8 + header 5.5 + total 6 = ~99mm
  // ══════════════════════════════════════════════════════════════════════════
  fc(...BLUE); doc.roundedRect(ML, y, CW, 5.5, 1, 1, 'F');
  tc(...WHITE); fn('bold', 6.5);
  doc.text('Concepto de los Ingresos', ML+4, y+4);
  doc.text('Valor', PW-MR-2, y+4, { align:'right' });
  y += 5.5;

  const RH = 4.8;
  const iRows = [
    { cas:'36', lbl:'Pagos por salarios', val:emp.c36 },
    { cas:'37', lbl:'Pagos con bonos electrónicos, cheques, tarjetas o vales', val:emp.c37 },
    { cas:'38', lbl:'Exceso pagos alimentación > 41 UVT (art. 387-1 E.T.)', val:emp.c38 },
    { cas:'39', lbl:'Pagos por honorarios', val:emp.c39 },
    { cas:'40', lbl:'Pagos por servicios', val:emp.c40 },
    { cas:'41', lbl:'Pagos por comisiones', val:emp.c41 },
    { cas:'42', lbl:'Pagos por prestaciones sociales', val:emp.c42 },
    { cas:'43', lbl:'Pagos por viáticos', val:emp.c43 },
    { cas:'44', lbl:'Pagos por gastos de representación', val:emp.c44 },
    { cas:'45', lbl:'Pagos por compensación trabajo asociado cooperativo', val:emp.c45 },
    { cas:'46', lbl:'Otros pagos', val:emp.c46 },
    { cas:'47', lbl:'Auxilio de cesantías e intereses efectivamente pagados', val:emp.c47 },
    { cas:'48', lbl:'Cesantías régimen tradicional CST (Cap.VII, Tít.VIII Parte Primera)', val:emp.c48 },
    { cas:'49', lbl:'Auxilio de cesantías consignadas al fondo', val:emp.c49 },
    { cas:'50', lbl:'Pensiones de jubilación, vejez o invalidez', val:emp.c50 },
    { cas:'51', lbl:'Apoyos económicos educativos no reembolsables (recursos públicos)', val:emp.c51 },
  ];
  iRows.forEach((r,i) => {
    drawRow(ML, y, CW, RH, i%2===0 ? ROW_A : ROW_B,
      i%2===0 ? [210,225,245] : [195,215,240], r.cas, r.lbl, r.val, BLUE);
    y += RH;
  });

  // casilla 52 total
  const tot = iRows.reduce((a,r)=>a+(parseFloat(r.val)||0),0);
  fc(...BLUE); doc.rect(ML, y, CW, 6, 'F');
  tc(...WHITE); fn('bold', 6.5);
  doc.text('52.  Total de Ingresos Brutos (Sume 36 a 51)', ML+4, y+4.2);
  fn('bold', 7); doc.text(money(tot), PW-MR-1.5, y+4.2, { align:'right' });
  y += 6;

  y += 2;

  // ══════════════════════════════════════════════════════════════════════════
  // TABLA APORTES  7 filas × 4.8 + header 5.5 = ~39mm
  // ══════════════════════════════════════════════════════════════════════════
  fc(...DIAN_GREEN); doc.roundedRect(ML, y, CW, 5.5, 1, 1, 'F');
  tc(...WHITE); fn('bold', 6.5);
  doc.text('Concepto de los Aportes', ML+4, y+4);
  doc.text('Valor', PW-MR-2, y+4, { align:'right' });
  y += 5.5;

  const aRows = [
    { cas:'53', lbl:'Aportes obligatorios por salud a cargo del trabajador', val:emp.c53 },
    { cas:'54', lbl:'Aportes obligatorios a fondos de pensiones y solidaridad pensional', val:emp.c54 },
    { cas:'55', lbl:'Cotizaciones voluntarias al RAIS', val:emp.c55 },
    { cas:'56', lbl:'Aportes voluntarios a fondos de pensiones', val:emp.c56 },
    { cas:'57', lbl:'Aportes a cuentas AFC', val:emp.c57 },
    { cas:'58', lbl:'Aportes a cuentas AVC', val:emp.c58 },
    { cas:'59', lbl:'Ingreso laboral promedio últimos 6 meses (num. 4 art. 206 E.T.)', val:emp.c59 },
  ];
  aRows.forEach((r,i) => {
    drawRow(ML, y, CW, RH, i%2===0 ? ROW_GA : ROW_GB,
      i%2===0 ? [210,240,220] : [195,230,210], r.cas, r.lbl, r.val, DIAN_GREEN);
    y += RH;
  });

  // casilla 60
  y += 1.5;
  fc(...DIAN_GREEN); doc.roundedRect(ML, y, CW, 9, 2, 2, 'F');
  fc(...GOLD); doc.roundedRect(ML, y+7, CW, 2, 0, 0, 'F');
  tc(...WHITE); fn('bold', 7);
  doc.text('60.  Valor de la retención en la fuente por ingresos laborales y de pensiones', ML+4, y+5);
  fn('bold', 9); doc.text(money(emp.c60), PW-MR-2, y+7, { align:'right' });
  y += 11;

  // nombre pagador
  fc(...ROW_B); dc(...BORDER); lw(0.15); doc.rect(ML, y, CW, 6, 'FD');
  tc(...MUTED); fn('normal', 4); doc.text('Nombre del pagador o agente retenedor', ML+2, y+2.5);
  tc(...TEXT); fn('bold', 7); doc.text('TAT DISTRIBUCIONES DEL EJE CAFETERO S.A.S.', ML+CW/2, y+5.2, { align:'center' });
  y += 6;

  y += 2;

  // ══════════════════════════════════════════════════════════════════════════
  // NOTA LEGAL compacta
  // ══════════════════════════════════════════════════════════════════════════
  fc(255,253,228); dc(200,190,120); lw(0.25); doc.roundedRect(ML, y, CW, 21, 2, 2, 'FD');
  fc(...GOLD); doc.rect(ML, y, 2.5, 21, 'F');
  tc(75,55,0); fn('bold', 6);
  doc.text('Certifico que durante el año gravable de 2025:', ML+5, y+4.5);
  fn('normal', 5.5);
  const ns = [
    '1. Mi patrimonio bruto excedió de 4.500 UVT ($224.095.000).',
    '2. Mis ingresos brutos fueron Inferiores a 1.400 UVT ($569.719.000).',
    '3. No fui responsable del IVA a 31 de diciembre de 2025.',
    '4. Mis consumos con tarjeta de crédito no excedieron 1.400 UVT ($569.719.000).',
    '5. Mis compras y consumos no superaron 1.400 UVT ($569.719.000).',
    '6. Mis consignaciones, depósitos e inversiones no excedieron 1.400 UVT ($569.719.000).',
  ];
  ns.forEach((n,i) => doc.text(n, ML+5, y+8.5+i*2.8));
  y += 21;

  y += 1.5;

  // nota DIAN
  fc(246,246,246); dc(...BORDER); lw(0.15); doc.roundedRect(ML, y, CW, 9, 1.5, 1.5, 'FD');
  tc(...MUTED); fn('italic', 5.2);
  const dn = 'NOTA: Este certificado sustituye la declaración de Renta y Complementario para quienes cumplan el art. 1.6.1.13.2.7 del D. 1625/2016. No necesita firma autógrafa (Art. 10 D.R. 836/91).';
  const dl = doc.splitTextToSize(dn, CW-5);
  dl.forEach((l,i) => doc.text(l, ML+2.5, y+3.5+i*3));
  y += 9;

  // ── Firma del trabajador (abajo a la derecha) ─────────────────────────────
  const FIRMA_W = 80;
  const FIRMA_H = 12;
  const FIRMA_X = PW - MR - FIRMA_W;
  fc(...ROW_A); dc(...BORDER); lw(0.15);
  doc.rect(FIRMA_X, y, FIRMA_W, FIRMA_H, 'FD');
  tc(...MUTED); fn('normal', 5);
  doc.text('Firma del trabajador o pensionado', FIRMA_X + 3, y + 3.5);
  // línea de firma
  dc(180, 180, 180); lw(0.3);
  doc.line(FIRMA_X + 6, y + FIRMA_H - 3, FIRMA_X + FIRMA_W - 6, y + FIRMA_H - 3);
  y += FIRMA_H;

  y += 1;

  // ══════════════════════════════════════════════════════════════════════════
  // FOOTER fijo al fondo
  // ══════════════════════════════════════════════════════════════════════════
  fc(...GOLD); doc.rect(0, PH-13, PW, 2, 'F');
  fc(...DIAN_DARK); doc.rect(0, PH-11, PW, 11, 'F');
  tc(...WHITE); fn('bold', 6.5);
  doc.text('Portal Tributario  ·  TAT Distribuciones del Eje Cafetero S.A.S.', ML, PH-5);
  fn('normal', 6);
  const ed = new Date().toLocaleDateString('es-CO',{day:'2-digit',month:'long',year:'numeric'});
  doc.text('Expedido el '+ed+'  ·  Documento electrónico, no requiere firma autógrafa', PW-MR, PH-5, { align:'right' });

  doc.save(`Formulario220_TAT_${emp.id}_2025.pdf`);
};
