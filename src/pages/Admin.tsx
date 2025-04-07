
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RemindersSection from "@/components/admin/RemindersSection";
import ImageManagement from "@/components/admin/ImageManagement";
import InvoiceManagement from "@/components/admin/InvoiceManagement";

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      toast({
        title: "Access Denied",
        description: "You must be logged in to access this page.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    try {
      if (userId === "admin_user") {
        setIsAdmin(true);
        return;
      }
      
      const userData = localStorage.getItem(`userData_${userId}`);
      if (userData) {
        const user = JSON.parse(userData);
        if (user.role === "admin") {
          setIsAdmin(true);
        } else {
          toast({
            title: "Access Denied",
            description: "You don't have permission to access this page.",
            variant: "destructive",
          });
          navigate("/dashboard");
        }
      } else {
        toast({
          title: "Access Denied",
          description: "User data not found.",
          variant: "destructive",
        });
        navigate("/login");
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      toast({
        title: "Error",
        description: "An error occurred while checking authorization.",
        variant: "destructive",
      });
      navigate("/login");
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 container max-w-6xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button onClick={() => navigate("/dashboard")}>Back to User Dashboard</Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full max-w-3xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="progress">Service Progress</TabsTrigger>
            <TabsTrigger value="reminders">Reminders</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="images">Image Management</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-medium mb-2">Booking Statistics</h3>
                <p className="text-gray-500 mb-4">All-time booking metrics</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Bookings</p>
                    <p className="text-2xl font-bold">87</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">This Month</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-medium mb-2">Revenue</h3>
                <p className="text-gray-500 mb-4">Financial overview</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-bold">₹1,24,500</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">This Month</p>
                    <p className="text-2xl font-bold">₹32,400</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-medium mb-2">Customers</h3>
                <p className="text-gray-500 mb-4">Customer statistics</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Customers</p>
                    <p className="text-2xl font-bold">45</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">New This Month</p>
                    <p className="text-2xl font-bold">8</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-medium mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <line x1="19" x2="19" y1="8" y2="14"></line>
                    <line x1="22" x2="16" y1="11" y2="11"></line>
                  </svg>
                  Add New Staff
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                    <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                    <line x1="2" x2="22" y1="10" y2="10"></line>
                  </svg>
                  View Payments
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <path d="M14 2v6h6"></path>
                    <path d="M16 13H8"></path>
                    <path d="M16 17H8"></path>
                    <path d="M10 9H8"></path>
                  </svg>
                  Generate Reports
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appointments">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-medium mb-4">Manage Appointments</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">ID</th>
                      <th className="border p-2 text-left">Customer</th>
                      <th className="border p-2 text-left">Service</th>
                      <th className="border p-2 text-left">Date & Time</th>
                      <th className="border p-2 text-left">Vehicle</th>
                      <th className="border p-2 text-left">Status</th>
                      <th className="border p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">AP-001</td>
                      <td className="border p-2">Amit Kumar</td>
                      <td className="border p-2">Full Service</td>
                      <td className="border p-2">2024-04-10 10:00 AM</td>
                      <td className="border p-2">Maruti Swift (KA-01-1234)</td>
                      <td className="border p-2"><span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">Confirmed</span></td>
                      <td className="border p-2 space-x-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="ghost" size="sm" className="text-red-500">Cancel</Button>
                      </td>
                    </tr>
                    <tr>
                      <td className="border p-2">AP-002</td>
                      <td className="border p-2">Priya Sharma</td>
                      <td className="border p-2">Oil Change</td>
                      <td className="border p-2">2024-04-11 09:30 AM</td>
                      <td className="border p-2">Honda City (KA-02-5678)</td>
                      <td className="border p-2"><span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">Pending</span></td>
                      <td className="border p-2 space-x-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="ghost" size="sm" className="text-red-500">Cancel</Button>
                      </td>
                    </tr>
                    <tr>
                      <td className="border p-2">AP-003</td>
                      <td className="border p-2">Rahul Verma</td>
                      <td className="border p-2">Wheel Alignment</td>
                      <td className="border p-2">2024-04-12 02:00 PM</td>
                      <td className="border p-2">Hyundai i20 (KA-03-4321)</td>
                      <td className="border p-2"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">In Progress</span></td>
                      <td className="border p-2 space-x-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="ghost" size="sm" className="text-red-500">Cancel</Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-between">
                <Button variant="outline">Previous</Button>
                <div className="flex items-center space-x-1">
                  <Button variant="outline" size="sm" className="w-8 h-8 p-0">1</Button>
                  <Button variant="ghost" size="sm" className="w-8 h-8 p-0">2</Button>
                  <Button variant="ghost" size="sm" className="w-8 h-8 p-0">3</Button>
                </div>
                <Button variant="outline">Next</Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="progress">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-medium mb-4">Service Progress</h3>
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-medium">Maruti Swift (KA-01-1234) - Full Service</h4>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">In Progress</span>
                  </div>
                  <p className="mb-2">Customer: Amit Kumar</p>
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Vehicle Inspection</span>
                      <span className="text-sm">Completed</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "100%" }}></div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Oil Change</span>
                      <span className="text-sm">Completed</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "100%" }}></div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Filter Replacement</span>
                      <span className="text-sm">In Progress</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "60%" }}></div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Final Inspection</span>
                      <span className="text-sm">Pending</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "0%" }}></div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button>Update Progress</Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-medium">Honda City (KA-02-5678) - Oil Change</h4>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">Completed</span>
                  </div>
                  <p className="mb-2">Customer: Priya Sharma</p>
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Vehicle Inspection</span>
                      <span className="text-sm">Completed</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: "100%" }}></div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Oil Change</span>
                      <span className="text-sm">Completed</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: "100%" }}></div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Final Inspection</span>
                      <span className="text-sm">Completed</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: "100%" }}></div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline">View Details</Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reminders">
            <RemindersSection />
          </TabsContent>
          
          <TabsContent value="invoices">
            <InvoiceManagement />
          </TabsContent>

          <TabsContent value="images">
            <ImageManagement />
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default Admin;
