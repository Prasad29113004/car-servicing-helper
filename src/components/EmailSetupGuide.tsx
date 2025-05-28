
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ExternalLink, Mail } from "lucide-react";

const EmailSetupGuide = () => {
  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Service Setup Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            To send real emails, you need to configure EmailJS with your email service credentials.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-3">
          <h4 className="font-semibold">Setup Steps:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Sign up for a free EmailJS account</li>
            <li>Connect your email service (Gmail, Outlook, etc.)</li>
            <li>Create email templates for booking confirmations</li>
            <li>Get your Service ID, Template ID, and Public Key</li>
            <li>Update the credentials in <code className="bg-gray-100 px-1 rounded">src/services/emailService.ts</code></li>
          </ol>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => window.open('https://www.emailjs.com/', '_blank')}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Go to EmailJS
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.open('https://www.emailjs.com/docs/', '_blank')}
          >
            View Documentation
          </Button>
        </div>
        
        <Alert>
          <AlertDescription>
            <strong>Template Variables:</strong> Create templates with these variables: 
            to_email, to_name, booking_id, services, booking_date, booking_time, car_details, license_plate, total_amount, phone
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default EmailSetupGuide;
