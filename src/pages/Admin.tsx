
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, FileText, Bell, User, CarFront, Clock, ImageIcon } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import RemindersSection from "@/components/admin/RemindersSection";
import { useToast } from "@/hooks/use-toast";

interface AppointmentData {
  id: string;
  customerId: string;
  customer: string;
  vehicle: string;
  services: string;
  date: string;
  time: string;
  status: string;
  price: string;
}

const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [todaysAppointments, setTodaysAppointments] = useState<AppointmentData[]>([]);
  const [allAppointments, setAllAppointments] = useState<AppointmentData[]>([]);
  const { toast } = useToast();

  // Load appointments on component mount
  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = () => {
    // Get all appointments from localStorage
    const appointments: AppointmentData[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key && key.startsWith('userData_')) {
        try {
          const userData = JSON.parse(localStorage.getItem(key) || '{}');
          
          if (userData.upcomingServices && Array.isArray(userData.upcomingServices)) {
            userData.upcomingServices.forEach((service: any) => {
              if (!service.id) return;
              
              const vehicleId = service.vehicleId;
              let vehicleInfo = "Unknown Vehicle";
              
              if (vehicleId && userData.vehicles) {
                const vehicle = userData.vehicles.find((v: any) => v.id.toString() === vehicleId.toString());
                if (vehicle) {
                  vehicleInfo = `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`;
                }
              }
              
              appointments.push({
                id: `${userData.id}_${service.id}`,
                customerId: userData.id,
                customer: userData.fullName,
                vehicle: vehicleInfo,
                services: service.service,
                date: service.date,
                time: service.time || "Unknown Time",
                status: service.status || "Pending",
                price: service.amount || "₹0.00"
              });
            });
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    }
    
    setAllAppointments(appointments);
    console.info("All appointments:", appointments);
    
    // Filter today's appointments
    const today = new Date().toISOString().split('T')[0];
    const todaysAppointments = appointments.filter(appointment => {
      console.info("Comparing", appointment.date, "with today", today);
      return appointment.date === today;
    });
    
    setTodaysAppointments(todaysAppointments);
    console.info("Today's date:", today);
    console.info("Today's appointments:", todaysAppointments);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-carservice-dark">Admin Dashboard</h1>
            <p className="text-gray-500">Manage your service center operations</p>
          </div>

          <div className="flex space-x-4 overflow-x-auto pb-4">
            <a 
              href="/admin" 
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                activeTab === "dashboard" ? "bg-carservice-dark text-white" : "bg-white text-gray-700"
              }`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("dashboard");
              }}
            >
              <FileText className="h-5 w-5" />
              <span>Dashboard</span>
            </a>
            <a 
              href="/admin/customers" 
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                activeTab === "customers" ? "bg-carservice-dark text-white" : "bg-white text-gray-700"
              }`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("customers");
              }}
            >
              <User className="h-5 w-5" />
              <span>Customers</span>
            </a>
            <a 
              href="/admin/appointments" 
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                activeTab === "appointments" ? "bg-carservice-dark text-white" : "bg-white text-gray-700"
              }`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("appointments");
              }}
            >
              <Calendar className="h-5 w-5" />
              <span>Appointments</span>
            </a>
            <a 
              href="/admin/reminders" 
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                activeTab === "reminders" ? "bg-carservice-dark text-white" : "bg-white text-gray-700"
              }`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("reminders");
              }}
            >
              <Bell className="h-5 w-5" />
              <span>Reminders</span>
            </a>
            <a 
              href="/admin/images" 
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                activeTab === "images" ? "bg-carservice-dark text-white" : "bg-white text-gray-700"
              }`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("images");
              }}
            >
              <ImageIcon className="h-5 w-5" />
              <span>Images</span>
            </a>
          </div>

          <div className="mt-6">
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold mb-4">Today's Appointments</h2>
                  {todaysAppointments.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Vehicle</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {todaysAppointments.map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell>{appointment.customer}</TableCell>
                            <TableCell>{appointment.vehicle}</TableCell>
                            <TableCell>{appointment.services}</TableCell>
                            <TableCell>{appointment.time}</TableCell>
                            <TableCell>
                              <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                                {appointment.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-gray-500">No appointments scheduled for today</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold">Pending Services</h3>
                      <CarFront className="h-5 w-5 text-blue-500" />
                    </div>
                    <p className="text-3xl font-bold">{allAppointments.filter(a => a.status === "Pending").length}</p>
                    <p className="text-sm text-gray-500 mt-2">Upcoming appointments</p>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold">In Progress</h3>
                      <Clock className="h-5 w-5 text-amber-500" />
                    </div>
                    <p className="text-3xl font-bold">{allAppointments.filter(a => a.status === "In Progress").length}</p>
                    <p className="text-sm text-gray-500 mt-2">Services in progress</p>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold">Completed</h3>
                      <Bell className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-3xl font-bold">{allAppointments.filter(a => a.status === "Completed").length}</p>
                    <p className="text-sm text-gray-500 mt-2">Completed services</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "customers" && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Customer Management</h2>
                <p className="text-gray-500 mb-4">View and manage your customers</p>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Vehicles</TableHead>
                      <TableHead>Last Service</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* This would be populated with actual customer data */}
                    <TableRow>
                      <TableCell>Prasad Nimje</TableCell>
                      <TableCell>prasadnimje2@gmail.com</TableCell>
                      <TableCell>7249439192</TableCell>
                      <TableCell>1</TableCell>
                      <TableCell>No services yet</TableCell>
                      <TableCell className="flex space-x-2">
                        <a href="#" className="text-blue-600 hover:text-blue-800">View</a>
                        <a href="#" className="text-blue-600 hover:text-blue-800">Edit</a>
                        <a href="#" className="text-blue-600 hover:text-blue-800">Remind</a>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Prasad Nimje</TableCell>
                      <TableCell>prasadnimje786@gmail.com</TableCell>
                      <TableCell>7249439192</TableCell>
                      <TableCell>0</TableCell>
                      <TableCell>No services yet</TableCell>
                      <TableCell className="flex space-x-2">
                        <a href="#" className="text-blue-600 hover:text-blue-800">View</a>
                        <a href="#" className="text-blue-600 hover:text-blue-800">Edit</a>
                        <a href="#" className="text-blue-600 hover:text-blue-800">Remind</a>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}

            {activeTab === "appointments" && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">All Appointments</h2>
                <p className="text-gray-500 mb-4">View and manage all scheduled appointments</p>
                
                {allAppointments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allAppointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>{appointment.customer}</TableCell>
                          <TableCell>{appointment.vehicle}</TableCell>
                          <TableCell>{appointment.services}</TableCell>
                          <TableCell>
                            {new Date(appointment.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{appointment.time}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                              {appointment.status}
                            </span>
                          </TableCell>
                          <TableCell>{appointment.price}</TableCell>
                          <TableCell className="flex space-x-2">
                            <a href="#" className="text-blue-600 hover:text-blue-800">Edit</a>
                            <a href="#" className="text-blue-600 hover:text-blue-800">Update</a>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-gray-500">No appointments found</p>
                )}
              </div>
            )}

            {activeTab === "reminders" && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <RemindersSection />
              </div>
            )}

            {activeTab === "images" && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Service Images</h2>
                <p className="text-gray-500 mb-4">Upload and manage service progress images</p>
                
                {/* Image upload functionality would go here */}
                <p className="text-gray-500">Image upload functionality coming soon</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
