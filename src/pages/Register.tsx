
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const validatePhone = (phoneNumber: string) => {
    // Indian phone numbers are 10 digits, often starting with 6, 7, 8, or 9
    const regex = /^[6-9]\d{9}$/;
    return regex.test(phoneNumber);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return;
    }

    if (!validatePhone(phone)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid 10-digit Indian mobile number",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // For demo purposes only - in a real app you would register with a backend
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userRole", "user");
      
      // Generate a unique user ID
      const userId = "user_" + Date.now();
      localStorage.setItem("currentUserId", userId);
      
      // Store user credentials for login
      const userCredentials = {
        email,
        password
      };
      localStorage.setItem(`credentials_${email}`, JSON.stringify(userCredentials));
      
      // Current date for registration/last update
      const currentDate = new Date().toISOString().split('T')[0];
      
      // Store user information - now with empty arrays for important collections
      const userData = {
        id: userId,
        fullName,
        email,
        phone,
        address: "", // Adding empty address field that user can update later
        vehicles: [], // Initialize empty vehicles array
        upcomingServices: [], // Initialize empty upcoming services array
        serviceHistory: [], // Initialize empty service history array
        notifications: [], // Initialize empty notifications array
        serviceImages: [], // Initialize empty service images array
        registrationDate: currentDate, // Add registration date
        lastUpdated: currentDate // Add last update date
      };
      
      // Save under user specific key
      localStorage.setItem(`userData_${userId}`, JSON.stringify(userData));
      
      // Also update the all customers collection for admin
      try {
        let allCustomers = [];
        const storedCustomers = localStorage.getItem("allCustomers");
        
        if (storedCustomers) {
          allCustomers = JSON.parse(storedCustomers);
        }
        
        // Add the new customer to the list
        allCustomers.push({
          id: userId,
          name: fullName,
          email,
          phone,
          vehicles: 0,
          lastService: "No services yet"
        });
        
        // Update the allCustomers list
        localStorage.setItem("allCustomers", JSON.stringify(allCustomers));
      } catch (error) {
        console.error("Error updating customers list:", error);
      }
      
      toast({
        title: "Registration successful",
        description: "Your account has been created",
      });
      navigate("/dashboard");
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="flex justify-center">
            <Car className="h-10 w-10 text-carservice-blue" />
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-carservice-dark">Create a new account</h2>
          <p className="mt-2 text-sm text-gray-500">
            Or{" "}
            <Link to="/login" className="font-medium text-carservice-blue hover:underline">
              sign in to existing account
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Register</CardTitle>
            <CardDescription>Enter your information to create an account</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="rahul.sharma@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Mobile Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  maxLength={10}
                />
                <p className="text-xs text-gray-500">Enter 10-digit mobile number without country code</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center">
                    <UserPlus className="mr-2 h-4 w-4 animate-spin" /> Creating account...
                  </span>
                ) : (
                  "Create account"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register;
