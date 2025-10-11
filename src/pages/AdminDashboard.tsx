import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import { Users, Briefcase, IndianRupee, TrendingUp } from "lucide-react";
import { mockPorters } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

interface Booking {
  id: string;
  passengerName: string;
  phone: string;
  pnr: string;
  station: string;
  bags: number;
  amount: number;
  date: string;
  status: string;
  assignedPorter: string | null;
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: "1",
      passengerName: "Ravi Kumar",
      phone: "9876543210",
      pnr: "1234567890",
      station: "Chennai Central",
      bags: 3,
      amount: 149,
      date: "2025-10-15",
      status: "assigned",
      assignedPorter: "Raj Kumar",
    },
    {
      id: "2",
      passengerName: "Priya Sharma",
      phone: "9123456789",
      pnr: "9876543210",
      station: "Chennai Central",
      bags: 2,
      amount: 99,
      date: "2025-10-15",
      status: "assigned",
      assignedPorter: "Raj Kumar",
    },
    {
      id: "3",
      passengerName: "Amit Patel",
      phone: "9988776655",
      pnr: "1122334455",
      station: "Secunderabad Junction",
      bags: 5,
      amount: 199,
      date: "2025-10-16",
      status: "pending",
      assignedPorter: null,
    },
  ]);

  const handleAssignPorter = (bookingId: string, porterName: string) => {
    setBookings(bookings.map(b => 
      b.id === bookingId ? { ...b, assignedPorter: porterName, status: "assigned" } : b
    ));
    toast({
      title: "Porter Assigned",
      description: `${porterName} has been assigned to this booking`,
    });
  };

  const stats = {
    totalBookings: bookings.length,
    activePorters: mockPorters.length,
    totalRevenue: bookings.reduce((sum, b) => sum + b.amount, 0),
    pendingAssignments: bookings.filter(b => !b.assignedPorter).length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage bookings and porters</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
        </div>

        {/* Bookings Management */}
        <Card className="shadow-card mb-8">
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{booking.passengerName}</h3>
                      <Badge variant={booking.assignedPorter ? "default" : "secondary"}>
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                      <p>📱 {booking.phone}</p>
                      <p>📍 {booking.station}</p>
                      <p>🗓️ {booking.date}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <p>PNR: {booking.pnr} • {booking.bags} bags</p>
                      <p className="font-semibold text-primary">₹{booking.amount}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 md:min-w-[200px]">
                    {booking.assignedPorter ? (
                      <div className="text-sm">
                        <p className="text-muted-foreground">Assigned to:</p>
                        <p className="font-medium">{booking.assignedPorter}</p>
                      </div>
                    ) : (
                      <Select onValueChange={(value) => handleAssignPorter(booking.id, value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Assign Porter" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockPorters.map((porter) => (
                            <SelectItem key={porter.id} value={porter.name}>
                              {porter.name} - {porter.station}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Porter Management */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Available Porters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockPorters.map((porter) => (
                <div key={porter.id} className="p-4 border rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                      {porter.avatar}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{porter.name}</h4>
                      <p className="text-sm text-muted-foreground">{porter.station}</p>
                      <p className="text-sm text-muted-foreground">
                        ⭐ {porter.rating} • {porter.experience}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
