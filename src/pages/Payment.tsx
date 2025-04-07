
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Download } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface PaymentInfo {
  bookingId: string;
  services: string[];
  total: string;
  date: string;
}

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [cardExpiry, setCardExpiry] = useState<string>("");
  const [cardCvv, setCardCvv] = useState<string>("");
  const [cardName, setCardName] = useState<string>("");
  const [upiId, setUpiId] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [showInvoice, setShowInvoice] = useState<boolean>(false);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  
  useEffect(() => {
    // Get payment info from state or localStorage
    if (location.state?.paymentInfo) {
      setPaymentInfo(location.state.paymentInfo);
    } else {
      // Try to get from localStorage
      const lastBooking = localStorage.getItem("lastBooking");
      if (lastBooking) {
        try {
          const bookingData = JSON.parse(lastBooking);
          setPaymentInfo({
            bookingId: `BK${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
            services: bookingData.services || [],
            total: bookingData.amount || "₹0",
            date: bookingData.date || new Date().toISOString().slice(0, 10),
          });
        } catch (error) {
          console.error("Error parsing booking data:", error);
        }
      } else {
        // If no data is available, redirect to booking
        navigate("/booking");
      }
    }
    
    // Load user data if available
    const userId = localStorage.getItem("userId");
    if (userId) {
      const userData = localStorage.getItem(`userData_${userId}`);
      if (userData) {
        try {
          const parsedData = JSON.parse(userData);
          setCardName(parsedData.fullName || "");
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    }
  }, [location, navigate]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 16) {
      // Format card number with spaces every 4 digits
      setCardNumber(value.replace(/(\d{4})(?=\d)/g, '$1 ').trim());
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      if (value.length > 2) {
        setCardExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
      } else {
        setCardExpiry(value);
      }
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 3) {
      setCardCvv(value);
    }
  };

  const handleUpiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpiId(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate payment details
    if (paymentMethod === "card") {
      if (cardNumber.length < 16 || !cardExpiry || cardCvv.length < 3 || !cardName) {
        toast({
          title: "Invalid Card Details",
          description: "Please enter valid card information.",
          variant: "destructive",
        });
        return;
      }
    } else if (paymentMethod === "upi" && !upiId) {
      toast({
        title: "Invalid UPI ID",
        description: "Please enter a valid UPI ID.",
        variant: "destructive",
      });
      return;
    }
    
    // Process payment (simulate API call)
    setIsProcessing(true);
    
    setTimeout(() => {
      // Generate invoice data
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
      const currentDate = new Date().toISOString().slice(0, 10);
      
      // Create invoice
      const invoice = {
        invoiceNumber,
        date: currentDate,
        dueDate: currentDate,
        customerName: cardName,
        services: paymentInfo?.services || [],
        total: paymentInfo?.total || "₹0",
        paymentMethod,
        status: "Paid",
      };
      
      // Save invoice to localStorage
      const userId = localStorage.getItem("userId");
      if (userId) {
        // Get existing invoices or create new array
        const existingInvoicesString = localStorage.getItem(`invoices_${userId}`);
        const existingInvoices = existingInvoicesString ? JSON.parse(existingInvoicesString) : [];
        
        // Add new invoice
        existingInvoices.push(invoice);
        localStorage.setItem(`invoices_${userId}`, JSON.stringify(existingInvoices));
        
        // Update booking status to paid
        const lastBookingData = localStorage.getItem("lastBooking");
        if (lastBookingData) {
          try {
            const bookingData = JSON.parse(lastBookingData);
            bookingData.paymentStatus = "Paid";
            bookingData.invoiceNumber = invoiceNumber;
            localStorage.setItem("lastBooking", JSON.stringify(bookingData));
            
            // Add to user's bookings
            const userBookings = localStorage.getItem(`bookings_${userId}`);
            const bookingsArray = userBookings ? JSON.parse(userBookings) : [];
            bookingsArray.push({
              ...bookingData,
              id: paymentInfo?.bookingId || `BK${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
              paymentStatus: "Paid",
              invoiceNumber,
            });
            localStorage.setItem(`bookings_${userId}`, JSON.stringify(bookingsArray));
            
            // Add notification
            const notifications = localStorage.getItem(`notifications_${userId}`);
            const notificationsArray = notifications ? JSON.parse(notifications) : [];
            notificationsArray.push({
              id: Date.now().toString(),
              title: "Payment Received",
              message: `Your payment of ${paymentInfo?.total} has been received for services booked on ${paymentInfo?.date}.`,
              date: new Date().toISOString(),
              read: false,
              type: "payment",
              invoiceNumber,
            });
            localStorage.setItem(`notifications_${userId}`, JSON.stringify(notificationsArray));
          } catch (error) {
            console.error("Error updating booking data:", error);
          }
        }
      }
      
      setInvoiceData(invoice);
      setIsProcessing(false);
      setPaymentSuccess(true);
    }, 2000);
  };

  const handleDownloadInvoice = () => {
    // In a real app, you'd generate a PDF. Here we'll just show the invoice dialog
    setShowInvoice(true);
  };

  const handleNavigateToDashboard = () => {
    navigate("/dashboard");
  };

  if (!paymentInfo) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Card className="w-[400px] shadow-lg">
            <CardHeader>
              <CardTitle>Payment</CardTitle>
              <CardDescription>Loading payment information...</CardDescription>
            </CardHeader>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-10 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          {!paymentSuccess ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Details</CardTitle>
                    <CardDescription>Enter your payment information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-6">
                        <RadioGroup
                          value={paymentMethod}
                          onValueChange={setPaymentMethod}
                          className="grid grid-cols-2 gap-4"
                        >
                          <div>
                            <RadioGroupItem
                              value="card"
                              id="card"
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor="card"
                              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 hover:border-gray-300 peer-data-[state=checked]:border-carservice-blue [&:has([data-state=checked])]:border-carservice-blue"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                                <rect width="20" height="14" x="2" y="5" rx="2" />
                                <line x1="2" x2="22" y1="10" y2="10" />
                              </svg>
                              Credit / Debit Card
                            </Label>
                          </div>
                          <div>
                            <RadioGroupItem
                              value="upi"
                              id="upi"
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor="upi"
                              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 hover:border-gray-300 peer-data-[state=checked]:border-carservice-blue [&:has([data-state=checked])]:border-carservice-blue"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                                <path d="M5.5 8.5 9 12l-3.5 3.5L2 12l3.5-3.5Z" />
                                <path d="m12 2 3.5 3.5L12 9 8.5 5.5 12 2Z" />
                                <path d="M18.5 8.5 22 12l-3.5 3.5L15 12l3.5-3.5Z" />
                                <path d="m12 15 3.5 3.5L12 22l-3.5-3.5L12 15Z" />
                              </svg>
                              UPI Payment
                            </Label>
                          </div>
                        </RadioGroup>

                        {paymentMethod === "card" && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="cardName">Cardholder Name</Label>
                              <Input
                                id="cardName"
                                placeholder="John Doe"
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value)}
                                required
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="cardNumber">Card Number</Label>
                              <Input
                                id="cardNumber"
                                placeholder="4242 4242 4242 4242"
                                value={cardNumber}
                                onChange={handleCardNumberChange}
                                required
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="expiry">Expiry Date</Label>
                                <Input
                                  id="expiry"
                                  placeholder="MM/YY"
                                  value={cardExpiry}
                                  onChange={handleExpiryChange}
                                  required
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="cvv">CVV</Label>
                                <Input
                                  id="cvv"
                                  placeholder="123"
                                  value={cardCvv}
                                  onChange={handleCvvChange}
                                  type="password"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {paymentMethod === "upi" && (
                          <div className="space-y-2">
                            <Label htmlFor="upiId">UPI ID</Label>
                            <Input
                              id="upiId"
                              placeholder="name@upi"
                              value={upiId}
                              onChange={handleUpiChange}
                              required
                            />
                            <p className="text-sm text-gray-500 mt-1">Enter your UPI ID (e.g., mobilenumber@upi)</p>
                          </div>
                        )}
                      </div>
                      
                      <Button
                        type="submit"
                        className="w-full mt-6"
                        disabled={isProcessing}
                      >
                        {isProcessing ? "Processing..." : `Pay ${paymentInfo.total}`}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium text-sm text-gray-500">Booking ID</h3>
                      <p>{paymentInfo.bookingId}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-sm text-gray-500">Services</h3>
                      <ul className="list-disc list-inside">
                        {paymentInfo.services.map((service: string, index: number) => (
                          <li key={index} className="text-sm">{service}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-sm text-gray-500">Appointment Date</h3>
                      <p>{paymentInfo.date}</p>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <div className="flex justify-between">
                        <span className="font-bold">Total</span>
                        <span className="font-bold text-carservice-blue">{paymentInfo.total}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card className="max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <CardTitle className="text-2xl">Payment Successful</CardTitle>
                <CardDescription>
                  Your payment of {paymentInfo.total} has been processed successfully
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="mb-2">Invoice Number: <span className="font-semibold">{invoiceData?.invoiceNumber}</span></p>
                  <p>Date: <span className="font-semibold">{new Date().toLocaleDateString()}</span></p>
                </div>
                <p>
                  A confirmation has been sent to your email address. You can also view and download your invoice from the dashboard.
                </p>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto"
                  onClick={handleDownloadInvoice}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Invoice
                </Button>
                <Button 
                  className="w-full sm:w-auto"
                  onClick={handleNavigateToDashboard}
                >
                  Go to Dashboard
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </main>
      <Footer />

      {/* Invoice Dialog */}
      <Dialog open={showInvoice} onOpenChange={setShowInvoice}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Invoice #{invoiceData?.invoiceNumber}</DialogTitle>
            <DialogDescription>
              Payment receipt for your car service booking
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
                <p className="text-gray-600"># {invoiceData?.invoiceNumber}</p>
                <p className="text-gray-600">Date: {invoiceData?.date}</p>
              </div>
            </div>
            
            <div className="mt-8">
              <h4 className="font-semibold text-gray-700">Bill To:</h4>
              <p>{cardName}</p>
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
                  {paymentInfo?.services.map((service: string, index: number) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-2">{service}</td>
                      <td className="text-right py-2">-</td>
                    </tr>
                  ))}
                  
                  <tr>
                    <td className="py-4 text-right font-bold">Total</td>
                    <td className="py-4 text-right font-bold">{paymentInfo?.total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-8 pt-4 border-t">
              <div className="flex space-x-2 items-center">
                <div className="w-4 h-4 rounded-full bg-green-600"></div>
                <p className="font-semibold text-green-600">Payment Status: Paid</p>
              </div>
              <p className="text-gray-600 mt-2">Payment Method: {paymentMethod === "card" ? "Credit/Debit Card" : "UPI"}</p>
              <p className="text-gray-600 mt-4">Thank you for your business!</p>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button onClick={() => setShowInvoice(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Payment;
