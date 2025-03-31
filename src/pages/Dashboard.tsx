import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Calendar, CarFront, FileText, Settings, User, Upload, Image } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  vehicles?: Vehicle[];
  upcomingServices?: AppointmentData[];
  serviceHistory?: ServiceData[];
  notifications?: NotificationData[];
  serviceImages?: ServiceImage[];
}

interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
}

interface ServiceData {
  id: number;
  date: string;
  service: string;
  status: string;
  amount: string;
}

interface AppointmentData {
  id: number;
  date: string;
  service: string;
  status: string;
  amount: string;
}

interface NotificationData {
  id: number;
  message: string;
  date: string;
  read: boolean;
}

interface ServiceImage {
  url: string;
  title: string;
}

const carMakes = [
  "Maruti Suzuki", "Hyundai", "Tata", "Mahindra", "Honda", "Toyota", 
  "Kia", "MG", "Renault", "Ford", "Volkswagen", "Skoda"
];

const serviceTypes = [
  "Oil Change", "Brake Service", "Tire Rotation", "Engine Tune-Up",
  "General Service", "Battery Replacement", "AC Service", "Wheel Alignment"
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [userData, setUserData] = useState<UserData>({
    id: "",
    fullName: "",
    email: "",
    phone: "",
    address: "",
    vehicles: [],
    upcomingServices: [],
    serviceHistory: [],
    notifications: [],
    serviceImages: []
  });
  const [isAddVehicleDialogOpen, setIsAddVehicleDialogOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState<Omit<Vehicle, "id">>({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    licensePlate: ""
  });
  const [isUpdateProfileOpen, setIsUpdateProfileOpen] = useState(false);
  const [updatedUserData, setUpdatedUserData] = useState<UserData>({
    id: "",
    fullName: "",
    email: "",
    phone: "",
    address: ""
  });
  const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);
  const [isViewImageOpen, setIsViewImageOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ServiceImage | null>(null);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isBookServiceOpen, setIsBookServiceOpen] = useState(false);
  const [newService, setNewService] = useState({
    vehicleId: "",
    serviceType: "",
    date: "",
    time: "10:00"
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    
    const currentUserId = localStorage.getItem("currentUserId");
    if (!currentUserId) {
      toast({
        title: "Session error",
        description: "Could not identify user session",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }
    
    const storedUserData = localStorage.getItem(`userData_${currentUserId}`);
    if (storedUserData) {
      const parsedData = JSON.parse(storedUserData);
      parsedData.vehicles = parsedData.vehicles || [];
      parsedData.upcomingServices = parsedData.upcomingServices || [];
      parsedData.serviceHistory = parsedData.serviceHistory || [];
      parsedData.notifications = parsedData.notifications || [];
      parsedData.serviceImages = parsedData.serviceImages || [];
      
      setUserData(parsedData);
      setUpdatedUserData(parsedData);
      
      setNotifications(parsedData.notifications || []);
    } else {
      toast({
        title: "Error loading profile",
        description: "Could not find your profile data",
        variant: "destructive"
      });
    }
  }, [navigate, toast]);
  
  const markAsRead = (id: number) => {
    const updatedNotifications = notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    );
    setNotifications(updatedNotifications);
    
    const updatedUserData = { ...userData, notifications: updatedNotifications };
    
    const currentUserId = localStorage.getItem("currentUserId");
    if (currentUserId) {
      localStorage.setItem(`userData_${currentUserId}`, JSON.stringify(updatedUserData));
      setUserData(updatedUserData);
    }
    
    toast({
      title: "Notification marked as read",
      description: "The notification has been marked as read"
    });
  };

  const handleAddVehicle = () => {
    const updatedUserData = { ...userData };
    const vehicles = updatedUserData.vehicles || [];
    
    const newVehicleWithId = {
      ...newVehicle,
      id: vehicles.length > 0 ? Math.max(...vehicles.map(v => v.id)) + 1 : 1
    };
    
    updatedUserData.vehicles = [...vehicles, newVehicleWithId];
    
    if (vehicles.length === 0) {
      const vehicleNotification = {
        id: notifications.length > 0 ? Math.max(...notifications.map(n => n.id)) + 1 : 1,
        message: `Your ${newVehicle.make} ${newVehicle.model} has been registered successfully`,
        date: new Date().toISOString().split('T')[0],
        read: false
      };
      
      updatedUserData.notifications = [...(notifications || []), vehicleNotification];
      setNotifications([...notifications, vehicleNotification]);
    }
    
    const currentUserId = localStorage.getItem("currentUserId");
    if (!currentUserId) {
      toast({
        title: "Session error",
        description: "Could not identify user session",
        variant: "destructive"
      });
      return;
    }
    
    localStorage.setItem(`userData_${currentUserId}`, JSON.stringify(updatedUserData));
    setUserData(updatedUserData);
    
    setNewVehicle({
      make: "",
      model: "",
      year: new Date().getFullYear(),
      licensePlate: ""
    });
    setIsAddVehicleDialogOpen(false);
    
    toast({
      title: "Vehicle added",
      description: `Your ${newVehicle.make} ${newVehicle.model} has been added to your profile`
    });
  };

  const handleUpdateProfile = () => {
    const currentUserId = localStorage.getItem("currentUserId");
    if (!currentUserId) {
      toast({
        title: "Session error",
        description: "Could not identify user session",
        variant: "destructive"
      });
      return;
    }
    
    localStorage.setItem(`userData_${currentUserId}`, JSON.stringify(updatedUserData));
    setUserData(updatedUserData);
    setIsUpdateProfileOpen(false);
    
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated"
    });
  };

  const handleImageUpload = () => {
    const mockImages = [
      { url: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=500&auto=format&fit=crop&q=60", title: "Engine Service" },
      { url: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500&auto=format&fit=crop&q=60", title: "Brake Inspection" }
    ];
    
    const updatedUserData = { ...userData, serviceImages: mockImages };
    
    const currentUserId = localStorage.getItem("currentUserId");
    if (currentUserId) {
      localStorage.setItem(`userData_${currentUserId}`, JSON.stringify(updatedUserData));
      setUserData(updatedUserData);
      
      const newNotification = {
        id: (notifications.length > 0 ? Math.max(...notifications.map(n => n.id)) + 1 : 1),
        message: "Service progress images have been shared with you",
        date: new Date().toISOString().split('T')[0],
        read: false
      };
      
      const updatedNotifications = [...notifications, newNotification];
      setNotifications(updatedNotifications);
      
      updatedUserData.notifications = updatedNotifications;
      localStorage.setItem(`userData_${currentUserId}`, JSON.stringify(updatedUserData));
    }
    
    setIsImageUploadOpen(false);
    
    toast({
      title: "Images uploaded",
      description: "Service progress images have been shared with you"
    });
  };

  const handleBookService = () => {
    if (!newService.vehicleId || !newService.serviceType || !newService.date) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    const vehicle = userData.vehicles?.find(v => v.id.toString() === newService.vehicleId);
    if (!vehicle) {
      toast({
        title: "Error",
        description: "Vehicle not found",
        variant: "destructive"
      });
      return;
    }
    
    const updatedUserData = { ...userData };
    
    // Generate a new unique ID for the service
    const newId = updatedUserData.upcomingServices && updatedUserData.upcomingServices.length > 0
      ? Math.max(...updatedUserData.upcomingServices.map(s => s.id)) + 1
      : 1;
    
    // Create new appointment object
    const newAppointment: AppointmentData = {
      id: newId,
      service: newService.serviceType,
      date: newService.date,
      status: "Pending",
      amount: `₹${(Math.floor(Math.random() * 5000) + 1000).toFixed(2)}` // Random price for demo
    };
    
    // Add to user's upcoming services
    updatedUserData.upcomingServices = [
      ...(updatedUserData.upcomingServices || []),
      newAppointment
    ];
    
    // Create notification
    const newNotification = {
      id: (notifications.length > 0 ? Math.max(...notifications.map(n => n.id)) + 1 : 1),
      message: `Your ${newService.serviceType} appointment has been scheduled for ${new Date(newService.date).toLocaleDateString()}`,
      date: new Date().toISOString().split('T')[0],
      read: false
    };
    
    updatedUserData.notifications = [
      ...(updatedUserData.notifications || []),
      newNotification
    ];
    
    // Save to localStorage
    const currentUserId = localStorage.getItem("currentUserId");
    if (currentUserId) {
      localStorage.setItem(`userData_${currentUserId}`, JSON.stringify(updatedUserData));
      setUserData(updatedUserData);
      setNotifications([...notifications, newNotification]);
    }
    
    // Reset form and close dialog
    setNewService({
      vehicleId: "",
      serviceType: "",
      date: "",
      time: "10:00"
    });
    
    setIsBookServiceOpen(false);
    
    toast({
      title: "Service booked",
      description: `Your ${newService.serviceType} has been scheduled for ${new Date(newService.date).toLocaleDateString()}`
    });
    
    // Switch to appointments tab to show the new booking
    setActiveTab("appointments");
  };

  const viewImage = (image: ServiceImage) => {
    setSelectedImage(image);
    setIsViewImageOpen(true);
  };

  const hasUpcomingServices = () => {
    return userData.upcomingServices && userData.upcomingServices.length > 0;
  };

  const hasServiceHistory = () => {
    return userData.serviceHistory && userData.serviceHistory.length > 0;
  };

  const hasServiceImages = () => {
    return userData.serviceImages && userData.serviceImages.length > 0;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-carservice-dark">Dashboard</h1>
            <p className="text-gray-500">Welcome back, {userData.fullName}</p>
          </div>

          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-5 w-full max-w-3xl">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <FileText className="h-4 w-4" /> Overview
              </TabsTrigger>
              <TabsTrigger value="vehicles" className="flex items-center gap-2">
                <CarFront className="h-4 w-4" /> My Vehicles
              </TabsTrigger>
              <TabsTrigger value="appointments" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Appointments
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" /> Notifications
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" /> Profile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Upcoming Service</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {hasUpcomingServices() ? (
                      <div>
                        <p className="font-medium">{userData.upcomingServices![0].service}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(userData.upcomingServices![0].date).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          })}
                        </p>
                        <p className="mt-2 font-semibold text-carservice-blue">{userData.upcomingServices![0].amount}</p>
                        <Button variant="outline" size="sm" className="mt-4">
                          Reschedule
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6">
                        <p className="text-sm text-gray-500 mb-4">No upcoming services</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setIsBookServiceOpen(true)}
                        >
                          Book a Service
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">My Vehicles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {userData.vehicles && userData.vehicles.length > 0 ? (
                        userData.vehicles.map((vehicle) => (
                          <div key={vehicle.id} className="flex justify-between">
                            <div>
                              <p className="font-medium">
                                {vehicle.year} {vehicle.make} {vehicle.model}
                              </p>
                              <p className="text-sm text-gray-500">{vehicle.licensePlate}</p>
                            </div>
                            <Button variant="ghost" size="icon">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No vehicles added yet</p>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => setIsAddVehicleDialogOpen(true)}
                    >
                      Add Vehicle
                    </Button>
                  </CardContent>
                </Card>

                <Card className="shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Service Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {hasServiceImages() ? (
                      <div>
                        <div className="grid grid-cols-2 gap-2">
                          {userData.serviceImages!.slice(0, 2).map((img, index) => (
                            <div 
                              key={index} 
                              className="relative cursor-pointer" 
                              onClick={() => viewImage(img)}
                            >
                              <img 
                                src={img.url} 
                                alt={img.title} 
                                className="rounded-md w-full h-24 object-cover"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-1 rounded-b-md">
                                <p className="text-xs text-white truncate">{img.title}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          Latest service progress photos
                        </p>
                        {userData.serviceImages!.length > 2 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-2 w-full text-carservice-blue"
                            onClick={() => setActiveTab("service-images")}
                          >
                            View all {userData.serviceImages!.length} images
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6">
                        <p className="text-sm text-gray-500 mb-4">No service progress images yet</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setIsImageUploadOpen(true)}
                        >
                          View Demo Images
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {hasServiceHistory() ? (
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle>Service History</CardTitle>
                    <CardDescription>Your past service records</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-medium">Date</th>
                            <th className="text-left py-3 px-4 font-medium">Service</th>
                            <th className="text-left py-3 px-4 font-medium">Status</th>
                            <th className="text-left py-3 px-4 font-medium">Amount</th>
                            <th className="text-left py-3 px-4 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userData.serviceHistory!.map((service) => (
                            <tr key={service.id} className="border-b">
                              <td className="py-3 px-4">
                                {new Date(service.date).toLocaleDateString("en-IN", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric"
                                })}
                              </td>
                              <td className="py-3 px-4">{service.service}</td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                  {service.status}
                                </span>
                              </td>
                              <td className="py-3 px-4">{service.amount}</td>
                              <td className="py-3 px-4">
                                <Button variant="ghost" size="sm">
                                  View
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle>Service History</CardTitle>
                    <CardDescription>You don't have any service records yet</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center py-6">
                    <p className="text-gray-500 mb-4">Book your first service to start building your service history</p>
                    <Button 
                      variant="outline"
                      onClick={() => setIsBookServiceOpen(true)}
                    >
                      Book a Service
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="vehicles" className="space-y-6">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>My Vehicles</CardTitle>
                  <CardDescription>Manage your registered vehicles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {userData.vehicles && userData.vehicles.length > 0 ? (
                      userData.vehicles.map((vehicle) => (
                        <div key={vehicle.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="text-lg font-semibold">
                                {vehicle.year} {vehicle.make} {vehicle.model}
                              </h3>
                              <p className="text-sm text-gray-500">License Plate: {vehicle.licensePlate}</p>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                              <Button variant="outline" size="sm">
                                Service History
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No vehicles added yet. Add your first vehicle!</p>
                    )}
                  </div>
                  <Button 
                    className="mt-6"
                    onClick={() => setIsAddVehicleDialogOpen(true)}
                  >
                    Add New Vehicle
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appointments" className="space-y-6">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Upcoming Appointments</CardTitle>
                  <CardDescription>Your scheduled car services</CardDescription>
                </CardHeader>
                <CardContent>
                  {hasUpcomingServices() ? (
                    <div className="space-y-4">
                      {userData.upcomingServices!.map((service) => (
                        <div key={service.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="text-lg font-semibold">{service.service}</h3>
                              <p className="text-sm text-gray-500">
                                {new Date(service.date).toLocaleDateString("en-US", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric"
                                })}
                              </p>
                              <p className="mt-1 font-medium text-carservice-blue">{service.amount}</p>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                Reschedule
                              </Button>
                              <Button variant="outline" size="sm">
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6">
                      <p className="text-gray-500 mb-4">No upcoming appointments</p>
                      <Button variant="outline">Book a Service</Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {hasServiceHistory() ? (
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle>Past Appointments</CardTitle>
                    <CardDescription>Your service history</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-medium">Date</th>
                            <th className="text-left py-3 px-4 font-medium">Service</th>
                            <th className="text-left py-3 px-4 font-medium">Status</th>
                            <th className="text-left py-3 px-4 font-medium">Amount</th>
                            <th className="text-left py-3 px-4 font-medium">Invoice</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userData.serviceHistory!.map((service) => (
                            <tr key={service.id} className="border-b">
                              <td className="py-3 px-4">
                                {new Date(service.date).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric"
                                })}
                              </td>
                              <td className="py-3 px-4">{service.service}</td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                  {service.status}
                                </span>
                              </td>
                              <td className="py-3 px-4">{service.amount}</td>
                              <td className="py-3 px-4">
                                <Button variant="ghost" size="sm">
                                  <FileText className="h-4 w-4 mr-2" /> Download
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle>Past Appointments</CardTitle>
                    <CardDescription>You don't have any service history yet</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center py-6">
                    <p className="text-gray-500">Your completed services will appear here</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Your service alerts and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  {notifications && notifications.length > 0 ? (
                    <div className="space-y-4">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`p-4 border rounded-lg ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className={`${notification.read ? 'font-normal' : 'font-semibold'}`}>
                                {notification.message}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                {new Date(notification.date).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric"
                                })}
                              </p>
                            </div>
                            {!notification.read && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                              >
                                Mark as read
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6">
                      <p className="text-gray-500">No notifications yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Manage your account details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Full Name</label>
                        <p className="mt-1">{userData.fullName || "Not provided"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <p className="mt-1">{userData.email || "Not provided"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Phone Number</label>
                        <p className="mt-1">{userData.phone ? `+91 ${userData.phone}` : "Not provided"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Address</label>
                        <p className="mt-1">{userData.address || "Not provided"}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => setIsUpdateProfileOpen(true)}
                    >
                      Edit Information
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Manage your password and account security</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline">
                    Change Password
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="service-images" className="space-y-6">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Service Progress Images</CardTitle>
                  <CardDescription>View progress photos of your vehicle service</CardDescription>
                </CardHeader>
                <CardContent>
                  {hasServiceImages() ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {userData.serviceImages!.map((image, index) => (
                        <div 
                          key={index} 
                          className="border rounded-lg overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                          onClick={() => viewImage(image)}
                        >
                          <img 
                            src={image.url} 
                            alt={image.title} 
                            className="w-full h-40 object-cover"
                          />
                          <div className="p-3 bg-gray-50">
                            <h4 className="font-medium">{image.title}</h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Image className="h-16 w-16 text-gray-300 mb-4" />
                      <p className="text-gray-500 mb-2">No service images available yet</p>
                      <p className="text-sm text-gray-400 mb-6 text-center max-w-md">
                        Service progress images will be uploaded by our technicians during your vehicle service
                      </p>
                      <Button 
                        variant="outline"
                        onClick={() => setIsImageUploadOpen(true)}
                      >
                        View Demo Images
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Dialog open={isAddVehicleDialogOpen} onOpenChange={setIsAddVehicleDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Vehicle</DialogTitle>
            <DialogDescription>
              Add your vehicle details to manage services
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="make" className="text-right">
                Make
              </Label>
              <div className="col-span-3">
                <Select 
                  onValueChange={(value) => setNewVehicle({...newVehicle, make: value})}
                  value={newVehicle.make}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select car make" />
                  </SelectTrigger>
                  <SelectContent>
                    {carMakes.map((make) => (
                      <SelectItem key={make} value={make}>{make}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="model" className="text-right">
                Model
              </Label>
              <Input
                id="model"
                value={newVehicle.model}
                onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                className="col-span-3"
                placeholder="e.g. Swift, i20, Nexon"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="year" className="text-right">
                Year
              </Label>
              <Input
                id="year"
                type="number"
                value={newVehicle.year}
                onChange={(e) => setNewVehicle({...newVehicle, year: parseInt(e.target.value)})}
                className="col-span-3"
                min={1990}
                max={new Date().getFullYear()}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="licensePlate" className="text-right">
                License Plate
              </Label>
              <Input
                id="licensePlate"
                value={newVehicle.licensePlate}
                onChange={(e) => setNewVehicle({...newVehicle, licensePlate: e.target.value})}
                className="col-span-3"
                placeholder="e.g. KA01AB1234"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddVehicleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddVehicle}>Add Vehicle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isUpdateProfileOpen} onOpenChange={setIsUpdateProfileOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Profile</DialogTitle>
            <DialogDescription>
              Update your personal information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fullName" className="text-right">
                Full Name
              </Label>
              <Input
                id="fullName"
                value={updatedUserData.fullName}
                onChange={(e) => setUpdatedUserData({...updatedUserData, fullName: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={updatedUserData.email}
                onChange={(e) => setUpdatedUserData({...updatedUserData, email: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                value={updatedUserData.phone}
                onChange={(e) => setUpdatedUserData({...updatedUserData, phone: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Input
                id="address"
                value={updatedUserData.address}
                onChange={(e) => setUpdatedUserData({...updatedUserData, address: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateProfileOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProfile}>Update Profile</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isImageUploadOpen} onOpenChange={setIsImageUploadOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Service Progress Images</DialogTitle>
            <DialogDescription>
              View real-time updates from your mechanic
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex justify-center items-center h-40 border-2 border-dashed rounded-lg mb-4">
              <div className="text-center">
                <Upload className="mx-auto h-10 w-10 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Demo images will be shown</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImageUploadOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImageUpload}>View Demo Images</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewImageOpen} onOpenChange={setIsViewImageOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedImage?.title || "Service Image"}</DialogTitle>
          </DialogHeader>
          <div className="py-4 flex justify-center">
            {selectedImage && (
              <img 
                src={selectedImage.url} 
                alt={selectedImage.title} 
                className="max-h-[400px] object-contain rounded-md"
              />
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsViewImageOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isBookServiceOpen} onOpenChange={setIsBookServiceOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Book a Service</DialogTitle>
            <DialogDescription>
              Schedule a service appointment for your vehicle
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {userData.vehicles && userData.vehicles.length > 0 ? (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="vehicle" className="text-right">
                    Vehicle
                  </Label>
                  <div className="col-span-3">
                    <Select 
                      value={newService.vehicleId}
                      onValueChange={(value) => setNewService({...newService, vehicleId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {userData.vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                            {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="service" className="text-right">
                    Service Type
                  </Label>
                  <div className="col-span-3">
                    <Select 
                      value={newService.serviceType}
                      onValueChange={(value) => setNewService({...newService, serviceType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceTypes.map((service) => (
                          <SelectItem key={service} value={service}>
                            {service}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    className="col-span-3"
                    value={newService.date}
                    onChange={(e) => setNewService({...newService, date: e.target.value})}
                    min={new Date().toISOString().split('T')[0]} // Can't select dates in the past
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="time" className="text-right">
                    Time
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    className="col-span-3"
                    value={newService.time}
                    onChange={(e) => setNewService({...newService, time: e.target.value})}
                  />
                </div>
              </>
            ) : (
              <div className="py-4 text-center">
                <p className="text-gray-500 mb-4">You need to add a vehicle before booking a service</p>
                <Button 
                  onClick={() => {
                    setIsBookServiceOpen(false);
                    setIsAddVehicleDialogOpen(true);
                  }}
                >
                  Add Vehicle
                </Button>
              </div>
            )}
          </div>
          {userData.vehicles && userData.vehicles.length > 0 && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBookServiceOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBookService}>Book Service</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Dashboard;
