
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Download, FileText, CreditCard } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

interface Invoice {
  invoiceNumber: string;
  customerName: string;
  amount: string;
  status: string;
  date: string;
  bookingId?: string;
  paymentMethod?: string;
  services: string[];
}

interface InvoiceViewProps {
  userId: string;
}

const InvoiceView = ({ userId }: InvoiceViewProps) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    if (userId) {
      loadInvoices();
    }
  }, [userId]);
  
  const loadInvoices = () => {
    const storedInvoices = localStorage.getItem(`invoices_${userId}`);
    if (storedInvoices) {
      try {
        const parsedInvoices = JSON.parse(storedInvoices);
        // Sort by date, most recent first
        const sortedInvoices = parsedInvoices.sort((a: Invoice, b: Invoice) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        
        console.log("Loaded invoices for user", userId, ":", sortedInvoices);
        setInvoices(sortedInvoices);
      } catch (error) {
        console.error("Error parsing invoices:", error);
      }
    } else {
      console.log("No invoices found for user", userId);
    }
  };
  
  const handleViewInvoice = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
    setShowInvoice(true);
  };

  const handlePayInvoice = (invoice: Invoice) => {
    // Redirect to payment page with invoice details
    navigate('/payment', {
      state: {
        paymentInfo: {
          invoiceNumber: invoice.invoiceNumber,
          bookingId: invoice.bookingId,
          services: invoice.services,
          total: invoice.amount,
          date: invoice.date,
        }
      }
    });
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (invoices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium mb-1">No Invoices Yet</h3>
            <p className="text-gray-500">Your invoices will appear here after your service is completed</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice, index) => (
                  <tr key={`invoice-${index}-${invoice.invoiceNumber}`}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.invoiceNumber}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatDate(invoice.date)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{invoice.amount}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant={invoice.status === "Paid" ? "default" : "outline"} className={invoice.status === "Paid" ? "" : "text-amber-500 border-amber-500"}>
                        {invoice.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewInvoice(invoice)}>
                          View
                        </Button>
                        {invoice.status !== "Paid" && (
                          <Button size="sm" variant="default" onClick={() => handlePayInvoice(invoice)}>
                            Pay Now
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Dialog */}
      <Dialog open={showInvoice} onOpenChange={setShowInvoice}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Invoice #{currentInvoice?.invoiceNumber}</DialogTitle>
            <DialogDescription>
              Payment receipt for your car service booking
            </DialogDescription>
          </DialogHeader>
          
          {currentInvoice && (
            <>
              <div className="p-6 border rounded-md bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-carservice-blue">CarService</h2>
                    <p className="text-gray-600">123 Service Road</p>
                    <p className="text-gray-600">Autoville, AV 12345</p>
                    <p className="text-gray-600">info@carservice.com</p>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                  </div>
                  
                  <div className="text-right">
                    <h3 className="text-xl font-semibold">INVOICE</h3>
                    <p className="text-gray-600"># {currentInvoice.invoiceNumber}</p>
                    <p className="text-gray-600">Date: {formatDate(currentInvoice.date)}</p>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h4 className="font-semibold text-gray-700">Bill To:</h4>
                  <p>{currentInvoice.customerName}</p>
                </div>
                
                <div className="mt-8">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Service Description</th>
                        <th className="text-right py-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentInvoice.services.map((service, index) => (
                        <tr key={`service-${index}`} className="border-b border-gray-200">
                          <td className="py-2">{service}</td>
                          <td className="text-right py-2">-</td>
                        </tr>
                      ))}
                      
                      <tr>
                        <td className="py-4 text-right font-bold">Total</td>
                        <td className="py-4 text-right font-bold">{currentInvoice.amount}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-8 pt-4 border-t">
                  <div className="flex space-x-2 items-center">
                    <div className={`w-4 h-4 rounded-full ${currentInvoice.status === "Paid" ? "bg-green-600" : "bg-amber-500"}`}></div>
                    <p className={`font-semibold ${currentInvoice.status === "Paid" ? "text-green-600" : "text-amber-500"}`}>
                      Payment Status: {currentInvoice.status}
                    </p>
                  </div>
                  {currentInvoice.paymentMethod && (
                    <p className="text-gray-600 mt-2">Payment Method: {currentInvoice.paymentMethod}</p>
                  )}
                  <p className="text-gray-600 mt-4">Thank you for your business!</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowInvoice(false)}>
                  Close
                </Button>
                {currentInvoice.status !== "Paid" ? (
                  <Button onClick={() => handlePayInvoice(currentInvoice)}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay Now
                  </Button>
                ) : (
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InvoiceView;
