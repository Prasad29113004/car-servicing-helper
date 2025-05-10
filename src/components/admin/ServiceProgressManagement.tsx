
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
import { useToast } from "@/hooks/use-toast";
import { ServiceTask } from "@/types/service";

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
  const { toast } = useToast();
  
  useEffect(() => {
    loadAllProgressData();
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
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {progressData.tasks.map((task) => (
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
                          </TableRow>
                        ))}
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
    </div>
  );
}
