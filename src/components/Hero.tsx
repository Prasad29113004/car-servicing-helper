
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarClock, Check, Wrench } from "lucide-react";

export default function Hero() {
  return (
    <div className="hero-gradient py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            <h1 className="text-4xl tracking-tight font-extrabold text-carservice-dark sm:text-5xl md:text-6xl">
              <span className="block">Professional</span>
              <span className="block text-carservice-blue">Car Service</span>
            </h1>
            <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
              Book your car service today and experience the difference. Our team of expert mechanics will make sure your vehicle runs at its best.
            </p>
            <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Button size="lg" asChild>
                  <Link to="/booking">Book a Service</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/contact">Contact Us</Link>
                </Button>
              </div>
              
              <div className="mt-8">
                <div className="flex items-center justify-center lg:justify-start">
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center">
                      <Check className="h-5 w-5 text-carservice-blue mr-2" />
                      <p className="text-sm text-gray-500">Expert Mechanics</p>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-5 w-5 text-carservice-blue mr-2" />
                      <p className="text-sm text-gray-500">Genuine Parts</p>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-5 w-5 text-carservice-blue mr-2" />
                      <p className="text-sm text-gray-500">Service Warranty</p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-3 ml-12">
                    <div className="flex items-center">
                      <Wrench className="h-5 w-5 text-carservice-blue mr-2" />
                      <p className="text-sm text-gray-500">Latest Tools</p>
                    </div>
                    <div className="flex items-center">
                      <CalendarClock className="h-5 w-5 text-carservice-blue mr-2" />
                      <p className="text-sm text-gray-500">Timely Service</p>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-5 w-5 text-carservice-blue mr-2" />
                      <p className="text-sm text-gray-500">Affordable Pricing</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
            <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
              <img
                className="w-full rounded-lg"
                src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1674&q=80"
                alt="Car service mechanic"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
