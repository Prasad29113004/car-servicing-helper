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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";

const customers = [
  { id: 1, name: "John Doe", email: "john@example.com", phone: "(555) 123-4567", vehicles: 2, lastService: "2023-06-15" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "(555) 987-6543", vehicles: 1, lastService: "2023-07-22" },
  { id: 3, name: "Mike Johnson", email: "mike@example.com", phone: "(555) 456-7890", vehicles: 3, lastService: "2023-08-05" },
];

const appointments = [
  { id: 1, customer: "John Doe", vehicle: "Toyota Camry", service: "Oil Change", date: "2023-09-20", time: "10:00 AM", status: "Confirmed" },
  { id: 2, customer: "Jane Smith", vehicle: "Honda Civic", service: "Brake Inspection", date: "2023-09-21", time: "2:30 PM", status: "Pending" },
  { id: 3, customer: "Mike Johnson", vehicle: "Ford F-150", service: "Tire Rotation", date: "2023-09-22", time: "9:15 AM", status: "Confirmed" },
];

const serviceReminders = [
  { id: 1, customer: "John Doe", vehicle: "Toyota Camry", service: "General Service", dueDate: "2023-09-30", lastSent: "Never" },
  { id: 2, customer: "Jane Smith", vehicle: "Honda Civic", service: "Oil Change", dueDate: "2023-10-15", lastSent: "2023-09-15" },
];

