import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Star, 
  Phone, 
  Briefcase,
  User,
  Package,
  IndianRupee,
  ArrowLeft,
  TrendingUp
} from "lucide-react";

const AvailablePorters = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const bookingData = location.state;

  const [selectedPorter, setSelectedPorter] = useState(null);
  const [requestSent, setRequestSent] = useState(false);
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const [porterAccepted, setPorterAccepted] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [showApproaching, setShowApproaching] = useState(false);

  // Available porter at the station
  const porter = {
    id: "1234",
    name: "Raju",
    photo: "/porter-raju.jpg",
    station: "Kurnool",
    rating: 4.8,
    totalTrips: 247,
    experience: "5 years",
    phone: "+91 98765 43210",
    languages: ["Telugu", "Hindi", "English"],
    specialization: "Heavy Luggage",
    availability: "Available Now",
    badge: "Verified",
  };

  useEffect(() => {
    if (!bookingData) {
      toast({
        title: "No Booking Data",
        description: "Please complete the booking form first",
        variant: "destructive",
      });
      navigate("/book");
    }
  }, [bookingData, navigate, toast]);

  // Show "Porter is approaching" after acceptance
  useEffect(() => {
    if (porterAccepted) {
      setShowApproaching(true);
    }
  }, [porterAccepted]);

  // Check for porter acceptance in real-time
  useEffect(() => {
    if (!requestSent || !currentBookingId) {
      console.log('⏸️ Not checking - requestSent:', requestSent, 'bookingId:', currentBookingId);
      return;
    }

    console.log('🔄 Starting polling for booking:', currentBookingId);
    const startTime = Date.now();
    const timeoutDuration = 5 * 60 * 1000; // 5 minutes

    const checkInterval = setInterval(() => {
      // Check for timeout
      if (Date.now() - startTime > timeoutDuration) {
        clearInterval(checkInterval);
        setWaitingForResponse(false);
        toast({
          title: "Request Timeout",
          description: "Porter hasn't responded yet. Please try again later.",
          variant: "destructive",
        });
        return;
      }

      try {
        const storedBookings = localStorage.getItem('porterBookings');
        console.log('🔍 Passenger checking localStorage:', storedBookings);
        
        if (storedBookings) {
          const bookings = JSON.parse(storedBookings);
          console.log('📦 All bookings found:', bookings);
          
          const thisBooking = bookings.find(b => b.id === currentBookingId);
          console.log('🎯 Current booking status:', thisBooking);
          
          if (thisBooking && thisBooking.status === "accepted") {
            console.log('✅ BOOKING ACCEPTED! Stopping polling.');
            clearInterval(checkInterval);
            setWaitingForResponse(false);
            setPorterAccepted(true);
            toast({
              title: "Request Accepted! 🎉",
              description: `${porter.name} has accepted your request`,
            });
          } else {
            console.log('⏳ Still waiting... Status:', thisBooking?.status);
          }
        } else {
          console.log('⚠️ No bookings in localStorage');
        }
      } catch (error) {
        console.error("❌ Error checking booking status:", error);
      }
    }, 2000);

    // Cleanup interval on unmount or when dependencies change
    return () => {
      console.log('🛑 Stopping polling interval');
      clearInterval(checkInterval);
    };
  }, [requestSent, currentBookingId, porter.name, toast]);

  const handleSendRequest = () => {
    if (!bookingData) {
      toast({
        title: "Error",
        description: "Booking data is missing",
        variant: "destructive",
      });
      return;
    }

    console.log('📤 Sending request with booking data:', bookingData);

    setSelectedPorter(porter);
    
    // Create booking request object
    const bookingRequest = {
      id: `BK${Date.now()}`,
      porterId: porter.id,
      porterName: porter.name,
      passengerName: bookingData.personalDetails?.fullName || "Guest",
      phone: bookingData.personalDetails?.phone || "N/A",
      pnr: bookingData.travelDetails?.pnr || "N/A",
      station: bookingData.travelDetails?.station || porter.station,
      trainNo: bookingData.travelDetails?.trainNo || "N/A",
      trainName: bookingData.travelDetails?.trainName || "N/A",
      coachNo: bookingData.travelDetails?.coachNo || "N/A",
      boardingStation: bookingData.travelDetails?.boardingStation || "N/A",
      boardingStationCode: bookingData.travelDetails?.boardingStationCode || "N/A",
      destinationStation: bookingData.travelDetails?.destinationStation || "N/A",
      destinationStationCode: bookingData.travelDetails?.destinationStationCode || "N/A",
      dateOfJourney: bookingData.travelDetails?.dateOfJourney || "N/A",
      arrivalTime: bookingData.travelDetails?.arrivalTime || "N/A",
      numberOfBags: bookingData.luggageDetails?.numberOfBags || 1,
      weight: bookingData.luggageDetails?.weight || 10,
      isLateNight: bookingData.luggageDetails?.isLateNight || false,
      isPriority: bookingData.luggageDetails?.isPriority || false,
      totalPrice: bookingData.pricing?.totalPrice || 100,
      notes: bookingData.notes || "",
      status: "pending",
      requestedAt: new Date().toISOString(),
    };

    console.log('📝 Created booking request:', bookingRequest);

    // Save to localStorage
    try {
      const existingBookings = localStorage.getItem('porterBookings');
      const bookings = existingBookings ? JSON.parse(existingBookings) : [];
      
      console.log('📚 Existing bookings before save:', bookings);
      
      bookings.push(bookingRequest);
      localStorage.setItem('porterBookings', JSON.stringify(bookings));
      
      console.log('💾 Saved to localStorage. All bookings:', bookings);
      console.log('✅ Booking ID:', bookingRequest.id);
      
      // Verify it was saved
      const verification = localStorage.getItem('porterBookings');
      console.log('🔍 Verification - localStorage now contains:', verification);
      
      // Store current booking ID for tracking
      setCurrentBookingId(bookingRequest.id);
      setRequestSent(true);
      setWaitingForResponse(true);

      toast({
        title: "Request Sent ✓",
        description: `Request sent to ${porter.name}. Waiting for acceptance...`,
      });
    } catch (error) {
      console.error("❌ Error saving booking:", error);
      toast({
        title: "Error",
        description: "Failed to send request. Please try again.",
        variant: "destructive",
      });
      setRequestSent(false);
      setWaitingForResponse(false);
    }
  };

  const handleConfirmBooking = () => {
    // Get the accepted booking details from localStorage
    try {
      const storedBookings = localStorage.getItem('porterBookings');
      if (storedBookings) {
        const bookings = JSON.parse(storedBookings);
        const acceptedBooking = bookings.find(b => b.id === currentBookingId);
        
        console.log('✅ Proceeding to confirmation with booking:', acceptedBooking);
        
        navigate("/", {
          state: {
            booking: acceptedBooking,
            bookingData: bookingData,
            assignedPorter: porter,
          },
        });
      }
    } catch (error) {
      console.error("❌ Error loading booking:", error);
      toast({
        title: "Error",
        description: "Failed to load booking details.",
        variant: "destructive",
      });
    }
  };

  if (!bookingData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/book-porter")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Booking
          </Button>
          <h1 className="text-3xl font-bold mb-2">Available Porters</h1>
          <p className="text-muted-foreground">
            Select a porter for your booking at {bookingData.travelDetails?.station || "your station"}
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Your Booking Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <User className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{bookingData.personalDetails?.fullName}</p>
                      <p className="text-muted-foreground">{bookingData.personalDetails?.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{bookingData.travelDetails?.station}</p>
                      <p className="text-muted-foreground text-xs">
                        {bookingData.travelDetails?.trainNo} - {bookingData.travelDetails?.trainName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Package className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {bookingData.luggageDetails?.numberOfBags} Bags, {bookingData.luggageDetails?.weight} kg
                      </p>
                    </div>
                  </div>
                  {bookingData.pricing && (
                    <div className="flex items-start space-x-2 pt-3 border-t">
                      <IndianRupee className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground text-xs">Total Fare</p>
                        <p className="font-bold text-lg text-primary">
                          ₹{bookingData.pricing.totalPrice}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Booking ID Display */}
                {currentBookingId && (
                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground uppercase mb-1">Booking ID</p>
                    <p className="font-mono text-sm font-semibold">{currentBookingId}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Porter Card */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Available Porter</CardTitle>
                  <Badge variant="success" className="bg-green-100 text-green-700">
                    {porter.availability}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Porter Photo */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-200 relative">
                      <img
                        src={porter.photo}
                        alt={porter.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 128 128'%3E%3Crect fill='%23ddd' width='128' height='128'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='48' fill='%23999'%3ER%3C/text%3E%3C/svg%3E";
                        }}
                      />
                      {porter.badge && (
                        <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-xs py-1 text-center">
                          ✓ {porter.badge}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Porter Details */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-1">{porter.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                          <span className="font-medium">{porter.rating}</span>
                        </div>
                        <div className="flex items-center">
                          <Briefcase className="w-4 h-4 mr-1" />
                          <span>{porter.totalTrips} trips</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{porter.experience}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase mb-1">Porter ID</p>
                        <p className="font-mono font-semibold">{porter.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase mb-1">Station</p>
                        <p className="font-semibold flex items-center">
                          <MapPin className="w-4 h-4 mr-1 text-primary" />
                          {porter.station}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase mb-1">Contact</p>
                        <p className="font-semibold flex items-center">
                          <Phone className="w-4 h-4 mr-1 text-primary" />
                          {porter.phone}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase mb-1">Specialization</p>
                        <p className="font-semibold">{porter.specialization}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground uppercase mb-2">Languages</p>
                      <div className="flex flex-wrap gap-2">
                        {porter.languages.map((lang) => (
                          <Badge key={lang} variant="secondary">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Section */}
                <div className="mt-6 pt-6 border-t">
                  {!requestSent && (
                    <Button
                      onClick={handleSendRequest}
                      className="w-full"
                      size="lg"
                    >
                      Send Request to {porter.name}
                    </Button>
                  )}

                  {requestSent && waitingForResponse && (
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="py-6">
                        <div className="text-center space-y-4">
                          <div className="flex justify-center">
                            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg text-blue-900 mb-1">
                              Request Sent Successfully
                            </h4>
                            <p className="text-sm text-blue-700">
                              Waiting for {porter.name} to accept your request
                            </p>
                            <p className="text-xs text-blue-600 mt-2">
                              This usually takes 1-2 minutes
                            </p>
                            {currentBookingId && (
                              <p className="text-xs text-blue-500 mt-2 font-mono">
                                Booking ID: {currentBookingId}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center justify-center space-x-2 text-sm text-blue-700">
                            <Clock className="w-4 h-4 animate-pulse" />
                            <span>Checking porter response...</span>
                          </div>
                          <div className="pt-3 border-t border-blue-200">
                            <p className="text-xs text-blue-600">
                              ✓ Request saved to system
                            </p>
                            <p className="text-xs text-blue-600">
                              ⏱ Auto-checking every 2 seconds
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {porterAccepted && showApproaching && (
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="py-6">
                        <div className="text-center space-y-4">
                          <div className="flex justify-center">
                            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center animate-pulse">
                              <TrendingUp className="w-10 h-10 text-green-600" />
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-xl text-green-900 mb-2">
                              Porter Has Accepted! 🎉
                            </h4>
                            <div className="bg-white p-4 rounded-lg border border-green-200 mb-4">
                              <div className="flex items-center justify-center mb-3">
                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                  <User className="w-6 h-6 text-green-600" />
                                </div>
                              </div>
                              <p className="font-bold text-lg text-green-900 mb-1">{porter.name}</p>
                              <p className="text-sm text-green-700 mb-3">is on the way to assist you</p>
                              
                              <div className="space-y-2 text-left bg-green-50 p-3 rounded border border-green-200">
                                <p className="text-xs text-green-800 flex items-center">
                                  <Phone className="w-3 h-3 mr-2" />
                                  <strong className="mr-1">Contact:</strong> {porter.phone}
                                </p>
                                <p className="text-xs text-green-800 flex items-center">
                                  <MapPin className="w-3 h-3 mr-2" />
                                  <strong className="mr-1">Location:</strong> {porter.station} Station
                                </p>
                                <p className="text-xs text-green-800 flex items-center">
                                  <Clock className="w-3 h-3 mr-2" />
                                  <strong className="mr-1">ETA:</strong> 1-2 minutes
                                </p>
                              </div>
                            </div>
                            
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                              <p className="text-sm text-amber-800 font-medium">
                                ⏱️ Please wait for the porter to arrive at your location
                              </p>
                              <p className="text-xs text-amber-600 mt-1">
                                You can contact the porter if needed
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={handleConfirmBooking}
                            className="w-full"
                            size="lg"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Completed! back to home 
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailablePorters;