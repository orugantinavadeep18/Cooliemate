import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  X,
  AlertCircle
} from "lucide-react";

const API_BASE = 'https://cooliemate.onrender.com';

const AvailablePorters = () => {
  const [bookingData, setBookingData] = useState(null);
  const [porters, setPorters] = useState([]);
  const [loadingPorters, setLoadingPorters] = useState(true);
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
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: "", description: "", variant: "default" });

  const toast = ({ title, description, variant = "default" }) => {
    setToastMessage({ title, description, variant });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Get booking data from navigation state or localStorage
  useEffect(() => {
    // Try to get from navigation state first (using window.history.state)
    const navigationState = window.history.state?.usr;
    
    if (navigationState) {
      console.log('📦 Booking data from navigation:', navigationState);
      setBookingData(navigationState);
      // Save to sessionStorage for page refresh
      sessionStorage.setItem('bookingData', JSON.stringify(navigationState));
    } else {
      // Try to get from sessionStorage if page was refreshed
      const savedData = sessionStorage.getItem('bookingData');
      if (savedData) {
        console.log('📦 Booking data from sessionStorage:', savedData);
        setBookingData(JSON.parse(savedData));
      } else {
        // No booking data found
        toast({
          title: "No Booking Data",
          description: "Please complete the booking form first",
          variant: "destructive",
        });
        console.warn('⚠️ No booking data found');
      }
    }
  }, []);

  // Fetch all available porters from backend
useEffect(() => {
  if (!bookingData) return;

  const fetchAvailablePorters = async () => {
    try {
      setLoadingPorters(true);
      const url = `${API_BASE}/api/porters/available`; // no station filter
      
      console.log('🔍 Fetching all available porters from:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch porters');
      }

      const data = await response.json();
      console.log('📦 Available porters:', data);
      
      if (data.success && data.data) {
        setPorters(data.data);
        if (data.data.length === 0) {
          toast({
            title: "No Porters Available",
            description: "No porters are currently online",
          });
        }
      } else {
        setPorters([]);
      }
    } catch (error) {
      console.error('❌ Error fetching porters:', error);
      toast({
        title: "Error Loading Porters",
        description: "Could not load available porters. Please try again.",
        variant: "destructive",
      });
      setPorters([]);
    } finally {
      setLoadingPorters(false);
    }
  };

  fetchAvailablePorters();
}, [bookingData]);

  // Show "Porter is approaching" after acceptance
  useEffect(() => {
    if (porterAccepted) {
      setShowApproaching(true);
    }
  }, [porterAccepted]);

  // Check for porter acceptance in real-time using backend API
  useEffect(() => {
    if (!requestSent || !currentBookingId) {
      return;
    }

    console.log('🔄 Starting polling for booking:', currentBookingId);
    const startTime = Date.now();
    const timeoutDuration = 5 * 60 * 1000; // 5 minutes

    const checkInterval = setInterval(async () => {
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
        const response = await fetch(`${API_BASE}/api/bookings/${currentBookingId}`);
        
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        
        if (data.booking && data.booking.status === "accepted") {
          clearInterval(checkInterval);
          setWaitingForResponse(false);
          setPorterAccepted(true);
          toast({
            title: "Request Accepted! 🎉",
            description: `${selectedPorter.name} has accepted your request`,
          });
        } else if (data.booking && data.booking.status === "declined") {
          clearInterval(checkInterval);
          setWaitingForResponse(false);
          setPorterDeclined(true);
          toast({
            title: "Request Declined",
            description: `${selectedPorter.name} is unable to accept this request`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("❌ Error checking booking status:", error);
      }
    }, 2000);

    return () => {
      clearInterval(checkInterval);
    };
  }, [requestSent, currentBookingId, selectedPorter]);

  const handleSendRequest = async (porter) => {
  if (!bookingData) {
    toast({
      title: "Error",
      description: "Booking data is missing",
      variant: "destructive",
    });
    return;
  }

  console.log('📤 Sending request to porter:', porter);

  setSelectedPorter(porter);
  
 const bookingRequest = {
  porterId: porter.mongoId, // <-- MongoDB ObjectId of the porter
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

console.log('📝 Booking request:', bookingRequest);

try {
  const response = await fetch(`${API_BASE}/api/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingRequest),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to create booking');
  }

  console.log('✅ Booking created successfully:', data);

  setCurrentBookingId(data.booking.id);
  setRequestSent(true);
  setWaitingForResponse(true);

  toast({
    title: "Request Sent ✓",
    description: `Request sent to ${porter.name}. Waiting for acceptance...`,
  });
} catch (error) {
  console.error("❌ Error creating booking:", error);
  toast({
    title: "Error",
    description: error.message || "Failed to send request. Please try again.",
    variant: "destructive",
  });
  setRequestSent(false);
  setWaitingForResponse(false);
}

};

  const handleConfirmBooking = () => {
    setShowReviewPopup(true);
  };

  const handleSkipReview = () => {
    // Clear booking data and navigate to home
    sessionStorage.removeItem('bookingData');
    window.location.href = "/";
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
        porterId: selectedPorter.id,
        porterName: selectedPorter.name
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

      setTimeout(() => {
        handleSkipReview();
      }, 1500);
    } catch (error) {
      console.error("❌ Error submitting review:", error);
      toast({
        title: "Review Error",
        description: "Failed to submit review, but you can continue to home",
        variant: "destructive",
      });
      handleSkipReview();
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleBackToBooking = () => {
    window.history.back();
  };

  // Loading state while fetching booking data
  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="py-12 text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-gray-600">Loading booking details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 left-4 right-4 z-50 animate-in fade-in slide-in-from-top-2">
          <div className={`border rounded-lg shadow-lg p-4 max-w-md mx-auto ${
            toastMessage.variant === "destructive" 
              ? "bg-red-50 border-red-200" 
              : "bg-white border-gray-200"
          }`}>
            <p className="font-semibold text-sm">{toastMessage.title}</p>
            <p className="text-xs text-gray-600 mt-1">{toastMessage.description}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="px-4 py-3">
          <Button variant="ghost" size="sm" className="mb-2" onClick={handleBackToBooking}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold">Available Porters</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            At {bookingData.travelDetails?.station || "your station"}
          </p>
        </div>
      </div>

      <div className="p-4 pb-20 max-w-6xl mx-auto">
        {/* Booking Summary */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Your Booking</span>
              {currentBookingId && (
                <span className="text-xs font-mono text-gray-600">#{currentBookingId.slice(0, 8)}</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{bookingData.personalDetails?.fullName}</span>
              </div>
              <span className="text-xs text-gray-600">{bookingData.personalDetails?.phone}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{bookingData.travelDetails?.station}</span>
              </div>
              <span className="text-xs text-gray-600">{bookingData.travelDetails?.trainNo}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-400" />
                <span>{bookingData.luggageDetails?.numberOfBags} Bags, {bookingData.luggageDetails?.weight} kg</span>
              </div>
              <div className="flex items-center gap-1 font-bold text-primary">
                <IndianRupee className="w-4 h-4" />
                {bookingData.pricing?.totalPrice}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Porter Cards */}
        {loadingPorters ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Loader2 className="w-10 h-10 mx-auto mb-3 animate-spin text-primary" />
                <p className="text-sm text-gray-600">Loading porters...</p>
              </div>
            </CardContent>
          </Card>
        ) : porters.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-3">
                <AlertCircle className="w-12 h-12 mx-auto text-yellow-500" />
                <h3 className="text-lg font-semibold">No Porters Available</h3>
                <p className="text-sm text-gray-600">
                  No porters are online at {bookingData.travelDetails?.station}
                </p>
                <Button size="sm" onClick={() => window.location.reload()}>
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {porters.map((porter) => (
              <Card key={porter._id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Porter</CardTitle>
                    <Badge className="bg-green-100 text-green-700 text-xs">
                      {porter.availability}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  {/* Porter Info */}
                  <div className="flex gap-3 mb-4">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0 relative">
                      <img
                        src={porter.photo}
                        alt={porter.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Crect fill='%23ddd' width='96' height='96'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='36' fill='%23999'%3E${porter.name.charAt(0)}%3C/text%3E%3C/svg%3E`;
                        }}
                      />
                      {porter.badge && (
                        <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-[10px] py-0.5 text-center">
                          ✓ {porter.badge}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold truncate">{porter.name}</h3>
                      <div className="flex flex-wrap gap-2 sm:gap-3 text-xs text-gray-600 mt-1">
                        <div className="flex items-center">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 mr-1" />
                          <span className="font-medium">{porter.rating}</span>
                        </div>
                        <div className="flex items-center">
                          <Briefcase className="w-3 h-3 mr-1" />
                          <span>{porter.totalTrips} trips</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>{porter.experience}</span>
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1">
                        {porter.languages.slice(0, 3).map((lang) => (
                          <Badge key={lang} variant="secondary" className="text-[10px] px-1.5 py-0">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                    <div>
                      <p className="text-gray-500 uppercase text-[10px] mb-0.5">Badge ID</p>
                      <p className="font-mono font-semibold truncate">{porter.id}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 uppercase text-[10px] mb-0.5">Station</p>
                      <p className="font-semibold truncate">{porter.station}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 uppercase text-[10px] mb-0.5">Contact</p>
                      <p className="font-semibold truncate">{porter.phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 uppercase text-[10px] mb-0.5">Specialty</p>
                      <p className="font-semibold truncate">{porter.specialization}</p>
                    </div>
                  </div>

                  {/* Action Section */}
                  {selectedPorter?.id === porter.id ? (
                    <>
                      {waitingForResponse && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                          <Loader2 className="w-10 h-10 mx-auto mb-2 animate-spin text-blue-600" />
                          <p className="font-semibold text-sm text-blue-900">Request Sent</p>
                          <p className="text-xs text-blue-700 mt-1">
                            Waiting for {porter.name} to respond...
                          </p>
                        </div>
                      )}

                      {porterAccepted && showApproaching && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="text-center mb-3">
                            <TrendingUp className="w-10 h-10 mx-auto mb-2 text-green-600 animate-pulse" />
                            <p className="font-bold text-base text-green-900">Request Accepted! 🎉</p>
                            <p className="text-sm text-green-700 mt-1">{porter.name} is on the way</p>
                          </div>
                          <div className="bg-white rounded p-3 space-y-2 text-xs mb-3">
                            <div className="flex items-center gap-2">
                              <Phone className="w-3 h-3 text-gray-500" />
                              <span className="truncate">{porter.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3 text-gray-500" />
                              <span>{porter.station} Station</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3 text-gray-500" />
                              <span>ETA: 1-2 minutes</span>
                            </div>
                          </div>
                          <Button onClick={handleConfirmBooking} className="w-full" size="sm">
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Completed! Back to Home
                          </Button>
                        </div>
                      )}

                      {porterDeclined && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                          <XCircle className="w-10 h-10 mx-auto mb-2 text-red-600" />
                          <p className="font-semibold text-sm text-red-900">Request Declined</p>
                          <p className="text-xs text-red-700 mt-1">
                            {porter.name} cannot accept at this time
                          </p>
                          <Button size="sm" className="mt-3 w-full" onClick={() => window.location.reload()}>
                            Try Another Porter
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <Button
                      onClick={() => handleSendRequest(porter)}
                      className="w-full"
                      size="sm"
                      disabled={requestSent}
                    >
                      Send Request to {porter.name}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Review Popup Modal */}
      {showReviewPopup && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <Card className="w-full sm:max-w-md sm:rounded-lg rounded-t-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="relative pb-3">
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 h-8 w-8 p-0"
                onClick={handleSkipReview}
              >
                <X className="w-4 h-4" />
              </Button>
              <CardTitle className="text-xl text-center pr-8">
                Rate Your Experience
              </CardTitle>
              <p className="text-center text-gray-600 text-xs mt-1">
                How was your service with {selectedPorter?.name}?
              </p>
            </CardHeader>
            <CardContent className="space-y-4 pb-6">
              {/* Star Rating */}
              <div className="flex flex-col items-center">
                <p className="text-sm font-medium mb-2">Your Rating</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="transition-transform active:scale-95"
                    >
                      <Star
                        className={`w-9 h-9 sm:w-10 sm:h-10 ${
                          star <= rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-xs text-gray-600 mt-2">
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
                  placeholder="Tell us about your experience..."
                  className="w-full min-h-[80px] p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {review.length}/500 characters
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleSkipReview}
                  disabled={submittingReview}
                  size="sm"
                >
                  Skip
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmitReview}
                  disabled={submittingReview || rating === 0}
                  size="sm"
                >
                  {submittingReview ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Submit
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-center text-gray-500 pt-2">
                Your feedback helps us improve
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AvailablePorters;