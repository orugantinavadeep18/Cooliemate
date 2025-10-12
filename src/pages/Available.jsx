import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { linkVisitToBooking } from '@/utils/analytics';
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
  TrendingUp,
  XCircle,
  X
} from "lucide-react";

const API_BASE = 'https://cooliemate.onrender.com';

const AvailablePorters = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const bookingData = location.state;

  const [selectedPorter, setSelectedPorter] = useState(null);
  const [requestSent, setRequestSent] = useState(false);
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const [porterAccepted, setPorterAccepted] = useState(false);
  const [porterDeclined, setPorterDeclined] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [showApproaching, setShowApproaching] = useState(false);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

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

  // Check for porter acceptance in real-time using backend API
  useEffect(() => {
    if (!requestSent || !currentBookingId) {
      console.log('⏸️ Not checking - requestSent:', requestSent, 'bookingId:', currentBookingId);
      return;
    }

    console.log('🔄 Starting polling for booking:', currentBookingId);
    const startTime = Date.now();
    const timeoutDuration = 5 * 60 * 1000; // 5 minutes

    const checkInterval = setInterval(async () => {
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
        console.log('🔍 Checking booking status from backend...');
        const response = await fetch(`${API_BASE}/api/bookings/${currentBookingId}`);
        
        if (!response.ok) {
          console.error('❌ Failed to fetch booking:', response.status);
          return;
        }

        const data = await response.json();
        console.log('📦 Booking data from backend:', data);
        
        if (data.booking && data.booking.status === "accepted") {
          console.log('✅ BOOKING ACCEPTED! Stopping polling.');
          clearInterval(checkInterval);
          setWaitingForResponse(false);
          setPorterAccepted(true);
          toast({
            title: "Request Accepted! 🎉",
            description: `${porter.name} has accepted your request`,
          });
        } else if (data.booking && data.booking.status === "declined") {
          console.log('❌ BOOKING DECLINED! Stopping polling.');
          clearInterval(checkInterval);
          setWaitingForResponse(false);
          setPorterDeclined(true);
          toast({
            title: "Request Declined",
            description: `${porter.name} is unable to accept this request`,
            variant: "destructive",
          });
        } else {
          console.log('⏳ Still waiting... Status:', data.booking?.status);
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

  const handleSendRequest = async () => {
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
    };

    console.log('📝 Created booking request:', bookingRequest);

    // Send to backend API
    try {
      const response = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingRequest)
      });

      if (!response.ok) {
        throw new Error('Failed to create booking');
      }

      const data = await response.json();
      console.log('✅ Booking created successfully:', data);
      
      // Store current booking ID for tracking
      setCurrentBookingId(data.booking.id);
      setRequestSent(true);
      setWaitingForResponse(true);

      // Link analytics visit to booking
      await linkVisitToBooking(data.booking.id);

      toast({
        title: "Request Sent ✓",
        description: `Request sent to ${porter.name}. Waiting for acceptance...`,
      });
    } catch (error) {
      console.error("❌ Error creating booking:", error);
      toast({
        title: "Error",
        description: "Failed to send request. Please try again.",
        variant: "destructive",
      });
      setRequestSent(false);
      setWaitingForResponse(false);
    }
  };

  const handleConfirmBooking = async () => {
    // Show review popup instead of navigating immediately
    setShowReviewPopup(true);
  };

  const handleSkipReview = () => {
    // Navigate to home without review
    navigate("/", {
      state: {
        booking: { id: currentBookingId },
        bookingData: bookingData,
        assignedPorter: porter,
      },
    });
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating",
        variant: "destructive",
      });
      return;
    }

    setSubmittingReview(true);

    try {
      const reviewData = {
        bookingId: currentBookingId,
        userName: bookingData.personalDetails?.fullName,
        userPhone: bookingData.personalDetails?.phone,
        rating: rating,
        comment: review || "Great service!",
        experience: rating >= 4 ? "excellent" : rating >= 3 ? "good" : rating >= 2 ? "average" : "poor",
        porterRating: rating,
        porterId: porter.id,
        porterName: porter.name
      };

      const response = await fetch(`${API_BASE}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      toast({
        title: "Thank You! ⭐",
        description: "Your review has been submitted successfully",
      });

      // Navigate to home after successful review
      navigate("/", {
        state: {
          booking: { id: currentBookingId },
          bookingData: bookingData,
          assignedPorter: porter,
        },
      });
    } catch (error) {
      console.error("❌ Error submitting review:", error);
      toast({
        title: "Review Error",
        description: "Failed to submit review, but you can continue to home",
      });
      // Still navigate even if review fails
      handleSkipReview();
    } finally {
      setSubmittingReview(false);
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
                              ✓ Request saved to backend
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

                  {porterDeclined && (
                    <Card className="bg-red-50 border-red-200">
                      <CardContent className="py-6">
                        <div className="text-center space-y-4">
                          <div className="flex justify-center">
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                              <XCircle className="w-10 h-10 text-red-600" />
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-xl text-red-900 mb-2">
                              Request Declined
                            </h4>
                            <p className="text-sm text-red-700 mb-4">
                              We're sorry! {porter.name} is unable to accept your request at this time.
                            </p>
                            
                            <div className="bg-white p-4 rounded-lg border border-red-200 mb-4">
                              <p className="text-sm text-gray-700 mb-3">
                                This could be due to:
                              </p>
                              <ul className="text-left text-xs text-gray-600 space-y-2">
                                <li className="flex items-start">
                                  <span className="text-red-500 mr-2">•</span>
                                  <span>Porter already engaged with another passenger</span>
                                </li>
                                <li className="flex items-start">
                                  <span className="text-red-500 mr-2">•</span>
                                  <span>Unable to handle the luggage requirements</span>
                                </li>
                                <li className="flex items-start">
                                  <span className="text-red-500 mr-2">•</span>
                                  <span>Location or timing constraints</span>
                                </li>
                              </ul>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                              <p className="text-sm font-medium text-blue-900 mb-2">
                                💡 What you can do:
                              </p>
                              <ul className="text-left text-xs text-blue-700 space-y-2">
                                <li className="flex items-start">
                                  <span className="text-blue-500 mr-2">✓</span>
                                  <span>Try booking again in a few minutes</span>
                                </li>
                                <li className="flex items-start">
                                  <span className="text-blue-500 mr-2">✓</span>
                                  <span>Check if other porters are available</span>
                                </li>
                                <li className="flex items-start">
                                  <span className="text-blue-500 mr-2">✓</span>
                                  <span>Contact station helpdesk for assistance</span>
                                </li>
                              </ul>
                            </div>

                            {currentBookingId && (
                              <div className="text-xs text-gray-500 mb-4">
                                Booking Reference: <span className="font-mono">{currentBookingId}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-3">
                            <Button
                              onClick={() => navigate("/book-porter")}
                              variant="outline"
                              className="flex-1"
                              size="lg"
                            >
                              Try Again
                            </Button>
                            <Button
                              onClick={() => navigate("/")}
                              className="flex-1"
                              size="lg"
                            >
                              Back to Home
                            </Button>
                          </div>
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

      {/* Review Popup Modal */}
      {showReviewPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full shadow-2xl">
            <CardHeader className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2"
                onClick={handleSkipReview}
              >
                <X className="w-4 h-4" />
              </Button>
              <CardTitle className="text-2xl text-center">
                Rate Your Experience
              </CardTitle>
              <p className="text-center text-muted-foreground text-sm mt-2">
                How was your service with {porter.name}?
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Star Rating */}
              <div className="flex flex-col items-center">
                <p className="text-sm font-medium mb-3">Your Rating</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          star <= rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {rating === 5 && "Excellent! ⭐"}
                    {rating === 4 && "Very Good! 😊"}
                    {rating === 3 && "Good 👍"}
                    {rating === 2 && "Could be better 🤔"}
                    {rating === 1 && "Needs improvement 😞"}
                  </p>
                )}
              </div>

              {/* Review Text */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Share your experience (Optional)
                </label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Tell us about your experience with the porter service..."
                  className="w-full min-h-[100px] p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {review.length}/500 characters
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleSkipReview}
                  disabled={submittingReview}
                >
                  Skip
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmitReview}
                  disabled={submittingReview || rating === 0}
                >
                  {submittingReview ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Submit Review
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Your feedback helps us improve our service
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AvailablePorters;