import ExcelJS from 'exceljs';
import { formatNumberToWords } from '../redux/FormatNumbertowords';

export interface DocumentData {
  buyer: { name: string; address: string };
  products: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  date: string;
  factureNumber: string;
}

const cellStyle: Partial<ExcelJS.Style> = {
  border: {
    top: { style: 'thin', color: { argb: '000000' } },
    bottom: { style: 'thin', color: { argb: '000000' } },
    left: { style: 'thin', color: { argb: '000000' } },
    right: { style: 'thin', color: { argb: '000000' } },
  },
  alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
  font: { name: 'Calibri', size: 12 }
};

const headerStyle: Partial<ExcelJS.Style> = {
  ...cellStyle,
  font: { 
    bold: true, 
    color: { argb: '000000' }, 
    size: 12,
    name: 'Arial'
  },
  fill: {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'F8F9FA' }
  }
};
const sanitizeWorksheetName = (name: string) => {
  return name.replace(/[*?:\\/[\] ]/g, '-').substring(0, 31); // Excel max 31 chars
};


async function createBaseWorksheet(workbook: ExcelJS.Workbook, title: string) {
  const cleanTitle = sanitizeWorksheetName(title);
  const worksheet = workbook.addWorksheet(cleanTitle);
  
  try {
    const response = await fetch('/Header.jpeg');
    const imageBuffer = await response.arrayBuffer();
    const imageId = workbook.addImage({ 
      buffer: imageBuffer, 
      extension: 'jpeg' 
    });
    
    worksheet.addImage(imageId, {
      tl: { col: 0, row: 0 },
      ext: { width: 800, height: 150 }
    });
  } catch (error) {
    console.error('Error loading header image:', error);
  }

  worksheet.pageSetup = {
    paperSize: 9,
    orientation: 'portrait',
    fitToPage: true,
    fitToWidth: 1,
    margins: {
      left: 0.7,
      right: 0.5,
      top: 0.4,
      bottom: 0.3,
      header: 0.2,
      footer: 0.2
    }
  };

  worksheet.columns = [
    { width: 10 },
    { width: 60 },
    { width: 18 },
    { width: 20 },
  ];

  return worksheet;
}

