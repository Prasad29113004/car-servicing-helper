
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Services from "@/components/Services";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Car, Check, Clock, Shield, Star, Wrench } from "lucide-react";

const ServicesPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-carservice-dark text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold sm:text-5xl">Our Services</h1>
            <p className="mt-4 text-xl max-w-3xl mx-auto">
              Professional car maintenance and repair services for all makes and models
            </p>
            <Button size="lg" className="mt-8" asChild>
              <Link to="/booking">Book a Service</Link>
            </Button>
          </div>
        </div>

        {/* Services Component */}
        <Services />

        {/* Why Choose Us Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-carservice-dark">Why Choose Us</h2>
              <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
                We're committed to providing top-quality service with transparency and integrity
              </p>
            </div>

            <div className="grid gap-10 md:grid-cols-3">
              <div className="text-center">
                <div className="w-16 h-16 bg-carservice-blue bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wrench className="h-8 w-8 text-carservice-blue" />
                </div>
                <h3 className="text-xl font-bold text-carservice-dark mb-2">Certified Technicians</h3>
                <p className="text-gray-500">
                  Our ASE-certified mechanics have the expertise to handle all automotive service and repair needs.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-carservice-blue bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-carservice-blue" />
                </div>
                <h3 className="text-xl font-bold text-carservice-dark mb-2">Quality Guarantee</h3>
                <p className="text-gray-500">
                  We stand behind our work with a comprehensive warranty on all repairs and services.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-carservice-blue bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-carservice-blue" />
                </div>
                <h3 className="text-xl font-bold text-carservice-dark mb-2">Timely Service</h3>
                <p className="text-gray-500">
                  We respect your time and strive to complete all services promptly without sacrificing quality.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Service Process */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-carservice-dark">Our Service Process</h2>
              <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
                We make car maintenance simple and hassle-free
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white p-6 rounded-lg shadow-md relative">
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-carservice-blue rounded-full text-white flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold text-carservice-dark mb-3">Book Online</h3>
                <p className="text-gray-500">
                  Schedule your service appointment online or by phone at a time that works for you.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md relative">
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-carservice-blue rounded-full text-white flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="text-xl font-bold text-carservice-dark mb-3">Vehicle Inspection</h3>
                <p className="text-gray-500">
                  Our technicians will perform a thorough inspection to identify any issues.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md relative">
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-carservice-blue rounded-full text-white flex items-center justify-center font-bold">
                  3
                </div>
                <h3 className="text-xl font-bold text-carservice-dark mb-3">Service Approval</h3>
                <p className="text-gray-500">
                  We provide a detailed estimate and only proceed once you approve the work.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md relative">
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-carservice-blue rounded-full text-white flex items-center justify-center font-bold">
                  4
                </div>
                <h3 className="text-xl font-bold text-carservice-dark mb-3">Quality Service</h3>
                <p className="text-gray-500">
                  We complete the service using quality parts and expert workmanship.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-carservice-blue">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-extrabold text-white">Ready to Schedule Your Service?</h2>
            <p className="mt-4 text-xl text-white opacity-90 max-w-2xl mx-auto">
              Book your appointment today and experience our professional car care
            </p>
            <div className="mt-8 flex justify-center space-x-4">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/booking">Book Online</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-carservice-blue" asChild>
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ServicesPage;
