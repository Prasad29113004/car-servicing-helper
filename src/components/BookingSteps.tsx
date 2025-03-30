
import { CalendarCheck, CarFront, CircleCheck, ClipboardCheck } from "lucide-react";

export default function BookingSteps() {
  const steps = [
    {
      title: "Choose Service",
      description: "Select the service your car needs",
      icon: ClipboardCheck,
    },
    {
      title: "Pick a Date",
      description: "Choose a convenient date and time",
      icon: CalendarCheck,
    },
    {
      title: "Car Details",
      description: "Provide your car's make and model",
      icon: CarFront,
    },
    {
      title: "Confirmation",
      description: "Receive booking confirmation",
      icon: CircleCheck,
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-carservice-dark sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            Book your car service in just a few simple steps
          </p>
        </div>

        <div className="mt-12 flex flex-wrap justify-center">
          {steps.map((step, index) => (
            <div key={index} className="w-full sm:w-1/2 lg:w-1/4 px-4 mb-8">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-carservice-blue bg-opacity-10 rounded-full flex items-center justify-center mb-4">
                  <step.icon className="h-8 w-8 text-carservice-blue" />
                </div>
                <h3 className="text-xl font-bold text-carservice-dark mb-2">{step.title}</h3>
                <p className="text-gray-500 text-center">{step.description}</p>
                
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute mt-8 ml-32">
                    <div className="w-12 h-0.5 bg-gray-200"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
