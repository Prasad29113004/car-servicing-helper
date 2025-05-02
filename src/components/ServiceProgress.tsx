
import { useState, useEffect } from "react";
import { Check, Clock, AlertCircle, Wrench, ImageIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface ServiceTask {
  id: string;
  title: string;
  status: "pending" | "in-progress" | "completed";
  description?: string;
  completedDate?: string;
  technician?: string;
  images?: {
    url: string;
    title: string;
  }[];
}

interface ServiceProgressProps {
  vehicleName: string;
  progress: number;
  tasks: ServiceTask[];
  appointmentId?: string;
  userId?: string; // Add userId prop
}

export function ServiceProgress({ vehicleName, progress, tasks, appointmentId, userId }: ServiceProgressProps) {
  const [selectedImage, setSelectedImage] = useState<{url: string, title: string} | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [sharedImages, setSharedImages] = useState<{url: string, title: string, category: string, customerId?: string}[]>([]);
  
  // Function to refresh images from localStorage with enhanced error handling
  const loadSharedImages = () => {
    try {
      // First try to get shared images
      const storedImages = localStorage.getItem('sharedServiceImages');
      if (storedImages) {
        const parsedImages = JSON.parse(storedImages);
        console.log("ServiceProgress - loaded images from storage:", parsedImages);
        
        // Validate image data
        const validImages = parsedImages.filter((img: any) => img && img.url && img.title);
        setSharedImages(validImages);
      } else {
        console.log("ServiceProgress - No shared images found, checking admin images");
        
        // Try loading from adminServiceImages as a fallback
        const adminImages = localStorage.getItem('adminServiceImages');
        if (adminImages) {
          const parsedAdminImages = JSON.parse(adminImages);
          console.log("ServiceProgress - Found admin images:", parsedAdminImages);
          
          // Filter to only include general images and validate image data
          const generalImages = parsedAdminImages
            .filter((img: any) => img && img.url && img.title && img.customerId === 'all')
            .map((img: any) => ({
              url: img.url,
              title: img.title,
              category: img.category || 'general',
              customerId: 'all'
            }));
            
          setSharedImages(generalImages);
          
          // Save to sharedServiceImages for future use
          if (generalImages.length > 0) {
            localStorage.setItem('sharedServiceImages', JSON.stringify(generalImages));
            console.log("ServiceProgress - Created shared images from admin images:", generalImages);
          }
        } else {
          console.log("ServiceProgress - No admin images found either");
        }
      }
      
      // Force trigger a UI refresh
      localStorage.setItem('imageUpdatedTimestamp', Date.now().toString());
    } catch (error) {
      console.error("Error loading shared images:", error);
      // Handle error gracefully
      setSharedImages([]);
    }
  };
  
  // Load images when component mounts and whenever localStorage updates
  useEffect(() => {
    loadSharedImages();
    
    // Set up event listener for localStorage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sharedServiceImages' || e.key === 'adminServiceImages' || e.key === null) {
        loadSharedImages();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check for the image update flag
    const checkForUpdates = setInterval(() => {
      const updateFlag = localStorage.getItem('imageUpdatedTimestamp');
      if (updateFlag) {
        loadSharedImages();
        localStorage.removeItem('imageUpdatedTimestamp');
      }
    }, 1000);
    
    // Trigger a manual image refresh after a short delay
    const initialLoadTimer = setTimeout(() => {
      loadSharedImages();
      console.log("ServiceProgress - Performed delayed image refresh");
    }, 1500);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkForUpdates);
      clearTimeout(initialLoadTimer);
    };
  }, []);
  
  const openImageDialog = (image: {url: string, title: string}) => {
    setSelectedImage(image);
    setIsImageDialogOpen(true);
  };

  // Filter shared images based on userId if provided
  const filteredSharedImages = userId 
    ? sharedImages.filter(img => 
        img.customerId === 'all' || img.customerId === userId
      )
    : sharedImages;

  // Manually check for image loading errors
  const checkImage = (url: string, callback: (success: boolean) => void) => {
    const img = new Image();
    img.onload = () => callback(true);
    img.onerror = () => callback(false);
    img.src = url;
  };

  // Debug logs
  useEffect(() => {
    console.log("ServiceProgress - userId:", userId);
    console.log("ServiceProgress - filtered images:", filteredSharedImages);
    console.log("ServiceProgress - tasks:", tasks);
    console.log("ServiceProgress - all shared images:", sharedImages);
    
    // Check if images are loadable
    sharedImages.forEach(img => {
      checkImage(img.url, success => {
        if (!success) {
          console.error(`Image failed to load: ${img.url}`);
        } else {
          console.log(`Image successfully loaded: ${img.url}`);
        }
      });
    });
  }, [userId, filteredSharedImages, tasks, sharedImages]);

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-gray-500" />
            <CardTitle className="text-lg">Your Car: {vehicleName}</CardTitle>
          </div>
          <span className={cn(
            "text-sm font-medium",
            progress >= 100 ? "text-green-600" : "text-blue-600"
          )}>
            {progress >= 100 ? "Completed" : `${progress}% Completed`}
          </span>
        </div>
        <CardDescription>Service progress tracking</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="mb-4">
          <Progress 
            value={progress} 
            className="h-2" 
            indicatorClassName={cn(
              progress >= 100 ? "bg-green-500" : "bg-blue-500"
            )}
          />
        </div>

        <div className="space-y-5 my-4">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <div key={task.id} className="relative">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "mt-1 rounded-full p-1",
                    task.status === "completed" ? "bg-green-100 text-green-600" : 
                    task.status === "in-progress" ? "bg-blue-100 text-blue-600" : 
                    "bg-gray-100 text-gray-400"
                  )}>
                    {task.status === "completed" ? (
                      <Check className="h-4 w-4" />
                    ) : task.status === "in-progress" ? (
                      <Clock className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                  </div>
                  <div className="space-y-1 w-full">
                    <div className="flex items-center gap-2">
                      <h4 className={cn(
                        "font-medium",
                        task.status === "completed" ? "text-green-600" : 
                        task.status === "in-progress" ? "text-blue-600" : 
                        "text-gray-500"
                      )}>
                        {task.title}
                      </h4>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        task.status === "completed" ? "bg-green-100 text-green-700" : 
                        task.status === "in-progress" ? "bg-blue-100 text-blue-700" : 
                        "bg-gray-100 text-gray-600"
                      )}>
                        {task.status === "completed" ? "Completed" : 
                        task.status === "in-progress" ? "In Progress" : 
                        "Pending"}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-500">{task.description}</p>
                    )}
                    {task.completedDate && task.technician && task.status === "completed" && (
                      <p className="text-sm text-gray-500">
                        {task.completedDate} | Technician: {task.technician}
                      </p>
                    )}

                    {/* Display task-specific images */}
                    {task.images && task.images.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {task.images.map((image, index) => (
                          <div 
                            key={`task-img-${index}`} 
                            className="relative group cursor-pointer"
                            onClick={() => openImageDialog(image)}
                          >
                            <div className="aspect-square overflow-hidden rounded-md border">
                              <img 
                                src={image.url} 
                                alt={image.title || "Service image"}
                                className="w-full h-full object-cover transition-transform hover:scale-105"
                                onError={(e) => {
                                  console.error("Image failed to load:", image.url);
                                  (e.target as HTMLImageElement).src = "/placeholder.svg"; // Fallback image
                                }}
                              />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-1 text-xs truncate">
                              {image.title || "Service image"}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Display shared images relevant to this task */}
                    {filteredSharedImages && filteredSharedImages.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-2">Reference Images:</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {filteredSharedImages
                            .filter(img => 
                              img.title.toLowerCase().includes(task.title.toLowerCase()) || 
                              task.title.toLowerCase().includes(img.title.toLowerCase())
                            )
                            .map((image, index) => (
                              <div 
                                key={`shared-${index}`} 
                                className="relative group cursor-pointer"
                                onClick={() => openImageDialog(image)}
                              >
                                <div className="aspect-square overflow-hidden rounded-md border">
                                  <img 
                                    src={image.url} 
                                    alt={image.title || "Reference image"}
                                    className="w-full h-full object-cover transition-transform hover:scale-105"
                                    onError={(e) => {
                                      console.error("Shared image failed to load:", image.url);
                                      (e.target as HTMLImageElement).src = "/placeholder.svg"; // Fallback image
                                    }}
                                  />
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-1 text-xs truncate">
                                  {image.title || "Reference image"}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {task !== tasks[tasks.length - 1] && (
                  <div className="absolute left-[18px] top-[28px] bottom-[-24px] w-[2px] bg-gray-200"></div>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">No service tasks available yet.</p>
          )}
        </div>
      </CardContent>
      
      {/* Image Preview Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedImage?.title || "Service Image"}</DialogTitle>
            <DialogDescription>
              Service progress documentation
            </DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="flex items-center justify-center">
              <img 
                src={selectedImage.url} 
                alt={selectedImage.title || "Service image"}
                className="max-h-[60vh] w-auto object-contain rounded-md"
                onError={(e) => {
                  console.error("Dialog image failed to load:", selectedImage.url);
                  (e.target as HTMLImageElement).src = "/placeholder.svg"; // Fallback image
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
