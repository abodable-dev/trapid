import { useEffect, useState } from"react";
import { useParams, useNavigate, Link } from"react-router-dom";
import { Menu, MenuButton, MenuItem, MenuItems } from"@headlessui/react";
import {
 ArrowLeft,
 MapPin,
 Phone,
 Mail,
 User,
 MoreHorizontal,
 CheckCircle2,
 Download,
} from"lucide-react";
import { api } from"../api";
import { formatCurrency } from"../utils/formatters";

function formatDate(dateString) {
 if (!dateString) return"-";
 const date = new Date(dateString);
 return date.toLocaleDateString("en-US", {
 year:"numeric",
 month:"long",
 day:"numeric",
 });
}

export default function PurchaseOrderDetailPage() {
 const { id } = useParams();
 const navigate = useNavigate();
 const [purchaseOrder, setPurchaseOrder] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);

 // Add print styles
 useEffect(() => {
 const style = document.createElement('style');
 style.innerHTML = `
 @media print {
 /* Force exact color reproduction - CRITICAL for dark theme */
 * {
 -webkit-print-color-adjust: exact !important;
 print-color-adjust: exact !important;
 color-adjust: exact !important;
 }

 /* CRITICAL: Remove all page margins for edge-to-edge black */
 @page {
 size: A4 portrait;
 margin: 0mm !important;
 }

 /* Hide navigation and action buttons */
 header, nav, .no-print {
 display: none !important;
 }

      /* Force desktop A4 width - override mobile viewport */
      html {
        background-color: #000000 !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 210mm !important;
        min-width: 210mm !important;
      }

      body {
        background-color: #000000 !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 210mm !important;
        min-width: 210mm !important;
      }

      /* Main container should be black with internal padding and full A4 width */
      main {
        background-color: #000000 !important;
        margin: 0 auto !important;
        padding: 15mm !important;
        width: 210mm !important;
        max-width: 210mm !important;
        min-width: 210mm !important;
      }

      /* Force invoice container to use full width */
      #po-invoice-content {
        max-width: none !important;
        width: 100% !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
      }

      /* Override all responsive max-width constraints */
      .max-w-4xl, .max-w-7xl {
        max-width: none !important;
      }

      /* Force all grid columns to desktop layout */
      .grid-cols-1 {
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
      }

      .md\:grid-cols-3 {
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
      }

      .md\:grid-cols-2 {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      }

      .sm\:grid-cols-4 {
        grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
      }
 /* Preserve all dark theme colors */
 .bg-black {
 background-color: #000000 !important;
 }

 .bg-gray-900, .bg-gray-900\/50 {
 background-color: #111827 !important;
 }

 .bg-gray-800, .bg-gray-800\/50 {
 background-color: #1f2937 !important;
 }

 .text-white {
 color: #ffffff !important;
 }

 .text-gray-300 {
 color: #d1d5db !important;
 }

 .text-gray-400 {
 color: #9ca3af !important;
 }

 .text-gray-500 {
 color: #6b7280 !important;
 }

 .border-gray-800 {
 border-color: #1f2937 !important;
 }

 .border-gray-700 {
 border-color: #374151 !important;
 }

 /* Preserve status badge colors */
 .bg-success\/10 {
 background-color: rgba(34, 197, 94, 0.1) !important;
 }

 .text-success {
 color: #22c55e !important;
 }

 .border-success\/20 {
 border-color: rgba(34, 197, 94, 0.2) !important;
 }

 /* Preserve other badge colors */
 .bg-warning\/10 {
 background-color: rgba(234, 179, 8, 0.1) !important;
 }

 .text-warning {
 color: #eab308 !important;
 }

 .bg-info\/10 {
 background-color: rgba(59, 130, 246, 0.1) !important;
 }

 .text-info {
 color: #3b82f6 !important;
 }

 /* Prevent page breaks in critical sections */
 .bg-gray-900.border {
 page-break-inside: avoid;
 break-inside: avoid;
 }

 table {
 page-break-inside: auto;
 }

 tr {
 page-break-inside: avoid;
 page-break-after: auto;
 }
 }
 `;
 document.head.appendChild(style);

 return () => {
 document.head.removeChild(style);
 };
 }, []);

 useEffect(() => {
 loadPurchaseOrder();
 }, [id]);

 const loadPurchaseOrder = async () => {
 try {
 setLoading(true);
 const response = await api.get(`/api/v1/purchase_orders/${id}`);
 setPurchaseOrder(response);
 } catch (err) {
 setError("Failed to load purchase order");
 console.error(err);
 } finally {
 setLoading(false);
 }
 };

 const handleApprove = async () => {
 try {
 await api.post(`/api/v1/purchase_orders/${id}/approve`);
 await loadPurchaseOrder();
 } catch (err) {
 console.error("Failed to approve purchase order:", err);
 alert("Failed to approve purchase order");
 }
 };

 const handleSendToSupplier = async () => {
 try {
 await api.post(`/api/v1/purchase_orders/${id}/send_to_supplier`);
 await loadPurchaseOrder();
 } catch (err) {
 console.error("Failed to send to supplier:", err);
 alert("Failed to send to supplier");
 }
 };

 const handleMarkReceived = async () => {
 try {
 await api.post(`/api/v1/purchase_orders/${id}/mark_received`);
 await loadPurchaseOrder();
 } catch (err) {
 console.error("Failed to mark as received:", err);
 alert("Failed to mark as received");
 }
 };

 const handleDownloadPdf = () => {
 // Use native browser print dialog
 // User can choose "Save as PDF" to get a PDF file
 // Print styles (defined in useEffect above) will preserve dark theme
 window.print();
 };

 const getStatusBadgeClass = (status) => {
 const classes = {
 draft:"bg-gray-800/50 text-gray-400 border-gray-700",
 pending:"bg-warning/10 text-warning border-warning/20",
 approved:"bg-info/10 text-info border-info/20",
 sent:"bg-blue-500/10 text-blue-400 border-blue-500/20",
 received:"bg-success/10 text-success border-success/20",
 invoiced:"bg-purple-500/10 text-purple-400 border-purple-500/20",
 paid:"bg-success/10 text-success border-success/20",
 cancelled:"bg-error/10 text-error border-error/20",
 };
 return classes[status] || classes.draft;
 };

 if (loading) {
 return (
 <div className="flex items-center justify-center min-h-screen bg-black">
 <div className="text-gray-500">Loading...</div>
 </div>
 );
 }

 if (error || !purchaseOrder) {
 return (
 <div className="flex items-center justify-center min-h-screen bg-black">
 <div className="text-error">{error ||"Purchase order not found"}</div>
 </div>
 );
 }

 return (
 <main className="min-h-screen bg-black">
 {/* Minimal Header */}
 <div className="border-b border-gray-800 no-print">
 <div className="mx-auto max-w-7xl px-6 py-4">
 <div className="flex items-center justify-between">
 <Link
 to="/active-jobs"
 className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
 >
 <ArrowLeft className="w-4 h-4" />
 Back
 </Link>

 <div className="flex items-center gap-3">
 {purchaseOrder.can_edit && (
 <button
 onClick={() => navigate(`/purchase-orders/${id}/edit`)}
 className="text-sm text-gray-400 hover:text-white transition-colors"
 >
 Edit
 </button>
 )}

 <button
 onClick={handleDownloadPdf}
 className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 transition-colors"
 >
 <Download className="w-4 h-4" />
 Print/Save PDF
 </button>

 {purchaseOrder.status ==="draft" && (
 <button
 onClick={handleApprove}
 className="bg-white text-black px-4 py-2 text-sm font-medium hover:opacity-90 transition-all"
 >
 Submit for Approval
 </button>
 )}
 {purchaseOrder.status ==="approved" && (
 <button
 onClick={handleSendToSupplier}
 className="bg-white text-black px-4 py-2 text-sm font-medium hover:opacity-90 transition-all"
 >
 Send to Supplier
 </button>
 )}
 {purchaseOrder.status ==="sent" && (
 <button
 onClick={handleMarkReceived}
 className="bg-success text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition-all"
 >
 Mark Received
 </button>
 )}

 <Menu as="div" className="relative">
 <MenuButton className="text-gray-400 hover:text-white transition-colors">
 <MoreHorizontal className="w-5 h-5" />
 </MenuButton>
 <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right bg-gray-900 border border-gray-800 py-2 transition">
 <MenuItem>
 {({ active }) => (
 <button
 onClick={() =>
 navigate(`/jobs/${purchaseOrder.construction_id}`)
 }
 className={`block w-full px-4 py-2 text-left text-sm ${
 active ?"bg-gray-800 text-white" :"text-gray-400"
 }`}
 >
 View Job
 </button>
 )}
 </MenuItem>
 {purchaseOrder.status ==="paid" && (
 <MenuItem>
 {({ active }) => (
 <button
 className={`flex items-center gap-2 w-full px-4 py-2 text-left text-sm ${
 active ?"bg-gray-800 text-white" :"text-gray-400"
 }`}
 >
 <Download className="w-4 h-4" />
 Download Receipt
 </button>
 )}
 </MenuItem>
 )}
 </MenuItems>
 </Menu>
 </div>
 </div>
 </div>
 </div>

 {/* Main Invoice Container */}
 <div className="mx-auto max-w-4xl px-6 py-6" id="po-invoice-content">
 {/* PO Header with Title & Status */}
 <div className="flex items-start justify-between mb-6 no-print">
 <div>
 <div className="flex items-center gap-3 mb-1">
 <h1 className="text-2xl font-semibold text-white">
 Purchase Order
 </h1>
 <span
 className={`inline-flex items-center px-2 py-0.5 text-xs font-medium border ${getStatusBadgeClass(purchaseOrder.status)}`}
 >
 {purchaseOrder.status.charAt(0).toUpperCase() +
 purchaseOrder.status.slice(1)}
 </span>
 </div>
 <p className="text-xs text-gray-400">
 PO #{purchaseOrder.purchase_order_number}
 </p>
 </div>
 <div className="flex items-end">
        {/* Total Amount */}
 <div className="text-right">
 <div className="text-2xl font-mono font-semibold text-white mb-0.5">
 {formatCurrency(purchaseOrder.total || 0)}
 </div>
 <p className="text-xs text-gray-500">Total Amount</p>
 </div>
 </div>
 </div>

 {/* Main Card */}
 <div className="bg-gray-900 border border-gray-800 overflow-hidden">
 {/* Company Header */}
 <div className="border-b border-gray-800 p-4">
 <div className="flex items-start justify-between mb-4">
 <div>
 <img
 src="/tekna_logo_white.png"
 alt={purchaseOrder.company_setting?.company_name || "Tekna Homes"}
 className="h-8 w-auto mb-2"
 />
 <p className="text-xs text-gray-400">
 {purchaseOrder.description ||"Quality Construction Services"}
 </p>
 </div>
 <div className="text-right text-xs space-y-0.5">
            <div className="text-white">
              {purchaseOrder.construction?.site_supervisor_info?.name ||
                purchaseOrder.construction?.site_supervisor_name ||
                "TBD"}
            </div>
            {(() => {
              const phone =
                purchaseOrder.construction?.site_supervisor_info?.phone ||
                "TBD";
              return phone === "TBD" ? (
                <div className="text-gray-400">
                  <span className="text-gray-500">p:</span> {phone}
                </div>
              ) : (
                <div>
                  <span className="text-gray-500">p:</span>{" "}
                  <a
                    href={`tel:${phone}`}
                    className="text-white hover:text-blue-400 transition-colors"
                  >
                    {phone}
                  </a>
                </div>
              );
            })()}
            <div>
              <span className="text-gray-500">e:</span>{" "}
              <a
                href={`mailto:${
                  purchaseOrder.construction?.site_supervisor_info?.email ||
                  "info@teknahomes.com.au"
                }`}
                className="text-white hover:text-blue-400 transition-colors"
              >
                {purchaseOrder.construction?.site_supervisor_info?.email ||
                  "info@teknahomes.com.au"}
              </a>
            </div>
          </div>
 </div>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
 <div>
 <span className="text-gray-500">PO Number:</span>{""}
 <span className="text-white font-mono">
 {purchaseOrder.purchase_order_number}
 </span>
 </div>
 {purchaseOrder.company_setting?.qbcc_number && (
 <div>
 <span className="text-gray-500">QBCC:</span>{""}
 <span className="text-gray-300 font-mono">
 {purchaseOrder.company_setting.qbcc_number}
 </span>
 </div>
 )}
 {purchaseOrder.company_setting?.abn && (
 <div>
 <span className="text-gray-500">ABN:</span>{""}
 <span className="text-gray-300 font-mono">
 {purchaseOrder.company_setting.abn}
 </span>
 </div>
 )}
 {purchaseOrder.required_date && (
 <div>
 <span className="text-gray-500">Delivery:</span>{""}
 <span className="text-gray-300 font-mono">
 {formatDate(purchaseOrder.required_date)}
 </span>
 </div>
 )}
 </div>
 </div>

 {/* Three-Column Info Section */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border-b border-gray-800">
 {/* Column 1: Service Address */}
 <div>
 <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
 Service Address
 </div>
 <div className="text-xs space-y-1">
 {(() => {
 const serviceAddress =
 purchaseOrder.construction_job?.title ||
 purchaseOrder.construction?.title ||
 purchaseOrder.construction?.name ||
 purchaseOrder.construction_job?.address ||
 purchaseOrder.construction?.address ||
 'No service address provided';

 return serviceAddress === 'No service address provided' ? (
 <div className="text-gray-500">{serviceAddress}</div>
 ) : (
 <div className="flex items-start gap-1.5 text-gray-400">
 <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
 <span className="whitespace-pre-line">
 {serviceAddress}
 </span>
 </div>
 );
 })()}
 </div>
 </div>

 {/* Column 2: Supplier */}
 <div>
 <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
 Supplier
 </div>
 {purchaseOrder.supplier ? (
 <div className="text-xs space-y-1">
 <div className="text-white font-medium">
 {purchaseOrder.supplier.name}
 </div>
 {purchaseOrder.supplier.contact_person && (
 <div className="flex items-center gap-1.5 text-gray-400">
 <User className="w-3.5 h-3.5" />
 {purchaseOrder.supplier.contact_person}
 </div>
 )}
 {purchaseOrder.supplier.email && (
 <div className="flex items-center gap-1.5 text-gray-400">
 <Mail className="w-3.5 h-3.5" />
 <a
 href={`mailto:${purchaseOrder.supplier.email}`}
 className="hover:text-white transition-colors"
 >
 {purchaseOrder.supplier.email}
 </a>
 </div>
 )}
 {purchaseOrder.supplier.phone && (
 <div className="flex items-center gap-1.5 text-gray-400">
 <Phone className="w-3.5 h-3.5" />
 <a
 href={`tel:${purchaseOrder.supplier.phone}`}
 className="hover:text-white transition-colors"
 >
 {purchaseOrder.supplier.phone}
 </a>
 </div>
 )}
 </div>
 ) : (
 <div className="text-xs text-gray-500">
 No supplier assigned
 </div>
 )}
 </div>

 {/* Column 3: Project Contacts */}
 <div>
 <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
 Project Contacts
 </div>
 <div className="text-xs space-y-2">
 {purchaseOrder.estimator_name && (
 <div>
 <div className="text-gray-500 mb-0.5">Estimator</div>
 <div className="text-white">{purchaseOrder.estimator_name}</div>
 </div>
 )}
 {purchaseOrder.area_manager_name && (
 <div>
 <div className="text-gray-500 mb-0.5">Area Manager</div>
 <div className="text-white">{purchaseOrder.area_manager_name}</div>
 </div>
 )}
 {purchaseOrder.whs_officer_name && (
 <div>
 <div className="text-gray-500 mb-0.5">WHS Officer</div>
 <div className="text-white">{purchaseOrder.whs_officer_name}</div>
 </div>
 )}
 {!purchaseOrder.estimator_name &&
 !purchaseOrder.area_manager_name &&
 !purchaseOrder.whs_officer_name && (
 <div className="text-gray-500">No contacts assigned</div>
 )}
 </div>
 </div>
 </div>

 {/* Line Items Table */}
 <div className="p-4">
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b border-gray-800">
 <th className="pb-2 text-left text-xs text-gray-500 uppercase tracking-wide font-medium">
 Qty
 </th>
 <th className="pb-2 text-left text-xs text-gray-500 uppercase tracking-wide font-medium">
 Description
 </th>
 <th className="pb-2 text-left text-xs text-gray-500 uppercase tracking-wide font-medium">
 Code
 </th>
 <th className="pb-2 text-right text-xs text-gray-500 uppercase tracking-wide font-medium">
 Rate
 </th>
 <th className="pb-2 text-center text-xs text-gray-500 uppercase tracking-wide font-medium">
 Tax
 </th>
 <th className="pb-2 text-right text-xs text-gray-500 uppercase tracking-wide font-medium">
 Amount
 </th>
 </tr>
 </thead>
 <tbody>
 {purchaseOrder.line_items?.map((item) => (
 <tr key={item.id} className="border-b border-gray-800">
 <td className="py-2 text-xs text-gray-400 font-mono">
 {item.quantity}
 </td>
 <td className="py-2">
 <div className="text-xs text-white font-medium">
 {item.description}
 </div>
 {item.notes && (
 <div className="text-xs text-gray-500 mt-0.5">
 {item.notes}
 </div>
 )}
 </td>
 <td className="py-2 text-xs text-gray-400 font-mono">
 {/* TODO: Add item_code field to backend */}
 {item.item_code ||"-"}
 </td>
 <td className="py-2 text-right text-xs text-gray-400 font-mono">
 {formatCurrency(item.unit_price, false)}
 </td>
 <td className="py-2 text-center text-xs">
 {/* TODO: Add tax_type field to backend (GST/Tax-Free) */}
 {item.tax_type ==="tax_free" ? (
 <span className="inline-flex items-center px-1.5 py-0.5 bg-gray-800 text-gray-400 border border-gray-700">
 Tax-Free
 </span>
 ) : (
 <span className="inline-flex items-center px-1.5 py-0.5 bg-gray-800 text-gray-400 border border-gray-700">
 GST
 </span>
 )}
 </td>
 <td className="py-2 text-right text-xs text-white font-mono">
 {formatCurrency(item.quantity * item.unit_price, false)}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 {/* Notes Section */}
 {purchaseOrder.special_instructions && (
 <div className="mt-4 p-3 bg-gray-800/50 border border-gray-700">
 <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
 Notes
 </div>
 <div className="text-xs text-gray-400 whitespace-pre-line">
 {purchaseOrder.special_instructions}
 </div>
 </div>
 )}

 {/* Totals */}
 <div className="mt-4 space-y-1">
 <div className="flex justify-between text-xs">
 <span className="text-gray-500">Sub Total</span>
 <span className="text-gray-400 font-mono">
 {formatCurrency(purchaseOrder.sub_total, false)}
 </span>
 </div>
 <div className="flex justify-between text-xs">
 <span className="text-gray-500">GST</span>
 <span className="text-gray-400 font-mono">
 {formatCurrency(purchaseOrder.tax, false)}
 </span>
 </div>
 <div className="flex justify-between pt-2 border-t border-gray-800">
 <span className="text-sm font-semibold text-white">
 Total
 </span>
 <span className="text-sm font-semibold text-white font-mono">
 {formatCurrency(purchaseOrder.total, false)}
 </span>
 </div>
 </div>
 </div>

 {/* Remittance Section */}
 <div className="border-t border-gray-800 p-4 bg-gray-900/50">
 <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
 Remittance
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
 <div>
 <div className="text-white font-medium mb-1">Invoice To</div>
 <div className="text-gray-400 space-y-0.5">
 {/* TODO: Add remittance fields to backend */}
 <div>
 {purchaseOrder.company_setting?.company_name ||
"Tekna Homes"}
 </div>
 <div className="flex items-center gap-1.5">
 <Mail className="w-3.5 h-3.5" />
 {purchaseOrder.remittance_email ||
 purchaseOrder.company_setting?.email ||
"accounts@tekna.com.au"}
 </div>
 <div className="flex items-center gap-1.5">
 <Phone className="w-3.5 h-3.5" />
 {purchaseOrder.remittance_phone ||
 purchaseOrder.company_setting?.phone ||
"0407 397 541"}
 </div>
 </div>
 </div>
 <div>
 <div className="text-white font-medium mb-1">Payment Terms</div>
 <div className="text-gray-400 space-y-0.5">
 <div>7-day accounts: Invoiced weekly</div>
 <div>14-day accounts: Invoiced fortnightly</div>
 <div>30-day accounts: Invoiced end of month</div>
 <div className="text-xs text-gray-500 mt-1">
 All invoices must be tax invoices with correct ABN
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Conditions of Acceptance */}
 <div className="border-t border-gray-800 p-4">
 <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
 Conditions of Acceptance
 </div>
 <div className="text-xs text-gray-400 space-y-1">
 <ul className="list-disc list-inside space-y-1">
 <li>
 If the purchase order is incorrect or unclear, contact the
 office immediately before proceeding
 </li>
 <li>
 The correct PO number and job address MUST appear on all
 invoices and delivery dockets
 </li>
 <li>
 Processing or fulfillment of this order acknowledges
 acceptance of these conditions
 </li>
 <li>
 Supplier is responsible for ensuring materials meet Australian
 Standards and comply with building codes
 </li>
 <li>
 Any variations to this order must be approved in writing
 before proceeding
 </li>
 <li>
 Delivery must be made to the specified delivery address during
 normal business hours unless arranged otherwise
 </li>
 <li>
 Risk in goods passes to purchaser upon delivery to the
 specified site
 </li>
 <li>
 Payment terms apply from date of receipt of valid tax invoice
 </li>
 </ul>
 </div>
 </div>
 </div>

 {/* Activity Timeline */}
 <div className="mt-4">
 <h2 className="text-xs font-medium text-gray-400 mb-2">Activity</h2>
 <div className="bg-gray-900 border border-gray-800 p-3">
 <div className="flex items-start gap-3">
 <div className="flex-shrink-0">
 <CheckCircle2 className="w-4 h-4 text-success" />
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-xs text-gray-400">
 <span className="text-white font-medium">System</span> created
 the purchase order
 </p>
 <p className="text-xs text-gray-500 mt-0.5 font-mono">
 {formatDate(purchaseOrder.created_at)}
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>
 </main>
 );
}
