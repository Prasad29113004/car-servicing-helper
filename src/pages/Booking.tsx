import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

// Get services from localStorage or use default
const getServicesFromStorage = () => {
  const storedServices = localStorage.getItem("carServices");
  if (storedServices) {
    try {
      const parsedServices = JSON.parse(storedServices);
      return parsedServices.map(service => ({
        id: service.id || service.title.toLowerCase().replace(/\s+/g, '-'),
        name: service.title,
        price: service.price
      }));
    } catch (error) {
      console.error("Error parsing services from localStorage:", error);
      return defaultServices;
    }
  }
  return defaultServices;
};

const defaultServices = [
  { id: "oil-change", name: "Oil Change", price: "₹999" },
  { id: "general-service", name: "General Service", price: "₹2,999" },
  { id: "brake-service", name: "Brake Service", price: "₹4,499" },
  { id: "tire-rotation", name: "Tyre Rotation", price: "₹799" },
  { id: "ac-service", name: "AC Service", price: "₹1,899" },
  { id: "diagnostics", name: "Computer Diagnostics", price: "₹1,499" },
];

const popularCarMakes = [
  "Maruti Suzuki", "Hyundai", "Tata", "Mahindra", "Honda", 
  "Toyota", "Kia", "MG", "Skoda", "Volkswagen", "Ford",
  "Renault", "Nissan", "Jeep", "Mercedes-Benz", "BMW", "Audi"
];

interface UserData {
  fullName: string;
  email: string;
  phone: string;
  vehicles?: Array<{
    id: string;
    make: string;
    model: string;
    year: string;
    licensePlate: string;
  }>;
}

