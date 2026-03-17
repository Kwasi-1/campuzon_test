import type { Order } from "@/types-new";
import { getBuyerStatusMeta } from "./orderWorkflow";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getReceiptFileName(orderNumber?: string) {
  const cleanOrder = (orderNumber || "order-receipt").replace(/[^a-zA-Z0-9-_]/g, "-");
  return `${cleanOrder}-receipt.html`;
}

export function buildBuyerOrderReceiptHtml(
  order: Order,
  formatAmount: (amount: number) => string,
) {
  const status = getBuyerStatusMeta(order.status);
  const rows = (order.items || [])
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.productName || "Item")}</td>
          <td>${item.quantity || 0}</td>
          <td>${escapeHtml(formatAmount(item.unitPrice || 0))}</td>
          <td>${escapeHtml(formatAmount(item.subtotal || 0))}</td>
        </tr>
      `,
    )
    .join("");

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Receipt ${escapeHtml(order.orderNumber || "")}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
      h1 { margin: 0 0 8px; }
      .meta { margin: 0 0 16px; color: #4b5563; font-size: 14px; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; font-size: 14px; }
      th { background: #f9fafb; }
      .totals { margin-top: 16px; width: 360px; margin-left: auto; }
      .totals div { display: flex; justify-content: space-between; margin: 4px 0; }
      .grand { font-weight: 700; font-size: 16px; border-top: 1px solid #e5e7eb; padding-top: 8px; }
    </style>
  </head>
  <body>
    <h1>Campus Order Receipt</h1>
    <p class="meta">Order: ${escapeHtml(order.orderNumber || "-")} | Status: ${escapeHtml(status.label)} | Created: ${escapeHtml(formatDate(order.dateCreated))}</p>
    <p class="meta">Buyer: ${escapeHtml(order.shippingAddress?.fullName || "Customer")}</p>
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Qty</th>
          <th>Unit Price</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
    <div class="totals">
      <div><span>Subtotal</span><span>${escapeHtml(formatAmount(order.subtotal || 0))}</span></div>
      <div><span>Delivery Fee</span><span>${escapeHtml(formatAmount(order.deliveryFee || 0))}</span></div>
      <div><span>Service Fee</span><span>${escapeHtml(formatAmount(order.serviceFee || 0))}</span></div>
      <div class="grand"><span>Total</span><span>${escapeHtml(formatAmount(order.totalAmount || 0))}</span></div>
    </div>
  </body>
</html>`;
}

export function previewBuyerOrderReceipt(
  order: Order,
  formatAmount: (amount: number) => string,
) {
  if (typeof window === "undefined") return;
  const html = buildBuyerOrderReceiptHtml(order, formatAmount);
  const popup = window.open("", "_blank", "noopener,noreferrer");
  if (!popup) return;
  popup.document.write(html);
  popup.document.close();
}

export function downloadBuyerOrderReceipt(
  order: Order,
  formatAmount: (amount: number) => string,
) {
  if (typeof window === "undefined") return;
  const html = buildBuyerOrderReceiptHtml(order, formatAmount);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = getReceiptFileName(order.orderNumber);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
