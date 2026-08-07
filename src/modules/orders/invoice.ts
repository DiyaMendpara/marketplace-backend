// Generates a professional invoice PDF as a Buffer.
import PDFDocument from 'pdfkit';

interface InvoiceItem {
  name: string;
  supplier: string;
  qty: number;
  unitPrice: number;
  subtotal: number;
}

interface InvoiceData {
  reference: string;
  total: number;
  items: InvoiceItem[];
  shipping?: Record<string, string>;
  createdAt?: Date | string;
  role?: string;
}

export function invoicePdf(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Uint8Array[] = [];

    doc.on('data', (chunk: Uint8Array) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageWidth = doc.page.width;
    const marginLeft = 50;
    const marginRight = pageWidth - 50;
    const contentWidth = marginRight - marginLeft;

    // ── Header ──
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .fillColor('#4338ca')
      .text('Loomly', marginLeft, 45);

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#6b7280')
      .text('B2B Textile Marketplace', marginLeft, 73);

    // Invoice title (right-aligned)
    doc
      .fontSize(28)
      .font('Helvetica-Bold')
      .fillColor('#111827')
      .text('INVOICE', marginLeft, 45, { align: 'right' });

    // Reference & date
    const dateStr = data.createdAt
      ? new Date(data.createdAt).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#374151')
      .text(`Invoice #: ${data.reference}`, marginLeft, 100, { align: 'right' })
      .text(`Date: ${dateStr}`, { align: 'right' });

    // ── Divider ──
    doc
      .moveTo(marginLeft, 135)
      .lineTo(marginRight, 135)
      .strokeColor('#e5e7eb')
      .lineWidth(1)
      .stroke();

    // ── Shipping address ──
    let currentY = 150;
    if (data.shipping && Object.keys(data.shipping).length > 0) {
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#6b7280')
        .text('SHIP TO', marginLeft, currentY);

      currentY += 16;
      doc.fontSize(10).font('Helvetica').fillColor('#111827');

      if (data.shipping.company) {
        doc.font('Helvetica-Bold').text(data.shipping.company, marginLeft, currentY);
        currentY += 14;
      }
      if (data.shipping.name) {
        doc.font('Helvetica').text(data.shipping.name, marginLeft, currentY);
        currentY += 14;
      }
      if (data.shipping.address) {
        doc.text(data.shipping.address, marginLeft, currentY);
        currentY += 14;
      }
      const cityZip = [data.shipping.city, data.shipping.state, data.shipping.zip]
        .filter(Boolean)
        .join(', ');
      if (cityZip) {
        doc.text(cityZip, marginLeft, currentY);
        currentY += 14;
      }
      if (data.shipping.phone) {
        doc.text(`Phone: ${data.shipping.phone}`, marginLeft, currentY);
        currentY += 14;
      }

      currentY += 10;
    }

    const isBuyer = data.role === 'buyer';

    const colX = isBuyer ? {
      item: marginLeft,
      qty: marginLeft + contentWidth * 0.58,
      rate: marginLeft + contentWidth * 0.72,
      amount: marginLeft + contentWidth * 0.86,
    } : {
      item: marginLeft,
      supplier: marginLeft + contentWidth * 0.35,
      qty: marginLeft + contentWidth * 0.58,
      rate: marginLeft + contentWidth * 0.72,
      amount: marginLeft + contentWidth * 0.86,
    };

    // Header background
    doc.rect(marginLeft, currentY, contentWidth, 24).fill('#f3f4f6');

    currentY += 7;
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#374151');
    doc.text('ITEM', colX.item + 8, currentY);
    if (!isBuyer) {
      doc.text('SUPPLIER', (colX as any).supplier, currentY);
    }
    doc.text('QTY (m)', colX.qty, currentY);
    doc.text('RATE', colX.rate, currentY);
    doc.text('AMOUNT', colX.amount, currentY);

    currentY += 17;

    // ── Table rows ──
    doc.font('Helvetica').fontSize(9).fillColor('#111827');

    for (const item of data.items) {
      currentY += 4;
      doc.text(item.name, colX.item + 8, currentY, { width: isBuyer ? contentWidth * 0.52 : contentWidth * 0.32 });
      if (!isBuyer) {
        doc.text(item.supplier, (colX as any).supplier, currentY, { width: contentWidth * 0.2 });
      }
      doc.text(String(item.qty), colX.qty, currentY);
      doc.text(`Rs. ${item.unitPrice.toFixed(2)}`, colX.rate, currentY);
      doc.text(`Rs. ${item.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, colX.amount, currentY);

      currentY += 16;

      // Row divider
      doc
        .moveTo(marginLeft, currentY)
        .lineTo(marginRight, currentY)
        .strokeColor('#f3f4f6')
        .lineWidth(0.5)
        .stroke();
    }

    // ── Total section ──
    currentY += 16;
    doc
      .moveTo(colX.rate - 10, currentY)
      .lineTo(marginRight, currentY)
      .strokeColor('#e5e7eb')
      .lineWidth(1)
      .stroke();

    currentY += 10;
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#111827')
      .text('TOTAL', colX.rate, currentY)
      .text(
        `Rs. ${data.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        colX.amount,
        currentY,
      );

    // ── Footer ──
    currentY += 50;
    doc
      .moveTo(marginLeft, currentY)
      .lineTo(marginRight, currentY)
      .strokeColor('#e5e7eb')
      .lineWidth(1)
      .stroke();

    currentY += 12;
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#9ca3af')
      .text(
        'This is a computer-generated invoice. Thank you for your business.',
        marginLeft,
        currentY,
        { align: 'center', width: contentWidth },
      );

    doc.end();
  });
}
