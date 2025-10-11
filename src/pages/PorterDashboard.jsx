import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  Luggage, 
  User,
  Train,
  Package,
  IndianRupee,
  AlertCircle,
  TrendingUp,
  XCircle,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PorterDashboard = () => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Porter info - should come from authentication in real app
  const porterInfo = {
    id: "1234",
    name: "Raju",
    station: "Kurnool",
  };

  // Load bookings from localStorage
  useEffect(() => {
    loadBookings();
    setLoading(false);

    // Set up interval to check for new bookings every 2 seconds
    const interval = setInterval(() => {
      loadBookings();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const loadBookings = () => {
    try {
      const storedBookings = localStorage.getItem('porterBookings');
      console.log('🔍 Porter Dashboard - Loading bookings from localStorage:', storedBookings);
      
      if (storedBookings) {
        const allBookings = JSON.parse(storedBookings);
        console.log('📦 All bookings in localStorage:', allBookings);
        
        // Filter bookings for this porter
        const porterBookings = allBookings.filter(
          b => b.porterId === porterInfo.id && b.status !== "declined"
        );
        
        console.log('✅ Filtered bookings for porter', porterInfo.id, ':', porterBookings);
        setBookings(porterBookings);
      } else {
        console.log('⚠️ No bookings found in localStorage');
        setBookings([]);
      }
    } catch (error) {
      console.error("❌ Error loading bookings:", error);
      toast({
        title: "Error Loading Bookings",
        description: "Failed to load bookings. Please refresh the page.",
        variant: "destructive",
      });
    }
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    loadBookings();
    setTimeout(() => setIsRefreshing(false), 500);
    toast({
      title: "Refreshed",
      description: "Bookings updated successfully",
    });
  };

  const handleAccept = (bookingId) => {
    try {
      const storedBookings = localStorage.getItem('porterBookings');
      console.log('🔔 Accepting booking:', bookingId);
      
      if (storedBookings) {
        const allBookings = JSON.parse(storedBookings);
        const updatedBookings = allBookings.map(b => 
          b.id === bookingId 
            ? { ...b, status: "accepted", acceptedAt: new Date().toISOString() }
            : b
        );
        
        localStorage.setItem('porterBookings', JSON.stringify(updatedBookings));
        console.log('✅ Booking accepted and saved to localStorage:', updatedBookings);
        
        // Update local state immediately
        setBookings(bookings.map(b => 
          b.id === bookingId 
            ? { ...b, status: "accepted", acceptedAt: new Date().toISOString() }
            : b
        ));

        toast({
          title: "Request Accepted ✓",
          description: "Passenger has been notified. Please be ready at the station.",
        });
      }
    } catch (error) {
      console.error("❌ Error accepting booking:", error);
      toast({
        title: "Error",
        description: "Failed to accept booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleComplete = (bookingId) => {
    try {
      const completedTime = new Date().toISOString();
      const storedBookings = localStorage.getItem('porterBookings');
      
      if (storedBookings) {
        const allBookings = JSON.parse(storedBookings);
        const updatedBookings = allBookings.map(b => 
          b.id === bookingId 
            ? { ...b, status: "completed", completedAt: completedTime }
            : b
        );
        localStorage.setItem('porterBookings', JSON.stringify(updatedBookings));
        console.log('✅ Booking completed:', bookingId);
        
        // Update local state
        setBookings(bookings.map(b => 
          b.id === bookingId 
            ? { ...b, status: "completed", completedAt: completedTime }
            : b
        ));

        toast({
          title: "Service Completed ✓",
          description: "Payment will be processed and added to your earnings.",
        });
      }
    } catch (error) {
      console.error("❌ Error completing booking:", error);
      toast({
        title: "Error",
        description: "Failed to complete booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDecline = (bookingId) => {
    try {
      const storedBookings = localStorage.getItem('porterBookings');
      
      if (storedBookings) {
        const allBookings = JSON.parse(storedBookings);
        const updatedBookings = allBookings.map(b => 
          b.id === bookingId 
            ? { ...b, status: "declined", declinedAt: new Date().toISOString() }
            : b
        );
        localStorage.setItem('porterBookings', JSON.stringify(updatedBookings));
        console.log('❌ Booking declined:', bookingId);
        
        // Remove from local state
        setBookings(bookings.filter(b => b.id !== bookingId));

        toast({
          title: "Request Declined",
          description: "Booking request has been declined.",
        });
      }
    } catch (error) {
      console.error("❌ Error declining booking:", error);
      toast({
        title: "Error",
        description: "Failed to decline booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Calculate statistics
  const stats = {
    pending: bookings.filter(b => b.status === "pending").length,
    accepted: bookings.filter(b => b.status === "accepted").length,
    completed: bookings.filter(b => b.status === "completed").length,
    totalEarnings: bookings
      .filter(b => b.status === "completed")
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0),
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return "Not specified";
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "accepted":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Porter Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {porterInfo.name} • {porterInfo.station} Station
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm">
                Porter ID: {porterInfo.id}
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleManualRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-sm text-muted-foreground mt-1">Pending Requests</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-blue-600">{stats.accepted}</p>
                <p className="text-sm text-muted-foreground mt-1">Accepted</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                <p className="text-sm text-muted-foreground mt-1">Completed</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                  <IndianRupee className="w-6 h-6 text-primary" />
                </div>
                <p className="text-3xl font-bold text-primary">₹{stats.totalEarnings}</p>
                <p className="text-sm text-muted-foreground mt-1">Total Earnings</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Booking Requests</CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage your passenger requests and bookings • Auto-refreshing every 2 seconds
            </p>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium mb-2">No Booking Requests</p>
                <p className="text-sm text-muted-foreground">
                  New passenger requests will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card 
                    key={booking.id} 
                    className={`border-2 ${
                      booking.status === "pending" 
                        ? "border-yellow-200 bg-yellow-50/30 shadow-md" 
                        : booking.status === "accepted"
                        ? "border-blue-200 bg-blue-50/30"
                        : "border-green-200 bg-green-50/30"
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">{booking.passengerName}</h3>
                              <p className="text-sm text-muted-foreground flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {booking.phone}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status.toUpperCase()}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDateTime(booking.requestedAt)}
                            </p>
                          </div>
                        </div>

                        {/* Booking ID */}
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase">Booking ID</p>
                            <p className="font-mono font-bold text-sm">{booking.id}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground uppercase">PNR Number</p>
                            <p className="font-mono font-bold text-sm">{booking.pnr}</p>
                          </div>
                        </div>

                        {/* Booking Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase mb-1">Station</p>
                            <p className="font-semibold flex items-center">
                              <MapPin className="w-4 h-4 mr-1 text-primary" />
                              {booking.station}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-xs text-muted-foreground uppercase mb-1">Train Details</p>
                            <p className="font-semibold flex items-center">
                              <Train className="w-4 h-4 mr-1 text-primary" />
                              {booking.trainNo} - {booking.trainName}
                            </p>
                            <p className="text-xs text-muted-foreground">Coach: {booking.coachNo}</p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground uppercase mb-1">Journey Date</p>
                            <p className="font-semibold flex items-center">
                              <Clock className="w-4 h-4 mr-1 text-primary" />
                              {booking.dateOfJourney}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Arrival: {booking.arrivalTime}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground uppercase mb-1">Luggage</p>
                            <p className="font-semibold flex items-center">
                              <Luggage className="w-4 h-4 mr-1 text-primary" />
                              {booking.numberOfBags} bags, {booking.weight} kg
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground uppercase mb-1">Passenger Phone</p>
                            <p className="font-semibold flex items-center">
                              <Phone className="w-4 h-4 mr-1 text-primary" />
                              {booking.phone}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground uppercase mb-1">Service Charges</p>
                            <p className="font-bold text-xl text-primary flex items-center">
                              <IndianRupee className="w-5 h-5" />
                              {booking.totalPrice}
                            </p>
                          </div>
                        </div>

                        {/* Route Information */}
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex-1">
                            <p className="text-xs text-blue-600 uppercase mb-1 font-semibold">From</p>
                            <p className="font-bold text-blue-900">
                              {booking.boardingStation}
                            </p>
                            <p className="text-xs text-blue-700">({booking.boardingStationCode})</p>
                          </div>
                          <div className="px-4">
                            <div className="flex items-center">
                              <div className="w-12 h-0.5 bg-blue-400"></div>
                              <Train className="w-5 h-5 text-blue-500 mx-1" />
                              <div className="w-12 h-0.5 bg-blue-400"></div>
                            </div>
                          </div>
                          <div className="flex-1 text-right">
                            <p className="text-xs text-blue-600 uppercase mb-1 font-semibold">To</p>
                            <p className="font-bold text-blue-900">
                              {booking.destinationStation}
                            </p>
                            <p className="text-xs text-blue-700">({booking.destinationStationCode})</p>
                          </div>
                        </div>

                        {/* Additional Services */}
                        {(booking.isLateNight || booking.isPriority) && (
                          <div className="flex flex-wrap gap-2">
                            {booking.isLateNight && (
                              <Badge variant="outline" className="bg-purple-50 border-purple-300 text-purple-700">
                                🌙 Late Night Service
                              </Badge>
                            )}
                            {booking.isPriority && (
                              <Badge variant="outline" className="bg-orange-50 border-orange-300 text-orange-700">
                                ⚡ Priority Service
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Special Notes */}
                        {booking.notes && (
                          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-xs text-amber-700 uppercase font-semibold mb-2 flex items-center">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              Special Instructions
                            </p>
                            <p className="text-sm text-amber-900">{booking.notes}</p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t">
                          {booking.status === "pending" && (
                            <>
                              <Button 
                                onClick={() => handleAccept(booking.id)} 
                                className="flex-1"
                                size="lg"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Accept Request
                              </Button>
                              <Button 
                                onClick={() => handleDecline(booking.id)} 
                                variant="destructive"
                                className="flex-1"
                                size="lg"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Decline
                              </Button>
                            </>
                          )}
                          
                          {booking.status === "accepted" && (
                            <Button 
                              onClick={() => handleComplete(booking.id)} 
                              className="w-full"
                              size="lg"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Mark as Completed
                            </Button>
                          )}
                          
                          {booking.status === "completed" && (
                            <div className="w-full p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                              <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                              <p className="font-semibold text-green-900">Service Completed Successfully</p>
                              <p className="text-xs text-green-600 mt-1">
                                Completed on {formatDateTime(booking.completedAt)}
                              </p>
                              <p className="text-sm font-bold text-green-700 mt-2">
                                Payment: ₹{booking.totalPrice}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PorterDashboard;