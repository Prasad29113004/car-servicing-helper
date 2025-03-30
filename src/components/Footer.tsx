
import { Link } from "react-router-dom";
import { Car, Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-carservice-dark text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center">
              <Car className="h-8 w-8 text-carservice-blue" />
              <span className="ml-2 text-xl font-bold">CarService</span>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              Professional automotive service and repair. Our highly trained technicians are ready to provide the best service for your vehicle.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-carservice-blue">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-carservice-blue">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-carservice-blue">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Services</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/services" className="text-gray-400 hover:text-carservice-blue">General Service</Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-400 hover:text-carservice-blue">Engine Repair</Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-400 hover:text-carservice-blue">AC Service</Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-400 hover:text-carservice-blue">Oil Change</Link>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-carservice-blue">Home</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-carservice-blue">About</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-carservice-blue">Contact</Link>
              </li>
              <li>
                <Link to="/booking" className="text-gray-400 hover:text-carservice-blue">Book a Service</Link>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Contact</h3>
            <ul className="mt-4 space-y-2">
              <li className="text-gray-400">
                123 Service Road
              </li>
              <li className="text-gray-400">
                Autoville, AV 12345
              </li>
              <li className="text-gray-400">
                info@carservice.com
              </li>
              <li className="text-gray-400">
                +1 (555) 123-4567
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-gray-700 pt-8">
          <p className="text-sm text-gray-400 text-center">
            © {new Date().getFullYear()} CarService. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
