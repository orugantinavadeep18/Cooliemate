import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import { Users, Briefcase, IndianRupee, TrendingUp, Phone, Mail, MapPin, Calendar, CheckCircle2 } from "lucide-react";
import { mockPorters, getAllBookings, assignPorterToBooking } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import Footer from "../pages/Footer"; 

const AdminDashboard = () => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    setBookings(getAllBookings());
  }, []);

  const handleAssignPorter = (bookingId, porterName) => {
    const porter = mockPorters.find(p => p.name === porterName);
    if (porter) {
      assignPorterToBooking(bookingId, porterName, porter.id);
      setBookings(getAllBookings());
      toast({
        title: "Porter Assigned",
        description: `${porterName} has been assigned to this booking`,
      });
    }
  };

  const stats = {
    totalBookings: bookings.length,
    activePorters: mockPorters.length,
    totalRevenue: bookings.reduce((sum, b) => sum + b.amount, 0),
    pendingAssignments: bookings.filter(b => !b.assignedPorter).length,
    completedBookings: bookings.filter(b => b.status === "completed").length,
  };

  const completedBookings = bookings.filter(b => b.status === "completed");
  const activeBookings = bookings.filter(b => b.status !== "completed");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage bookings, passengers, and porters</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                  <p className="text-2xl font-bold">{stats.totalBookings}</p>
                </div>
                <Briefcase className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Porters</p>
                  <p className="text-2xl font-bold">{stats.activePorters}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">₹{stats.totalRevenue}</p>
                </div>
                <IndianRupee className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.pendingAssignments}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{stats.completedBookings}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Active and Completed Bookings */}
        <Tabs defaultValue="active" className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="active">Active Bookings ({activeBookings.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedBookings.length})</TabsTrigger>
          </TabsList>

          {/* Active Bookings */}
          <TabsContent value="active">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Active Bookings - Passenger Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeBookings.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No active bookings</p>
                  ) : (
                    activeBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors space-y-4"
                      >
                        {/* Passenger Info Header */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="font-bold text-lg">{booking.passengerName}</h3>
                              <Badge variant={booking.assignedPorter ? "default" : "secondary"}>
                                {booking.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center text-muted-foreground">
                                <Phone className="w-4 h-4 mr-2" />
                                {booking.phone}
                              </div>
                              {booking.email && (
                                <div className="flex items-center text-muted-foreground">
                                  <Mail className="w-4 h-4 mr-2" />
                                  {booking.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Booking Details Grid */}
                        <div className="bg-muted/30 p-4 rounded-lg">
                          <h4 className="font-semibold mb-3 text-sm">Booking Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                            <div>
                              <p className="text-muted-foreground text-xs">PNR Number</p>
                              <p className="font-medium">{booking.pnr}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Train</p>
                              <p className="font-medium">{booking.trainNo} - {booking.trainName}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Coach</p>
                              <p className="font-medium">{booking.coachNo}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Station</p>
                              <p className="font-medium flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {booking.station}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Travel Date & Time</p>
                              <p className="font-medium flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {booking.date} at {booking.time}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Luggage</p>
                              <p className="font-medium">{booking.bags} bags, {booking.weight} kg</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Amount</p>
                              <p className="font-bold text-primary">₹{booking.amount}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Booked At</p>
                              <p className="font-medium">{booking.bookedAt}</p>
                            </div>
                          </div>
                          {booking.notes && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-muted-foreground text-xs">Special Notes</p>
                              <p className="text-sm mt-1">{booking.notes}</p>
                            </div>
                          )}
                        </div>

                        {/* Porter Assignment */}
                        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between pt-2 border-t">
                          {booking.assignedPorter ? (
                            <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg flex-1">
                              <p className="text-xs text-muted-foreground mb-1">Assigned Porter</p>
                              <p className="font-semibold text-green-700 dark:text-green-400">
                                {booking.assignedPorter}
                              </p>
                            </div>
                          ) : (
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground mb-2">Assign Porter</p>
                              <Select onValueChange={(value) => handleAssignPorter(booking.id, value)}>
                                <SelectTrigger className="w-full md:w-[200px]">
                                  <SelectValue placeholder="Select Porter" />
                                </SelectTrigger>
                                <SelectContent>
                                  {mockPorters.map((porter) => (
                                    <SelectItem key={porter.id} value={porter.name}>
                                      {porter.name} - {porter.station}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Completed Bookings */}
          <TabsContent value="completed">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Completed Bookings - With Porter Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completedBookings.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No completed bookings yet</p>
                  ) : (
                    completedBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="p-4 border-2 border-green-200 dark:border-green-800 rounded-lg bg-green-50/50 dark:bg-green-950/20 space-y-4"
                      >
                        {/* Header with completion badge */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                              <CheckCircle2 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">{booking.passengerName}</h3>
                              <p className="text-sm text-muted-foreground">Completed by {booking.assignedPorter}</p>
                            </div>
                          </div>
                          <Badge className="bg-green-600">Completed</Badge>
                        </div>

                        {/* Passenger Details */}
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg">
                          <h4 className="font-semibold mb-3 text-sm">Passenger Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                            <div>
                              <p className="text-muted-foreground text-xs">Contact</p>
                              <p className="font-medium">{booking.phone}</p>
                              {booking.email && <p className="text-xs text-muted-foreground">{booking.email}</p>}
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">PNR / Train</p>
                              <p className="font-medium">{booking.pnr}</p>
                              <p className="text-xs">{booking.trainNo} - Coach {booking.coachNo}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Station</p>
                              <p className="font-medium">{booking.station}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Luggage</p>
                              <p className="font-medium">{booking.bags} bags ({booking.weight} kg)</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Travel Date</p>
                              <p className="font-medium">{booking.date} at {booking.time}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Amount Paid</p>
                              <p className="font-bold text-green-700 dark:text-green-400">₹{booking.amount}</p>
                            </div>
                          </div>
                        </div>

                        {/* Porter Performance Info */}
                        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                          <h4 className="font-semibold mb-3 text-sm">Porter Performance</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                            <div>
                              <p className="text-muted-foreground text-xs">Porter Name</p>
                              <p className="font-semibold text-blue-700 dark:text-blue-400">{booking.assignedPorter}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Booking Accepted</p>
                              <p className="font-medium">{booking.bookedAt}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Completed At</p>
                              <p className="font-medium text-green-700 dark:text-green-400">
                                {booking.completedAt || "Recently completed"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Porter Management */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Available Porters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockPorters.map((porter) => {
                const porterBookings = bookings.filter(b => b.porterId === porter.id);
                const completedCount = porterBookings.filter(b => b.status === "completed").length;
                const activeCount = porterBookings.filter(b => b.status !== "completed").length;

                return (
                  <div key={porter.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-lg">
                        {porter.avatar}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{porter.name}</h4>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {porter.station}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ⭐ {porter.rating} • {porter.experience}
                        </p>
                        <div className="mt-3 pt-3 border-t flex justify-between text-xs">
                          <div>
                            <p className="text-muted-foreground">Active</p>
                            <p className="font-bold text-blue-600">{activeCount}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Completed</p>
                            <p className="font-bold text-green-600">{completedCount}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total</p>
                            <p className="font-bold">{porterBookings.length}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        <Footer />
      </div>
    </div>
  );
};

export default AdminDashboard;
