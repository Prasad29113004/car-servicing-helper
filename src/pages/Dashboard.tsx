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
import { Checkbox } from "@/components/ui/checkbox";

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
  vehicleId?: string | number;
  time?: string;
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
    serviceTypes: [] as string[],
    date: "",
    time: "10:00"
  });
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
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
    if (!newService.vehicleId || newService.serviceTypes.length === 0 || !newService.date) {
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
    
    newService.serviceTypes.forEach((serviceType, index) => {
      const newId = updatedUserData.upcomingServices && updatedUserData.upcomingServices.length > 0
        ? Math.max(...updatedUserData.upcomingServices.map(s => s.id)) + 1 + index
        : 1 + index;
      
      const newAppointment: AppointmentData = {
        id: newId,
        service: serviceType,
        date: newService.date,
        status: "Pending",
        amount: `₹${(Math.floor(Math.random() * 5000) + 1000).toFixed(2)}`
      };
      
      updatedUserData.upcomingServices = [
        ...(updatedUserData.upcomingServices || []),
        newAppointment
      ];
    });
    
    const servicesText = newService.serviceTypes.length > 1 
      ? `${newService.serviceTypes.length} services` 
      : newService.serviceTypes[0];
    
    const newNotification = {
      id: (notifications.length > 0 ? Math.max(...notifications.map(n => n.id)) + 1 : 1),
      message: `Your ${servicesText} appointment${newService.serviceTypes.length > 1 ? 's have' : ' has'} been scheduled for ${new Date(newService.date).toLocaleDateString()}`,
      date: new Date().toISOString().split('T')[0],
      read: false
    };
    
    updatedUserData.notifications = [
      ...(updatedUserData.notifications || []),
      newNotification
    ];
    
    const currentUserId = localStorage.getItem("currentUserId");
    if (currentUserId) {
      localStorage.setItem(`userData_${currentUserId}`, JSON.stringify(updatedUserData));
      setUserData(updatedUserData);
      setNotifications([...notifications, newNotification]);
    }
    
    setNewService({
      vehicleId: "",
      serviceTypes: [],
      date: "",
      time: "10:00"
    });
    
    setIsBookServiceOpen(false);
    
    toast({
      title: "Service booked",
      description: `Your ${servicesText} ${newService.serviceTypes.length > 1 ? 'have' : 'has'} been scheduled for ${new Date(newService.date).toLocaleDateString()}`
    });
    
    setActiveTab("appointments");
  };

  const handleServiceSelection = (value: string) => {
    setNewService(prev => {
      const updatedServiceTypes = prev.serviceTypes.includes(value)
        ? prev.serviceTypes.filter(type => type !== value)
        : [...prev.serviceTypes, value];
      
      return {
        ...prev,
        serviceTypes: updatedServiceTypes
      };
    });
  };

  const viewImage = (image: ServiceImage) => {
    setSelectedImage(image);
    setIsViewImageOpen(true);
  };

  const handleRescheduleClick = (appointment: AppointmentData) => {
    setSelectedAppointment(appointment);
    setRescheduleData({
      date: appointment.date,
      time: appointment.time || "10:00"
    });
    setIsRescheduleDialogOpen(true);
  };

  const handleCancelClick = (appointment: AppointmentData) => {
    setSelectedAppointment(appointment);
    setIsCancelDialogOpen(true);
  };

  const handleRescheduleSubmit = () => {
    if (!selectedAppointment || !rescheduleData.date) {
      toast({
        title: "Missing information",
        description: "Please select a valid date",
        variant: "destructive"
      });
      return;
    }

    const updatedUserData = { ...userData };
    
    if (updatedUserData.upcomingServices) {
      updatedUserData.upcomingServices = updatedUserData.upcomingServices.map(service => 
        service.id === selectedAppointment.id ? 
          { ...service, date: rescheduleData.date, time: rescheduleData.time } : 
          service
      );
    }

    const newNotification = {
      id: (notifications.length > 0 ? Math.max(...notifications.map(n => n.id)) + 1 : 1),
      message: `Your ${selectedAppointment.service} appointment has been rescheduled to ${new Date(rescheduleData.date).toLocaleDateString()} at ${rescheduleData.time}`,
      date: new Date().toISOString().split('T')[0],
      read: false
    };

    updatedUserData.notifications = [
      ...(updatedUserData.notifications || []),
      newNotification
    ];

    const currentUserId = localStorage.getItem("currentUserId");
    if (currentUserId) {
      localStorage.setItem(`userData_${currentUserId}`, JSON.stringify(updatedUserData));
      setUserData(updatedUserData);
      setNotifications([...notifications, newNotification]);
    }

    setIsRescheduleDialogOpen(false);
    setSelectedAppointment(null);

    toast({
      title: "Appointment rescheduled",
      description: `Your appointment has been rescheduled to ${new Date(rescheduleData.date).toLocaleDateString()} at ${rescheduleData.time}`
    });
  };

  const handleCancelAppointment = () => {
    if (!selectedAppointment) return;

    const updatedUserData = { ...userData };
    
    if (updatedUserData.upcomingServices) {
      updatedUserData.upcomingServices = updatedUserData.upcomingServices.filter(
        service => service.id !== selectedAppointment.id
      );
    }

    const newNotification = {
      id: (notifications.length > 0 ? Math.max(...notifications.map(n => n.id)) + 1 : 1),
      message: `Your ${selectedAppointment.service} appointment has been cancelled`,
      date: new Date().toISOString().split('T')[0],
      read: false
    };

    updatedUserData.notifications = [
      ...(updatedUserData.notifications || []),
      newNotification
    ];

    const currentUserId = localStorage.getItem("currentUserId");
    if (currentUserId) {
      localStorage.setItem(`userData_${currentUserId}`, JSON.stringify(updatedUserData));
      setUserData(updatedUserData);
      setNotifications([...notifications, newNotification]);
    }

    setIsCancelDialogOpen(false);
    setSelectedAppointment(null);

    toast({
      title: "Appointment cancelled",
      description: `Your ${selectedAppointment.service} appointment has been cancelled`
    });
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
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-4"
                          onClick={() => handleRescheduleClick(userData.upcomingServices![0])}
                        >
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
                                {service.time && ` at ${service.time}`}
                              </p>
                              <p className="mt-1 font-medium text-carservice-blue">{service.amount}</p>
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleRescheduleClick(service)}
                              >
                                Reschedule
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleCancelClick(service)}
                              >
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
                      <Button 
                        variant="outline"
                        onClick={() => setIsBookServiceOpen(true)}
                      >
                        Book a Service
                      </Button>
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
                      <p className="text-gray-500">You don't have any notifications</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Your personal information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <h3 className="font-semibold">Full Name</h3>
                      <p className="text-gray-600">{userData.fullName}</p>
                    </div>
                    <div className="grid gap-2">
                      <h3 className="font-semibold">Email Address</h3>
                      <p className="text-gray-600">{userData.email}</p>
                    </div>
                    <div className="grid gap-2">
                      <h3 className="font-semibold">Phone Number</h3>
                      <p className="text-gray-600">{userData.phone || "Not provided"}</p>
                    </div>
                    <div className="grid gap-2">
                      <h3 className="font-semibold">Address</h3>
                      <p className="text-gray-600">{userData.address || "Not provided"}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => setIsUpdateProfileOpen(true)}
                    >
                      Update Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />

      <Dialog open={isAddVehicleDialogOpen} onOpenChange={setIsAddVehicleDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add a Vehicle</DialogTitle>
            <DialogDescription>
              Enter the details of your vehicle to add it to your profile.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="make">Make</Label>
              <Select
                value={newVehicle.make}
                onValueChange={(value) => setNewVehicle({ ...newVehicle, make: value })}
              >
                <SelectTrigger id="make">
                  <SelectValue placeholder="Select Make" />
                </SelectTrigger>
                <SelectContent>
                  {carMakes.map((make) => (
                    <SelectItem key={make} value={make}>
                      {make}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={newVehicle.model}
                onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                placeholder="Enter model"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={newVehicle.year}
                onChange={(e) => setNewVehicle({ ...newVehicle, year: Number(e.target.value) })}
                placeholder="Enter year"
                min="1900"
                max={new Date().getFullYear() + 1}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="licensePlate">License Plate</Label>
              <Input
                id="licensePlate"
                value={newVehicle.licensePlate}
                onChange={(e) => setNewVehicle({ ...newVehicle, licensePlate: e.target.value })}
                placeholder="Enter license plate number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddVehicleDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleAddVehicle}>
              Add Vehicle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isUpdateProfileOpen} onOpenChange={setIsUpdateProfileOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Profile</DialogTitle>
            <DialogDescription>
              Update your personal information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={updatedUserData.fullName}
                onChange={(e) => setUpdatedUserData({ ...updatedUserData, fullName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={updatedUserData.email}
                onChange={(e) => setUpdatedUserData({ ...updatedUserData, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={updatedUserData.phone}
                onChange={(e) => setUpdatedUserData({ ...updatedUserData, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={updatedUserData.address}
                onChange={(e) => setUpdatedUserData({ ...updatedUserData, address: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateProfileOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleUpdateProfile}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isImageUploadOpen} onOpenChange={setIsImageUploadOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload Service Images</DialogTitle>
            <DialogDescription>
              This is a demo mode. Click upload to add sample images.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center">
              <Upload className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Drag & drop files or click to browse</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImageUploadOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleImageUpload}>
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewImageOpen} onOpenChange={setIsViewImageOpen}>
        <DialogContent className="sm:max-w-[425px] sm:max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedImage?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center py-4">
            {selectedImage && (
              <img 
                src={selectedImage.url} 
                alt={selectedImage.title} 
                className="max-w-full max-h-[60vh] rounded-md"
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewImageOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isBookServiceOpen} onOpenChange={setIsBookServiceOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Book a Service</DialogTitle>
            <DialogDescription>
              Schedule your next car service
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {userData.vehicles && userData.vehicles.length > 0 ? (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="vehicle">Select Vehicle</Label>
                  <Select
                    value={newService.vehicleId}
                    onValueChange={(value) => setNewService({ ...newService, vehicleId: value })}
                  >
                    <SelectTrigger id="vehicle">
                      <SelectValue placeholder="Choose a vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {userData.vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                          {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Select Services</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {serviceTypes.map((service) => (
                      <div className="flex items-center space-x-2" key={service}>
                        <Checkbox 
                          id={service} 
                          checked={newService.serviceTypes.includes(service)}
                          onCheckedChange={() => handleServiceSelection(service)}
                        />
                        <Label htmlFor={service} className="cursor-pointer">
                          {service}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newService.date}
                    onChange={(e) => setNewService({ ...newService, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Time</Label>
                  <Select
                    value={newService.time}
                    onValueChange={(value) => setNewService({ ...newService, time: value })}
                  >
                    <SelectTrigger id="time">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <p className="text-gray-500 mb-4">You need to add a vehicle first</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsBookServiceOpen(false);
                    setIsAddVehicleDialogOpen(true);
                  }}
                >
                  Add a Vehicle
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookServiceOpen(false)}>
              Cancel
            </Button>
            {userData.vehicles && userData.vehicles.length > 0 && (
              <Button type="submit" onClick={handleBookService}>
                Book Service
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Choose a new date and time for your service
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rescheduleDate">New Date</Label>
              <Input
                id="rescheduleDate"
                type="date"
                value={rescheduleData.date}
                onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rescheduleTime">New Time</Label>
              <Select
                value={rescheduleData.time}
                onValueChange={(value) => setRescheduleData({ ...rescheduleData, time: value })}
              >
                <SelectTrigger id="rescheduleTime">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRescheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleRescheduleSubmit}>
              Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedAppointment && (
              <div className="space-y-2">
                <p className="font-medium">{selectedAppointment.service}</p>
                <p className="text-sm text-gray-500">
                  {new Date(selectedAppointment.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}
                  {selectedAppointment.time && ` at ${selectedAppointment.time}`}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Go Back
            </Button>
            <Button variant="destructive" onClick={handleCancelAppointment}>
              Cancel Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
