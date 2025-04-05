
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
}

export function ServiceProgress({ vehicleName, progress, tasks, appointmentId }: ServiceProgressProps) {
  const [selectedImage, setSelectedImage] = useState<{url: string, title: string} | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  
  const openImageDialog = (image: {url: string, title: string}) => {
    setSelectedImage(image);
    setIsImageDialogOpen(true);
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
          <Progress value={progress} className="h-2" />
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

                    {task.images && task.images.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {task.images.map((image, index) => (
                          <div 
                            key={index} 
                            className="relative group cursor-pointer"
                            onClick={() => openImageDialog(image)}
                          >
                            <div className="aspect-square overflow-hidden rounded-md border">
                              <img 
                                src={image.url} 
                                alt={image.title}
                                className="w-full h-full object-cover transition-transform hover:scale-105"
                              />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-1 text-xs truncate">
                              {image.title}
                            </div>
                          </div>
                        ))}
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
            <DialogTitle>{selectedImage?.title}</DialogTitle>
            <DialogDescription>
              Service progress documentation
            </DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="flex items-center justify-center">
              <img 
                src={selectedImage.url} 
                alt={selectedImage.title}
                className="max-h-[60vh] w-auto object-contain rounded-md"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
