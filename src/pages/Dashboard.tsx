
import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Plus, Car, Bell, Settings, Clock, CheckCircle, User } from "lucide-react";
import { ServiceProgress, ServiceTask } from "@/components/ServiceProgress";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { formatDistance } from "date-fns";

interface Vehicle {
  id: string;
  year: string;
  make: string;
  model: string;
  licensePlate: string;
}

interface UpcomingService {
  id: string;
  service: string;
  date: string;
  time: string;
  amount: string;
  status: string;
  vehicleId: string;
}

interface Notification {
  id: number;
  message: string;
  date: string;
  read: boolean;
  details?: {
    type: string;
    appointmentId?: string;
    vehicleId?: string;
  };
}

interface UserData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  vehicles?: Vehicle[];
  upcomingServices?: UpcomingService[];
  notifications?: Notification[];
  serviceProgress?: {
    appointmentId: string;
    vehicleId: string;
    progress: number;
    tasks: ServiceTask[];
  }[];
}

const Dashboard = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [relatedAppointment, setRelatedAppointment] = useState<UpcomingService | null>(null);
  const [relatedVehicle, setRelatedVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    // Load user data from localStorage
    const userId = localStorage.getItem("userId");
    if (userId) {
      const storedData = localStorage.getItem(`userData_${userId}`);
      if (storedData) {
        const parsedData: UserData = JSON.parse(storedData);
        setUserData(parsedData);
        
        // Calculate unread notifications
        const unread = parsedData.notifications?.filter(n => !n.read).length || 0;
        setUnreadCount(unread);
      }
    }

    // Check for booking form data and update
    const bookingData = localStorage.getItem("lastBooking");
    if (bookingData) {
      try {
        const booking = JSON.parse(bookingData);
        const userId = localStorage.getItem("userId");
        
        if (userId) {
          // Get current user data
          let userData: UserData;
          const storedData = localStorage.getItem(`userData_${userId}`);
          
          if (storedData) {
            userData = JSON.parse(storedData);
          } else {
            // Create new user data if none exists
            userData = {
              id: userId,
              fullName: booking.name || "Guest",
              email: booking.email || "",
              phone: booking.phone || "",
              vehicles: [],
              upcomingServices: [],
              notifications: [],
              serviceProgress: []
            };
          }
          
          // Create vehicle if it doesn't exist
          const vehicleId = `v-${Date.now()}`;
          const newVehicle = {
            id: vehicleId,
            year: booking.carYear || "",
            make: booking.carMake || "",
            model: booking.carModel || "",
            licensePlate: booking.licensePlate || `TMP-${Math.floor(Math.random() * 10000)}`,
          };
          
          // Create service appointment
          const appointmentId = `appt-${Date.now()}`;
          const newAppointment = {
            id: appointmentId,
            service: Array.isArray(booking.services) ? booking.services.join(", ") : booking.services,
            date: booking.date,
            time: booking.time,
            amount: booking.amount,
            status: "Scheduled",
            vehicleId: vehicleId,
          };
          
          // Update user profile information if available
          if (booking.name && booking.name.trim() !== "") {
            userData.fullName = booking.name;
          }
          if (booking.email && booking.email.trim() !== "") {
            userData.email = booking.email;
          }
          if (booking.phone && booking.phone.trim() !== "") {
            userData.phone = booking.phone;
          }

          // Add notification about new booking
          const newNotification = {
            id: Date.now(),
            message: `New appointment scheduled for ${newVehicle.year} ${newVehicle.make} ${newVehicle.model}`,
            date: new Date().toISOString(),
            read: false,
            details: {
              type: "appointment",
              appointmentId: appointmentId,
              vehicleId: vehicleId
            }
          };

          // Update user data with new vehicle, appointment and notification
          const updatedUserData = {
            ...userData,
            vehicles: [...(userData.vehicles || []), newVehicle],
            upcomingServices: [...(userData.upcomingServices || []), newAppointment],
            notifications: [...(userData.notifications || []), newNotification]
          };

          // Save updated user data
          localStorage.setItem(`userData_${userId}`, JSON.stringify(updatedUserData));
          
          // Update state
          setUserData(updatedUserData);
          setUnreadCount((prev) => prev + 1);

          // Display success toast
          toast({
            title: "Booking data processed",
            description: "Your recent booking has been added to your account",
          });

          // Clear the booking data to prevent duplicates
          localStorage.removeItem("lastBooking");
        }
      } catch (error) {
        console.error("Error processing booking data:", error);
        toast({
          title: "Error processing booking data",
          description: "Please try again or contact support",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  // Handle viewing notification details
  const handleViewDetails = (notification: Notification) => {
    setSelectedNotification(notification);
    
    // Mark notification as read
    if (!notification.read && userData) {
      const updatedNotifications = userData.notifications?.map(n => 
        n.id === notification.id ? {...n, read: true} : n
      );
      
      const updatedUserData = {
        ...userData,
        notifications: updatedNotifications
      };
      
      // Update localStorage
      localStorage.setItem(`userData_${userData.id}`, JSON.stringify(updatedUserData));
      
      // Update state
      setUserData(updatedUserData);
      setUnreadCount(prev => prev > 0 ? prev - 1 : 0);
    }
    
    // Find related appointment and vehicle if they exist
    if (notification.details) {
      if (notification.details.appointmentId) {
        const appointment = userData?.upcomingServices?.find(
          service => service.id === notification.details?.appointmentId
        );
        setRelatedAppointment(appointment || null);
        
        // Find vehicle related to appointment
        if (appointment) {
          const vehicle = userData?.vehicles?.find(v => v.id === appointment.vehicleId);
          setRelatedVehicle(vehicle || null);
        }
      } else if (notification.details.vehicleId) {
        const vehicle = userData?.vehicles?.find(v => v.id === notification.details.vehicleId);
        setRelatedVehicle(vehicle || null);
      }
    }
    
    setIsDialogOpen(true);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistance(date, new Date(), { addSuffix: true });
    } catch (e) {
      return dateString;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, {userData?.fullName || "Guest"}</h1>
              <p className="text-gray-600">Manage your vehicles and service history</p>
            </div>
            <div>
              <Button onClick={() => window.location.href = "/booking"}>
                <Plus className="mr-1 h-4 w-4" />
                Book Service
              </Button>
            </div>
          </div>

          <Tabs defaultValue="vehicles" className="space-y-6">
            <TabsList>
              <TabsTrigger value="vehicles" className="flex items-center">
                <Car className="mr-1 h-4 w-4" />
                Vehicles
              </TabsTrigger>
              <TabsTrigger value="appointments" className="flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                Appointments
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center">
                <Bell className="mr-1 h-4 w-4" />
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                Progress
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center">
                <User className="mr-1 h-4 w-4" />
                Profile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="vehicles" className="space-y-4">
              {userData?.vehicles && userData.vehicles.length > 0 ? (
                userData.vehicles.map((vehicle) => (
                  <Card key={vehicle.id}>
                    <CardHeader>
                      <CardTitle>{vehicle.year} {vehicle.make} {vehicle.model}</CardTitle>
                      <CardDescription>License Plate: {vehicle.licensePlate}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>
                        <Button 
                          variant="link" 
                          className="text-blue-500 p-0 hover:underline"
                          onClick={() => {
                            setSelectedNotification(null);
                            setRelatedVehicle(vehicle);
                            setRelatedAppointment(null);
                            setIsDialogOpen(true);
                          }}
                        >
                          View Details
                        </Button>
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent>
                    <p className="text-gray-500">No vehicles added yet.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="appointments" className="space-y-4">
              {userData?.upcomingServices && userData.upcomingServices.length > 0 ? (
                userData.upcomingServices.map((service) => {
                  const vehicle = userData.vehicles?.find(v => v.id === service.vehicleId);
                  return (
                    <Card key={service.id}>
                      <CardHeader>
                        <CardTitle>{service.service}</CardTitle>
                        <CardDescription>
                          {service.date} at {service.time}
                          {vehicle && (
                            <span className="block mt-1 text-sm">
                              Vehicle: {vehicle.year} {vehicle.make} {vehicle.model}
                            </span>
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>Amount: {service.amount}</p>
                        <p>Status: {service.status}</p>
                      </CardContent>
                      <CardFooter>
                        <Button
                          onClick={() => {
                            setSelectedNotification(null);
                            setRelatedAppointment(service);
                            setRelatedVehicle(vehicle || null);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Clock className="mr-1 h-4 w-4" />
                          Manage
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })
              ) : (
                <Card>
                  <CardContent>
                    <p className="text-gray-500">No upcoming appointments.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              {userData?.notifications && userData.notifications.length > 0 ? (
                userData.notifications.map((notification) => (
                  <Card key={notification.id} className={!notification.read ? "bg-blue-50" : ""}>
                    <CardHeader>
                      <CardTitle>
                        {notification.message}
                        {!notification.read && (
                          <span className="ml-2 text-xs text-blue-500">New</span>
                        )}
                      </CardTitle>
                      <CardDescription>{formatDate(notification.date)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>
                        <Button 
                          variant="link" 
                          className="text-blue-500 p-0 hover:underline"
                          onClick={() => handleViewDetails(notification)}
                        >
                          View Details
                        </Button>
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent>
                    <p className="text-gray-500">No notifications yet.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="progress" className="space-y-4">
              {userData?.serviceProgress && userData.serviceProgress.length > 0 ? (
                userData.serviceProgress.map((progress) => {
                  const vehicle = userData.vehicles?.find(v => v.id === progress.vehicleId);
                  return vehicle ? (
                    <ServiceProgress
                      key={progress.appointmentId}
                      vehicleName={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      progress={progress.progress}
                      tasks={progress.tasks}
                      appointmentId={progress.appointmentId}
                      userId={userData.id} 
                    />
                  ) : null;
                })
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-gray-500">No service progress available yet.</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Active service appointments will appear here once they are being worked on.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Manage your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userData ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-medium">{userData.fullName || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{userData.email || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{userData.phone || "Not provided"}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">User information not available.</p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline">
                    <Settings className="mr-1 h-4 w-4" />
                    Edit Profile
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Notification Details Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {selectedNotification ? "Notification Details" : 
                   relatedAppointment ? "Appointment Details" : "Vehicle Details"}
                </DialogTitle>
                <DialogDescription>
                  {selectedNotification?.message || "View detailed information"}
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                {/* Vehicle Details Section */}
                {relatedVehicle && (
                  <div className="mb-4 p-4 border rounded-md">
                    <h3 className="font-semibold text-lg mb-2">Vehicle Information</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-gray-500">Make</p>
                        <p>{relatedVehicle.make}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Model</p>
                        <p>{relatedVehicle.model}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Year</p>
                        <p>{relatedVehicle.year}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">License Plate</p>
                        <p>{relatedVehicle.licensePlate}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Appointment Details Section */}
                {relatedAppointment && (
                  <div className="mb-4 p-4 border rounded-md">
                    <h3 className="font-semibold text-lg mb-2">Appointment Details</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-gray-500">Service</p>
                        <p>{relatedAppointment.service}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p>{relatedAppointment.status}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p>{relatedAppointment.date}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Time</p>
                        <p>{relatedAppointment.time}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Amount</p>
                        <p>{relatedAppointment.amount}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* If no related data */}
                {!relatedVehicle && !relatedAppointment && (
                  <p className="text-center text-gray-500 py-4">No additional details available</p>
                )}
              </div>
              
              <div className="flex justify-end">
                <DialogClose asChild>
                  <Button>Close</Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;

