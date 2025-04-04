
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface UserData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  vehicles?: Vehicle[];
}

interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
}

interface ReminderData {
  id: string;
  customerId: string;
  customerName: string;
  vehicleInfo: string;
  service: string;
  dueDate: string;
  lastReminded: string | null;
}

const RemindersSection = () => {
  const [reminders, setReminders] = useState<ReminderData[]>([]);
  const [customers, setCustomers] = useState<UserData[]>([]);
  const [isNewReminderOpen, setIsNewReminderOpen] = useState(false);
  const [isSendReminderOpen, setIsSendReminderOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<ReminderData | null>(null);
  const [newReminder, setNewReminder] = useState({
    customerId: "",
    vehicleId: "",
    service: "General Service",
    dueDate: new Date().toISOString().split('T')[0]
  });
  
  const { toast } = useToast();

  // Load customers and reminders data
  useEffect(() => {
    loadCustomers();
    loadReminders();
  }, []);

  const loadCustomers = () => {
    const storedCustomers: UserData[] = [];
    
    // Get all keys from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      // Check if the key follows the pattern "userData_user_..."
      if (key && key.startsWith('userData_')) {
        try {
          const userData = JSON.parse(localStorage.getItem(key) || '{}');
          if (userData.id && userData.fullName) {
            storedCustomers.push(userData);
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    }
    
    setCustomers(storedCustomers);
    console.info("Loaded customers:", storedCustomers);
  };

  const loadReminders = () => {
    // Get reminders from localStorage, or initialize with sample data if none exists
    const storedReminders = localStorage.getItem('serviceReminders');
    let parsedReminders: ReminderData[] = [];
    
    if (storedReminders) {
      try {
        parsedReminders = JSON.parse(storedReminders);
      } catch (error) {
        console.error("Error parsing reminders:", error);
      }
    } else {
      // Initialize with sample data if no reminders exist
      parsedReminders = [
        {
          id: "reminder1",
          customerId: "sample1",
          customerName: "John Doe",
          vehicleInfo: "Toyota Camry",
          service: "General Service",
          dueDate: "2023-09-30",
          lastReminded: null
        },
        {
          id: "reminder2",
          customerId: "sample2",
          customerName: "Jane Smith",
          vehicleInfo: "Honda Civic",
          service: "Oil Change",
          dueDate: "2023-10-15",
          lastReminded: "2023-09-15"
        }
      ];
      localStorage.setItem('serviceReminders', JSON.stringify(parsedReminders));
    }
    
    setReminders(parsedReminders);
    console.info("Loaded reminders:", parsedReminders);
  };

  const handleAddReminder = () => {
    if (!newReminder.customerId || !newReminder.vehicleId || !newReminder.service || !newReminder.dueDate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const customer = customers.find(c => c.id === newReminder.customerId);
    const vehicle = customer?.vehicles?.find(v => v.id.toString() === newReminder.vehicleId);
    
    if (!customer || !vehicle) {
      toast({
        title: "Error",
        description: "Customer or vehicle not found",
        variant: "destructive"
      });
      return;
    }

    const vehicleInfo = `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`;
    const newReminderData: ReminderData = {
      id: `reminder_${Date.now()}`,
      customerId: customer.id,
      customerName: customer.fullName,
      vehicleInfo: vehicleInfo,
      service: newReminder.service,
      dueDate: newReminder.dueDate,
      lastReminded: null
    };

    const updatedReminders = [...reminders, newReminderData];
    setReminders(updatedReminders);
    localStorage.setItem('serviceReminders', JSON.stringify(updatedReminders));

    // Reset form and close dialog
    setNewReminder({
      customerId: "",
      vehicleId: "",
      service: "General Service",
      dueDate: new Date().toISOString().split('T')[0]
    });
    setIsNewReminderOpen(false);

    toast({
      title: "Reminder created",
      description: `Service reminder for ${customer.fullName} has been created`
    });
  };

  const handleSendReminder = () => {
    if (!selectedReminder) return;

    // Update the lastReminded date to today
    const updatedReminders = reminders.map(reminder =>
      reminder.id === selectedReminder.id
        ? { ...reminder, lastReminded: new Date().toISOString().split('T')[0] }
        : reminder
    );

    setReminders(updatedReminders);
    localStorage.setItem('serviceReminders', JSON.stringify(updatedReminders));

    // Create notification for the customer
    const customerId = selectedReminder.customerId;
    const customerKey = `userData_${customerId}`;
    
    try {
      const userData = JSON.parse(localStorage.getItem(customerKey) || '{}');
      if (userData.id) {
        const newNotification = {
          id: Date.now(),
          message: `Reminder: Your ${selectedReminder.service} is due on ${new Date(selectedReminder.dueDate).toLocaleDateString()}`,
          date: new Date().toISOString().split('T')[0],
          read: false
        };

        userData.notifications = [...(userData.notifications || []), newNotification];
        localStorage.setItem(customerKey, JSON.stringify(userData));
      }
    } catch (error) {
      console.error("Error updating customer notifications:", error);
    }

    setIsSendReminderOpen(false);
    setSelectedReminder(null);

    toast({
      title: "Reminder sent",
      description: `Service reminder has been sent to ${selectedReminder.customerName}`
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Service Reminders</h2>
          <p className="text-gray-500">Manage and send service alerts to customers</p>
        </div>
        <Button onClick={() => setIsNewReminderOpen(true)}>New Reminder</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Last Reminded</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reminders.length > 0 ? (
            reminders.map((reminder) => (
              <TableRow key={reminder.id}>
                <TableCell>{reminder.customerName}</TableCell>
                <TableCell>{reminder.vehicleInfo}</TableCell>
                <TableCell>{reminder.service}</TableCell>
                <TableCell>{new Date(reminder.dueDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  {reminder.lastReminded 
                    ? new Date(reminder.lastReminded).toLocaleDateString()
                    : "Never"}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedReminder(reminder);
                      setIsSendReminderOpen(true);
                    }}
                  >
                    Send Reminder
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                No service reminders found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* New Reminder Dialog */}
      <Dialog open={isNewReminderOpen} onOpenChange={setIsNewReminderOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Service Reminder</DialogTitle>
            <DialogDescription>
              Create a new service reminder for a customer
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="customer">Customer</Label>
              <Select
                value={newReminder.customerId}
                onValueChange={(value) => {
                  setNewReminder({ ...newReminder, customerId: value, vehicleId: "" });
                }}
              >
                <SelectTrigger id="customer">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.fullName} ({customer.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {newReminder.customerId && (
              <div className="grid gap-2">
                <Label htmlFor="vehicle">Vehicle</Label>
                <Select
                  value={newReminder.vehicleId}
                  onValueChange={(value) => setNewReminder({ ...newReminder, vehicleId: value })}
                >
                  <SelectTrigger id="vehicle">
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.find(c => c.id === newReminder.customerId)?.vehicles?.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                        {vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="service">Service</Label>
              <Select
                value={newReminder.service}
                onValueChange={(value) => setNewReminder({ ...newReminder, service: value })}
              >
                <SelectTrigger id="service">
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {["General Service", "Oil Change", "Brake Service", "Tire Rotation", 
                    "Engine Tune-Up", "Battery Replacement", "AC Service", "Wheel Alignment"].map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={newReminder.dueDate}
                onChange={(e) => setNewReminder({ ...newReminder, dueDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewReminderOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddReminder}>
              Create Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Reminder Dialog */}
      <Dialog open={isSendReminderOpen} onOpenChange={setIsSendReminderOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Service Reminder</DialogTitle>
            <DialogDescription>
              Send a service reminder to the customer
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedReminder && (
              <div className="space-y-4">
                <div>
                  <p className="font-semibold">Customer:</p>
                  <p>{selectedReminder.customerName}</p>
                </div>
                <div>
                  <p className="font-semibold">Vehicle:</p>
                  <p>{selectedReminder.vehicleInfo}</p>
                </div>
                <div>
                  <p className="font-semibold">Service:</p>
                  <p>{selectedReminder.service}</p>
                </div>
                <div>
                  <p className="font-semibold">Due Date:</p>
                  <p>{new Date(selectedReminder.dueDate).toLocaleDateString()}</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-md">
                  <p className="text-amber-800 text-sm">
                    This will send a notification to the customer about their upcoming service.
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSendReminderOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendReminder}>
              Send Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RemindersSection;
