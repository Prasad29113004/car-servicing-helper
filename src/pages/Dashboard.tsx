import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Plus, Car, Bell, Settings, Clock, CheckCircle } from "lucide-react";
import { ServiceProgress, ServiceTask } from "@/components/ServiceProgress";

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

  useEffect(() => {
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
  }, []);
  
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
            
            {userData?.serviceProgress && userData.serviceProgress.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Service Progress</h2>
                <div className="space-y-6">
                  {userData.serviceProgress.map((progress) => {
                    const vehicle = userData.vehicles?.find(v => v.id === progress.vehicleId);
                    return vehicle ? (
                      <ServiceProgress
                        key={progress.appointmentId}
                        vehicleName={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                        progress={progress.progress}
                        tasks={progress.tasks}
                        appointmentId={progress.appointmentId}
                        userId={userData.id} // Pass the user ID
                      />
                    ) : null;
                  })}
                </div>
              </div>
            )}

          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
