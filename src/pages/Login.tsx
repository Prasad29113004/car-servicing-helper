
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, KeyRound, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("user");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (activeTab === "user") {
        // User login
        if (email === "user@example.com" && password === "password") {
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("userRole", "user");
          toast({
            title: "Login successful",
            description: "Welcome back!",
          });
          navigate("/dashboard");
        } else {
          toast({
            title: "Login failed",
            description: "Invalid email or password",
            variant: "destructive",
          });
        }
      } else {
        // Admin login
        if (email === "admin@example.com" && password === "admin") {
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("userRole", "admin");
          toast({
            title: "Admin Login successful",
            description: "Welcome back, Admin!",
          });
          navigate("/admin");
        } else {
          toast({
            title: "Admin Login failed",
            description: "Invalid admin credentials",
            variant: "destructive",
          });
        }
      }
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
          <h2 className="mt-6 text-3xl font-extrabold text-carservice-dark">Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-500">
            Or{" "}
            <Link to="/register" className="font-medium text-carservice-blue hover:underline">
              create a new account
            </Link>
          </p>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="user" className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" /> User Login
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Admin Login
            </TabsTrigger>
          </TabsList>

          <TabsContent value="user">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">User Login</CardTitle>
                <CardDescription>Enter your credentials to access your account</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link to="/forgot-password" className="text-sm font-medium text-carservice-blue hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <span className="flex items-center">
                        <KeyRound className="mr-2 h-4 w-4 animate-spin" /> Signing in...
                      </span>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Admin Login</CardTitle>
                <CardDescription>Enter your admin credentials</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="admin-password">Password</Label>
                      <Link to="/forgot-password" className="text-sm font-medium text-carservice-blue hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <span className="flex items-center">
                        <KeyRound className="mr-2 h-4 w-4 animate-spin" /> Signing in...
                      </span>
                    ) : (
                      "Admin Sign in"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">
            Demo credentials:<br />
            User: user@example.com / password<br />
            Admin: admin@example.com / admin
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
