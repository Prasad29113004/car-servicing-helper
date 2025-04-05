import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, FileText, Bell, User, CarFront, Clock, ImageIcon, Tool, Upload, CheckCircle, CircleDashed, CircleDot } from "lucide-react";
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ServiceTask } from "@/components/ServiceProgress";

interface AppointmentData {
  id: string;
  customerId: string;
  customer: string;
  vehicle: string;
  vehicleId?: string;
  services: string;
  date: string;
  time: string;
  status: string;
  price: string;
}

interface UserData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  vehicles?: any[];
  upcomingServices?: any[];
  notifications?: any[];
  serviceProgress?: {
    appointmentId: string;
    vehicleId: string;
    progress: number;
    tasks: ServiceTask[];
  }[];
}

const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [todaysAppointments, setTodaysAppointments] = useState<AppointmentData[]>([]);
  const [allAppointments, setAllAppointments] = useState<AppointmentData[]>([]);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null);
  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [selectedServiceProgress, setSelectedServiceProgress] = useState<{
    userId: string;
    appointmentId: string;
    vehicleId: string;
    progress: number;
    tasks: ServiceTask[];
  } | null>(null);
  const [newTaskData, setNewTaskData] = useState<{
    title: string;
    description: string;
    status: "pending" | "in-progress" | "completed";
    technician: string;
  }>({
    title: "",
    description: "",
    status: "pending",
    technician: ""
  });
  const [selectedTask, setSelectedTask] = useState<ServiceTask | null>(null);
  const [newImageData, setNewImageData] = useState({
    title: "",
    url: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const users: UserData[] = [];
    const appointments: AppointmentData[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key && key.startsWith('userData_')) {
        try {
          const userData = JSON.parse(localStorage.getItem(key) || '{}');
          users.push(userData);
          
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
                vehicleId: vehicleId,
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
    
    setAllUsers(users);
    setAllAppointments(appointments);
    console.info("All appointments:", appointments);
    
    const today = new Date().toISOString().split('T')[0];
    const todaysAppointments = appointments.filter(appointment => {
      return appointment.date === today;
    });
    
    setTodaysAppointments(todaysAppointments);
  };

  const openProgressDialog = (appointment: AppointmentData) => {
    if (!appointment.customerId || !appointment.vehicleId) {
      toast({
        title: "Error",
        description: "Missing customer or vehicle information",
        variant: "destructive"
      });
      return;
    }

    const userData = allUsers.find(user => user.id === appointment.customerId);
    if (!userData) {
      toast({
        title: "Error",
        description: "Customer data not found",
        variant: "destructive"
      });
      return;
    }

    let serviceProgress = userData.serviceProgress?.find(
      p => p.appointmentId === appointment.id
    );

    if (!serviceProgress) {
      serviceProgress = {
        appointmentId: appointment.id,
        vehicleId: appointment.vehicleId,
        progress: 0,
        tasks: []
      };
    }

    setSelectedAppointment(appointment);
    setSelectedServiceProgress({
      userId: appointment.customerId,
      ...serviceProgress
    });
    setIsProgressDialogOpen(true);
  };

  const saveServiceProgress = () => {
    if (!selectedServiceProgress || !selectedAppointment) return;

    const userData = JSON.parse(
      localStorage.getItem(`userData_${selectedServiceProgress.userId}`) || '{}'
    );

    let serviceProgress = userData.serviceProgress || [];
    const existingIndex = serviceProgress.findIndex(
      (p: any) => p.appointmentId === selectedServiceProgress.appointmentId
    );

    if (existingIndex >= 0) {
      serviceProgress[existingIndex] = {
        appointmentId: selectedServiceProgress.appointmentId,
        vehicleId: selectedServiceProgress.vehicleId,
        progress: selectedServiceProgress.progress,
        tasks: selectedServiceProgress.tasks
      };
    } else {
      serviceProgress.push({
        appointmentId: selectedServiceProgress.appointmentId,
        vehicleId: selectedServiceProgress.vehicleId,
        progress: selectedServiceProgress.progress,
        tasks: selectedServiceProgress.tasks
      });
    }

    const newStatus = selectedServiceProgress.progress >= 100 ? "Completed" : 
                    selectedServiceProgress.progress > 0 ? "In Progress" : "Pending";

    userData.serviceProgress = serviceProgress;

    if (userData.upcomingServices) {
      const appointmentIdParts = selectedAppointment.id.split('_');
      const serviceId = appointmentIdParts.length > 1 ? appointmentIdParts[1] : null;
      
      if (serviceId) {
        const serviceIndex = userData.upcomingServices.findIndex((s: any) => s.id.toString() === serviceId);
        if (serviceIndex >= 0) {
          userData.upcomingServices[serviceIndex].status = newStatus;
        }
      }
    }

    const newNotification = {
      id: (userData.notifications?.length || 0) + 1,
      message: `Your service status has been updated to "${newStatus}"`,
      date: new Date().toISOString().split('T')[0],
      read: false
    };

    userData.notifications = [...(userData.notifications || []), newNotification];

    localStorage.setItem(`userData_${selectedServiceProgress.userId}`, JSON.stringify(userData));

    loadData();
    
    setIsProgressDialogOpen(false);
    
    toast({
      title: "Progress updated",
      description: `Service progress for ${selectedAppointment.customer} has been updated`
    });
  };

  const openTaskDialog = (task?: ServiceTask) => {
    if (task) {
      setSelectedTask(task);
      setNewTaskData({
        title: task.title,
        description: task.description || "",
        status: task.status,
        technician: task.technician || ""
      });
    } else {
      setSelectedTask(null);
      setNewTaskData({
        title: "",
        description: "",
        status: "pending",
        technician: ""
      });
    }
    setIsTaskDialogOpen(true);
  };

  const saveTaskData = () => {
    if (!selectedServiceProgress) return;
    
    const tasks = [...selectedServiceProgress.tasks];
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    
    if (selectedTask) {
      const taskIndex = tasks.findIndex(t => t.id === selectedTask.id);
      if (taskIndex >= 0) {
        tasks[taskIndex] = {
          ...selectedTask,
          title: newTaskData.title,
          description: newTaskData.description,
          status: newTaskData.status,
          technician: newTaskData.technician,
          completedDate: newTaskData.status === "completed" ? formattedDate : selectedTask.completedDate
        };
      }
    } else {
      const newTask: ServiceTask = {
        id: `task_${Date.now()}`,
        title: newTaskData.title,
        description: newTaskData.description,
        status: newTaskData.status,
        technician: newTaskData.technician,
        completedDate: newTaskData.status === "completed" ? formattedDate : undefined,
        images: []
      };
      tasks.push(newTask);
    }
    
    const progressPercentage = tasks.length > 0 ? Math.round((tasks.filter(task => task.status === "completed").length / tasks.length) * 100) : 0;
    
    setSelectedServiceProgress({
      ...selectedServiceProgress,
      tasks,
      progress: progressPercentage
    });
    
    setIsTaskDialogOpen(false);
    
    toast({
      title: selectedTask ? "Task updated" : "Task added",
      description: `Task "${newTaskData.title}" has been ${selectedTask ? "updated" : "added"}`
    });
  };

  const openImageDialog = (task: ServiceTask) => {
    setSelectedTask(task);
    setNewImageData({
      title: "",
      url: ""
    });
    setIsImageDialogOpen(true);
  };

  const saveImageData = () => {
    if (!selectedServiceProgress || !selectedTask) return;
    
    const imageUrl = newImageData.url || "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=500&auto=format&fit=crop&q=60";
    
    const tasks = [...selectedServiceProgress.tasks];
    const taskIndex = tasks.findIndex(t => t.id === selectedTask.id);
    
    if (taskIndex >= 0) {
      const updatedTask = {
        ...tasks[taskIndex],
        images: [
          ...(tasks[taskIndex].images || []),
          {
            url: imageUrl,
            title: newImageData.title
          }
        ]
      };
      
      tasks[taskIndex] = updatedTask;
      
      setSelectedServiceProgress({
        ...selectedServiceProgress,
        tasks
      });
      
      setIsImageDialogOpen(false);
      
      toast({
        title: "Image added",
        description: `Image "${newImageData.title}" has been added to the task`
      });
    }
  };

  const calculateOverallProgress = (appointment: AppointmentData) => {
    if (!appointment.customerId) return 0;
    
    const userData = allUsers.find(user => user.id === appointment.customerId);
    if (!userData) return 0;
    
    const serviceProgress = userData.serviceProgress?.find(
      p => p.appointmentId === appointment.id
    );
    
    return serviceProgress?.progress || 0;
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
              href="/admin/service-progress" 
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                activeTab === "service-progress" ? "bg-carservice-dark text-white" : "bg-white text-gray-700"
              }`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("service-progress");
              }}
            >
              <Tool className="h-5 w-5" />
              <span>Service Progress</span>
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
                          <TableHead>Progress</TableHead>
                          <TableHead>Actions</TableHead>
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
                            <TableCell>
                              <div className="w-32">
                                <Progress value={calculateOverallProgress(appointment)} className="h-2" />
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => openProgressDialog(appointment)}
                              >
                                Update Progress
                              </Button>
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
                        <TableHead>Progress</TableHead>
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
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              appointment.status === "Completed" ? "bg-green-100 text-green-800" :
                              appointment.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                              "bg-yellow-100 text-yellow-800"
                            }`}>
                              {appointment.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Progress value={calculateOverallProgress(appointment)} className="w-24 h-2" />
                              <span className="text-xs text-gray-500">{calculateOverallProgress(appointment)}%</span>
                            </div>
                          </TableCell>
                          <TableCell>{appointment.price}</TableCell>
                          <TableCell className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openProgressDialog(appointment)}
                            >
                              Update
                            </Button>
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

            {activeTab === "service-progress" && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Service Progress Tracking</h2>
                <p className="text-gray-500 mb-4">Update service progress and upload status images</p>
                
                {allAppointments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Tasks</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allAppointments.map((appointment) => {
                        const progress = calculateOverallProgress(appointment);
                        
                        return (
                          <TableRow key={appointment.id}>
                            <TableCell>{appointment.customer}</TableCell>
                            <TableCell>{appointment.vehicle}</TableCell>
                            <TableCell>{appointment.services}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                appointment.status === "Completed" ? "bg-green-100 text-green-800" :
                                appointment.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                                "bg-yellow-100 text-yellow-800"
                              }`}>
                                {appointment.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Progress value={progress} className="w-24 h-2" />
                                <span className="text-xs text-gray-500">{progress}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {(() => {
                                const userData = allUsers.find(user => user.id === appointment.customerId);
                                const serviceProgress = userData?.serviceProgress?.find(
                                  p => p.appointmentId === appointment.id
                                );
                                const taskCount = serviceProgress?.tasks?.length || 0;
                                return taskCount || 0;
                              })()}
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => openProgressDialog(appointment)}
                              >
                                Manage Progress
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
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
                
                <p className="text-gray-500">Please use the Service Progress section to manage images for specific service tasks</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      <Dialog open={isProgressDialogOpen} onOpenChange={setIsProgressDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Service Progress</DialogTitle>
            <DialogDescription>
              {selectedAppointment && `${selectedAppointment.customer} - ${selectedAppointment.vehicle}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedServiceProgress && (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Overall Progress</Label>
                    <span className="text-sm font-medium">{selectedServiceProgress.progress}%</span>
                  </div>
                  <Progress value={selectedServiceProgress.progress} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Service Tasks</Label>
                    <Button variant="outline" size="sm" onClick={() => openTaskDialog()}>
                      Add Task
                    </Button>
                  </div>
                  
                  {selectedServiceProgress.tasks.length === 0 ? (
                    <p className="text-sm text-gray-500 py-2">No tasks added yet</p>
                  ) : (
                    <div className="space-y-3 mt-2">
                      {selectedServiceProgress.tasks.map((task) => (
                        <Card key={task.id} className="overflow-hidden">
                          <CardHeader className="p-3 pb-0">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                {task.status === "completed" ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : task.status === "in-progress" ? (
                                  <CircleDot className="h-4 w-4 text-blue-500" />
                                ) : (
                                  <CircleDashed className="h-4 w-4 text-gray-400" />
                                )}
                                <CardTitle className="text-sm">{task.title}</CardTitle>
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                task.status === "completed" ? "bg-green-100 text-green-700" :
                                task.status === "in-progress" ? "bg-blue-100 text-blue-700" :
                                "bg-gray-100 text-gray-600"
                              }`}>
                                {task.status === "completed" ? "Completed" : 
                                 task.status === "in-progress" ? "In Progress" : 
                                 "Pending"}
                              </span>
                            </div>
                            {task.description && (
                              <CardDescription className="text-xs mt-1">
                                {task.description}
                              </CardDescription>
                            )}
                          </CardHeader>
                          
                          <CardContent className="p-3 pt-1">
                            {task.completedDate && task.technician && (
                              <p className="text-xs text-gray-500 mb-2">
                                {task.completedDate} by {task.technician}
                              </p>
                            )}
                            
                            {task.images && task.images.length > 0 && (
                              <div className="grid grid-cols-3 gap-2 mt-2">
                                {task.images.map((image, idx) => (
                                  <div key={idx} className="relative group">
                                    <img 
                                      src={image.url} 
                                      alt={image.title}
                                      className="rounded-md w-full h-16 object-cover"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-1 text-[10px] truncate">
                                      {image.title}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                          
                          <CardFooter className="p-2 bg-gray-50 flex justify-between">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openTaskDialog(task)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openImageDialog(task)}
                            >
                              Add Image
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsProgressDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveServiceProgress}>
                  Save Progress
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedTask ? "Edit Task" : "Add Task"}</DialogTitle>
            <DialogDescription>
              {selectedTask ? "Update the task details" : "Add a new service task"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="taskTitle">Task Title</Label>
              <Input
                id="taskTitle"
                value={newTaskData.title}
                onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
                placeholder="e.g., Engine Oil Change"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="taskDescription">Description (optional)</Label>
              <Input
                id="taskDescription"
                value={newTaskData.description}
                onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}
                placeholder="Brief description of the task"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="taskTechnician">Technician Name</Label>
              <Input
                id="taskTechnician"
                value={newTaskData.technician}
                onChange={(e) => setNewTaskData({ ...newTaskData, technician: e.target.value })}
                placeholder="Name of technician"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="taskStatus">Status</Label>
              <Select
                value={newTaskData.status}
                onValueChange={(value) => setNewTaskData({ 
                  ...newTaskData, 
                  status: value as "pending" | "in-progress" | "completed"
                })}
              >
                <SelectTrigger id="taskStatus">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveTaskData}>
              {selectedTask ? "Update Task" : "Add Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Image</DialogTitle>
            <DialogDescription>
              {selectedTask && `Add an image for "${selectedTask.title}"`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="imageTitle">Image Title</Label>
              <Input
                id="imageTitle"
                value={newImageData.title}
                onChange={(e) => setNewImageData({ ...newImageData, title: e.target.value })}
                placeholder="e.g., Oil Filter Replacement"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="imageUrl">Image URL (optional)</Label>
              <Input
                id="imageUrl"
                value={newImageData.url}
                onChange={(e) => setNewImageData({ ...newImageData, url: e.target.value })}
                placeholder="URL of image (demo will use placeholder if empty)"
              />
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center">
              <Upload className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Demo Mode: Placeholder images will be used</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImageDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveImageData}>
              Add Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
