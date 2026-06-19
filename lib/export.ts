/**
 * Utilities for client-side exporting of data to CSV (Excel-friendly) and PDF formats.
 */

export function exportToCSV(
  data: any[],
  headersMap: Record<string, string>,
  filename: string
) {
  const headers = Object.values(headersMap);
  const keys = Object.keys(headersMap);

  const csvRows: string[] = [];

  // Header row
  csvRows.push(headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','));

  // Data rows
  for (const item of data) {
    const rowValues = keys.map(key => {
      // support nested keys e.g. "itinerary.title" or simple keys
      let val = item;
      if (key.includes('.')) {
        const parts = key.split('.');
        for (const part of parts) {
          val = val ? val[part] : undefined;
        }
      } else {
        val = item[key];
      }

      if (val === null || val === undefined) {
        return '""';
      }

      let strVal = '';
      if (typeof val === 'object') {
        if (Array.isArray(val)) {
          // If it's an array of objects (like itinerary), stringify neatly, otherwise join
          if (val.length > 0 && typeof val[0] === 'object') {
            strVal = val.map(v => JSON.stringify(v)).join('; ');
          } else {
            strVal = val.join('; ');
          }
        } else {
          strVal = JSON.stringify(val);
        }
      } else if (val instanceof Date) {
        strVal = val.toLocaleString();
      } else {
        strVal = String(val);
      }

      // Escape quotes
      return `"${strVal.replace(/"/g, '""')}"`;
    });
    csvRows.push(rowValues.join(','));
  }

  // Prepends Byte Order Mark (BOM) to force Excel to open in UTF-8 mode
  const csvContent = '\uFEFF' + csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function formatPriceForExport(priceStr: any): string {
  if (priceStr === null || priceStr === undefined) return "";
  let cleaned = String(priceStr).trim();
  if (cleaned.startsWith("₹")) {
    cleaned = cleaned.replace("₹", "Rs. ").trim();
  } else if (/^\d+$/.test(cleaned)) {
    // If it's a pure number, format it with Rs. and commas
    const num = parseInt(cleaned, 10);
    cleaned = "Rs. " + num.toLocaleString("en-IN");
  } else {
    // Clean any weird quotes or symbols but keep numbers and commas
    const digitsAndCommas = cleaned.replace(/[^0-9,]/g, "");
    if (digitsAndCommas) {
      cleaned = "Rs. " + digitsAndCommas;
    }
  }
  return cleaned;
}

export async function exportToPDF(
  title: string,
  headers: string[],
  rows: any[][],
  filename: string
) {
  // Dynamically import to ensure window references don't break server-side builds
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  let titleX = 14;
  try {
    const logoImg = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = '/logo.png';
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
    doc.addImage(logoImg, 'PNG', 14, 8, 12, 12);
    titleX = 30;
  } catch (e) {
    console.error('Failed to load logo for PDF export:', e);
  }

  // Add Document Title
  doc.setFontSize(18);
  doc.setTextColor(234, 88, 12); // #ea580c (brand orange)
  doc.text(title, titleX, 15);

  // Add Date subtitle
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Exported on: ${new Date().toLocaleString()}`, titleX, 21);

  // Render Table
  autoTable(doc, {
    startY: 25,
    head: [headers],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [234, 88, 12], // brand orange #ea580c
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85], // slate-700
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // slate-50
    },
    margin: { top: 25, bottom: 15, left: 14, right: 14 },
    styles: {
      cellPadding: 2.5,
      overflow: 'linebreak',
    },
  });

  doc.save(filename);
}

