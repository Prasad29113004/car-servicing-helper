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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { ServiceTask } from "@/components/ServiceProgress";
import { AlertCircle, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Vehicle {
  id: string;
  year: string;
  make: string;
  model: string;
  licensePlate: string;
}

interface Appointment {
  id: string;
  service: string;
  date: string;
  time: string;
  amount: string;
  status: string;
  vehicleId: string;
  userId: string;
  customerName?: string;
}

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [vehicles, setVehicles] = useState<{[key: string]: Vehicle}>({});
  const [customers, setCustomers] = useState<{[key: string]: string}>({});
  const [serviceProgress, setServiceProgress] = useState<{
    [key: string]: {
      progress: number;
      tasks: ServiceTask[];
      vehicleId: string;
      userId?: string;
    }
  }>({});
  
  // Dialog state
  const [editAppointmentId, setEditAppointmentId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editStatus, setEditStatus] = useState("");
  
  // Progress update dialog
  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [progressTasks, setProgressTasks] = useState<ServiceTask[]>([]);
  const [taskStatusUpdates, setTaskStatusUpdates] = useState<{[taskId: string]: "pending" | "in-progress" | "completed"}>({});

  // Clear data dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    checkAdminStatus();
    if (isAdmin) {
      loadAllAppointments();
    }
  }, [isAdmin]);

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

  const loadAllAppointments = () => {
    const userIds: string[] = [];
    const allVehicles: {[key: string]: Vehicle} = {};
    const allCustomers: {[key: string]: string} = {};
    const allAppointments: Appointment[] = [];
    const allProgress: {[key: string]: {
      progress: number;
      tasks: ServiceTask[];
      vehicleId: string;
      userId?: string;
    }} = {};
    
    // Find all user IDs
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('userData_') && !key.includes('admin')) {
        const userId = key.replace('userData_', '');
        userIds.push(userId);
      }
    }
    
    // Process each user's data
    userIds.forEach(userId => {
      try {
        const userData = localStorage.getItem(`userData_${userId}`);
        if (userData) {
          const user = JSON.parse(userData);
          
          if (user.fullName) {
            allCustomers[userId] = user.fullName;
          }
          
          if (user.vehicles && Array.isArray(user.vehicles)) {
            user.vehicles.forEach((vehicle: Vehicle) => {
              allVehicles[vehicle.id] = vehicle;
            });
          }
          
          if (user.upcomingServices && Array.isArray(user.upcomingServices)) {
            user.upcomingServices.forEach((appointment: Appointment) => {
              allAppointments.push({
                ...appointment,
                userId: userId,
                customerName: user.fullName || "Unknown Customer"
              });
            });
          }
          
          if (user.serviceProgress && Array.isArray(user.serviceProgress)) {
            user.serviceProgress.forEach((progress: any) => {
              const typedTasks: ServiceTask[] = Array.isArray(progress.tasks) ? 
                progress.tasks.map((task: any) => ({
                  ...task,
                  status: (task.status === "in-progress" || task.status === "pending" || task.status === "completed") 
                    ? task.status as "in-progress" | "pending" | "completed"
                    : "pending"
                })) : [];
              
              allProgress[progress.appointmentId] = {
                progress: progress.progress,
                tasks: typedTasks,
                vehicleId: progress.vehicleId,
                userId: userId
              };
            });
          }
        }
      } catch (error) {
        console.error(`Error loading user data for ${userId}:`, error);
      }
    });
    
    // Ensure all appointments have corresponding progress entries
    allAppointments.forEach(appointment => {
      if (!allProgress[appointment.id]) {
        // Create default progress for this appointment
        const defaultTasks: ServiceTask[] = generateTasksForService(appointment.service);
        
        allProgress[appointment.id] = {
          progress: 0,
          tasks: defaultTasks,
          vehicleId: appointment.vehicleId,
          userId: appointment.userId
        };
        
        // Update user data with this new progress
        try {
          const userData = localStorage.getItem(`userData_${appointment.userId}`);
          if (userData) {
            const user = JSON.parse(userData);
            const updatedUser = {
              ...user,
              serviceProgress: [
                ...(user.serviceProgress || []),
                {
                  appointmentId: appointment.id,
                  vehicleId: appointment.vehicleId,
                  progress: 0,
                  tasks: defaultTasks
                }
              ]
            };
            localStorage.setItem(`userData_${appointment.userId}`, JSON.stringify(updatedUser));
            console.log(`Created missing progress entry for appointment ${appointment.id}`);
          }
        } catch (error) {
          console.error(`Error updating progress data for ${appointment.userId}:`, error);
        }
      }
    });
    
    setAppointments(allAppointments);
    setVehicles(allVehicles);
    setCustomers(allCustomers);
    setServiceProgress(allProgress);
    
    console.log("Loaded service progress:", allProgress);
    console.log("Loaded appointments:", allAppointments);
  };

  // Helper function to generate tasks based on service name
  const generateTasksForService = (serviceName: string): ServiceTask[] => {
    const serviceTypes = serviceName.split(',').map(s => s.trim());
    const tasks: ServiceTask[] = [
      {
        id: `task-${Date.now()}-inspection`,
        title: "Vehicle Inspection",
        status: "pending",
        description: "Initial inspection of the vehicle"
      }
    ];
    
    // Add a task for each service type
    serviceTypes.forEach((service, index) => {
      tasks.push({
        id: `task-${Date.now()}-${index}`,
        title: service,
        status: "pending",
        description: "Main service work"
      });
    });
    
    // Add final inspection task
    tasks.push({
      id: `task-${Date.now()}-final`,
      title: "Final Inspection",
      status: "pending",
      description: "Final quality check"
    });
    
    return tasks;
  };

  const handleEditStatus = (appointmentId: string, currentStatus: string) => {
    setEditAppointmentId(appointmentId);
    setEditStatus(currentStatus);
    setIsEditDialogOpen(true);
  };

  const handleStatusUpdate = () => {
    const appointment = appointments.find(a => a.id === editAppointmentId);
    
    if (!appointment || !appointment.userId) {
      toast({
        title: "Error",
        description: "Appointment information not found",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const userData = localStorage.getItem(`userData_${appointment.userId}`);
      if (userData) {
        const user = JSON.parse(userData);
        
        if (user.upcomingServices && Array.isArray(user.upcomingServices)) {
          // Find the specific appointment to update
          const updatedServices = user.upcomingServices.map((service: any) => {
            if (service.id === editAppointmentId) {
              return {
                ...service,
                status: editStatus
              };
            }
            return service;
          });
          
          // Update user data with modified service status
          const updatedUserData = {
            ...user,
            upcomingServices: updatedServices
          };
          
          // Save updated user data back to localStorage
          localStorage.setItem(`userData_${appointment.userId}`, JSON.stringify(updatedUserData));
          
          // Update local state
          setAppointments(prevAppointments => 
            prevAppointments.map(a => 
              a.id === editAppointmentId ? {...a, status: editStatus} : a
            )
          );
          
          // Create default service progress if moving to "In Progress" status
          if (editStatus === "In Progress" && !serviceProgress[editAppointmentId]) {
            const defaultTasks: ServiceTask[] = [
              {
                id: `task-${Date.now()}-1`,
                title: "Vehicle Inspection",
                status: "in-progress",
                description: "Initial inspection of the vehicle"
              },
              {
                id: `task-${Date.now()}-2`,
                title: appointment.service.includes("Oil Change") ? "Oil Change" : 
                      appointment.service.includes("Wheel") ? "Wheel Service" : "Service Work",
                status: "pending",
                description: "Main service work"
              },
              {
                id: `task-${Date.now()}-3`,
                title: "Final Inspection",
                status: "pending",
                description: "Final quality check"
              }
            ];
            
            const newProgress = {
              appointmentId: editAppointmentId,
              vehicleId: appointment.vehicleId,
              progress: 15,
              tasks: defaultTasks
            };
            
            // Add the new progress to user data
            const updatedUserWithProgress = {
              ...updatedUserData,
              serviceProgress: [...(updatedUserData.serviceProgress || []), newProgress]
            };
            
            // Save updated user data with progress
            localStorage.setItem(`userData_${appointment.userId}`, JSON.stringify(updatedUserWithProgress));
            
            // Update local state for progress
            setServiceProgress(prev => ({
              ...prev,
              [editAppointmentId]: {
                progress: 15,
                tasks: defaultTasks,
                vehicleId: appointment.vehicleId,
                userId: appointment.userId
              }
            }));
          }
          
          // Add notification about status change
          const newNotification = {
            id: Date.now(),
            message: `Your appointment status has been updated to ${editStatus}`,
            date: new Date().toISOString(),
            read: false,
            details: {
              type: "appointment",
              appointmentId: editAppointmentId
            }
          };
          
          const updatedUserWithNotification = {
            ...updatedUserData,
            notifications: [...(updatedUserData.notifications || []), newNotification]
          };
          
          localStorage.setItem(`userData_${appointment.userId}`, JSON.stringify(updatedUserWithNotification));
          
          toast({
            title: "Status Updated",
            description: `Appointment status has been updated to ${editStatus}`
          });
        }
      }
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive"
      });
    }
    
    setIsEditDialogOpen(false);
  };

  const handleCancelAppointment = (appointmentId: string) => {
    const appointment = appointments.find(a => a.id === appointmentId);
    
    if (!appointment || !appointment.userId) {
      toast({
        title: "Error",
        description: "Appointment information not found",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const userData = localStorage.getItem(`userData_${appointment.userId}`);
      if (userData) {
        const user = JSON.parse(userData);
        
        if (user.upcomingServices && Array.isArray(user.upcomingServices)) {
          const updatedServices = user.upcomingServices.filter(
            (service: any) => service.id !== appointmentId
          );
          
          localStorage.setItem(`userData_${appointment.userId}`, JSON.stringify({
            ...user,
            upcomingServices: updatedServices
          }));
          
          setAppointments(prevAppointments => 
            prevAppointments.filter(a => a.id !== appointmentId)
          );
          
          const newNotification = {
            id: Date.now(),
            message: `Your appointment has been cancelled`,
            date: new Date().toISOString(),
            read: false,
            details: {
              type: "cancellation"
            }
          };
          
          user.notifications = [...(user.notifications || []), newNotification];
          localStorage.setItem(`userData_${appointment.userId}`, JSON.stringify(user));
          
          toast({
            title: "Appointment Cancelled",
            description: `The appointment has been cancelled`
          });
        }
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive"
      });
    }
  };

  const handleUpdateProgress = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    
    const progressData = serviceProgress[appointment.id];
    if (progressData) {
      setProgressTasks([...progressData.tasks]);
      
      const initialStatuses: {[taskId: string]: "pending" | "in-progress" | "completed"} = {};
      progressData.tasks.forEach(task => {
        initialStatuses[task.id] = task.status;
      });
      setTaskStatusUpdates(initialStatuses);
    } else {
      const defaultTasks = generateTasksForService(appointment.service);
      setProgressTasks(defaultTasks);
      
      const initialStatuses: {[taskId: string]: "pending" | "in-progress" | "completed"} = {};
      defaultTasks.forEach(task => {
        initialStatuses[task.id] = task.status;
      });
      setTaskStatusUpdates(initialStatuses);
    }
    
    setIsProgressDialogOpen(true);
  };

  const updateTaskStatus = (taskId: string, status: "pending" | "in-progress" | "completed") => {
    setTaskStatusUpdates(prev => ({
      ...prev,
      [taskId]: status
    }));
  };

  const calculateProgress = (tasks: ServiceTask[]): number => {
    if (!tasks.length) return 0;
    
    const completedCount = tasks.filter(task => task.status === "completed").length;
    const inProgressCount = tasks.filter(task => task.status === "in-progress").length;
    
    return Math.round((completedCount / tasks.length) * 100 + (inProgressCount / tasks.length) * 30);
  };

  const saveProgressUpdates = () => {
    if (!selectedAppointment) return;
    
    try {
      const updatedTasks: ServiceTask[] = progressTasks.map(task => ({
        ...task,
        status: taskStatusUpdates[task.id] || task.status,
        ...(taskStatusUpdates[task.id] === "completed" ? {
          completedDate: new Date().toISOString().split('T')[0],
          technician: "Admin Staff"
        } : {})
      }));
      
      const progress = calculateProgress(updatedTasks);
      
      const userData = localStorage.getItem(`userData_${selectedAppointment.userId}`);
      if (userData) {
        const user = JSON.parse(userData);
        let updatedUser = {...user};
        
        // Handle service progress update
        if (updatedUser.serviceProgress && Array.isArray(updatedUser.serviceProgress)) {
          const progressIndex = updatedUser.serviceProgress.findIndex(
            (p: any) => p.appointmentId === selectedAppointment.id
          );
          
          if (progressIndex >= 0) {
            // Update existing progress
            updatedUser.serviceProgress[progressIndex] = {
              ...updatedUser.serviceProgress[progressIndex],
              progress,
              tasks: updatedTasks
            };
          } else {
            // Add new progress entry
            updatedUser.serviceProgress.push({
              appointmentId: selectedAppointment.id,
              vehicleId: selectedAppointment.vehicleId,
              progress,
              tasks: updatedTasks
            });
          }
        } else {
          // Create new progress array
          updatedUser.serviceProgress = [{
            appointmentId: selectedAppointment.id,
            vehicleId: selectedAppointment.vehicleId,
            progress,
            tasks: updatedTasks
          }];
        }
        
        // Update appointment status if service is completed
        if (progress >= 100) {
          if (updatedUser.upcomingServices && Array.isArray(updatedUser.upcomingServices)) {
            updatedUser.upcomingServices = updatedUser.upcomingServices.map((service: any) => 
              service.id === selectedAppointment.id ? {...service, status: "Completed"} : service
            );
          }
          
          // Update local state for appointments
          setAppointments(prev => prev.map(a => 
            a.id === selectedAppointment.id ? {...a, status: "Completed"} : a
          ));
        }
        
        // Add notification for progress update
        const newNotification = {
          id: Date.now(),
          message: `Your service progress has been updated`,
          date: new Date().toISOString(),
          read: false,
          details: {
            type: "progress",
            appointmentId: selectedAppointment.id
          }
        };
        
        updatedUser.notifications = [...(updatedUser.notifications || []), newNotification];
        
        // Save all changes back to localStorage
        localStorage.setItem(`userData_${selectedAppointment.userId}`, JSON.stringify(updatedUser));
        
        // Update local state for service progress
        setServiceProgress(prev => ({
          ...prev,
          [selectedAppointment.id]: {
            progress,
            tasks: updatedTasks,
            vehicleId: selectedAppointment.vehicleId,
            userId: selectedAppointment.userId
          }
        }));
        
        toast({
          title: "Progress Updated",
          description: "Service progress has been successfully updated"
        });
      }
    } catch (error) {
      console.error("Error updating service progress:", error);
      toast({
        title: "Error",
        description: "Failed to update service progress",
        variant: "destructive"
      });
    }
    
    setIsProgressDialogOpen(false);
  };

  const handleClearAllData = () => {
    try {
      // Get all keys from localStorage
      const allKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) allKeys.push(key);
      }
      
      // Filter for user data, keeping admin data intact
      const userKeys = allKeys.filter(key => 
        key.startsWith('userData_') && 
        !key.includes('admin')
      );
      
      // Delete all user data
      userKeys.forEach(key => localStorage.removeItem(key));
      
      // Clear user-related shared data but preserve admin images
      const adminImages = localStorage.getItem('adminServiceImages');
      localStorage.removeItem('sharedServiceImages');
      
      if (adminImages) {
        const parsedImages = JSON.parse(adminImages);
        // Create a new version with only general images visible to all customers
        const generalImages = parsedImages.map((img: any) => ({
          ...img,
          customerId: 'all'
        }));
        localStorage.setItem('sharedServiceImages', JSON.stringify(generalImages));
      }
      
      // Reset state
      setAppointments([]);
      setVehicles({});
      setCustomers({});
      setServiceProgress({});
      
      toast({
        title: "Data Cleared",
        description: "All customer data has been successfully cleared",
      });
      
      // Force a storage event to notify other components
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error("Error clearing data:", error);
      toast({
        title: "Error",
        description: "Failed to clear customer data",
        variant: "destructive"
      });
    }
    
    setIsDeleteDialogOpen(false);
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
                    <p className="text-2xl font-bold">{appointments.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">This Month</p>
                    <p className="text-2xl font-bold">
                      {appointments.filter(a => {
                        const date = new Date(a.date);
                        const currentMonth = new Date().getMonth();
                        return date.getMonth() === currentMonth;
                      }).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-medium mb-2">Revenue</h3>
                <p className="text-gray-500 mb-4">Financial overview</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-bold">
                      ₹{appointments.reduce((acc, curr) => {
                        const amount = parseInt(curr.amount.replace(/[^0-9]/g, '')) || 0;
                        return acc + amount;
                      }, 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">This Month</p>
                    <p className="text-2xl font-bold">
                      ₹{appointments.filter(a => {
                        const date = new Date(a.date);
                        const currentMonth = new Date().getMonth();
                        return date.getMonth() === currentMonth;
                      }).reduce((acc, curr) => {
                        const amount = parseInt(curr.amount.replace(/[^0-9]/g, '')) || 0;
                        return acc + amount;
                      }, 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-medium mb-2">Customers</h3>
                <p className="text-gray-500 mb-4">Customer statistics</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Customers</p>
                    <p className="text-2xl font-bold">{Object.keys(customers).length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Active Services</p>
                    <p className="text-2xl font-bold">
                      {appointments.filter(a => a.status === "In Progress").length}
                    </p>
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
                
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex flex-col items-center justify-center bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="mb-2 h-5 w-5" />
                  Clear Customer Data
                </Button>
              </div>
            </div>
            
            <div className="mt-8">
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Clearing customer data will permanently remove all user accounts, vehicles, appointments, and service records. This action cannot be undone.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>

          <TabsContent value="appointments">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-medium mb-4">Manage Appointments</h3>
              {appointments.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.map((appointment) => {
                        const vehicle = vehicles[appointment.vehicleId];
                        return (
                          <TableRow key={`appointment-${appointment.id}`}>
                            <TableCell>{appointment.id}</TableCell>
                            <TableCell>{appointment.customerName || customers[appointment.userId] || "Unknown"}</TableCell>
                            <TableCell>{appointment.service}</TableCell>
                            <TableCell>{appointment.date} {appointment.time}</TableCell>
                            <TableCell>
                              {vehicle ? 
                                `${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})` : 
                                "Unknown Vehicle"}
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full ${
                                appointment.status === "Confirmed" ? "bg-green-100 text-green-800" :
                                appointment.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                                appointment.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                                appointment.status === "Completed" ? "bg-purple-100 text-purple-800" :
                                "bg-gray-100 text-gray-800"
                              }`}>
                                {appointment.status}
                              </span>
                            </TableCell>
                            <TableCell className="space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditStatus(appointment.id, appointment.status)}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-500"
                                onClick={() => handleCancelAppointment(appointment.id)}
                              >
                                Cancel
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-gray-500">No appointments found. Customers' appointments will appear here.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="progress">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-medium mb-4">Service Progress</h3>
              {appointments.filter(a => a.status === "In Progress" || a.status === "Completed").length > 0 ? (
                <div className="space-y-6">
                  {appointments
                    .filter(a => a.status === "In Progress" || a.status === "Completed")
                    .map(appointment => {
                      const vehicle = vehicles[appointment.vehicleId];
                      const progressData = serviceProgress[appointment.id];
                      const progress = progressData?.progress || 0;
                      
                      return (
                        <div key={`progress-${appointment.id}`} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-lg font-medium">
                              {vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})` : "Unknown Vehicle"} - {appointment.service}
                            </h4>
                            <span className={`px-2 py-1 rounded-full ${
                              appointment.status === "Completed" ? "bg-green-100 text-green-800" :
                              "bg-blue-100 text-blue-800"
                            }`}>
                              {appointment.status}
                            </span>
                          </div>
                          <p className="mb-2">Customer: {appointment.customerName || customers[appointment.userId] || "Unknown"}</p>
                          
                          {progressData && progressData.tasks ? (
                            <>
                              {progressData.tasks.map((task, index) => (
                                <div key={`task-${task.id}-${index}`} className="mb-4">
                                  <div className="flex justify-between mb-1">
                                    <span className="text-sm">{task.title}</span>
                                    <span className="text-sm">
                                      {task.status === "completed" ? "Completed" : 
                                       task.status === "in-progress" ? "In Progress" : "Pending"}
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className={`h-2 rounded-full ${
                                      task.status === "completed" ? "bg-green-600" : 
                                      task.status === "in-progress" ? "bg-blue-600" : "bg-gray-300"
                                    }`} style={{ 
                                      width: task.status === "completed" ? "100%" : 
                                             task.status === "in-progress" ? "60%" : "0%" 
                                    }}></div>
                                  </div>
                                </div>
                              ))}
                            </>
                          ) : (
                            <p className="text-gray-500 mb-2">No progress data available</p>
                          )}
                          
                          <div className="mt-4">
                            <Button onClick={() => handleUpdateProgress(appointment)}>
                              Update Progress
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-gray-500">No active services. Services in progress will appear here.</p>
                </div>
              )}
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
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Appointment Status</DialogTitle>
            <DialogDescription>
              Change the status of this appointment
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={editStatus} onValueChange={setEditStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleStatusUpdate}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isProgressDialogOpen} onOpenChange={setIsProgressDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Update Service Progress</DialogTitle>
            <DialogDescription>
              Update the status of each task in this service
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {progressTasks.map((task) => (
              <div key={task.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="font-medium">{task.title}</p>
                  <Select 
                    value={taskStatusUpdates[task.id] || task.status} 
                    onValueChange={(value: "pending" | "in-progress" | "completed") => updateTaskStatus(task.id, value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {task.description && (
                  <p className="text-sm text-gray-500">{task.description}</p>
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={saveProgressUpdates}>Save Progress</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Clear Data Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Customer Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete all customer accounts, vehicles, appointments, and service records. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAllData}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete All Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
