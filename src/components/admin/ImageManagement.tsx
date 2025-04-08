
import { useState, useRef, ChangeEvent, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Upload, ImageIcon, X, Plus, Info, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ServiceImage {
  id: string;
  title: string;
  url: string;
  createdAt: string;
  category: string;
  customerId?: string | 'all';
  customerName?: string;
}

interface UserData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  vehicles?: any[];
}

const ImageManagement = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [images, setImages] = useState<ServiceImage[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ServiceImage | null>(null);
  const [newImageData, setNewImageData] = useState({
    title: "",
    category: "general",
    url: "",
    customerId: "all"
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [allUsers, setAllUsers] = useState<UserData[]>([]);

  useEffect(() => {
    // Load images from localStorage on component mount
    loadImagesFromStorage();
    loadAllUsers();
  }, []);

  const loadAllUsers = () => {
    const users: UserData[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key && key.startsWith('userData_')) {
        try {
          const userData = JSON.parse(localStorage.getItem(key) || '{}');
          users.push(userData);
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    }
    
    setAllUsers(users);
  };

  const loadImagesFromStorage = () => {
    try {
      const storedImages = localStorage.getItem('adminServiceImages');
      if (storedImages) {
        setImages(JSON.parse(storedImages));
      }
    } catch (error) {
      console.error("Error loading images from storage:", error);
    }
  };

  const saveImagesToStorage = (updatedImages: ServiceImage[]) => {
    try {
      // Save admin version
      localStorage.setItem('adminServiceImages', JSON.stringify(updatedImages));
      
      // Also save a simplified version for sharing with service progress
      const sharedImages = updatedImages.map(img => ({
        url: img.url,
        title: img.title,
        category: img.category,
        customerId: img.customerId || 'all',
        customerName: img.customerName
      }));
      
      // This ensures the data is available to the customer dashboard
      localStorage.setItem('sharedServiceImages', JSON.stringify(sharedImages));
      
      console.log("Images saved to storage:", sharedImages);
    } catch (error) {
      console.error("Error saving images to storage:", error);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadImage = () => {
    if (!newImageData.title.trim()) {
      toast({
        title: "Error",
        description: "Please provide an image title",
        variant: "destructive"
      });
      return;
    }

    if (!imagePreview) {
      toast({
        title: "Error",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }

    // Get customer name if specific customer selected
    let customerName = "All Customers";
    if (newImageData.customerId !== "all") {
      const customer = allUsers.find(user => user.id === newImageData.customerId);
      customerName = customer ? customer.fullName : "Unknown Customer";
    }

    // Create a new image object
    const newImage: ServiceImage = {
      id: `img_${Date.now()}`,
      title: newImageData.title,
      url: imagePreview,
      category: newImageData.category,
      createdAt: new Date().toISOString(),
      customerId: newImageData.customerId,
      customerName: customerName
    };

    // Update state with the new image
    const updatedImages = [newImage, ...images];
    setImages(updatedImages);
    
    // Save to localStorage
    saveImagesToStorage(updatedImages);
    
    // Reset form
    resetUploadForm();
    setIsUploadDialogOpen(false);
    
    toast({
      title: "Success",
      description: `Image uploaded successfully and shared with ${newImageData.customerId === 'all' ? 'all customers' : customerName}`
    });
  };

  const resetUploadForm = () => {
    setNewImageData({
      title: "",
      category: "general",
      url: "",
      customerId: "all"
    });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openImageViewer = (image: ServiceImage) => {
    setSelectedImage(image);
    setIsViewDialogOpen(true);
  };

  const deleteImage = (id: string) => {
    const updatedImages = images.filter(img => img.id !== id);
    setImages(updatedImages);
    
    // Save updated list to localStorage
    saveImagesToStorage(updatedImages);
    
    toast({
      title: "Image deleted",
      description: "The image has been removed"
    });
  };

  // Filter images based on active tab
  const filteredImages = activeTab === "all" 
    ? images 
    : images.filter(img => img.category === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Service Images</h2>
          <p className="text-gray-500">Upload and manage service related images</p>
        </div>
        <Button onClick={() => setIsUploadDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Upload Image
        </Button>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-700">
          Images uploaded here will automatically be available in customer service progress sections
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Images</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="service">Service</TabsTrigger>
          <TabsTrigger value="parts">Parts</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {filteredImages.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredImages.map((image) => (
                <Card key={image.id} className="overflow-hidden">
                  <div 
                    className="aspect-square relative cursor-pointer"
                    onClick={() => openImageViewer(image)}
                  >
                    <img 
                      src={image.url} 
                      alt={image.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                      <Button variant="secondary" size="sm">
                        <ImageIcon className="h-4 w-4 mr-1" /> 
                        View
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start">
                      <div className="truncate">
                        <p className="font-medium text-sm truncate">{image.title}</p>
                        <p className="text-xs text-gray-500">{new Date(image.createdAt).toLocaleDateString()}</p>
                        {image.customerName && (
                          <p className="text-xs text-blue-600 mt-1">
                            {image.customerId === 'all' ? 'All Customers' : image.customerName}
                          </p>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-gray-500 hover:text-red-500 ml-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteImage(image.id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No images found</h3>
              <p className="text-gray-500 mt-1">Upload images to see them here</p>
              <Button 
                variant="outline" 
                onClick={() => setIsUploadDialogOpen(true)}
                className="mt-4"
              >
                Upload Image
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={(open) => {
        setIsUploadDialogOpen(open);
        if (!open) resetUploadForm();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Image</DialogTitle>
            <DialogDescription>
              Add a new image to your service library
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="imageTitle">Image Title *</Label>
              <Input
                id="imageTitle"
                value={newImageData.title}
                onChange={(e) => setNewImageData({...newImageData, title: e.target.value})}
                placeholder="Enter image title"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="imageCategory">Category</Label>
              <select
                id="imageCategory"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newImageData.category}
                onChange={(e) => setNewImageData({...newImageData, category: e.target.value})}
              >
                <option value="general">General</option>
                <option value="service">Service</option>
                <option value="parts">Parts</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="customerSelect">Share With</Label>
              <Select 
                value={newImageData.customerId} 
                onValueChange={(value) => setNewImageData({...newImageData, customerId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4 text-blue-500" />
                      <span>All Customers</span>
                    </div>
                  </SelectItem>
                  {allUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">Select which customer(s) this image will be visible to</p>
            </div>
            
            <div className="grid gap-2">
              <Label>Upload Image *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  id="imageUpload"
                  className="hidden"
                />
                
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-[200px] mx-auto rounded-md object-contain"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white"
                      onClick={() => {
                        setImagePreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="flex flex-col items-center justify-center py-6 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-900">Click to upload</p>
                    <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              resetUploadForm();
              setIsUploadDialogOpen(false);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleUploadImage}
              disabled={!imagePreview || !newImageData.title.trim()}
            >
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Image Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedImage?.title}</DialogTitle>
            <DialogDescription>
              {selectedImage?.category} | {selectedImage && new Date(selectedImage.createdAt).toLocaleDateString()}
              {selectedImage?.customerName && (
                <div className="mt-1 text-blue-600">
                  Shared with: {selectedImage.customerId === 'all' ? 'All Customers' : selectedImage.customerName}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedImage && (
            <div className="flex items-center justify-center my-4">
              <img 
                src={selectedImage.url}
                alt={selectedImage.title}
                className="max-h-[60vh] max-w-full object-contain rounded-md"
              />
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                if (selectedImage) {
                  deleteImage(selectedImage.id);
                  setIsViewDialogOpen(false);
                }
              }}
            >
              Delete Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageManagement;
