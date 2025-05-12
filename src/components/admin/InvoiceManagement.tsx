
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Download, Send, FileText, Eye, FilePlus } from "lucide-react";

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  services: string[];
  date: string;
  time: string;
  carMake: string;
  carModel: string;
  carYear: string;
  licensePlate?: string;
  paymentStatus?: string;
  invoiceNumber?: string;
  amount: string;
}

interface ServiceItem {
  name: string;
  price: string;
}

interface Invoice {
  invoiceNumber: string;
  customerName: string;
  email?: string;
  amount: string;
  status: string;
  date: string;
  bookingId: string;
  paymentMethod?: string;
  services: string[];
  serviceItems?: ServiceItem[];
}

const InvoiceManagement = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [emailMessage, setEmailMessage] = useState("");
  
  const { toast } = useToast();
  
  useEffect(() => {
    // Load all bookings and invoices from localStorage
    loadBookingsAndInvoices();
    
    // Set up interval to refresh data
    const intervalId = setInterval(loadBookingsAndInvoices, 10000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const loadBookingsAndInvoices = () => {
    // Get all users
    const allUsers = [];
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith("userData_")) {
        const userId = key.replace("userData_", "");
        allUsers.push(userId);
      }
    }
    
    // Collect all bookings and invoices
    const allBookings: Booking[] = [];
    const allInvoices: Invoice[] = [];
    
    for (const userId of allUsers) {
      // Get bookings for this user
      const userBookingsStr = localStorage.getItem(`bookings_${userId}`);
      if (userBookingsStr) {
        try {
          const userBookings = JSON.parse(userBookingsStr);
          allBookings.push(...userBookings);
        } catch (error) {
          console.error(`Error parsing bookings for user ${userId}:`, error);
        }
      }
      
      // Get invoices for this user
      const userInvoicesStr = localStorage.getItem(`invoices_${userId}`);
      if (userInvoicesStr) {
        try {
          const userInvoices = JSON.parse(userInvoicesStr);
          allInvoices.push(...userInvoices);
        } catch (error) {
          console.error(`Error parsing invoices for user ${userId}:`, error);
        }
      }
    }
    
    setBookings(allBookings);
    setInvoices(allInvoices);
  };
  
  const handleViewInvoice = (invoice: Invoice) => {
    // If serviceItems aren't defined, create them from the services array
    if (!invoice.serviceItems) {
      const totalAmount = parseFloat(invoice.amount.replace(/[^\d.]/g, ''));
      const serviceCount = invoice.services.length;
      
      // Calculate per-service price - divide total evenly among services
      const pricePerService = serviceCount > 0 ? totalAmount / serviceCount : 0;
      
      // Format the currency symbol consistently
      const currencySymbol = invoice.amount.charAt(0) || '₹';
      
      const serviceItems = invoice.services.map(service => ({
        name: service,
        price: `${currencySymbol}${pricePerService.toLocaleString('en-IN')}`
      }));
      
      invoice = { ...invoice, serviceItems };
    }
    
    setCurrentInvoice(invoice);
    setShowInvoiceDialog(true);
  };
  
  const handleCreateInvoice = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowCreateInvoice(true);
  };
  
  const handleSendInvoice = (invoice: Invoice) => {
    // In a real app, you'd send this via email API
    setCurrentInvoice(invoice);
    setEmailMessage(`Dear ${invoice.customerName},\n\nPlease find attached your invoice #${invoice.invoiceNumber} for services performed on ${invoice.date}.\n\nThank you for choosing our service.\n\nBest Regards,\nCarService Team`);
    
    toast({
      title: "Invoice sent successfully",
      description: `Invoice #${invoice.invoiceNumber} has been sent to the customer.`,
    });
    
    // Find the user ID that owns this booking
    const keys = Object.keys(localStorage);
    let foundUserId = null;
    
    for (const key of keys) {
      if (key.startsWith("bookings_")) {
        const userId = key.replace("bookings_", "");
        const userBookingsStr = localStorage.getItem(key);
        if (userBookingsStr) {
          try {
            const userBookings = JSON.parse(userBookingsStr);
            const matchingBooking = userBookings.find((b: Booking) => b.id === invoice.bookingId);
            if (matchingBooking) {
              foundUserId = userId;
              // Add notification for this user
              const notificationsKey = `notifications_${userId}`;
              const notificationsStr = localStorage.getItem(notificationsKey);
              const notifications = notificationsStr ? JSON.parse(notificationsStr) : [];
              
              notifications.push({
                id: Date.now().toString(),
                title: "Invoice Received",
                message: `You have received invoice #${invoice.invoiceNumber} for services booked on ${matchingBooking.date}.`,
                date: new Date().toISOString(),
                read: false,
                type: "invoice",
                invoiceNumber: invoice.invoiceNumber,
              });
              
              localStorage.setItem(notificationsKey, JSON.stringify(notifications));
              
              // Make sure the invoice is also stored for this user
              const userInvoicesKey = `invoices_${userId}`;
              const userInvoicesStr = localStorage.getItem(userInvoicesKey);
              const userInvoices = userInvoicesStr ? JSON.parse(userInvoicesStr) : [];
              
              // Check if this invoice already exists for this user
              const existingInvoiceIndex = userInvoices.findIndex((inv: Invoice) => 
                inv.invoiceNumber === invoice.invoiceNumber);
                
              if (existingInvoiceIndex === -1) {
                // Add the invoice if it doesn't exist
                userInvoices.push(invoice);
                localStorage.setItem(userInvoicesKey, JSON.stringify(userInvoices));
              }
              
              break;
            }
          } catch (error) {
            console.error(`Error processing bookings for user ${userId}:`, error);
          }
        }
      }
    }
    
    // Trigger a storage event to update other tabs
    if (foundUserId) {
      window.dispatchEvent(new StorageEvent('storage', {
        key: `invoices_${foundUserId}`,
        newValue: localStorage.getItem(`invoices_${foundUserId}`)
      }));
    }
  };
  
  const handleGenerateInvoice = () => {
    if (!selectedBooking) return;
    
    // Create a new invoice
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    
    // Calculate individual service prices by dividing the total amount
    const totalAmount = parseFloat(selectedBooking.amount.replace(/[^\d.]/g, ''));
    const serviceCount = selectedBooking.services.length;
    const pricePerService = serviceCount > 0 ? totalAmount / serviceCount : 0;
    
    // Format the currency symbol consistently
    const currencySymbol = selectedBooking.amount.charAt(0) || '₹';
    
    // Create service items with calculated prices
    const serviceItems = selectedBooking.services.map(service => ({
      name: service,
      price: `${currencySymbol}${pricePerService.toLocaleString('en-IN')}`
    }));
    
    const newInvoice: Invoice = {
      invoiceNumber,
      customerName: selectedBooking.name,
      email: selectedBooking.email,
      amount: selectedBooking.amount,
      status: "Unpaid",
      date: new Date().toISOString().slice(0, 10),
      bookingId: selectedBooking.id,
      services: selectedBooking.services,
      serviceItems: serviceItems
    };
    
    // Update the invoices list
    const updatedInvoices = [...invoices, newInvoice];
    setInvoices(updatedInvoices);
    
    // Store the invoice in localStorage for the corresponding user
    // Find the user ID that owns this booking
    const keys = Object.keys(localStorage);
    let foundUserId = null;
    
    for (const key of keys) {
      if (key.startsWith("bookings_")) {
        const userId = key.replace("bookings_", "");
        const userBookingsStr = localStorage.getItem(key);
        if (userBookingsStr) {
          try {
            const userBookings = JSON.parse(userBookingsStr);
            const matchingBookingIndex = userBookings.findIndex((b: Booking) => b.id === selectedBooking.id);
            if (matchingBookingIndex !== -1) {
              foundUserId = userId;
              // Update the booking with invoice information
              userBookings[matchingBookingIndex].invoiceNumber = invoiceNumber;
              localStorage.setItem(key, JSON.stringify(userBookings));
              
              // Add the invoice to the user's invoices
              const userInvoicesKey = `invoices_${userId}`;
              const userInvoicesStr = localStorage.getItem(userInvoicesKey);
              const userInvoices = userInvoicesStr ? JSON.parse(userInvoicesStr) : [];
              userInvoices.push(newInvoice);
              localStorage.setItem(userInvoicesKey, JSON.stringify(userInvoices));
              
              // Add notification for this user
              const notificationsKey = `notifications_${userId}`;
              const notificationsStr = localStorage.getItem(notificationsKey);
              const notifications = notificationsStr ? JSON.parse(notificationsStr) : [];
              
              notifications.push({
                id: Date.now().toString(),
                title: "Invoice Generated",
                message: `An invoice #${invoiceNumber} has been generated for your booking on ${selectedBooking.date}.`,
                date: new Date().toISOString(),
                read: false,
                type: "invoice",
                invoiceNumber,
              });
              
              localStorage.setItem(notificationsKey, JSON.stringify(notifications));
              break;
            }
          } catch (error) {
            console.error(`Error processing bookings for user ${userId}:`, error);
          }
        }
      }
    }
    
    // Trigger a storage event to update other tabs
    if (foundUserId) {
      window.dispatchEvent(new StorageEvent('storage', {
        key: `invoices_${foundUserId}`,
        newValue: localStorage.getItem(`invoices_${foundUserId}`)
      }));
    }
    
    // Show success message and close dialog
    toast({
      title: "Invoice created successfully",
      description: `Invoice #${invoiceNumber} has been created and is ready to send.`,
    });
    
    setShowCreateInvoice(false);
    setSelectedBooking(null);
  };

  // Helper function to mark invoice as paid
  const handleMarkAsPaid = (invoice: Invoice) => {
    const updatedInvoice = { ...invoice, status: "Paid", paymentMethod: "card" };
    
    // Update invoice in state
    const updatedInvoices = invoices.map(inv => 
      inv.invoiceNumber === invoice.invoiceNumber ? updatedInvoice : inv
    );
    setInvoices(updatedInvoices);
    
    if (currentInvoice?.invoiceNumber === invoice.invoiceNumber) {
      setCurrentInvoice(updatedInvoice);
    }
    
    // Find user ID for this invoice
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith("invoices_")) {
        const userId = key.replace("invoices_", "");
        const userInvoicesStr = localStorage.getItem(key);
        
        if (userInvoicesStr) {
          try {
            const userInvoices = JSON.parse(userInvoicesStr);
            const invoiceIndex = userInvoices.findIndex((inv: Invoice) => 
              inv.invoiceNumber === invoice.invoiceNumber
            );
            
            if (invoiceIndex !== -1) {
              // Update the invoice status
              userInvoices[invoiceIndex] = updatedInvoice;
              localStorage.setItem(key, JSON.stringify(userInvoices));
              
              // Update the revenue data in admin stats too (new!)
              const adminStatsKey = `adminStats`;
              const statsStr = localStorage.getItem(adminStatsKey);
              const stats = statsStr ? JSON.parse(statsStr) : {
                totalRevenue: 0,
                monthlyRevenue: 0,
                paidInvoices: 0
              };
              
              // Extract numerical value from invoice amount
              const amount = parseFloat(invoice.amount.replace(/[^\d.]/g, '')) || 0;
              
              // Update total revenue
              stats.totalRevenue = (stats.totalRevenue || 0) + amount;
              
              // Check if this is current month
              const invoiceDate = new Date(invoice.date);
              const currentDate = new Date();
              if (invoiceDate.getMonth() === currentDate.getMonth() && 
                  invoiceDate.getFullYear() === currentDate.getFullYear()) {
                stats.monthlyRevenue = (stats.monthlyRevenue || 0) + amount;
              }
              
              stats.paidInvoices = (stats.paidInvoices || 0) + 1;
              
              // Save updated stats
              localStorage.setItem(adminStatsKey, JSON.stringify(stats));
              
              // Add notification for payment
              const notificationsKey = `notifications_${userId}`;
              const notificationsStr = localStorage.getItem(notificationsKey);
              const notifications = notificationsStr ? JSON.parse(notificationsStr) : [];
              
              notifications.push({
                id: Date.now().toString(),
                title: "Payment Received",
                message: `Your payment for invoice #${invoice.invoiceNumber} has been processed successfully.`,
                date: new Date().toISOString(),
                read: false,
                type: "payment",
                invoiceNumber: invoice.invoiceNumber,
              });
              
              localStorage.setItem(notificationsKey, JSON.stringify(notifications));
              
              // Trigger storage event to update other components
              window.dispatchEvent(new StorageEvent('storage', {
                key: `adminStats`,
                newValue: localStorage.getItem(adminStatsKey)
              }));
              
              toast({
                title: "Invoice marked as paid",
                description: `Invoice #${invoice.invoiceNumber} has been marked as paid.`,
              });
              
              break;
            }
          } catch (error) {
            console.error(`Error processing invoices for user ${userId}:`, error);
          }
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Invoice Management</h2>
      
      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="pending">Pending Bookings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Invoices</CardTitle>
              <CardDescription>Manage and view customer invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.length > 0 ? (
                      invoices.map((invoice) => (
                        <tr key={invoice.invoiceNumber}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.invoiceNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.customerName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.amount}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={invoice.status === "Paid" ? "default" : "outline"}>
                              {invoice.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="icon" onClick={() => handleViewInvoice(invoice)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleSendInvoice(invoice)}>
                                <Send className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Download className="h-4 w-4" />
                              </Button>
                              {invoice.status !== "Paid" && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-green-600 border-green-600 hover:bg-green-50"
                                  onClick={() => handleMarkAsPaid(invoice)}
                                >
                                  Mark Paid
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No invoices found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Bookings</CardTitle>
              <CardDescription>Create invoices for bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Services</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.filter(b => !b.invoiceNumber).length > 0 ? (
                      bookings.filter(b => !b.invoiceNumber).map((booking) => (
                        <tr key={booking.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {booking.services.slice(0, 2).join(", ")}
                            {booking.services.length > 2 ? "..." : ""}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="outline" className="text-amber-500 border-amber-500">
                              No Invoice
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <Button variant="outline" size="sm" onClick={() => handleCreateInvoice(booking)}>
                              <FilePlus className="h-4 w-4 mr-2" />
                              Create Invoice
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No pending bookings found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* View Invoice Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Invoice #{currentInvoice?.invoiceNumber}</DialogTitle>
            <DialogDescription>
              {currentInvoice?.status === "Paid" ? "Payment received" : "Payment pending"}
            </DialogDescription>
          </DialogHeader>
          
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
                <p className="text-gray-600"># {currentInvoice?.invoiceNumber}</p>
                <p className="text-gray-600">Date: {currentInvoice?.date}</p>
              </div>
            </div>
            
            <div className="mt-8">
              <h4 className="font-semibold text-gray-700">Bill To:</h4>
              <p>{currentInvoice?.customerName}</p>
              {currentInvoice?.email && <p>{currentInvoice.email}</p>}
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
                  {currentInvoice?.serviceItems ? (
                    // Display service items with prices if available
                    currentInvoice.serviceItems.map((item, index) => (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="py-2">{item.name}</td>
                        <td className="text-right py-2">{item.price}</td>
                      </tr>
                    ))
                  ) : (
                    // Fallback to just service names
                    currentInvoice?.services.map((service, index) => (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="py-2">{service}</td>
                        <td className="text-right py-2">-</td>
                      </tr>
                    ))
                  )}
                  
                  <tr>
                    <td className="py-4 text-right font-bold">Total</td>
                    <td className="py-4 text-right font-bold">{currentInvoice?.amount}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-8 pt-4 border-t">
              <div className="flex space-x-2 items-center">
                <div className={`w-4 h-4 rounded-full ${currentInvoice?.status === "Paid" ? "bg-green-600" : "bg-amber-500"}`}></div>
                <p className={`font-semibold ${currentInvoice?.status === "Paid" ? "text-green-600" : "text-amber-500"}`}>
                  Payment Status: {currentInvoice?.status}
                </p>
              </div>
              {currentInvoice?.paymentMethod && (
                <p className="text-gray-600 mt-2">Payment Method: {currentInvoice.paymentMethod}</p>
              )}
              <p className="text-gray-600 mt-4">Thank you for your business!</p>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setShowInvoiceDialog(false)}>Close</Button>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              {currentInvoice?.status !== "Paid" ? (
                <>
                  <Button onClick={() => {
                    setShowInvoiceDialog(false);
                    handleSendInvoice(currentInvoice!);
                  }}>
                    <Send className="mr-2 h-4 w-4" />
                    Send to Customer
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-green-600 border-green-600 hover:bg-green-50"
                    onClick={() => {
                      handleMarkAsPaid(currentInvoice!);
                    }}
                  >
                    Mark as Paid
                  </Button>
                </>
              ) : (
                <Button variant="default" disabled>
                  <Send className="mr-2 h-4 w-4" />
                  Already Paid
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Create Invoice Dialog */}
      <Dialog open={showCreateInvoice} onOpenChange={setShowCreateInvoice}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>
              Generate an invoice for booking #{selectedBooking?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Customer</Label>
                  <Input value={selectedBooking.name} readOnly />
                </div>
                <div>
                  <Label>Booking Date</Label>
                  <Input value={selectedBooking.date} readOnly />
                </div>
              </div>
              
              <div>
                <Label>Services</Label>
                <div className="border rounded-md p-2 mt-1">
                  <ul className="list-disc list-inside">
                    {selectedBooking.services.map((service, index) => (
                      <li key={index} className="text-sm">{service}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div>
                <Label>Total Amount</Label>
                <Input value={selectedBooking.amount} />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateInvoice(false)}>Cancel</Button>
                <Button onClick={handleGenerateInvoice}>Generate Invoice</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceManagement;