const Booking = () => {
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [carMake, setCarMake] = useState("");
  const [carModel, setCarModel] = useState("");
  const [carYear, setCarYear] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [bookingComplete, setBookingComplete] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      const storedData = localStorage.getItem(`userData_${userId}`);
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setUserData(parsedData);
          
          setName(parsedData.fullName || "");
          setEmail(parsedData.email || "");
          setPhone(parsedData.phone || "");
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    }
  }, []);

  const validatePhone = (phoneNumber: string) => {
    const regex = /^[6-9]\d{9}$/;
    return regex.test(phoneNumber);
  };

  const handleNextStep = () => {
    if (step === 1 && selectedServices.length === 0) {
      toast({
        title: "Please select at least one service",
        variant: "destructive",
      });
      return;
    }

    if (step === 2 && (!date || !time)) {
      toast({
        title: "Please select a date and time",
        variant: "destructive",
      });
      return;
    }

    if (step === 3) {
      if (!name || !email || !phone || !carMake || !carModel || !carYear) {
        toast({
          title: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
      
      if (!validatePhone(phone)) {
        toast({
          title: "Invalid phone number",
          description: "Please enter a valid 10-digit Indian mobile number",
          variant: "destructive",
        });
        return;
      }
    }

    if (step < 4) {
      setStep(step + 1);
    } else {
      const bookingId = `BK${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
      const bookingData = {
        id: bookingId,
        services: selectedServices.map(serviceId => {
          const service = services.find(s => s.id === serviceId);
          return service ? service.name : "";
        }),
        date: date ? format(date, 'yyyy-MM-dd') : '',
        time,
        name,
        email,
        phone,
        carMake,
        carModel,
        carYear,
        licensePlate,
        additionalInfo,
        amount: getTotalPrice(),
        paymentStatus: "Pending",
        status: "Scheduled",
        createdAt: new Date().toISOString(),
      };
      
      localStorage.setItem("lastBooking", JSON.stringify(bookingData));
      
      const userId = localStorage.getItem("userId");
      if (userId) {
        const userBookingsKey = `bookings_${userId}`;
        const existingBookings = localStorage.getItem(userBookingsKey);
        const bookings = existingBookings ? JSON.parse(existingBookings) : [];
        bookings.push(bookingData);
        localStorage.setItem(userBookingsKey, JSON.stringify(bookings));
        
        const notificationsKey = `notifications_${userId}`;
        const existingNotifications = localStorage.getItem(notificationsKey);
        const notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
        notifications.push({
          id: Date.now().toString(),
          title: "Booking Confirmed",
          message: `Your booking for ${bookingData.date} has been confirmed. We'll see you at ${time}!`,
          date: new Date().toISOString(),
          read: false,
          type: "booking",
          bookingId: bookingId,
        });
        localStorage.setItem(notificationsKey, JSON.stringify(notifications));
        
        setTimeout(() => {
          setBookingComplete(true);
          toast({
            title: "Booking Successful",
            description: "You can view your booking details in the dashboard",
          });
        }, 1500);
      } else {
        setTimeout(() => {
          setBookingComplete(true);
          toast({
            title: "Booking Successful",
            description: "Please log in to view your bookings",
          });
        }, 1500);
      }
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const [services, setServices] = useState(getServicesFromStorage());

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  const getTotalPrice = () => {
    let total = 0;
    selectedServices.forEach(serviceId => {
      const service = services.find(s => s.id === serviceId);
      if (service) {
        total += parseInt(service.price.replace(/[₹,]/g, ''));
      }
    });
    return `₹${total.toLocaleString('en-IN')}`;
  };

  const getServiceNames = () => {
    return selectedServices.map(serviceId => {
      const service = services.find(s => s.id === serviceId);
      return service ? service.name : "";
    }).join(", ");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-10 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-carservice-dark sm:text-4xl">
              Book a Service
            </h1>
            <p className="mt-4 text-lg text-gray-500">
              Schedule your car service in just a few easy steps
            </p>
          </div>

          {!bookingComplete ? (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <div className="flex justify-between">
                  <div className={`flex flex-col items-center ${step >= 1 ? "text-carservice-blue" : "text-gray-400"}`}>
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${step >= 1 ? "border-carservice-blue bg-carservice-blue text-white" : "border-gray-300"}`}>
                      1
                    </div>
                    <span className="text-xs mt-1">Service</span>
                  </div>
                  <div className={`flex-1 border-t-2 mt-4 ${step >= 2 ? "border-carservice-blue" : "border-gray-300"}`}></div>
                  <div className={`flex flex-col items-center ${step >= 2 ? "text-carservice-blue" : "text-gray-400"}`}>
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${step >= 2 ? "border-carservice-blue bg-carservice-blue text-white" : "border-gray-300"}`}>
                      2
                    </div>
                    <span className="text-xs mt-1">Date & Time</span>
                  </div>
                  <div className={`flex-1 border-t-2 mt-4 ${step >= 3 ? "border-carservice-blue" : "border-gray-300"}`}></div>
                  <div className={`flex flex-col items-center ${step >= 3 ? "text-carservice-blue" : "text-gray-400"}`}>
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${step >= 3 ? "border-carservice-blue bg-carservice-blue text-white" : "border-gray-300"}`}>
                      3
                    </div>
                    <span className="text-xs mt-1">Your Info</span>
                  </div>
                  <div className={`flex-1 border-t-2 mt-4 ${step >= 4 ? "border-carservice-blue" : "border-gray-300"}`}></div>
                  <div className={`flex flex-col items-center ${step >= 4 ? "text-carservice-blue" : "text-gray-400"}`}>
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${step >= 4 ? "border-carservice-blue bg-carservice-blue text-white" : "border-gray-300"}`}>
                      4
                    </div>
                    <span className="text-xs mt-1">Confirm</span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {step === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-carservice-dark">Select Services</h2>
                    <p className="text-sm text-gray-500">Select multiple services as needed for your vehicle</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {services.map((service) => (
                        <Card 
                          key={service.id}
                          className={`cursor-pointer transition-all ${
                            selectedServices.includes(service.id) 
                              ? "border-carservice-blue ring-2 ring-carservice-blue ring-opacity-50" 
                              : "border-gray-200 hover:border-carservice-blue"
                          }`}
                          onClick={() => toggleService(service.id)}
                        >
                          <CardContent className="p-4 flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                              <Checkbox 
                                checked={selectedServices.includes(service.id)}
                                onCheckedChange={() => toggleService(service.id)}
                                className="h-5 w-5"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div>
                                <h3 className="font-medium">{service.name}</h3>
                                <p className="text-sm text-carservice-blue font-semibold">{service.price}</p>
                              </div>
                            </div>
                            {selectedServices.includes(service.id) && (
                              <CheckCircle2 className="h-5 w-5 text-carservice-blue" />
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    {selectedServices.length > 0 && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">Selected Services: </span>
                            <span className="text-sm">{selectedServices.length}</span>
                          </div>
                          <span className="text-lg font-bold text-carservice-blue">{getTotalPrice()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-carservice-dark">Select Date & Time</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label>Select Date</Label>
                        <div className="mt-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !date && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                                disabled={(date) => {
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  const day = date.getDay();
                                  return date < today || day === 0;
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <div>
                        <Label>Select Time</Label>
                        <div className="mt-2">
                          <Select value={time} onValueChange={setTime}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="09:00">9:00 AM</SelectItem>
                              <SelectItem value="10:00">10:00 AM</SelectItem>
                              <SelectItem value="11:00">11:00 AM</SelectItem>
                              <SelectItem value="13:00">1:00 PM</SelectItem>
                              <SelectItem value="14:00">2:00 PM</SelectItem>
                              <SelectItem value="15:00">3:00 PM</SelectItem>
                              <SelectItem value="16:00">4:00 PM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-carservice-dark">Your Information</h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input 
                            id="name" 
                            placeholder="Rahul Sharma" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            placeholder="rahul.sharma@example.com" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Mobile Number</Label>
                        <Input 
                          id="phone" 
                          placeholder="9876543210" 
                          value={phone} 
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                          required 
                          maxLength={10}
                        />
                        <p className="text-xs text-gray-500">Enter 10-digit mobile number without country code</p>
                      </div>

                      <div className="pt-4 border-t">
                        <h3 className="text-lg font-medium text-carservice-dark mb-4">Car Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="carMake">Make</Label>
                            <Select value={carMake} onValueChange={setCarMake}>
                              <SelectTrigger id="carMake">
                                <SelectValue placeholder="Select car make" />
                              </SelectTrigger>
                              <SelectContent>
                                {popularCarMakes.map((make) => (
                                  <SelectItem key={make} value={make}>{make}</SelectItem>
                                ))}
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            {carMake === "other" && (
                              <Input 
                                placeholder="Enter car make" 
                                onChange={(e) => setCarMake(e.target.value)} 
                                className="mt-2" 
                              />
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="carModel">Model</Label>
                            <Input 
                              id="carModel" 
                              placeholder="Swift" 
                              value={carModel} 
                              onChange={(e) => setCarModel(e.target.value)} 
                              required 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="carYear">Year</Label>
                            <Input 
                              id="carYear" 
                              placeholder="2020" 
                              value={carYear} 
                              onChange={(e) => setCarYear(e.target.value.replace(/\D/g, '').slice(0, 4))} 
                              required 
                              maxLength={4}
                            />
                          </div>
                        </div>
                        <div className="mt-4">
                          <Label htmlFor="licensePlate">License Plate</Label>
                          <Input 
                            id="licensePlate" 
                            placeholder="KA01AB1234" 
                            value={licensePlate} 
                            onChange={(e) => setLicensePlate(e.target.value)} 
                            className="mt-1" 
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
                        <Textarea 
                          id="additionalInfo" 
                          placeholder="Any specific issues or concerns about your vehicle?"
                          value={additionalInfo}
                          onChange={(e) => setAdditionalInfo(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-carservice-dark">Confirm Your Booking</h2>
                    <div className="border rounded-lg p-4 space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <p className="text-sm text-gray-500">Services:</p>
                        <p className="text-sm font-medium">{getServiceNames()}</p>
                        
                        <p className="text-sm text-gray-500">Date:</p>
                        <p className="text-sm font-medium">
                          {date ? format(date, "PPP") : "Not selected"}
                        </p>
                        
                        <p className="text-sm text-gray-500">Time:</p>
                        <p className="text-sm font-medium">
                          {time ? `${time.slice(0, 2)}:${time.slice(2)} ${parseInt(time) < 12 ? "AM" : "PM"}` : "Not selected"}
                        </p>
                        
                        <p className="text-sm text-gray-500">Name:</p>
                        <p className="text-sm font-medium">{name}</p>
                        
                        <p className="text-sm text-gray-500">Contact:</p>
                        <p className="text-sm font-medium">{email} | {phone}</p>
                        
                        <p className="text-sm text-gray-500">Vehicle:</p>
                        <p className="text-sm font-medium">{carYear} {carMake} {carModel}</p>
                        
                        <p className="text-sm text-gray-500">License Plate:</p>
                        <p className="text-sm font-medium">{licensePlate || "Not provided"}</p>
                        
                        <p className="text-sm text-gray-500">Total Amount:</p>
                        <p className="text-sm font-medium text-carservice-blue">{getTotalPrice()}</p>
                      </div>
                      
                      {additionalInfo && (
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-sm text-gray-500">Additional Info:</p>
                          <p className="text-sm">{additionalInfo}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-yellow-800 text-sm">
                      <p className="font-medium">Payment Information</p>
                      <p className="mt-1">Payment will be collected after your service is completed. You'll receive an invoice with payment instructions.</p>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      <p>By confirming this booking, you agree to our terms and conditions.</p>
                    </div>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePreviousStep}
                    disabled={step === 1}
                  >
                    Previous
                  </Button>
                  <Button onClick={handleNextStep}>
                    {step < 4 ? "Next" : "Confirm Booking"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden p-8 text-center animate-fade-in">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-carservice-dark mb-2">Booking Confirmed!</h2>
                <p className="text-gray-500 mb-6">
                  Your appointment has been scheduled for {date ? format(date, "PPP") : ""} at {time ? `${time.slice(0, 2)}:${time.slice(2)} ${parseInt(time) < 12 ? "AM" : "PM"}` : ""}.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-6 w-full max-w-md">
                  <div className="text-left">
                    <p className="text-sm"><span className="font-medium">Services:</span> {getServiceNames()}</p>
                    <p className="text-sm"><span className="font-medium">Vehicle:</span> {carYear} {carMake} {carModel}</p>
                    <p className="text-sm"><span className="font-medium">License Plate:</span> {licensePlate || "Not provided"}</p>
                    <p className="text-sm"><span className="font-medium">Total Amount:</span> {getTotalPrice()}</p>
                    <p className="text-sm"><span className="font-medium">Booking Reference:</span> #{Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}</p>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-yellow-800 text-sm mb-6 w-full max-w-md">
                  <p className="font-medium">Payment Information</p>
                  <p className="mt-1">Payment will be collected after your service is completed.</p>
                </div>
                
                <p className="text-gray-500 mb-6">
                  We've sent a confirmation email to {email} with all the details.
                </p>
                
                <div className="flex space-x-4">
                  <Button variant="outline" onClick={() => navigate("/dashboard")}>
                    {localStorage.getItem("userId") ? "View Dashboard" : "Login to Track"}
                  </Button>
                  <Button onClick={() => navigate("/")}>
                    Return to Home
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Booking;
