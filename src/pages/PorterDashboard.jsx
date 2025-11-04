import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  MapPin,
  Star,
  Briefcase,
  Phone,
  Clock,
  Package,
  IndianRupee,
  CheckCircle,
  XCircle,
  Loader2,
  LogOut,
  Bell,
  TrendingUp,
  Calendar
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/pages/Footer";

const API_BASE = 'https://cooliemate.onrender.com';

const PorterDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [porterData, setPorterData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [processingBooking, setProcessingBooking] = useState(null);

  // Check authentication and load porter data
  useEffect(() => {
    const token = localStorage.getItem('porterToken');
    const porterId = localStorage.getItem('porterId');

    if (!token || !porterId) {
      toast({
        title: "Authentication Required",
        description: "Please login to access the dashboard",
        variant: "destructive",
      });
      navigate("/porter-login");
      return;
    }

    loadPorterData(token, porterId);
    loadBookings(porterId, token);

    // Poll for new bookings every 5 seconds
    const interval = setInterval(() => {
      loadBookings(porterId, token);
    }, 5000);

    return () => clearInterval(interval);
  }, [navigate, toast]);

  const loadPorterData = async (token, porterId) => {
    try {
      const response = await fetch(`${API_BASE}/api/porter/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load profile');
      }

      const data = await response.json();
      setPorterData(data.data);
      setIsOnline(data.data.isOnline);
      setLoading(false);
    } catch (error) {
      console.error('Error loading porter data:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const loadBookings = async (porterId, token) => {
    try {
      console.log('Fetching bookings for porterId:', porterId);
      
      const response = await fetch(`${API_BASE}/api/porter/${porterId}/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error('Failed to load bookings, status:', response.status);
        const errorData = await response.json();
        console.error('Error details:', errorData);
        throw new Error('Failed to load bookings');
      }

      const data = await response.json();
      console.log('Bookings loaded:', data);
      
      // Ensure data.data is always an array
      const bookingsArray = Array.isArray(data.data) ? data.data : [];
      setBookings(bookingsArray);
    } catch (error) {
      console.error('Error loading bookings:', error);
      setBookings([]); // Set empty array on error
    }
  };

  const handleStatusToggle = async (newStatus) => {
    if (!porterData) return;

    setUpdatingStatus(true);
    const token = localStorage.getItem('porterToken');

    try {
      const response = await fetch(`${API_BASE}/api/porter/${porterData._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isOnline: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      setIsOnline(newStatus);
      toast({
        title: "Status Updated",
        description: `You are now ${newStatus ? 'online' : 'offline'}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleBookingAction = async (bookingId, action) => {
    const token = localStorage.getItem('porterToken');
    const porterId = localStorage.getItem('porterId');
    
    setProcessingBooking(bookingId);

    try {
      console.log(`Attempting to ${action} booking:`, bookingId);
      
      const response = await fetch(`${API_BASE}/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: action })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed response:', errorData);
        throw new Error(errorData.message || `Failed to ${action} booking`);
      }

      const result = await response.json();
      console.log(`Booking ${action} successfully:`, result);

      toast({
        title: "Success",
        description: `Booking ${action} successfully`,
      });

      // Reload bookings
      await loadBookings(porterId, token);
    } catch (error) {
      console.error(`Error ${action} booking:`, error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${action} booking`,
        variant: "destructive",
      });
    } finally {
      setProcessingBooking(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('porterToken');
    localStorage.removeItem('porterId');
    localStorage.removeItem('porterBadgeNumber');
    localStorage.removeItem('porterName');
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    
    navigate("/porter-login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!porterData) {
    return null;
  }

  // Safely filter bookings with fallback to empty array
  const pendingBookings = Array.isArray(bookings) ? bookings.filter(b => b.status === 'pending') : [];
  const acceptedBookings = Array.isArray(bookings) ? bookings.filter(b => b.status === 'accepted') : [];
  const completedBookings = Array.isArray(bookings) ? bookings.filter(b => b.status === 'completed') : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Porter Dashboard</h1>
            <p className="text-muted-foreground">Manage your bookings and profile</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Porter Profile Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 relative">
                    <img
                      src={`${API_BASE}/uploads/${porterData.image}`}
                      alt={porterData.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Crect fill='%23ddd' width='96' height='96'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='36' fill='%23999'%3E%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                </div>
                <CardTitle className="text-xl">{porterData.name}</CardTitle>
                <div className="flex items-center justify-center space-x-2 mt-2">
                  <Badge variant={porterData.isVerified ? "success" : "secondary"}>
                    {porterData.isVerified ? "✓ Verified" : "Pending"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Online Status Toggle */}
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                    <Label htmlFor="online-status" className="cursor-pointer">
                      {isOnline ? 'Online' : 'Offline'}
                    </Label>
                  </div>
                  <Switch
                    id="online-status"
                    checked={isOnline}
                    onCheckedChange={handleStatusToggle}
                    disabled={updatingStatus}
                  />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg text-center">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold">{porterData.rating}</p>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg text-center">
                    <Briefcase className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold">{porterData.totalTrips}</p>
                    <p className="text-xs text-muted-foreground">Total Trips</p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Badge:</span>
                    <span className="font-semibold">{porterData.badgeNumber}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Station:</span>
                    <span className="font-semibold">{porterData.station}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-semibold">{porterData.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Experience:</span>
                    <span className="font-semibold">{porterData.experience}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Specialization:</span>
                    <span className="font-semibold">{porterData.specialization}</span>
                  </div>
                </div>

                {/* Languages */}
                <div>
  <p className="text-xs text-muted-foreground mb-2">Languages:</p>
  <div className="flex flex-wrap gap-2">
    {(porterData.languages && porterData.languages.length > 0
      ? porterData.languages
      : ["Telugu"]
    ).map((lang) => (
      <Badge key={lang} variant="secondary" className="text-xs">
        {lang}
      </Badge>
    ))}
  </div>
</div>

              </CardContent>
            </Card>
          </div>

          {/* Bookings Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pending Requests */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Bell className="w-5 h-5 mr-2 text-orange-500" />
                    Pending Requests ({pendingBookings.length})
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {pendingBookings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No pending booking requests</p>
                    <p className="text-sm mt-1">New requests will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingBookings.map((booking) => (
                      <Card key={booking._id} className="border-2 border-orange-200 bg-orange-50">
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold text-lg">{booking.passengerName}</h4>
                                <p className="text-sm text-muted-foreground flex items-center">
                                  <Phone className="w-3 h-3 mr-1" />
                                  {booking.phone}
                                </p>
                              </div>
                              <Badge variant="warning">Pending</Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-muted-foreground">Train</p>
                                <p className="font-medium">{booking.trainNo} - {booking.trainName}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Coach</p>
                                <p className="font-medium">{booking.coachNo}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Luggage</p>
                                <p className="font-medium">{booking.numberOfBags} bags, {booking.weight} kg</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Price</p>
                                <p className="font-medium">₹{booking.totalPrice}</p>
                              </div>
                            </div>

                            {booking.notes && (
                              <div className="bg-white p-3 rounded border">
                                <p className="text-xs text-muted-foreground mb-1">Special Notes:</p>
                                <p className="text-sm">{booking.notes}</p>
                              </div>
                            )}

                            <div className="flex space-x-3 pt-3">
                              <Button
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                onClick={() => handleBookingAction(booking._id, 'accepted')}
                                disabled={processingBooking === booking._id}
                              >
                                {processingBooking === booking._id ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                )}
                                Accept
                              </Button>
                              <Button
                                variant="outline"
                                className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                                onClick={() => handleBookingAction(booking._id, 'declined')}
                                disabled={processingBooking === booking._id}
                              >
                                {processingBooking === booking._id ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <XCircle className="w-4 h-4 mr-2" />
                                )}
                                Decline
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Bookings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2 text-blue-500" />
                  Active Bookings ({acceptedBookings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {acceptedBookings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No active bookings</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {acceptedBookings.map((booking) => (
                      <Card key={booking._id} className="border-2 border-blue-200 bg-blue-50">
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold text-lg">{booking.passengerName}</h4>
                                <p className="text-sm text-muted-foreground">{booking.phone}</p>
                              </div>
                              <Badge className="bg-blue-600">Active</Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-muted-foreground">Station</p>
                                <p className="font-medium">{booking.station}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Date</p>
                                <p className="font-medium">{booking.dateOfJourney}</p>
                              </div>
                            </div>

                            <Button
                              className="w-full bg-green-600 hover:bg-green-700"
                              onClick={() => handleBookingAction(booking._id, 'completed')}
                              disabled={processingBooking === booking._id}
                            >
                              {processingBooking === booking._id ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4 mr-2" />
                              )}
                              Mark as Completed
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Completed Bookings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                  Completed Trips ({completedBookings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {completedBookings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No completed bookings yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {completedBookings.slice(0, 5).map((booking) => (
                      <div key={booking._id} className="flex justify-between items-center p-3 bg-green-50 rounded border border-green-200">
                        <div>
                          <p className="font-medium">{booking.passengerName}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(booking.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-700">₹{booking.totalPrice}</p>
                          <Badge variant="success" className="text-xs">Completed</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* <Footer /> */}
    </div>
  );
};

export default PorterDashboard;