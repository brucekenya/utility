
import { BillData, formatCurrency, formatDate } from "./billGenerator";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { autoTable } from "jspdf-autotable";

export const generatePDF = (billData: BillData): string => {
  const { customer, bill, company } = billData;
  const doc = new jsPDF();

  try {
    // Add company logo
    doc.addImage(company.logo, "PNG", 10, 10, 50, 20);
  } catch (e) {
    console.error("Error adding logo:", e);
    // Continue without logo if there's an error
  }

  // Company information
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(company.name, 70, 20);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(company.address, 70, 25);
  doc.text(`Phone: ${company.phone}`, 70, 30);
  doc.text(`Email: ${company.email}`, 70, 35);
  doc.text(`Website: ${company.website}`, 70, 40);

  // Bill information
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`${bill.type.toUpperCase()} BILL`, 10, 50);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Bill #: ${bill.billNumber}`, 10, 60);
  doc.text(`Date: ${formatDate(bill.billDate)}`, 10, 65);
  doc.text(`Due Date: ${formatDate(bill.dueDate)}`, 10, 70);

  // Customer information
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 110, 60);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(customer.name, 110, 65);
  doc.text(customer.address, 110, 70);
  doc.text(`${customer.city}, ${customer.state} ${customer.zip}`, 110, 75);
  doc.text(`Account #: ${customer.accountNumber}`, 110, 80);

  // Usage details
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Usage Details", 10, 90);

  const usageUnit = bill.type === "water" ? "gallons" : "kWh";
  const unitPrice = bill.type === "water" ? "KES 120" : "KES 24";

  const tableColumn = ["Description", "Usage", "Unit Price", "Amount"];
  const tableRows = [
    [
      `${bill.type.charAt(0).toUpperCase() + bill.type.slice(1)} Usage`, 
      `${bill.usageAmount} ${usageUnit}`, 
      unitPrice, 
      formatCurrency(bill.subTotal)
    ],
  ];
  
  // Add type-specific charges
  if (bill.type === "electricity") {
    if (bill.ercLevy) {
      tableRows.push(["ERC Levy", "", "", formatCurrency(bill.ercLevy)]);
    }
    if (bill.repLevy) {
      tableRows.push(["REP Levy", "", "", formatCurrency(bill.repLevy)]);
    }
  } else {
    if (bill.sewageCharges) {
      tableRows.push(["Sewage Charges", "", "", formatCurrency(bill.sewageCharges)]);
    }
    if (bill.serviceCharge) {
      tableRows.push(["Service Charge", "", "", formatCurrency(bill.serviceCharge)]);
    }
  }
  
  // Add common charges
  tableRows.push(
    ["VAT (16%)", "", "", formatCurrency(bill.vat)],
    ["Tax Levy (5%)", "", "", formatCurrency(bill.taxLevy)]
  );

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 95,
    theme: 'grid',
    headStyles: { fillColor: bill.type === "water" ? [0, 136, 204] : [255, 165, 0] }
  });

  // Bill summary
  let finalY = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Previous Balance:", 130, finalY);
  doc.text(formatCurrency(bill.previousBalance), 175, finalY, { align: "right" });
  
  finalY += 5;
  doc.text("Current Charges:", 130, finalY);
  doc.text(formatCurrency(bill.amount), 175, finalY, { align: "right" });
  
  finalY += 5;
  doc.setFont("helvetica", "bold");
  doc.text("Total Amount Due:", 130, finalY);
  doc.text(formatCurrency(bill.totalDue), 175, finalY, { align: "right" });

  // Payment information
  finalY += 15;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Payment Information", 10, finalY);
  
  finalY += 5;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Please pay by ${formatDate(bill.dueDate)}`, 10, finalY + 5);
  doc.text("Make payments to:", 10, finalY + 10);
  doc.text(company.name, 10, finalY + 15);
  doc.text(company.address, 10, finalY + 20);

  // Footer
  doc.setFontSize(8);
  doc.text("This is a computer generated bill and doesn't require signature.", 10, 280);
  doc.text("For questions about your bill, please contact customer service.", 10, 285);

  // Generate PDF as data URL
  return doc.output('datauristring');
};
