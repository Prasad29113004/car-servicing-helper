
import { useState } from "react";
import { 
  Car, 
  Cog, 
  Fuel, 
  Gauge, 
  Sparkles, 
  PlusCircle,
  Wrench 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function Services() {
  const [isOpen, setIsOpen] = useState(false);
  const [newService, setNewService] = useState({
    title: "",
    description: "",
    price: "",
    icon: "Wrench"
  });
  const { toast } = useToast();
  
  // Get services from localStorage or use default
  const getServicesFromStorage = () => {
    const storedServices = localStorage.getItem("carServices");
    if (storedServices) {
      try {
        return JSON.parse(storedServices);
      } catch (error) {
        console.error("Error parsing services from localStorage:", error);
        return defaultServices;
      }
    }
    return defaultServices;
  };

  const defaultServices = [
    {
      title: "General Service",
      description: "Complete check-up and maintenance of your vehicle",
      price: "₹2,999",
      icon: "Wrench",
    },
    {
      title: "Engine Repair",
      description: "Expert diagnosis and repair for all engine problems",
      price: "₹4,999",
      icon: "Cog",
    },
    {
      title: "AC Service",
      description: "Full air conditioning system check and recharge",
      price: "₹1,899",
      icon: "Sparkles",
    },
    {
      title: "Oil Change",
      description: "Premium quality engine oil change for smooth performance",
      price: "₹999",
      icon: "Fuel",
    },
    {
      title: "Wheel Alignment",
      description: "Precision wheel alignment for better handling and tyre life",
      price: "₹1,499",
      icon: "Car",
    },
    {
      title: "Diagnostics",
      description: "Advanced computer diagnostics to identify issues",
      price: "₹1,499",
      icon: "Gauge",
    },
  ];
  
  const [services, setServices] = useState(getServicesFromStorage());

  const iconOptions = {
    "Wrench": Wrench,
    "Cog": Cog,
    "Sparkles": Sparkles,
    "Fuel": Fuel,
    "Car": Car,
    "Gauge": Gauge,
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewService({
      ...newService,
      [name]: value
    });
  };
  
  const handleIconChange = (value) => {
    setNewService({
      ...newService,
      icon: value
    });
  };
  
  const handleAddService = () => {
    // Validate inputs
    if (!newService.title || !newService.description || !newService.price || !newService.icon) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    // Format price if it doesn't have the ₹ symbol
    const formattedPrice = newService.price.startsWith("₹") 
      ? newService.price 
      : `₹${newService.price}`;
    
    // Create ID for the service (using timestamp)
    const id = `service_${Date.now()}`;
    
    // Add new service to the list
    const updatedServices = [
      ...services, 
      { 
        ...newService,
        id,
        price: formattedPrice
      }
    ];
    
    // Update state and localStorage
    setServices(updatedServices);
    localStorage.setItem("carServices", JSON.stringify(updatedServices));
    
    // Reset form and close dialog
    setNewService({
      title: "",
      description: "",
      price: "",
      icon: "Wrench"
    });
    setIsOpen(false);
    
    toast({
      title: "Service added",
      description: `${newService.title} has been added to your services`,
    });
  };

  // Check if the current user is an admin
  const isAdmin = () => {
    const userRole = localStorage.getItem("userRole");
    return userRole === "admin";
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-carservice-dark sm:text-4xl">
            Our Services
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            We offer a wide range of car services to keep your vehicle running at its best
          </p>
          
          {isAdmin() && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="mt-8" variant="outline">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Service
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Service</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Service Title</Label>
                    <Input 
                      id="title" 
                      name="title" 
                      placeholder="e.g. Brake Service" 
                      value={newService.title}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      name="description" 
                      placeholder="Brief description of the service" 
                      value={newService.description}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input 
                      id="price" 
                      name="price" 
                      placeholder="e.g. 1499" 
                      value={newService.price}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Icon</Label>
                    <Select 
                      value={newService.icon} 
                      onValueChange={handleIconChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an icon" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(iconOptions).map((iconName) => (
                          <SelectItem key={iconName} value={iconName}>
                            {iconName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddService}>
                    Add Service
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const IconComponent = iconOptions[service.icon];
            
            return (
              <Card key={service.id || index} className="service-card border-none shadow-lg">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 bg-carservice-blue bg-opacity-10 rounded-lg flex items-center justify-center mb-4">
                    {IconComponent && <IconComponent className="h-6 w-6 text-carservice-blue" />}
                  </div>
                  <CardTitle className="text-xl font-bold text-carservice-dark">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-500 mb-2">{service.description}</CardDescription>
                  <p className="text-carservice-blue font-semibold">{service.price}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
