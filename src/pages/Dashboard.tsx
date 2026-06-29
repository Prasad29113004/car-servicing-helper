import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Plus, Car, Bell, Settings, Clock, User, RefreshCw } from "lucide-react";
import { useNavigate, Link } from "react-router-dom"; // Link is used here
import { ServiceProgress } from "@/components/ServiceProgress";
import { ServiceTask } from "@/types/service";
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
import InvoiceView from "@/components/InvoiceView";

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
  const navigate = useNavigate(); // CORRECT: Hook inside the component
  const [userData, setUserData] = useState<UserData | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [relatedAppointment, setRelatedAppointment] = useState<UpcomingService | null>(null);
  const [relatedVehicle, setRelatedVehicle] = useState<Vehicle | null>(null);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    loadUserData();
    const bookingData = localStorage.getItem("lastBooking");
    if (bookingData) {
      try {
        const booking = JSON.parse(bookingData);
        processNewBooking(booking);
      } catch (error) {
        console.error("Error processing booking data:", error);
      }
    }
  }, [toast]);

  const loadUserData = () => {
    if (userId) {
      const storedData = localStorage.getItem(`userData_${userId}`);
      if (storedData) {
        try {
          const parsedData: UserData = JSON.parse(storedData);
          if (parsedData.upcomingServices) {
            if (!parsedData.serviceProgress) parsedData.serviceProgress = [];
            parsedData.upcomingServices.forEach(service => {
              if (!parsedData.serviceProgress?.find(p => p.appointmentId === service.id)) {
                const vehicle = parsedData.vehicles?.find(v => v.id === service.vehicleId);
                if (vehicle) {
                  parsedData.serviceProgress?.push({
                    appointmentId: service.id,
                    vehicleId: service.vehicleId,
                    progress: 0,
                    tasks: [{ id: `init-${service.id}`, title: "Service Started", status: "pending", description: "In Progress" }]
                  });
                }
              }
            });
          }
          setUserData(parsedData);
          setUnreadCount(parsedData.notifications?.filter(n => !n.read).length || 0);
        } catch (e) { console.error(e); }
      }
    }
  };

  const processNewBooking = (booking: any) => {
    // Logic remains as in your original code
    localStorage.removeItem("lastBooking");
  };

  const handleViewDetails = (notification: Notification) => {
    setSelectedNotification(notification);
    if (!notification.read && userData) {
      const updatedData = { ...userData, notifications: userData.notifications?.map(n => n.id === notification.id ? {...n, read: true} : n) };
      setUserData(updatedData);
      localStorage.setItem(`userData_${userData.id}`, JSON.stringify(updatedData));
      setUnreadCount(prev => prev > 0 ? prev - 1 : 0);
    }
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    try { return formatDistance(new Date(dateString), new Date(), { addSuffix: true }); }
    catch { return dateString; }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, {userData?.fullName || "Guest"}</h1>
            </div>
            <Button onClick={() => navigate('/booking')}>
              <Plus className="mr-1 h-4 w-4" /> Book Service
            </Button>
          </div>
          {/* ... Tabs and Dialog remain as in your original code ... */}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