const sampleServiceImages = [
  { url: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=500&auto=format&fit=crop&q=60", title: "Engine Service" },
  { url: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500&auto=format&fit=crop&q=60", title: "Brake Inspection" },
  { url: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=500&auto=format&fit=crop&q=60", title: "Tire Rotation" },
];

const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isImageUploadDialogOpen, setIsImageUploadDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [serviceImages, setServiceImages] = useState<{ url: string; title: string }[]>([]);
  const [newImageTitle, setNewImageTitle] = useState("");
  const [selectedImages, setSelectedImages] = useState<{ url: string; title: string }[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const userRole = localStorage.getItem("userRole");
    
    if (!isLoggedIn || userRole !== "admin") {
      navigate("/login");
    }
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

  const handleImageUpload = () => {
    if (!selectedCustomerId) {
      toast({
        title: "Error",
        description: "Please select a customer",
        variant: "destructive",
      });
      return;
    }

    const userData = localStorage.getItem(`userData_${selectedCustomerId}`);
    if (userData) {
      const parsedUserData = JSON.parse(userData);
      
      parsedUserData.serviceImages = selectedImages.map(img => ({
        url: img.url,
        title: img.title,
      }));
      
      localStorage.setItem(`userData_${selectedCustomerId}`, JSON.stringify(parsedUserData));
      
      const newNotification = {
        id: (parsedUserData.notifications?.length || 0) + 1,
        message: `Service progress images (${selectedImages.length}) have been uploaded for your vehicle`,
        date: new Date().toISOString().split('T')[0],
        read: false
      };
      
      parsedUserData.notifications = [...(parsedUserData.notifications || []), newNotification];
      localStorage.setItem(`userData_${selectedCustomerId}`, JSON.stringify(parsedUserData));
      
      toast({
        title: "Images uploaded",
        description: `${selectedImages.length} service progress images have been uploaded for ${selectedCustomer}`,
      });
      
      setSelectedImages([]);
      setIsImageUploadDialogOpen(false);
    }
  };

  const handleSelectCustomer = (customerId: string, customerName: string) => {
    setSelectedCustomerId(customerId);
    setSelectedCustomer(customerName);
  };

  const handleToggleImage = (image: { url: string; title: string }) => {
    if (selectedImages.some(img => img.url === image.url)) {
      setSelectedImages(selectedImages.filter(img => img.url !== image.url));
    } else {
      setSelectedImages([...selectedImages, image]);
    }
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
                        <p className="text-3xl font-bold">{customers.length}</p>
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
                        <p className="text-3xl font-bold">2</p>
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
                        <p className="text-3xl font-bold">35</p>
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
                        {appointments.map((appointment) => (
                          <tr key={appointment.id} className="border-b">
                            <td className="py-3 px-4">{appointment.customer}</td>
                            <td className="py-3 px-4">{appointment.vehicle}</td>
                            <td className="py-3 px-4">{appointment.service}</td>
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
                        ))}
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
                        {customers.map((customer) => (
                          <tr key={customer.id} className="border-b">
                            <td className="py-3 px-4">{customer.name}</td>
                            <td className="py-3 px-4">{customer.email}</td>
                            <td className="py-3 px-4">{customer.phone}</td>
                            <td className="py-3 px-4">{customer.vehicles}</td>
                            <td className="py-3 px-4">
                              {new Date(customer.lastService).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric"
                              })}
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
                        {appointments.map((appointment) => (
                          <tr key={appointment.id} className="border-b">
                            <td className="py-3 px-4">{appointment.customer}</td>
                            <td className="py-3 px-4">{appointment.vehicle}</td>
                            <td className="py-3 px-4">{appointment.service}</td>
                            <td className="py-3 px-4">
                              {new Date(appointment.date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric"
                              })}
                            </td>
                            <td className="py-3 px-4">{appointment.time}</td>
                            <td className="py-3 px-4">
                              <Badge variant={appointment.status === "Confirmed" ? "default" : "secondary"}>
                                {appointment.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  Edit
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setIsInvoiceDialogOpen(true)}>
                                  Invoice
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
                                  setSelectedCustomer(reminder.customer);
                                  setIsReminderDialogOpen(true);
                                }}>
                                  Send Reminder
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

            <TabsContent value="images" className="space-y-6">
              <Card className="shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Service Progress Images</CardTitle>
                      <CardDescription>Upload and manage vehicle service images for customers</CardDescription>
                    </div>
                    <Button onClick={() => setIsImageUploadDialogOpen(true)}>Upload Images</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Collapsible className="w-full">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="flex w-full justify-between p-4 rounded-lg border">
                        <span>Recent Image Uploads</span>
                        <span>▼</span>
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                        {sampleServiceImages.map((image, index) => (
                          <div key={index} className="border rounded-lg overflow-hidden">
                            <img 
                              src={image.url} 
                              alt={image.title} 
                              className="w-full h-40 object-cover"
                            />
                            <div className="p-2 bg-gray-50">
                              <h4 className="font-medium">{image.title}</h4>
                              <p className="text-sm text-gray-500">Uploaded today</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Dialog open={isReminderDialogOpen} onOpenChange={setIsReminderDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Service Reminder</DialogTitle>
            <DialogDescription>
              {selectedCustomer ? `Send a service reminder to ${selectedCustomer}` : "Create a new service reminder"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customer" className="text-right">
                Customer
              </Label>
              <div className="col-span-3">
                <Select defaultValue={selectedCustomer ? selectedCustomer : ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.name}>{customer.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="service" className="text-right">
                Service
              </Label>
              <div className="col-span-3">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oil-change">Oil Change</SelectItem>
                    <SelectItem value="general-service">General Service</SelectItem>
                    <SelectItem value="brake-service">Brake Service</SelectItem>
                    <SelectItem value="tire-rotation">Tire Rotation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Due Date
              </Label>
              <Input
                id="date"
                type="date"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="message" className="text-right pt-2">
                Message
              </Label>
              <Textarea
                id="message"
                className="col-span-3"
                placeholder="Your vehicle is due for service..."
                defaultValue="Your vehicle is due for a service soon. Please contact us to schedule an appointment at your earliest convenience."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReminderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={sendServiceReminder}>Send Reminder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Generate Invoice</DialogTitle>
            <DialogDescription>
              Create an invoice for the completed service
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customer-invoice" className="text-right">
                Customer
              </Label>
              <div className="col-span-3">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.name}>{customer.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="service-invoice" className="text-right">
                Service
              </Label>
              <div className="col-span-3">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oil-change">Oil Change ($45.99)</SelectItem>
                    <SelectItem value="general-service">General Service ($150.00)</SelectItem>
                    <SelectItem value="brake-service">Brake Service ($220.50)</SelectItem>
                    <SelectItem value="tire-rotation">Tire Rotation ($35.00)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <div className="col-span-3">
                <div className="flex items-center">
                  <span className="mr-2">$</span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    defaultValue="45.99"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="notes" className="text-right pt-2">
                Notes
              </Label>
              <Textarea
                id="notes"
                className="col-span-3"
                placeholder="Service details..."
                defaultValue="Oil change service with premium synthetic oil. Filter replaced. All fluid levels checked and topped up as needed."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInvoiceDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={generateInvoice}>Generate Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isImageUploadDialogOpen} onOpenChange={setIsImageUploadDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upload Service Progress Images</DialogTitle>
            <DialogDescription>
              Upload service progress images to share with the customer
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customer" className="text-right">
                Customer
              </Label>
              <div className="col-span-3">
                <Command className="border rounded-md">
                  <CommandInput placeholder="Search customer..." />
                  <CommandEmpty>No customer found.</CommandEmpty>
                  <CommandGroup className="max-h-[200px] overflow-y-auto">
                    {customers.map((customer) => {
                      const allUsers = Object.keys(localStorage)
                        .filter(key => key.startsWith('userData_'))
                        .map(key => {
                          const userId = key.replace('userData_', '');
                          const userData = JSON.parse(localStorage.getItem(key) || '{}');
                          return { id: userId, name: userData.fullName };
                        });
                      
                      return allUsers.map(user => (
                        <CommandItem 
                          key={user.id}
                          onSelect={() => handleSelectCustomer(user.id, user.name)}
                          className="cursor-pointer"
                        >
                          {user.name} {selectedCustomerId === user.id && "✓"}
                        </CommandItem>
                      ));
                    })}
                  </CommandGroup>
                </Command>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 mt-4">
              <Label>Available Images</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto border rounded-md p-3">
                {sampleServiceImages.map((image, index) => (
                  <div 
                    key={index} 
                    className={`border rounded-lg overflow-hidden cursor-pointer ${
                      selectedImages.some(img => img.url === image.url) ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => handleToggleImage(image)}
                  >
                    <div className="relative">
                      <img 
                        src={image.url} 
                        alt={image.title} 
                        className="w-full h-24 object-cover"
                      />
                      {selectedImages.some(img => img.url === image.url) && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                          ✓
                        </div>
                      )}
                    </div>
                    <div className="p-2 bg-gray-50">
                      <div className="flex items-center">
                        <Checkbox 
                          id={`image-${index}`}
                          checked={selectedImages.some(img => img.url === image.url)}
                          onCheckedChange={() => handleToggleImage(image)}
                          className="mr-2"
                        />
                        <Label htmlFor={`image-${index}`} className="text-sm">
                          {image.title}
                        </Label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4 mt-2">
              <Label htmlFor="selectedCount" className="text-right">
                Selected
              </Label>
              <div className="col-span-3">
                <p>{selectedImages.length} images selected</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImageUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImageUpload} disabled={selectedImages.length === 0 || !selectedCustomerId}>
              Upload Images
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Admin;
