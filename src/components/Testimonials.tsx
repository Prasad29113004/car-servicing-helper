
import { Card, CardContent } from "@/components/ui/card";
import { StarIcon } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      name: "John Smith",
      position: "BMW Owner",
      content: "The service was exceptional! They fixed my car on time and kept me updated throughout the process.",
      rating: 5,
    },
    {
      name: "Sarah Johnson",
      position: "Honda Owner",
      content: "I've been taking my car here for years. Their mechanics are highly skilled and always deliver quality service.",
      rating: 5,
    },
    {
      name: "David Clark",
      position: "Toyota Owner",
      content: "Professional, efficient, and affordable. I highly recommend their services to anyone looking for quality car repairs.",
      rating: 4,
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-carservice-dark sm:text-4xl">
            What Our Customers Say
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            Don't just take our word for it, hear from our satisfied customers
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-5 w-5 ${
                        i < testimonial.rating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">{testimonial.content}</p>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-carservice-blue text-white flex items-center justify-center">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-carservice-dark">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-gray-500">{testimonial.position}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
