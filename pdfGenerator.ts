import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Invoice, LedgerEntry, PaymentRecord, BusinessProfile, Customer } from "../types";

// Helper function to convert numeric currency to Indian Rupee Words
export function numberToWords(amount: number): string {
  if (isNaN(amount) || amount <= 0) return "Rs. Zero Only";

  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const formatTens = (n: number): string => {
    if (n < 20) return a[n];
    return (b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "")).trim();
  };

  const convertGroup = (n: number): string => {
    if (n === 0) return "";
    let str = "";
    if (Math.floor(n / 100) > 0) {
      str += a[Math.floor(n / 100)] + " Hundred ";
    }
    if (n % 100 > 0) {
      str += formatTens(n % 100) + " ";
    }
    return str;
  };

  const convertRupees = (num: number): string => {
    if (num === 0) return "Zero";
    let str = "";
    let remaining = num;

    if (Math.floor(remaining / 10000000) > 0) {
      const crore = Math.floor(remaining / 10000000);
      str += convertGroup(crore) + "Crore ";
      remaining %= 10000000;
    }

    if (Math.floor(remaining / 100000) > 0) {
      const lakh = Math.floor(remaining / 100000);
      str += convertGroup(lakh) + "Lakh ";
      remaining %= 100000;
    }

    if (Math.floor(remaining / 1000) > 0) {
      const thousand = Math.floor(remaining / 1000);
      str += convertGroup(thousand) + "Thousand ";
      remaining %= 1000;
    }

    if (remaining > 0) {
      str += convertGroup(remaining);
    }

    return str.trim();
  };

  let result = `Rs. ${convertRupees(rupees)}`;
  if (paise > 0) {
    result += ` and ${formatTens(paise)} Paise`;
  }
  return `${result} Only`;
}

