import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, CalendarCheck, CarFront, FileText, Users, Wrench, Image, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

const getCustomersFromStorage = () => {
  try {
    const storedCustomers = localStorage.getItem("allCustomers");
    if (storedCustomers) {
      return JSON.parse(storedCustomers);
    }
    
    return getAllRegisteredUsers();
  } catch (error) {
    console.error("Error loading customers from storage:", error);
  }
  
  return [
    { id: 1, name: "John Doe", email: "john@example.com", phone: "(555) 123-4567", vehicles: 2, lastService: "2023-06-15" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "(555) 987-6543", vehicles: 1, lastService: "2023-07-22" },
    { id: 3, name: "Mike Johnson", email: "mike@example.com", phone: "(555) 456-7890", vehicles: 3, lastService: "2023-08-05" },
  ];
};

interface Appointment {
  id: number | string;
  customer: string;
  customerId?: string | number;
  vehicle: string;
  services: string[] | string;
  date: string;
  time: string;
  status: string;
  price?: string;
}

const getAppointmentsFromStorage = (): Appointment[] => {
  try {
    // First check for a dedicated appointments storage
    const storedAppointments = localStorage.getItem("allAppointments");
    if (storedAppointments) {
      return JSON.parse(storedAppointments);
    }

    // If no dedicated storage, gather appointments from user data
    const appointments: Appointment[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('userData_')) {
        try {
          const userData = JSON.parse(localStorage.getItem(key) || '{}');
          const userId = key.replace('userData_', '');
          
          if (userData && Array.isArray(userData.appointments)) {
            userData.appointments.forEach((appointment: any, index: number) => {
              if (appointment) {
                appointments.push({
                  id: `${userId}_${index}`,
                  customerId: userId,
                  customer: userData.fullName || "Unknown User",
                  vehicle: appointment.vehicle || "Unknown Vehicle",
                  services: Array.isArray(appointment.services) 
                    ? appointment.services.join(", ") 
                    : appointment.service || "Unknown Service",
                  date: appointment.date || "Unknown Date",
                  time: appointment.time || "Unknown Time",
                  status: appointment.status || "Pending",
                  price: appointment.price || "₹0"
                });
              }
            });
          }
        } catch (error) {
          console.error("Error parsing user appointments:", error);
        }
      }
    }

    console.log("Found appointments in user data:", appointments.length);
    
    if (appointments.length > 0) {
      try {
        localStorage.setItem("allAppointments", JSON.stringify(appointments));
      } catch (error) {
        console.error("Error saving appointments to storage:", error);
      }
      return appointments;
    }
  } catch (error) {
    console.error("Error loading appointments from storage:", error);
  }
  
  return [
    { id: 1, customer: "John Doe", vehicle: "Toyota Camry", services: "Oil Change", date: "2023-09-20", time: "10:00 AM", status: "Confirmed" },
    { id: 2, customer: "Jane Smith", vehicle: "Honda Civic", services: "Brake Inspection", date: "2023-09-21", time: "2:30 PM", status: "Pending" },
    { id: 3, customer: "Mike Johnson", vehicle: "Ford F-150", services: "Tire Rotation", date: "2023-09-22", time: "9:15 AM", status: "Confirmed" },
  ];
};

const serviceReminders = [
  { id: 1, customer: "John Doe", vehicle: "Toyota Camry", service: "General Service", dueDate: "2023-09-30", lastSent: "Never" },
  { id: 2, customer: "Jane Smith", vehicle: "Honda Civic", service: "Oil Change", dueDate: "2023-10-15", lastSent: "2023-09-15" },
];

