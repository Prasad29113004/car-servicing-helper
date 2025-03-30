import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Calendar, CarFront, FileText, Settings, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

interface UserData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
}

// Mock data for vehicles
const userVehicles = [
  { id: 1, make: "Toyota", model: "Camry", year: 2018, licensePlate: "ABC123" },
  { id: 2, make: "Honda", model: "Civic", year: 2020, licensePlate: "XYZ789" }
];

// Mock data for service history
const serviceHistory = [
  { id: 1, date: "2023-06-15", service: "Oil Change", status: "Completed", amount: "$45.99" },
  { id: 2, date: "2023-04-02", service: "Brake Replacement", status: "Completed", amount: "$220.50" },
  { id: 3, date: "2023-02-18", service: "Tire Rotation", status: "Completed", amount: "$35.00" }
];

// Mock data for upcoming services
const upcomingServices = [
  { id: 1, date: "2023-09-20", service: "General Service", status: "Scheduled", amount: "$150.00" }
];

// Mock data for notifications
const notifications = [
  { id: 1, message: "Your car is due for service in 3 days", date: "2023-09-17", read: false },
  { id: 2, message: "Your recent service invoice is available", date: "2023-09-15", read: true },
  { id: 3, message: "Special discount on AC service this month", date: "2023-09-10", read: true }
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [userData, setUserData] = useState<UserData>({
    fullName: "",
    email: "",
    phone: "",
    address: ""
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check if user is logged in and load user data
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    
    // Load user data from localStorage
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, [navigate]);
  
  // Mark notification as read
  const markAsRead = (id: number) => {
    toast({
      title: "Notification marked as read",
      description: "The notification has been marked as read"
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-carservice-dark">Dashboard</h1>
            <p className="text-gray-500">Welcome back, User</p>
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
                    {upcomingServices.length > 0 ? (
                      <div>
                        <p className="font-medium">{upcomingServices[0].service}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(upcomingServices[0].date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          })}
                        </p>
                        <p className="mt-2 font-semibold text-carservice-blue">{upcomingServices[0].amount}</p>
                        <Button variant="outline" size="sm" className="mt-4">
                          Reschedule
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No upcoming services</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">My Vehicles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {userVehicles.map((vehicle) => (
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
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="mt-4">
                      Add Vehicle
                    </Button>
                  </CardContent>
                </Card>

                <Card className="shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Recent Service</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {serviceHistory.length > 0 ? (
                      <div>
                        <p className="font-medium">{serviceHistory[0].service}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(serviceHistory[0].date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          })}
                        </p>
                        <p className="mt-2 font-semibold text-carservice-blue">{serviceHistory[0].amount}</p>
                        <Button variant="outline" size="sm" className="mt-4">
                          View Invoice
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No service history</p>
                    )}
                  </CardContent>
                </Card>
              </div>

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
                        {serviceHistory.map((service) => (
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
            </TabsContent>

            <TabsContent value="vehicles" className="space-y-6">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>My Vehicles</CardTitle>
                  <CardDescription>Manage your registered vehicles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {userVehicles.map((vehicle) => (
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
                    ))}
                  </div>
                  <Button className="mt-6">
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
                  {upcomingServices.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingServices.map((service) => (
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
                    <p className="text-gray-500">No upcoming appointments</p>
                  )}
                  <Button className="mt-6">
                    Book New Appointment
                  </Button>
                </CardContent>
              </Card>

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
                        {serviceHistory.map((service) => (
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
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Your service alerts and updates</CardDescription>
                </CardHeader>
                <CardContent>
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
                    <Button variant="outline">
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
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
