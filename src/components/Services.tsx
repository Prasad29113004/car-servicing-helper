
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
  const services = [
    {
      title: "General Service",
      description: "Complete check-up and maintenance of your vehicle",
      icon: Wrench,
    },
    {
      title: "Engine Repair",
      description: "Expert diagnosis and repair for all engine problems",
      icon: Cog,
    },
    {
      title: "AC Service",
      description: "Full air conditioning system check and recharge",
      icon: Sparkles,
    },
    {
      title: "Oil Change",
      description: "Regular oil changes to keep your engine running smoothly",
      icon: Fuel,
    },
    {
      title: "Wheel Alignment",
      description: "Precision wheel alignment for better handling and tire life",
      icon: Car,
    },
    {
      title: "Diagnostics",
      description: "Advanced computer diagnostics to identify issues",
      icon: Gauge,
    },
  ];

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
          {services.map((service, index) => (
            <Card key={index} className="service-card border-none shadow-lg">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 bg-carservice-blue bg-opacity-10 rounded-lg flex items-center justify-center mb-4">
                  <service.icon className="h-6 w-6 text-carservice-blue" />
                </div>
                <CardTitle className="text-xl font-bold text-carservice-dark">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-500">{service.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
