
import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Plus, Car, Bell, Settings, Clock, CheckCircle, User } from "lucide-react";
import { ServiceProgress, ServiceTask } from "@/components/ServiceProgress";
import { useToast } from "@/hooks/use-toast";

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
          const storedData = localStorage.getItem(`userData_${userId}`);
          if (storedData) {
            const userData: UserData = JSON.parse(storedData);
            
            // Create vehicle if it doesn't exist already
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
              service: booking.services.join(", "),
              date: booking.date,
              time: booking.time,
              amount: booking.amount,
              status: "Scheduled",
              vehicleId: vehicleId,
            };

            // Update user data with new vehicle and appointment
            const updatedUserData = {
              ...userData,
              vehicles: [...(userData.vehicles || []), newVehicle],
              upcomingServices: [...(userData.upcomingServices || []), newAppointment],
            };

            // Save updated user data
            localStorage.setItem(`userData_${userId}`, JSON.stringify(updatedUserData));
            setUserData(updatedUserData);

            // Display success toast
            toast({
              title: "Booking data processed",
              description: "Your recent booking has been added to your account",
            });

            // Clear the booking data to prevent duplicates
            localStorage.removeItem("lastBooking");
          }
        }
      } catch (error) {
        console.error("Error processing booking data:", error);
      }
    }
  }, [toast]);
  
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
                        <a href="#" className="text-blue-500 hover:underline">View Details</a>
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
                userData.upcomingServices.map((service) => (
                  <Card key={service.id}>
                    <CardHeader>
                      <CardTitle>{service.service}</CardTitle>
                      <CardDescription>
                        {new Date(service.date).toLocaleDateString()} at {service.time}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>Amount: {service.amount}</p>
                      <p>Status: {service.status}</p>
                    </CardContent>
                    <CardFooter>
                      <Button>
                        <Clock className="mr-1 h-4 w-4" />
                        Manage
                      </Button>
                    </CardFooter>
                  </Card>
                ))
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
                      <CardDescription>{notification.date}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>
                        <a href="#" className="text-blue-500 hover:underline">View Details</a>
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
