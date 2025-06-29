
import { useState, useEffect } from "react";
import { Check, Clock, AlertCircle, Wrench, ImageIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ServiceTask } from "@/types/service";

interface ServiceProgressProps {
  vehicleName: string;
  progress: number;
  tasks: ServiceTask[];
  appointmentId?: string;
  userId?: string;
}

export function ServiceProgress({ vehicleName, progress, tasks, appointmentId, userId }: ServiceProgressProps) {
  const [selectedImage, setSelectedImage] = useState<{url: string, title: string} | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [sharedImages, setSharedImages] = useState<{url: string, title: string, category: string, customerId?: string}[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [imageLoadAttempts, setImageLoadAttempts] = useState(0);
  
  // Enhanced function to load images with better error handling
  const loadSharedImages = () => {
    try {
      console.log("ServiceProgress - Loading shared images attempt:", imageLoadAttempts + 1);
      setLoadingImages(true);
      
      // First check admin images directly - this is more reliable
      const adminImages = localStorage.getItem('adminServiceImages');
      
      if (adminImages) {
        const parsedAdminImages = JSON.parse(adminImages);
        console.log("ServiceProgress - Found admin images:", parsedAdminImages);
        
        if (Array.isArray(parsedAdminImages) && parsedAdminImages.length > 0) {
          // Filter images that should be visible to this user
          const visibleImages = parsedAdminImages.filter((img: any) => {
            if (img && img.url && img.title) {
              // Show if shared with all users or specifically with this user
              return img.customerId === 'all' || 
                   (userId && img.customerId === userId);
            }
            return false;
          });
          
          const processedImages = visibleImages.map((img: any) => ({
            url: img.url,
            title: img.title,
            category: img.category || 'general',
            customerId: img.customerId
          }));
          
          console.log("ServiceProgress - Filtered visible images:", processedImages);
          setSharedImages(processedImages);
        } else {
          console.log("ServiceProgress - Admin images array is empty or invalid");
        }
      } else {
        // Fallback to sharedServiceImages if adminServiceImages doesn't exist
        const storedImages = localStorage.getItem('sharedServiceImages');
        if (storedImages) {
          const parsedImages = JSON.parse(storedImages);
          console.log("ServiceProgress - Loaded from shared images:", parsedImages);
          
          // Validate and filter images
          const validImages = parsedImages.filter((img: any) => {
            if (img && img.url && img.title) {
              return img.customerId === 'all' || 
                   (userId && img.customerId === userId);
            }
            return false;
          });
          
          setSharedImages(validImages);
        } else {
          console.log("ServiceProgress - No shared images found");
          setSharedImages([]);
        }
      }
      
      setLoadingImages(false);
    } catch (error) {
      console.error("Error loading shared images:", error);
      setSharedImages([]);
      setLoadingImages(false);
    }
  };
  
  // Initial load and setup event listeners
  useEffect(() => {
    console.log("ServiceProgress - Initial mount, userId:", userId);
    loadSharedImages();
    
    // Set up event listener for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sharedServiceImages' || e.key === 'adminServiceImages' || e.key === 'imageUpdatedTimestamp' || e.key === null) {
        console.log("ServiceProgress - Storage change detected:", e.key);
        loadSharedImages();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('serviceImagesUpdated', loadSharedImages as EventListener);
    
    // Trigger additional load attempts with increasing delays
    const loadTimers = [
      setTimeout(() => {
        console.log("ServiceProgress - Delayed image refresh (1)");
        setImageLoadAttempts(prev => prev + 1);
        loadSharedImages();
      }, 1000),
      
      setTimeout(() => {
        console.log("ServiceProgress - Delayed image refresh (2)");
        setImageLoadAttempts(prev => prev + 1);
        loadSharedImages();
      }, 3000)
    ];
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('serviceImagesUpdated', loadSharedImages as EventListener);
      loadTimers.forEach(timer => clearTimeout(timer));
    };
  }, [userId]);
  
  // Additional useEffect to reload images when imageLoadAttempts changes
  useEffect(() => {
    if (imageLoadAttempts > 0) {
      loadSharedImages();
    }
  }, [imageLoadAttempts]);
  
  const openImageDialog = (image: {url: string, title: string}) => {
    setSelectedImage(image);
    setIsImageDialogOpen(true);
  };

  // Filter shared images based on userId if provided
  const filteredSharedImages = sharedImages.filter(img => 
    img.customerId === 'all' || (userId && img.customerId === userId)
  );

  // COMPLETELY REWRITTEN: Strict task-to-image matching function
  const getTaskRelevantImages = (task: ServiceTask) => {
    // First check if the task itself has direct attached images
    if (task.images && task.images.length > 0) {
      return task.images;
    }
    
    // Implement extremely strict matching to ensure images only show for their specific service
    return filteredSharedImages.filter(img => {
      // Basic validation - skip invalid images
      if (!img.title || !task.title) return false;
      
      const imgTitleLower = img.title.toLowerCase().trim();
      const taskTitleLower = task.title.toLowerCase().trim();
      
      // 1. EXACT MATCH - Image title must exactly match the task title (case-insensitive)
      if (imgTitleLower === taskTitleLower) {
        return true;
      }
      
      // 2. For special cases like "Vehicle Inspection" or "Final Inspection"
      if (taskTitleLower === "vehicle inspection" || taskTitleLower === "initial inspection") {
        // Only match inspection images specifically labeled for initial inspection
        return (imgTitleLower === "vehicle inspection" || imgTitleLower === "initial inspection") &&
               img.category?.toLowerCase() === "inspection";
      }
      
      if (taskTitleLower === "final inspection") {
        // Only match images specifically labeled for final inspection
        return imgTitleLower === "final inspection" && img.category?.toLowerCase() === "inspection";
      }
      
      // 3. For images that have the exact task name in their title (not just a substring)
      const imgWords = imgTitleLower.split(/\s+/);
      const taskWords = taskTitleLower.split(/\s+/);
      
      // Only consider a match if ALL significant words from the task title appear in the image title
      // AND the image has a matching category if available
      if (taskWords.length > 1 && taskWords.every(word => {
        // Skip short words like "the", "and", "of"
        return word.length <= 2 || imgWords.includes(word);
      })) {
        // Extra validation: if we have a category, it should align with the task type
        if (img.category) {
          const category = img.category.toLowerCase();
          
          if (taskTitleLower.includes("oil change") && (category === "service" || imgTitleLower.includes("oil"))) {
            return true;
          }
          
          if (taskTitleLower.includes("tyre rotation") && (category === "service" || imgTitleLower.includes("tyre"))) {
            return true;
          }
          
          if (taskTitleLower.includes("brake") && (category === "service" || imgTitleLower.includes("brake"))) {
            return true;
          }
        }
      }
      
      // No match found
      return false;
    });
  };
  
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
            tasks.map((task) => {
              // Get images STRICTLY relevant to THIS task only with the new matcher function
              const taskImages = getTaskRelevantImages(task);

              return (
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
                      {task.completedDate && (
                        <p className="text-sm text-gray-500">
                          {task.completedDate}
                          {task.technician && (
                            <span> | Technician: {task.technician}</span>
                          )}
                        </p>
                      )}

                      {/* Display task-specific images - ONLY if task is completed or in progress */}
                      {(task.status === "completed" || task.status === "in-progress") && taskImages && taskImages.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-2">
                            {taskImages === task.images ? "Task Images:" : "Service Images:"}
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {taskImages.map((image, index) => (
                              <div 
                                key={`task-img-${task.id}-${index}`} 
                                className="relative group cursor-pointer"
                                onClick={() => openImageDialog(image)}
                              >
                                <div className="aspect-square overflow-hidden rounded-md border">
                                  <img 
                                    src={image.url} 
                                    alt={image.title || "Service image"}
                                    className="w-full h-full object-cover transition-transform hover:scale-105"
                                    onError={(e) => {
                                      console.error("Task image failed to load:", image.url);
                                      (e.target as HTMLImageElement).src = "/placeholder.svg"; 
                                    }}
                                  />
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-1 text-xs truncate">
                                  {image.title || "Service image"}
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
              );
            })
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
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
