import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ServiceTask } from "@/types/service";
import { Image } from "lucide-react";

export default function ServiceProgressManagement() {
  const [serviceProgress, setServiceProgress] = useState<{
    [key: string]: {
      progress: number;
      tasks: ServiceTask[];
      vehicleId: string;
      userId?: string;
      appointmentId: string;
    }
  }>({});
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<{[key: string]: any}>({});
  const [customers, setCustomers] = useState<{[key: string]: string}>({});
  const [sharedImages, setSharedImages] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<{url: string, title: string} | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ServiceTask | null>(null);
  const [isUpdateTaskDialogOpen, setIsUpdateTaskDialogOpen] = useState(false);
  const [taskStatus, setTaskStatus] = useState<"pending" | "in-progress" | "completed">("pending");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [customTechnician, setCustomTechnician] = useState<string>("Admin Staff");
  const [isCustomTechnicianSelected, setIsCustomTechnicianSelected] = useState(false);
  const [technicianInputValue, setTechnicianInputValue] = useState("");
  const [availableTechnicians, setAvailableTechnicians] = useState<string[]>(["Admin Staff", "John Smith", "Maria Garcia", "David Kim", "Sarah Johnson"]);
  const { toast } = useToast();
  
  useEffect(() => {
    loadAllProgressData();
    loadSharedImages();

    // Set up event listener for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sharedServiceImages' || e.key === 'adminServiceImages' || e.key === null) {
        loadSharedImages();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  const loadAllProgressData = () => {
    const allProgress: {[key: string]: any} = {};
    const allVehicles: {[key: string]: any} = {};
    const allCustomers: {[key: string]: string} = {};
    const allAppointments: any[] = [];
    
    // Find all user IDs
    const userIds: string[] = [];
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
            user.vehicles.forEach((vehicle: any) => {
              allVehicles[vehicle.id] = vehicle;
            });
          }
          
          if (user.upcomingServices && Array.isArray(user.upcomingServices)) {
            user.upcomingServices.forEach((appointment: any) => {
              allAppointments.push({
                ...appointment,
                userId: userId,
                customerName: user.fullName || "Unknown Customer"
              });
            });
          }
          
          if (user.serviceProgress && Array.isArray(user.serviceProgress)) {
            user.serviceProgress.forEach((progress: any) => {
              allProgress[progress.appointmentId] = {
                ...progress,
                userId: userId
              };
            });
          }
        }
      } catch (error) {
        console.error(`Error loading user data for ${userId}:`, error);
      }
    });
    
    setServiceProgress(allProgress);
    setVehicles(allVehicles);
    setCustomers(allCustomers);
    setAppointments(allAppointments);
  };

  const loadSharedImages = () => {
    try {
      // First check admin images directly
      const adminImages = localStorage.getItem('adminServiceImages');
      
      if (adminImages) {
        const parsedImages = JSON.parse(adminImages);
        console.log("Admin panel - Found admin images:", parsedImages);
        
        if (Array.isArray(parsedImages)) {
          setSharedImages(parsedImages);
        }
      } else {
        // Fallback to sharedServiceImages
        const storedImages = localStorage.getItem('sharedServiceImages');
        if (storedImages) {
          const parsedImages = JSON.parse(storedImages);
          console.log("Admin panel - Loaded from shared images:", parsedImages);
          setSharedImages(parsedImages);
        }
      }
    } catch (error) {
      console.error("Error loading shared images:", error);
      setSharedImages([]);
    }
  };

  const openImageDialog = (image: {url: string, title: string}) => {
    setSelectedImage(image);
    setIsImageDialogOpen(true);
  };

  const openUpdateTaskDialog = (task: ServiceTask, appointmentId: string) => {
    setSelectedTask(task);
    setTaskStatus(task.status);
    setSelectedAppointmentId(appointmentId);
    setCustomTechnician(task.technician || "Admin Staff");
    setIsCustomTechnicianSelected(false);
    setTechnicianInputValue("");
    setIsUpdateTaskDialogOpen(true);
  };

  const handleTechnicianSelection = (value: string) => {
    if (value === "custom") {
      setIsCustomTechnicianSelected(true);
      setCustomTechnician("custom");
    } else {
      setIsCustomTechnicianSelected(false);
      setCustomTechnician(value);
    }
  };

  const updateTaskStatus = () => {
    if (!selectedTask || !selectedAppointmentId) return;
    
    const progressData = serviceProgress[selectedAppointmentId];
    if (!progressData || !progressData.userId) return;
    
    try {
      const userData = localStorage.getItem(`userData_${progressData.userId}`);
      if (!userData) return;
      
      const user = JSON.parse(userData);
      if (!user.serviceProgress) return;
      
      const progressIndex = user.serviceProgress.findIndex(
        (p: any) => p.appointmentId === selectedAppointmentId
      );
      
      if (progressIndex === -1) return;
      
      // Update the task status
      const updatedTasks = [...user.serviceProgress[progressIndex].tasks];
      const taskIndex = updatedTasks.findIndex(t => t.id === selectedTask.id);
      
      if (taskIndex === -1) return;
      
      // Determine the technician name to use
      const finalTechnicianName = isCustomTechnicianSelected 
        ? technicianInputValue || "Custom Technician" 
        : customTechnician;
      
      // Update the task with status and custom technician
      updatedTasks[taskIndex] = {
        ...updatedTasks[taskIndex],
        status: taskStatus,
        ...(taskStatus === "completed" || taskStatus === "in-progress" ? {
          completedDate: taskStatus === "completed" ? new Date().toLocaleDateString() : updatedTasks[taskIndex].completedDate,
          technician: finalTechnicianName
        } : {})
      };
      
      // Calculate new progress
      const totalTasks = updatedTasks.length;
      const completedTasks = updatedTasks.filter(t => t.status === "completed").length;
      const inProgressTasks = updatedTasks.filter(t => t.status === "in-progress").length;
      const newProgress = Math.round((completedTasks / totalTasks) * 100 + (inProgressTasks / totalTasks) * 30);
      
      // Update user data
      user.serviceProgress[progressIndex].tasks = updatedTasks;
      user.serviceProgress[progressIndex].progress = newProgress;
      
      localStorage.setItem(`userData_${progressData.userId}`, JSON.stringify(user));
      
      // Update local state
      const updatedServiceProgress = { ...serviceProgress };
      updatedServiceProgress[selectedAppointmentId].tasks = updatedTasks;
      updatedServiceProgress[selectedAppointmentId].progress = newProgress;
      setServiceProgress(updatedServiceProgress);
      
      // Update appointment status if all tasks are completed
      if (completedTasks === totalTasks) {
        const appointmentIndex = user.upcomingServices.findIndex(
          (a: any) => a.id === selectedAppointmentId
        );
        
        if (appointmentIndex !== -1) {
          user.upcomingServices[appointmentIndex].status = "Completed";
          localStorage.setItem(`userData_${progressData.userId}`, JSON.stringify(user));
          
          // Update local appointments state
          const updatedAppointments = [...appointments];
          const appointmentStateIndex = updatedAppointments.findIndex(a => a.id === selectedAppointmentId);
          
          if (appointmentStateIndex !== -1) {
            updatedAppointments[appointmentStateIndex].status = "Completed";
            setAppointments(updatedAppointments);
          }
        }
      }
      
      // Notify user about the update
      const newNotification = {
        id: Date.now(),
        message: `Your service task "${selectedTask.title}" has been updated to ${taskStatus} by ${finalTechnicianName}`,
        date: new Date().toISOString(),
        read: false,
        details: {
          type: "service_progress",
          appointmentId: selectedAppointmentId,
          taskId: selectedTask.id
        }
      };
      
      user.notifications = [...(user.notifications || []), newNotification];
      localStorage.setItem(`userData_${progressData.userId}`, JSON.stringify(user));
      
      toast({
        title: "Task Updated",
        description: `Task status has been updated to ${taskStatus} by ${finalTechnicianName}.`
      });
      
      // Trigger an event to notify components about the update
      const event = new Event('serviceImagesUpdated');
      document.dispatchEvent(event);
      
      // Close the dialog
      setIsUpdateTaskDialogOpen(false);
      setIsCustomTechnicianSelected(false);
      setTechnicianInputValue("");
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not completed";
    return new Date(dateString).toLocaleDateString();
  };

  // Get images relevant to a specific task
  const getRelevantImages = (task: ServiceTask, userId?: string) => {
    // First check if task has its own images
    if (task.images && task.images.length > 0) {
      return task.images;
    }
    
    // Then look for relevant shared images
    return sharedImages.filter(img => {
      // Show if shared with all users or specifically with this user
      const isForUser = img.customerId === 'all' || (userId && img.customerId === userId);
      
      if (!isForUser) return false;
      
      const imgTitle = img.title?.toLowerCase() || '';
      const taskTitle = task.title?.toLowerCase() || '';
      
      // Check if relevant to this task (title match or category match)
      return imgTitle.includes(taskTitle) || 
        taskTitle.includes(imgTitle) ||
        (task.title?.toLowerCase().includes('inspection') && img.category?.toLowerCase() === 'inspection') ||
        (task.title?.toLowerCase().includes('diagnostics') && img.category?.toLowerCase() === 'diagnostics') ||
        (task.title?.toLowerCase().includes('oil') && img.category?.toLowerCase() === 'service');
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Service Progress</h3>
      </div>

      {Object.keys(serviceProgress).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(serviceProgress).map(([appointmentId, progressData]) => {
            const appointment = appointments.find(a => a.id === appointmentId);
            const vehicle = vehicles[progressData.vehicleId];
            const customerName = customers[progressData.userId || ""] || "Unknown";
            
            return (
              <Card key={appointmentId} className="border shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {appointment ? appointment.service : "Unknown Service"}
                      </CardTitle>
                      <CardDescription>
                        {customerName} - {vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})` : "Unknown Vehicle"}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {appointment?.status || "Unknown"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-gray-500">{progressData.progress}%</span>
                    </div>
                    <Progress value={progressData.progress} className="h-2" />
                  </div>
                  
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Task</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Completed</TableHead>
                          <TableHead>Technician</TableHead>
                          <TableHead>Images</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {progressData.tasks.map((task) => {
                          const relevantImages = getRelevantImages(task, progressData.userId);
                          
                          return (
                            <TableRow key={task.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{task.title}</p>
                                  {task.description && (
                                    <p className="text-xs text-gray-500">{task.description}</p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(task.status)}`}>
                                  {task.status === "in-progress" ? "In Progress" : 
                                   task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                                </span>
                              </TableCell>
                              <TableCell>{formatDate(task.completedDate)}</TableCell>
                              <TableCell>{task.technician || "Not assigned"}</TableCell>
                              <TableCell>
                                {relevantImages && relevantImages.length > 0 ? (
                                  <div className="flex gap-2">
                                    {relevantImages.slice(0, 2).map((image: any, index: number) => (
                                      <div 
                                        key={`img-${task.id}-${index}`}
                                        className="cursor-pointer relative h-10 w-10 rounded border bg-gray-100"
                                        onClick={() => openImageDialog(image)}
                                      >
                                        <img 
                                          src={image.url} 
                                          alt={image.title || "Service image"}
                                          className="h-full w-full object-cover rounded"
                                          onError={(e) => {
                                            console.error("Image failed to load:", image.url);
                                            (e.target as HTMLImageElement).src = "/placeholder.svg"; 
                                          }}
                                        />
                                      </div>
                                    ))}
                                    {relevantImages.length > 2 && (
                                      <Badge variant="secondary" className="cursor-pointer">
                                        +{relevantImages.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 flex items-center gap-1">
                                    <Image className="h-4 w-4" /> None
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openUpdateTaskDialog(task, appointmentId)}
                                >
                                  Update
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center">
          <p className="text-gray-500">No service progress data available.</p>
        </div>
      )}
      
      {/* Image Preview Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedImage?.title || "Service Image"}</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="flex items-center justify-center">
              <img 
                src={selectedImage.url} 
                alt={selectedImage.title || "Service image"}
                className="max-h-[60vh] w-auto object-contain rounded-md"
                onError={(e) => {
                  console.error("Dialog image failed to load:", selectedImage.url);
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Update Task Dialog - With fixed technician input */}
      <Dialog open={isUpdateTaskDialogOpen} onOpenChange={setIsUpdateTaskDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Task Status</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="mb-2 font-medium">Updating: {selectedTask?.title}</p>
            
            <div className="space-y-2">
              <Label htmlFor="task-status">Task Status</Label>
              <Select value={taskStatus} onValueChange={(value: "pending" | "in-progress" | "completed") => setTaskStatus(value)}>
                <SelectTrigger id="task-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="technician">Assign Technician</Label>
              <Select 
                value={customTechnician} 
                onValueChange={handleTechnicianSelection}
                disabled={taskStatus === "pending"}
              >
                <SelectTrigger id="technician">
                  <SelectValue placeholder="Select technician" />
                </SelectTrigger>
                <SelectContent>
                  {availableTechnicians.map(tech => (
                    <SelectItem key={tech} value={tech}>{tech}</SelectItem>
                  ))}
                  <SelectItem value="custom">Custom...</SelectItem>
                </SelectContent>
              </Select>
              
              {isCustomTechnicianSelected && (
                <div className="mt-2">
                  <Input 
                    placeholder="Enter technician name"
                    value={technicianInputValue}
                    onChange={(e) => setTechnicianInputValue(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={updateTaskStatus}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