async function addCommonContent(
  worksheet: ExcelJS.Worksheet,
  data: DocumentData,
  docTitle: string,
  formattedDate: string
) {
  // Header spacing
  worksheet.getRow(1).height = 150;
  worksheet.mergeCells('A1:D1');
  worksheet.getCell('A1').alignment = { 
    horizontal: 'center', 
    vertical: 'middle', 
    wrapText: true 
  };

  // Buyer info
  worksheet.mergeCells('A6:D6');
  worksheet.getCell('A6').value = `A ${data.buyer.name.toUpperCase() || 'CLIENT'}`;
  worksheet.getCell('A6').style = {
    font: { bold: true, size: 14, color: { argb: '1F4E78' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
  };

  worksheet.mergeCells('A7:D7');
  worksheet.getCell('A7').value = data.buyer.address;
  worksheet.getCell('A7').font = { 
    bold: true, 
    italic: true, 
    color: { argb: '595959' } 
  };
  worksheet.getCell('A7').alignment = { horizontal: 'center' };

  // Document title and date
  worksheet.mergeCells('A9:C9');
  worksheet.getCell('A9').value = docTitle;
  worksheet.getCell('A9').font = { bold: true, size: 12 };
  worksheet.getCell('A9').alignment = { horizontal: 'left', vertical: 'middle' };

  worksheet.getCell('D9').value = `AGADIR LE ${formattedDate}  `;
  worksheet.getCell('D9').alignment = { horizontal: 'right', vertical: 'middle' };
  worksheet.getCell('D9').font = { bold: true };
  worksheet.getColumn(4).width = 22;

  // Table header
  const headerRow = worksheet.addRow(['QTÉ', 'Désignation', 'Prix Unitaire', 'Montant Total']);
  headerRow.height = 25;
  headerRow.eachCell(cell => cell.style = headerStyle);
}

function addProducts(worksheet: ExcelJS.Worksheet, products: DocumentData['products']) {
  let total = 0;
  
  products.forEach(p => {
    const totalRow = p.quantity * p.price;
    total += totalRow;
    const row = worksheet.addRow([p.quantity, p.name, p.price, totalRow]);
    row.eachCell(cell => cell.style = cellStyle);
  });

  while (worksheet.rowCount < 35) {
    const emptyRow = worksheet.addRow(['', '', '', '']);
    emptyRow.eachCell(cell => cell.style = cellStyle);
  }

  return total;
}

function addFinancials(worksheet: ExcelJS.Worksheet, total: number) {
  const cellBorder = {
    top: { style: 'thin' as ExcelJS.BorderStyle },
    bottom: { style: 'thin' as ExcelJS.BorderStyle },
    left: { style: 'thin' as ExcelJS.BorderStyle },
    right: { style: 'thin' as ExcelJS.BorderStyle }
  };

  // Total HT
  let rowIndex = (worksheet.lastRow?.number || 0) + 1;
  worksheet.getCell(`C${rowIndex}`).value = 'Montant Total HT';
  worksheet.getCell(`C${rowIndex}`).alignment = { horizontal: 'right', vertical: 'middle' };
  worksheet.getCell(`C${rowIndex}`).font = { bold: true };
  worksheet.getCell(`C${rowIndex}`).border = cellBorder;
  worksheet.getCell(`D${rowIndex}`).value = `${total.toFixed(2)} DH`;
  worksheet.getCell(`D${rowIndex}`).alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getCell(`D${rowIndex}`).font = { bold: true };
  worksheet.getCell(`D${rowIndex}`).border = cellBorder;

  // TVA
  rowIndex++;
  const tva = total * 0.2;
  worksheet.getCell(`C${rowIndex}`).value = 'TVA (20%)';
  worksheet.getCell(`C${rowIndex}`).alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getCell(`C${rowIndex}`).font = { bold: true };
  worksheet.getCell(`C${rowIndex}`).border = cellBorder;
  worksheet.getCell(`D${rowIndex}`).value = `${tva.toFixed(2)} DH`;
  worksheet.getCell(`D${rowIndex}`).font = { bold: true };
  worksheet.getCell(`D${rowIndex}`).alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getCell(`D${rowIndex}`).border = cellBorder;

  // Total TTC
  rowIndex++;
  const totalTTC = total + tva;
  worksheet.getCell(`C${rowIndex}`).value = 'Montant Total TTC';
  worksheet.getCell(`C${rowIndex}`).alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getCell(`C${rowIndex}`).font = { bold: true };
  worksheet.getCell(`C${rowIndex}`).border = cellBorder;
  worksheet.getCell(`D${rowIndex}`).value = `${totalTTC.toFixed(2)} DH`;
  worksheet.getCell(`D${rowIndex}`).font = { bold: true };
  worksheet.getCell(`D${rowIndex}`).alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getCell(`D${rowIndex}`).border = cellBorder;

  return { totalTTC, rowIndex };
}

function addFooter(worksheet: ExcelJS.Worksheet) {
  // First ensure minimum printable rows
  const minimumPrintableRows = 50;
  while (worksheet.rowCount < minimumPrintableRows) {
    worksheet.addRow(['', '', '', '']);
  }

  // Now add footer at absolute bottom
  const footerRow = worksheet.addRow([]);
  worksheet.mergeCells(`A${footerRow.number}:D${footerRow.number}`);
  
  worksheet.getCell(`A${footerRow.number}`).value = `
BLOC F 19 RUE FARHAT HECHAD CITE DAKHLA AGADIR TEL 0528.23.34.88 / FAX 0528.23.36.51
CAPITAL SOCIAL : 500 000,00 DHS PATENTE : 48156045 RC 7127 CNSS 6161294 IF 06926525 I.C.E.: 000075220000046
C.B.: 007 010 0015248000000044-78 ATTJARIWAFABANK CITE DAKHLA AGADIR
  `.trim();

  // Maintain original styling
  worksheet.getCell(`A${footerRow.number}`).style = {
    font: { size: 9, name: 'Arial', color: { argb: '808080' } },
    alignment: { 
      horizontal: 'center', 
      vertical: 'middle', 
      wrapText: true 
    }
  };
  
  worksheet.getRow(footerRow.number).height = 55;
  worksheet.pageSetup.printArea = `A1:D${footerRow.number}`;

  // Remove borders from empty rows above footer
  for (let i = minimumPrintableRows; i < footerRow.number - 1; i++) {
    const row = worksheet.getRow(i);
    row.eachCell(cell => {
      cell.border = {};
    });
  }
}
async function generateDocument(
  data: DocumentData,
  docType: 'facture' | 'bon_de_livraison' | 'devis'
) {
  const workbook = new ExcelJS.Workbook();
  const docTitleMap = {
    facture: `FACTURE N°: ${data.factureNumber.replace('/', '/')}`,
    bon_de_livraison: `BON DE LIVRAISON N°: ${data.factureNumber.replace('/', '/')}`,
    devis: `DEVIS N°: ${data.factureNumber.replace('/', '/')}`
  };

  const worksheet = await createBaseWorksheet(workbook, docTitleMap[docType]);
  const formattedDate = new Date(data.date).toLocaleDateString('fr-FR');

  await addCommonContent(worksheet, data, docTitleMap[docType], formattedDate);
  const total = addProducts(worksheet, data.products);
  const { totalTTC } = addFinancials(worksheet, total);
  
  // Signature section
  const stopRowIndex = (worksheet.lastRow?.number || 0) + 1;
  worksheet.mergeCells(`A${stopRowIndex}:C${stopRowIndex}`);
  
  const article = docType === 'facture' ? 'LA PRÉSENTE' : 'LE PRÉSENT';

  const formattedText = [
    { 
      font: { 
        name: 'Arial', // Required field
        family: 2, // Required field (2 = Swiss)
        bold: true, 
        italic: true, 
        underline: true, // Correct underline format
        color: { argb: 'FF2F5496' }, // Full ARGB format
        size: 12 
      },
      text: `\u00A0\u00A0\u00A0\u00A0ARRÊTÉE ${article} ${docType.toUpperCase()} À LA SOMME DE :\n`
    },
    {
      font: { 
        name: 'Arial',
        family: 2,
        bold: true, 
        italic: false, 
        color: { argb: 'FF000000' }, 
        size: 12 
      },
      text: `\u00A0\u00A0\u00A0\u00A0${' '.repeat(50)}${formatNumberToWords(totalTTC)}`
    }
  ];
  
  // Apply with proper typing
  worksheet.getCell(`A${stopRowIndex}`).value = {
    richText: formattedText as ExcelJS.RichText[] // Type assertion
  };
  
  // Rest of your unchanged code
  worksheet.getCell(`A${stopRowIndex}`).alignment = {
    vertical: 'middle',
    horizontal: 'left',
    wrapText: true
  };
  worksheet.getRow(stopRowIndex).height = 80;
  addFooter(worksheet);

  // Generate file
  const buffer = await workbook.xlsx.writeBuffer();
  const fileName = `${docType}_${data.buyer.name || 'client'}_${formattedDate.replace(/\//g, '-')}.xlsx`;
  
  // Trigger download
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
}

export const generateFacture = (data: DocumentData) => generateDocument(data, 'facture');
export const generateBonLivraison = (data: DocumentData) => generateDocument(data, 'bon_de_livraison');
export const generateDevis = (data: DocumentData) => generateDocument(data, 'devis');