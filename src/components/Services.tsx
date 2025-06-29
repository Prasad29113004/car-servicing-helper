
import { useState } from "react";
import { 
  Car, 
  Cog, 
  Fuel, 
  Gauge, 
  Sparkles, 
  Wrench 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Services() {
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
  
  const [services] = useState(getServicesFromStorage());

  const iconOptions = {
    "Wrench": Wrench,
    "Cog": Cog,
    "Sparkles": Sparkles,
    "Fuel": Fuel,
    "Car": Car,
    "Gauge": Gauge,
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