export function generateInvoicePDF(invoice: Invoice, businessProfile: BusinessProfile, customerObj?: Customer) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const leftMargin = 8;
  const rightMargin = 8;
  const contentWidth = pageWidth - leftMargin - rightMargin; // 194mm

  // Party Information from customer object or fallback to invoice
  const partyName = customerObj?.partyName || invoice.customerName || "N/A";
  const partyAddress = customerObj?.billingAddress || customerObj?.shippingAddress || invoice.customerAddress || "N/A";
  const partyPhone = customerObj?.mobileNumber || customerObj?.whatsAppNumber || invoice.customerPhone || "N/A";

  // 1. Outer Border Frame (0.35mm solid line wrapping entire bill area)
  doc.setLineWidth(0.35);
  doc.setDrawColor(0, 0, 0);
  doc.rect(leftMargin, 8, contentWidth, 281, "S");

  // 2. Agency Header Section
  let y = 13;

  const agencyName = (businessProfile?.name || "QADRI'S MEDICAL AGENCY").toUpperCase();
  const agencyAddress = businessProfile?.address
    ? `${businessProfile.address}, ${businessProfile.city || "Anantnag"} ${businessProfile.state || "Kashmir"} ${businessProfile.pinCode || "192101"}`
    : "Reshi Bazar, Anantnag Kashmir 192101";
  const agencyPhone = businessProfile?.mobile || "6006037028, 8899464931";
  const dl20 = businessProfile?.drugLicense20B || "AW2/15857/58";
  const dl21 = businessProfile?.drugLicense21B || "RLF20B2022JK000809";

  // Line 1: Main Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(agencyName, leftMargin + 4, y);

  // Line 2: Business Sub-Header
  y += 4.5;
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.text("Pharmaceutical Distributors", leftMargin + 4, y);

  // Line 3: Address Line
  y += 4.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(agencyAddress, leftMargin + 4, y);

  // Line 4: Contact / License Line
  y += 4.5;
  doc.setFontSize(7.5);
  doc.text(`Cell: ${agencyPhone} | D.L. No: ${dl20} | D.L. No: ${dl21}`, leftMargin + 4, y);

  // Right Side Header Banner: INVOICE
  doc.setLineWidth(0.35);
  doc.rect(pageWidth - rightMargin - 36, 11, 32, 10, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("INVOICE", pageWidth - rightMargin - 20, 17.5, { align: "center" });

  // Top Divider Line
  y = 31;
  doc.setLineWidth(0.3);
  doc.line(leftMargin, y, pageWidth - rightMargin, y);

  // 3. Customer Info & Invoice Meta Box (2-Column Grid Box)
  const metaBoxY = y;
  const metaBoxHeight = 31;
  const midX = 110; // Divider between customer info & invoice metadata
  const maxLeftContentWidth = midX - leftMargin - 6; // 96mm container constraint for customer details
  const rightValAlignX = pageWidth - rightMargin - 3; // 199mm

  // Vertical Divider in middle box
  doc.line(midX, metaBoxY, midX, metaBoxY + metaBoxHeight);
  // Bottom line for middle box
  doc.line(leftMargin, metaBoxY + metaBoxHeight, pageWidth - rightMargin, metaBoxY + metaBoxHeight);

  // Left Column - Customer / Party Details
  let leftY = metaBoxY + 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  const custNameLines = doc.splitTextToSize(`M/s ${partyName.toUpperCase()}`, maxLeftContentWidth);
  doc.text(custNameLines[0], leftMargin + 3, leftY);

  leftY += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  
  // Wrap customer address within fixed width container constraint
  const rawAddr = partyAddress ? partyAddress.trim() : "N/A";
  const wrappedAddr = doc.splitTextToSize(`Address : ${rawAddr}`, maxLeftContentWidth);
  doc.text(wrappedAddr.slice(0, 2), leftMargin + 3, leftY);

  leftY += (wrappedAddr.length > 1 ? 7.5 : 5);
  doc.text(`Contact Number : ${partyPhone}`, leftMargin + 3, leftY);

  // Right Column - Party & Bill Details (6 Fields)
  let rightY = metaBoxY + 4.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);

  doc.text(`Bill No: __________________`, midX + 3, rightY);

  rightY += 4.5;
  doc.text(`Date: ${invoice.date}`, midX + 3, rightY);

  rightY += 4.5;
  doc.setFont("helvetica", "bold");
  doc.text(`Last Balance:`, midX + 3, rightY);
  doc.text(`Rs. ${(invoice.previousBalance || 0).toFixed(2)}`, rightValAlignX, rightY, { align: "right" });

  rightY += 4.5;
  doc.text(`Current Bill Amount:`, midX + 3, rightY);
  doc.text(`Rs. ${(invoice.grandTotal || 0).toFixed(2)}`, rightValAlignX, rightY, { align: "right" });

  rightY += 4.5;
  doc.setFont("helvetica", "normal");
  doc.text(`TIME: ${invoice.time || "12:00 PM"}`, midX + 3, rightY);

  rightY += 4.5;
  const netBalanceVal = (invoice.previousBalance || 0) + (invoice.grandTotal || 0);
  doc.setFont("helvetica", "bold");
  doc.text(`Net Balance:`, midX + 3, rightY);
  doc.text(`Rs. ${netBalanceVal.toFixed(2)}`, rightValAlignX, rightY, { align: "right" });

  // 4. Product Table Section (ONLY 9 Columns: S.No, Qty., Pack, Product, Batch, Exp., MRP, Rate, Amount)
  const tableStartY = metaBoxY + metaBoxHeight;

  const tableData = invoice.items.map((item, idx) => {
    const pack = (item as any).packSize || "10's";
    return [
      (idx + 1).toString(),
      `${item.qty}${item.freeQty ? `+${item.freeQty}` : ""}`,
      pack,
      item.productName,
      item.batchNumber,
      item.expiryDate,
      `Rs. ${item.mrp.toFixed(2)}`,
      `Rs. ${item.sellingRate.toFixed(2)}`,
      `Rs. ${item.amount.toFixed(2)}`,
    ];
  });

  autoTable(doc, {
    startY: tableStartY,
    head: [["S.No", "Qty.", "Pack", "Product", "Batch", "Exp.", "MRP", "Rate", "Amount"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [15, 23, 42], // Charcoal Slate
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
      lineWidth: 0.15,
      lineColor: [0, 0, 0],
      cellPadding: { top: 2, bottom: 2, left: 1, right: 1 },
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [0, 0, 0],
      lineWidth: 0.15,
      lineColor: [0, 0, 0],
      valign: "middle",
      cellPadding: { top: 1.8, bottom: 1.8, left: 1, right: 1 },
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 8 },   // S.No
      1: { halign: "center", cellWidth: 12 },  // Qty
      2: { halign: "center", cellWidth: 12 },  // Pack
      3: { halign: "left", cellWidth: 60, overflow: "linebreak" }, // Product
      4: { halign: "center", cellWidth: 20 },  // Batch
      5: { halign: "center", cellWidth: 20 },  // Exp.
      6: { halign: "center", cellWidth: 20 },  // MRP
      7: { halign: "center", cellWidth: 20 },  // Rate
      8: { halign: "center", cellWidth: 22 },  // Amount
    },
    margin: { left: leftMargin, right: rightMargin },
  });

  const finalTableY = (doc as any).lastAutoTable.finalY;

  // Draw extended vertical grid lines for structured invoice look if table is short
  const minTableBottomY = 185;
  if (finalTableY < minTableBottomY) {
    doc.setLineWidth(0.15);
    doc.setDrawColor(0, 0, 0);

    const colWidths = [8, 12, 12, 60, 20, 20, 20, 20, 22];
    let currX = leftMargin;
    for (let i = 0; i < colWidths.length; i++) {
      currX += colWidths[i];
      if (i < colWidths.length - 1) {
        doc.line(currX, finalTableY, currX, minTableBottomY);
      }
    }

    doc.line(leftMargin, finalTableY, leftMargin, minTableBottomY);
    doc.line(pageWidth - rightMargin, finalTableY, pageWidth - rightMargin, minTableBottomY);
    doc.line(leftMargin, minTableBottomY, pageWidth - rightMargin, minTableBottomY);
  }

  // 5. Bottom Section
  const bottomBoxY = Math.max(finalTableY, minTableBottomY) + 2;
  const bottomBoxHeight = 289 - bottomBoxY;

  // Outer border for bottom section box
  doc.setLineWidth(0.3);
  doc.rect(leftMargin, bottomBoxY, contentWidth, bottomBoxHeight, "S");

  // Vertical dividing line separating Left (Terms, Sign) and Right (Totals)
  const rightTotalsX = 132;
  doc.line(rightTotalsX, bottomBoxY, rightTotalsX, bottomBoxY + bottomBoxHeight);

  // LEFT CONTAINER
  // Row 1: Amount in Words Box
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(0, 0, 0);

  const maxWordsWidth = rightTotalsX - leftMargin - 6; // 118mm container constraint
  const wordsStr = `Amount in Words : ${numberToWords(invoice.grandTotal)}`;
  const wrappedWords = doc.splitTextToSize(wordsStr, maxWordsWidth);
  const wordsRowHeight = wrappedWords.length > 1 ? 9 : 7;

  doc.line(leftMargin, bottomBoxY + wordsRowHeight, rightTotalsX, bottomBoxY + wordsRowHeight);
  doc.text(wrappedWords.slice(0, 2), leftMargin + 3, bottomBoxY + 4.5);

  // Terms & Conditions Block (Customer's exact terms)
  let termY = bottomBoxY + wordsRowHeight + 3.5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("Terms & Conditions :", leftMargin + 3, termY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.2);
  termY += 3.5;
  doc.text("1. Goods once sold will not be taken back.", leftMargin + 3, termY);
  termY += 3;
  doc.text("2. Expiry may be intimated before 4 months.", leftMargin + 3, termY);
  termY += 3;
  const term3Lines = doc.splitTextToSize(
    "3. Any claim regarding rate difference, bonus offer, breakage, leakage or difference in the bill should be intimated within 7 days of purchase along with the bill.",
    rightTotalsX - leftMargin - 6
  );
  doc.text(term3Lines, leftMargin + 3, termY);
  termY += (term3Lines.length * 2.8);
  doc.text("4. Subject to Anantnag jurisdiction entirely.", leftMargin + 3, termY);

  // Signatures Line & Stamp Area
  const sigRowY = bottomBoxY + bottomBoxHeight - 16;
  doc.line(leftMargin, sigRowY, rightTotalsX, sigRowY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("Checked", leftMargin + 10, sigRowY + 11);

  doc.setFont("helvetica", "bold");
  doc.text(`For ${agencyName}`, rightTotalsX - 5, sigRowY + 4, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text("Authorised Signatory & Stamp", rightTotalsX - 5, sigRowY + 11, { align: "right" });

  // RIGHT CONTAINER (THREE REQUIRED SUMMARY VALUES: TOTAL, LAST BALANCE, SUBTOTAL UP TO DATE)
  let totY = bottomBoxY;

  // 1. TOTAL Row
  totY += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("TOTAL", rightTotalsX + 3, totY);
  doc.text(`Rs. ${(invoice.grandTotal || 0).toFixed(2)}`, rightValAlignX, totY, { align: "right" });

  doc.setLineWidth(0.15);
  doc.line(rightTotalsX, totY + 2.5, pageWidth - rightMargin, totY + 2.5);

  // 2. LAST BALANCE Row
  totY += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("LAST BALANCE", rightTotalsX + 3, totY);
  doc.text(`Rs. ${(invoice.previousBalance || 0).toFixed(2)}`, rightValAlignX, totY, { align: "right" });

  doc.setLineWidth(0.15);
  doc.line(rightTotalsX, totY + 2.5, pageWidth - rightMargin, totY + 2.5);

  // 3. SUBTOTAL UP TO DATE Row
  totY += 6;
  const subtotalUpToDate = (invoice.previousBalance || 0) + (invoice.grandTotal || 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("SUBTOTAL UP TO DATE", rightTotalsX + 3, totY);
  doc.text(`Rs. ${subtotalUpToDate.toFixed(2)}`, rightValAlignX, totY, { align: "right" });

  // Optional: Only show PENDING BALANCE if there's a remaining balance for partial payment
  if (invoice.pendingBalance && invoice.pendingBalance > 0 && invoice.pendingBalance !== invoice.grandTotal && invoice.status !== "Paid") {
    doc.setLineWidth(0.15);
    doc.line(rightTotalsX, totY + 2.5, pageWidth - rightMargin, totY + 2.5);
    totY += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text("PENDING BALANCE", rightTotalsX + 3, totY);
    doc.text(`Rs. ${invoice.pendingBalance.toFixed(2)}`, rightValAlignX, totY, { align: "right" });
  }

  // Save/Download PDF
  doc.save(`${invoice.invoiceNumber}.pdf`);
}

export function generateLedgerPDF(customer: Customer, ledgerEntries: LedgerEntry[], businessProfile: BusinessProfile) {
  generateLedgerStatementPDF(customer, ledgerEntries, businessProfile);
}

export function generateLedgerStatementPDF(customer: Customer, ledgerEntries: LedgerEntry[], businessProfile: BusinessProfile) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const leftMargin = 14;
  const rightMargin = 14;
  const contentWidth = pageWidth - leftMargin - rightMargin; // 182mm

  let y = 12;

  // Top Dark Header Accent Bar
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, pageWidth, 5, "F");

  // 1. Business Header (Left Column)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text((businessProfile.name || "QADRI'S MEDICAL AGENCY").toUpperCase(), leftMargin, y + 4);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(16, 185, 129); // Emerald 500
  doc.text("Pharmaceutical Distributors & Medical Agency", leftMargin, y + 8.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`${businessProfile.address || "Reshi Bazar, Anantnag Kashmir 192101"}`, leftMargin, y + 12.5);
  doc.text(
    `Contact: ${businessProfile.mobile || "6006037028, 8899464931"} | Email: ${businessProfile.email || "info@qadrimedical.com"}`,
    leftMargin,
    y + 16.5
  );
  doc.text(
    `D.L. No: ${businessProfile.drugLicense20B || "AW2/15857/58 | RLF20B2022JK000809"} | GSTIN: ${businessProfile.gstin || "19AAACQ1234F1Z1"}`,
    leftMargin,
    y + 20.5
  );

  // Statement Title Box (Right Side)
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(pageWidth - rightMargin - 65, y + 2, 65, 20, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("FINANCIAL LEDGER STATEMENT", pageWidth - rightMargin - 32.5, y + 7, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Account Code: ${customer.code}`, pageWidth - rightMargin - 32.5, y + 11.5, { align: "center" });
  doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, pageWidth - rightMargin - 32.5, y + 15.5, { align: "center" });

  y += 26;

  // Divider Line
  doc.setLineWidth(0.3);
  doc.setDrawColor(203, 213, 225);
  doc.line(leftMargin, y, pageWidth - rightMargin, y);

  y += 4;

  // 2. Party Information Card (Two Columns)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(leftMargin, y, contentWidth, 24, 2, 2, "FD");

  // Left Side: Customer Name & Address
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`PARTY / CUSTOMER: ${customer.partyName.toUpperCase()}`, leftMargin + 4, y + 5.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Contact Person: ${customer.contactPerson || "N/A"}`, leftMargin + 4, y + 9.5);
  doc.text(`Phone / Mobile: ${customer.mobileNumber}`, leftMargin + 4, y + 13.5);
  doc.text(`Address: ${customer.billingAddress || customer.city}`, leftMargin + 4, y + 17.5);

  // Right Side: Legal & Financial Details
  const rightColX = leftMargin + 105;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`GSTIN Number: ${customer.gstNumber || "N/A"}`, rightColX, y + 5.5);
  doc.text(`Drug License No: ${customer.drugLicenseNumber || "N/A"}`, rightColX, y + 9.5);
  doc.text(`Credit Limit: Rs. ${(customer.creditLimit || 0).toLocaleString("en-IN")}`, rightColX, y + 13.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(customer.currentBalance > 0 ? 225 : 16, customer.currentBalance > 0 ? 29 : 185, customer.currentBalance > 0 ? 72 : 129);
  doc.text(`NET OUTSTANDING: Rs. ${customer.currentBalance.toFixed(2)}`, rightColX, y + 18.5);

  y += 28;

  // 3. Financial Summary Bar (3 Cards)
  const custEntries = ledgerEntries.filter((l) => l.customerId === customer.id);
  const totalDebit = custEntries.reduce((sum, e) => sum + (e.debit || 0), 0);
  const totalCredit = custEntries.reduce((sum, e) => sum + (e.credit || 0), 0);

  const cardW = (contentWidth - 8) / 3;

  // Card 1: Total Billed (Debit)
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(leftMargin, y, cardW, 12, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("TOTAL BILLED (DEBIT)", leftMargin + 3, y + 4);
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`Rs. ${totalDebit.toFixed(2)}`, leftMargin + 3, y + 9);

  // Card 2: Total Paid (Credit)
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(leftMargin + cardW + 4, y, cardW, 12, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(5, 150, 105);
  doc.text("TOTAL COLLECTED (CREDIT)", leftMargin + cardW + 7, y + 4);
  doc.setFontSize(9);
  doc.setTextColor(4, 120, 87);
  doc.text(`Rs. ${totalCredit.toFixed(2)}`, leftMargin + cardW + 7, y + 9);

  // Card 3: Net Balance
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(leftMargin + (cardW + 4) * 2, y, cardW, 12, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(220, 38, 38);
  doc.text("CLOSING OUTSTANDING BALANCE", leftMargin + (cardW + 4) * 2 + 3, y + 4);
  doc.setFontSize(9);
  doc.setTextColor(185, 28, 28);
  doc.text(`Rs. ${customer.currentBalance.toFixed(2)}`, leftMargin + (cardW + 4) * 2 + 3, y + 9);

  y += 16;

  // 4. Transaction Ledger Table
  const tableData = custEntries.map((e, idx) => [
    (idx + 1).toString(),
    e.date,
    e.reference,
    e.description,
    e.debit > 0 ? `Rs. ${e.debit.toFixed(2)}` : "-",
    e.credit > 0 ? `Rs. ${e.credit.toFixed(2)}` : "-",
    `Rs. ${e.balance.toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [["S.No", "Date", "Ref / Inv #", "Particulars / Description", "Debit (Dr)", "Credit (Cr)", "Balance"]],
    body: tableData.length > 0 ? tableData : [["-", "-", "-", "No recorded transaction history", "-", "-", "Rs. 0.00"]],
    theme: "striped",
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
      halign: "left",
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 20 },
      2: { cellWidth: 28 },
      3: { cellWidth: 54 },
      4: { halign: "right", cellWidth: 22 },
      5: { halign: "right", cellWidth: 22 },
      6: { halign: "right", cellWidth: 26 },
    },
    margin: { left: leftMargin, right: rightMargin },
  });

  const finalTableY = (doc as any).lastAutoTable.finalY + 6;

  // 5. Signatures and Stamp Footer Section
  const footerY = Math.min(finalTableY, pageHeight - 35);

  doc.setLineWidth(0.2);
  doc.setDrawColor(203, 213, 225);
  doc.line(leftMargin, footerY, pageWidth - rightMargin, footerY);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text("This is a system-generated account ledger statement. Certified accurate as per ERP database.", leftMargin, footerY + 5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Checked By", leftMargin + 10, footerY + 14);

  doc.text(`For ${businessProfile.name || "QADRI'S MEDICAL AGENCY"}`, pageWidth - rightMargin - 10, footerY + 12, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text("Authorised Signatory & Stamp", pageWidth - rightMargin - 10, footerY + 17, { align: "right" });

  doc.save(`Ledger_${customer.partyName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
}

export function generatePaymentReceiptPDF(payment: PaymentRecord, businessProfile: BusinessProfile) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 14;

  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, pageWidth, 4, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text(businessProfile.name.toUpperCase(), 14, y);

  doc.setFontSize(14);
  doc.setTextColor(16, 185, 129);
  doc.text("PAYMENT RECEIPT", pageWidth - 14, y, { align: "right" });

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`${businessProfile.address}, ${businessProfile.city}`, 14, y);
  doc.text(`Receipt No: ${payment.receiptNumber}`, pageWidth - 14, y, { align: "right" });

  y += 5;
  doc.text(`Date: ${payment.date} | Time: ${payment.time}`, pageWidth - 14, y, { align: "right" });

  y += 8;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, pageWidth - 28, 55, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("Received With Thanks From:", 20, y + 8);

  doc.setFontSize(12);
  doc.setTextColor(16, 185, 129);
  doc.text(payment.customerName, 20, y + 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`Amount Received: ₹${payment.amount.toFixed(2)}`, 20, y + 23);
  doc.text(`Payment Mode: ${payment.mode}`, 20, y + 29);
  doc.text(`Transaction / Reference No: ${payment.referenceNumber || "N/A"}`, 20, y + 35);
  doc.text(`Remarks: ${payment.remarks || "Payment collected against ledger account."}`, 20, y + 41);
  doc.text(`Collected By: ${payment.collectedBy}`, 20, y + 47);

  y += 65;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`Account Balance Before: ₹${payment.balanceBefore.toFixed(2)}`, 14, y);
  doc.text(`Account Balance After: ₹${payment.balanceAfter.toFixed(2)}`, 14, y + 6);

  y += 30;
  doc.text(`For ${businessProfile.name}`, pageWidth - 60, y, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("Authorized Seal & Stamp", pageWidth - 60, y + 15, { align: "center" });

  doc.save(`Receipt_${payment.receiptNumber}.pdf`);
}