const sampleServiceImages = [
  { url: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=500&auto=format&fit=crop&q=60", title: "Engine Service" },
  { url: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500&auto=format&fit=crop&q=60", title: "Brake Inspection" },
  { url: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=500&auto=format&fit=crop&q=60", title: "Tire Rotation" },
  { url: "/lovable-uploads/1cc0e11a-9d93-4eed-8d02-59aa9a487c33.png", title: "Complete Service" },
  { url: "/lovable-uploads/cb6a4ec8-b918-4978-b763-593612f03b52.png", title: "Oil Change Service" },
  { url: "/lovable-uploads/fa60b102-82f0-4fd8-83f2-1528bdb868c9.png", title: "Suspension Check" },
];

interface RegisteredUser {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  vehicles: number;
  lastService: string;
}

const getAllRegisteredUsers = (): RegisteredUser[] => {
  const registeredUsers: RegisteredUser[] = [];
  
  try {
    const storedCustomers = localStorage.getItem("allCustomers");
    if (storedCustomers) {
      const parsedCustomers = JSON.parse(storedCustomers);
      if (Array.isArray(parsedCustomers) && parsedCustomers.length > 0) {
        return parsedCustomers;
      }
    }
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('userData_')) {
        try {
          const userData = JSON.parse(localStorage.getItem(key) || '{}');
          if (userData && userData.fullName) {
            registeredUsers.push({
              id: userData.id || key.replace('userData_', ''),
              name: userData.fullName,
              email: userData.email || '',
              phone: userData.phone || '',
              vehicles: Array.isArray(userData.vehicles) ? userData.vehicles.length : 0,
              lastService: Array.isArray(userData.serviceHistory) && userData.serviceHistory.length > 0 
                ? userData.serviceHistory[0].date 
                : "No services yet"
            });
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    }
  } catch (error) {
    console.error("Error reading localStorage:", error);
  }
  
  if (registeredUsers.length > 0) {
    try {
      localStorage.setItem("allCustomers", JSON.stringify(registeredUsers));
    } catch (error) {
      console.error("Error updating allCustomers:", error);
    }
    return registeredUsers;
  }
  
  const sampleData = [
    { id: 1, name: "John Doe", email: "john@example.com", phone: "(555) 123-4567", vehicles: 2, lastService: "2023-06-15" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "(555) 987-6543", vehicles: 1, lastService: "2023-07-22" },
    { id: 3, name: "Mike Johnson", email: "mike@example.com", phone: "(555) 456-7890", vehicles: 3, lastService: "2023-08-05" },
  ];
  
  return sampleData;
};

const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isImageUploadDialogOpen, setIsImageUploadDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customers, setCustomers] = useState<RegisteredUser[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [serviceImages, setServiceImages] = useState<{ url: string; title: string }[]>(sampleServiceImages || []);
  const [newImageTitle, setNewImageTitle] = useState("");
  const [selectedImages, setSelectedImages] = useState<{ url: string; title: string }[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadImageTitle, setUploadImageTitle] = useState("");
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const userRole = localStorage.getItem("userRole");
    
    if (!isLoggedIn || userRole !== "admin") {
      navigate("/login");
    }
    
    const users = getAllRegisteredUsers();
    setRegisteredUsers(users);
    setCustomers(users);
    
    // Load appointments from storage
    const storedAppointments = getAppointmentsFromStorage();
    setAppointments(storedAppointments);
    
    console.log("Registered users loaded:", users.length);
    console.log("Appointments loaded:", storedAppointments.length);
  }, [navigate]);
  
  const sendServiceReminder = () => {
    setIsReminderDialogOpen(false);
    toast({
      title: "Reminder sent",
      description: "Service reminder has been sent to the customer",
    });
  };
  
  const generateInvoice = () => {
    setIsInvoiceDialogOpen(false);
    toast({
      title: "Invoice generated",
      description: "Invoice has been generated and sent to the customer",
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = () => {
    if (!selectedCustomerId) {
      toast({
        title: "Error",
        description: "Please select a customer",
        variant: "destructive",
      });
      return;
    }

    let imagesToUpload: { url: string; title: string }[] = [];
    
    if (Array.isArray(selectedImages)) {
      imagesToUpload = [...selectedImages];
    }

    if (uploadedImage && uploadImageTitle) {
      imagesToUpload.push({
        url: uploadedImage,
        title: uploadImageTitle
      });
    }

    if (imagesToUpload.length === 0) {
      toast({
        title: "Error",
        description: "Please select or upload at least one image",
        variant: "destructive",
      });
      return;
    }

    try {
      const userData = localStorage.getItem(`userData_${selectedCustomerId}`);
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        
        if (!parsedUserData.serviceImages) {
          parsedUserData.serviceImages = [];
        }
        
        parsedUserData.serviceImages = [
          ...(parsedUserData.serviceImages || []),
          ...imagesToUpload.map(img => ({
            url: img.url,
            title: img.title,
            date: new Date().toISOString().split('T')[0]
          }))
        ];
        
        if (!parsedUserData.notifications) {
          parsedUserData.notifications = [];
        }
        
        const newNotification = {
          id: parsedUserData.notifications.length > 0 ? 
               Math.max(...parsedUserData.notifications.map((n: any) => n.id)) + 1 : 1,
          message: `Service progress images (${imagesToUpload.length}) have been uploaded for your vehicle`,
          date: new Date().toISOString().split('T')[0],
          read: false
        };
        
        parsedUserData.notifications.push(newNotification);
        
        parsedUserData.lastUpdated = new Date().toISOString().split('T')[0];
        
        localStorage.setItem(`userData_${selectedCustomerId}`, JSON.stringify(parsedUserData));
        
        toast({
          title: "Images uploaded",
          description: `${imagesToUpload.length} service progress images have been uploaded for ${selectedCustomer}`,
        });
        
        setSelectedImages([]);
        setUploadedImage(null);
        setUploadImageTitle("");
        setIsImageUploadDialogOpen(false);
      } else {
        throw new Error("User data not found");
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      toast({
        title: "Error",
        description: "Failed to upload images. User data not found.",
        variant: "destructive",
      });
    }
  };

  const handleSelectCustomer = (customerId: string | number, customerName: string) => {
    setSelectedCustomerId(String(customerId));
    setSelectedCustomer(customerName);
  };

  const handleToggleImage = (image: { url: string; title: string }) => {
    const currentSelectedImages = Array.isArray(selectedImages) ? selectedImages : [];
    
    if (currentSelectedImages.some(img => img.url === image.url)) {
      setSelectedImages(currentSelectedImages.filter(img => img.url !== image.url));
    } else {
      setSelectedImages([...currentSelectedImages, image]);
    }
  };

  // Function to update appointment status
  const handleUpdateAppointmentStatus = (appointmentId: string | number, newStatus: string) => {
    const updatedAppointments = appointments.map(appointment => {
      if (appointment.id === appointmentId) {
        return { ...appointment, status: newStatus };
      }
      return appointment;
    });
    
    setAppointments(updatedAppointments);
    
    // Update in localStorage
    try {
      localStorage.setItem("allAppointments", JSON.stringify(updatedAppointments));
      
      // If the appointment has a customerId, update in user data as well
      const appointment = appointments.find(a => a.id === appointmentId);
      if (appointment && appointment.customerId) {
        const userData = localStorage.getItem(`userData_${appointment.customerId}`);
        if (userData) {
          const parsedUserData = JSON.parse(userData);
          if (Array.isArray(parsedUserData.appointments)) {
            // Update status in the user's appointments array
            const userAppointments = parsedUserData.appointments.map((a: any, index: number) => {
              if (`${appointment.customerId}_${index}` === appointmentId) {
                return { ...a, status: newStatus };
              }
              return a;
            });
            
            parsedUserData.appointments = userAppointments;
            localStorage.setItem(`userData_${appointment.customerId}`, JSON.stringify(parsedUserData));
          }
        }
      }
      
      toast({
        title: "Status updated",
        description: `Appointment status has been updated to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      });
    }
  };

  // Get today's appointments
  const getTodayAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date).toISOString().split('T')[0];
      return appointmentDate === today;
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-carservice-dark">Admin Dashboard</h1>
            <p className="text-gray-500">Manage your car service business</p>
          </div>

          <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-5 w-full max-w-3xl">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <FileText className="h-4 w-4" /> Dashboard
              </TabsTrigger>
              <TabsTrigger value="customers" className="flex items-center gap-2">
                <Users className="h-4 w-4" /> Customers
              </TabsTrigger>
              <TabsTrigger value="appointments" className="flex items-center gap-2">
                <CalendarCheck className="h-4 w-4" /> Appointments
              </TabsTrigger>
              <TabsTrigger value="reminders" className="flex items-center gap-2">
                <Bell className="h-4 w-4" /> Reminders
              </TabsTrigger>
              <TabsTrigger value="images" className="flex items-center gap-2">
                <Image className="h-4 w-4" /> Images
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total Customers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Users className="h-10 w-10 text-carservice-blue" />
                      <div className="ml-4">
                        <p className="text-3xl font-bold">{registeredUsers.length}</p>
                        <p className="text-sm text-gray-500">Active accounts</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Today's Appointments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <CalendarCheck className="h-10 w-10 text-carservice-blue" />
                      <div className="ml-4">
                        <p className="text-3xl font-bold">{getTodayAppointments().length}</p>
                        <p className="text-sm text-gray-500">Scheduled services</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Pending Reminders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Bell className="h-10 w-10 text-carservice-blue" />
                      <div className="ml-4">
                        <p className="text-3xl font-bold">{serviceReminders.length}</p>
                        <p className="text-sm text-gray-500">Service alerts</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Services Completed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Wrench className="h-10 w-10 text-carservice-blue" />
                      <div className="ml-4">
                        <p className="text-3xl font-bold">{appointments.filter(a => a.status === "Completed").length}</p>
                        <p className="text-sm text-gray-500">This month</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Recent Appointments</CardTitle>
                  <CardDescription>Today's scheduled services</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Customer</th>
                          <th className="text-left py-3 px-4 font-medium">Vehicle</th>
                          <th className="text-left py-3 px-4 font-medium">Service</th>
                          <th className="text-left py-3 px-4 font-medium">Time</th>
                          <th className="text-left py-3 px-4 font-medium">Status</th>
                          <th className="text-left py-3 px-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getTodayAppointments().length > 0 ? (
                          getTodayAppointments().map((appointment) => (
                            <tr key={appointment.id} className="border-b">
                              <td className="py-3 px-4">{appointment.customer}</td>
                              <td className="py-3 px-4">{appointment.vehicle}</td>
                              <td className="py-3 px-4">{appointment.services}</td>
                              <td className="py-3 px-4">{appointment.time}</td>
                              <td className="py-3 px-4">
                                <Badge variant={appointment.status === "Confirmed" ? "default" : "secondary"}>
                                  {appointment.status}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex space-x-2">
                                  <Button variant="outline" size="sm" onClick={() => setIsInvoiceDialogOpen(true)}>
                                    Invoice
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => {
                                    setSelectedCustomer(appointment.customer);
                                    setIsReminderDialogOpen(true);
                                  }}>
                                    Remind
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-6 text-center text-gray-500">No appointments scheduled for today</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="customers" className="space-y-6">
              <Card className="shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Customer Management</CardTitle>
                      <CardDescription>View and manage your customers</CardDescription>
                    </div>
                    <Button>Add Customer</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Name</th>
                          <th className="text-left py-3 px-4 font-medium">Email</th>
                          <th className="text-left py-3 px-4 font-medium">Phone</th>
                          <th className="text-left py-3 px-4 font-medium">Vehicles</th>
                          <th className="text-left py-3 px-4 font-medium">Last Service</th>
                          <th className="text-left py-3 px-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getAllRegisteredUsers().map((customer) => (
                          <tr key={customer.id} className="border-b">
                            <td className="py-3 px-4">{customer.name}</td>
                            <td className="py-3 px-4">{customer.email}</td>
                            <td className="py-3 px-4">{customer.phone}</td>
                            <td className="py-3 px-4">{customer.vehicles}</td>
                            <td className="py-3 px-4">
                              {customer.lastService === "No services yet" ? 
                                <span className="text-orange-500">No services yet</span> :
                                new Date(customer.lastService).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric"
                                })
                              }
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  View
                                </Button>
                                <Button variant="outline" size="sm">
                                  Edit
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => {
                                  setSelectedCustomer(customer.name);
                                  setSelectedCustomerId(String(customer.id));
                                  setIsReminderDialogOpen(true);
                                }}>
                                  Remind
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appointments" className="space-y-6">
              <Card className="shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Appointments</CardTitle>
                      <CardDescription>Manage scheduled services</CardDescription>
                    </div>
                    <Button>Schedule New</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Customer</th>
                          <th className="text-left py-3 px-4 font-medium">Vehicle</th>
                          <th className="text-left py-3 px-4 font-medium">Service</th>
                          <th className="text-left py-3 px-4 font-medium">Date</th>
                          <th className="text-left py-3 px-4 font-medium">Time</th>
                          <th className="text-left py-3 px-4 font-medium">Status</th>
                          <th className="text-left py-3 px-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.length > 0 ? (
                          appointments.map((appointment) => (
                            <tr key={appointment.id} className="border-b">
                              <td className="py-3 px-4">{appointment.customer}</td>
                              <td className="py-3 px-4">{appointment.vehicle}</td>
                              <td className="py-3 px-4">{appointment.services}</td>
                              <td className="py-3 px-4">
                                {new Date(appointment.date).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric"
                                })}
                              </td>
                              <td className="py-3 px-4">{appointment.time}</td>
                              <td className="py-3 px-4">
                                <Select 
                                  value={appointment.status} 
                                  onValueChange={(value) => handleUpdateAppointmentStatus(appointment.id, value)}
                                >
                                  <SelectTrigger className="w-[130px]">
                                    <SelectValue>
                                      <Badge variant={
                                        appointment.status === "Confirmed" ? "default" : 
                                        appointment.status === "Completed" ? "success" : 
                                        appointment.status === "Cancelled" ? "destructive" : 
                                        "secondary"
                                      }>
                                        {appointment.status}
                                      </Badge>
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex space-x-2">
                                  <Button variant="outline" size="sm">
                                    Edit
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => {
                                    setSelectedCustomer(appointment.customer);
                                    setIsInvoiceDialogOpen(true);
                                  }}>
                                    Invoice
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="py-6 text-center text-gray-500">No appointments found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reminders" className="space-y-6">
              <Card className="shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Service Reminders</CardTitle>
                      <CardDescription>Manage and send service alerts to customers</CardDescription>
                    </div>
                    <Button onClick={() => setIsReminderDialogOpen(true)}>New Reminder</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Customer</th>
                          <th className="text-left py-3 px-4 font-medium">Vehicle</th>
                          <th className="text-left py-3 px-4 font-medium">Service</th>
                          <th className="text-left py-3 px-4 font-medium">Due Date</th>
                          <th className="text-left py-3 px-4 font-medium">Last Reminded</th>
                          <th className="text-left py-3 px-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {serviceReminders.map((reminder) => (
                          <tr key={reminder.id} className="border-b">
                            <td className="py-3 px-4">{reminder.customer}</td>
                            <td className="py-3 px-4">{reminder.vehicle}</td>
                            <td className="py-3 px-4">{reminder.service}</td>
                            <td className="py-3 px-4">
                              {new Date(reminder.dueDate).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric"
                              })}
                            </td>
                            <td className="py-3 px-4">
                              {reminder.lastSent === "Never" ? (
                                <span className="text-orange-500">Never</span>
                              ) : (
                                new Date(reminder.lastSent).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric"
                                })
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm" onClick={() => {
                                  setSelectedCustomer(reminder
