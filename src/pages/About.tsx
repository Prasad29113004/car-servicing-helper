
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle, Users, Trophy, Star } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-carservice-dark text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold sm:text-5xl">About CarService</h1>
            <p className="mt-4 text-xl max-w-3xl mx-auto">
              Professional car service with over 15 years of experience
            </p>
          </div>
        </div>

        {/* Our Story */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div>
                <h2 className="text-3xl font-extrabold text-carservice-dark">Our Story</h2>
                <div className="mt-6 text-gray-500 space-y-4">
                  <p>
                    Founded in 2008, CarService has grown from a small local garage to a full-service automotive repair center with multiple locations. Our passion for cars and commitment to exceptional service has made us the trusted choice for thousands of vehicle owners.
                  </p>
                  <p>
                    We believe in transparency, honesty, and using only the highest quality parts and tools. Our team of ASE-certified mechanics has decades of combined experience working with all makes and models.
                  </p>
                  <p>
                    Our mission is simple: provide top-quality car service at fair prices with exceptional customer service. That's why we stand behind all our work with a comprehensive warranty.
                  </p>
                </div>
              </div>
              <div className="mt-10 lg:mt-0">
                <img 
                  src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80" 
                  alt="Car garage" 
                  className="rounded-lg shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-carservice-dark">Why Choose Us</h2>
              <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
                We pride ourselves on offering the best car service experience possible
              </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <CheckCircle className="h-10 w-10 text-carservice-blue mb-4" />
                <h3 className="text-xl font-bold text-carservice-dark mb-2">Quality Service</h3>
                <p className="text-gray-500">
                  We use only genuine parts and the latest tools to ensure quality repairs.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <Users className="h-10 w-10 text-carservice-blue mb-4" />
                <h3 className="text-xl font-bold text-carservice-dark mb-2">Expert Team</h3>
                <p className="text-gray-500">
                  Our team of ASE-certified mechanics has years of experience.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <Trophy className="h-10 w-10 text-carservice-blue mb-4" />
                <h3 className="text-xl font-bold text-carservice-dark mb-2">Award Winning</h3>
                <p className="text-gray-500">
                  Recognized for excellence in automotive service and customer satisfaction.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <Star className="h-10 w-10 text-carservice-blue mb-4" />
                <h3 className="text-xl font-bold text-carservice-dark mb-2">Customer First</h3>
                <p className="text-gray-500">
                  We prioritize your needs and ensure complete satisfaction.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
