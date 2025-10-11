import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { mockPNRData, calculatePrice } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, IndianRupee, Train, MapPin, Calendar, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";

const BookPorter = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    pnr: "",
    station: "",
    numberOfBags: "",
    weight: "",
    notes: "",
    isLateNight: false,
    isPriority: false,
  });

  const [pnrInfo, setPnrInfo] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [pnrLoading, setPnrLoading] = useState(false);

  const handlePNRLookup = async () => {
    if (formData.pnr.length !== 10) {
      toast({
        title: "Invalid PNR",
        description: "PNR number must be 10 digits",
        variant: "destructive",
      });
      return;
    }

    setPnrLoading(true);

    try {
      const response = await axios.get(
        `https://irctc-indian-railway-pnr-status.p.rapidapi.com/getPNRStatus/${formData.pnr}`,
        {
          headers: {
            "X-RapidAPI-Key":
              "04f9d9a80bmshdfaf063ed8263e2p1db5a1jsn10b594d595f7",
            "X-RapidAPI-Host": "irctc-indian-railway-pnr-status.p.rapidapi.com",
          },
        }
      );

      const data = response.data;

      if (data.success && data.data) {
        const pnrData = data.data;
        const info = {
          trainNo: pnrData.trainNumber || pnrData.train_number || "",
          trainName: pnrData.trainName || pnrData.train_name || "",
          coachNo:
            pnrData.passengers?.[0]?.coach ||
            pnrData.passengers?.[0]?.currentCoach ||
            "",
          destinationStation:
            pnrData.destinationStation || pnrData.to_station || "",
          destinationStationCode:
            pnrData.to || pnrData.destinationStationCode || "",
          arrivalTime: pnrData.arrivalTime || pnrData.arrival_time || "",
          boardingStation: pnrData.boardingPoint || pnrData.from_station || "",
          boardingStationCode:
            pnrData.from || pnrData.boardingStationCode || "",
          dateOfJourney: pnrData.dateOfJourney || pnrData.doj || "",
        };

        setPnrInfo(info);

        toast({
          title: "PNR Verified! ✓",
          description: `Train ${info.trainNo} - ${info.trainName}`,
        });
      } else {
        throw new Error("Invalid PNR or no data found");
      }
    } catch (error) {
      console.error("PNR lookup error:", error);

      const info = mockPNRData[formData.pnr];
      if (info) {
        setPnrInfo(info);

        toast({
          title: "PNR Verified (Demo Mode)",
          description: `Train ${info.trainNo} - ${info.trainName}`,
        });
      } else {
        const errorMessage = axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : "Unknown error occurred";

        toast({
          title: "PNR Lookup Failed",
          description: `Error: ${errorMessage}. For demo, try: 1234567890`,
          variant: "destructive",
        });
      }
    } finally {
      setPnrLoading(false);
    }
  };

  const handleCalculatePrice = (updatedData = formData) => {
    if (updatedData.numberOfBags && updatedData.weight) {
      const price = calculatePrice(
        parseInt(updatedData.numberOfBags),
        parseInt(updatedData.weight),
        updatedData.isLateNight,
        updatedData.isPriority
      );
      setPricing(price);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.pnr ||
      !formData.station ||
      !formData.numberOfBags ||
      !formData.weight
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.phone.length !== 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Phone number must be 10 digits",
        variant: "destructive",
      });
      return;
    }

    if (!pnrInfo) {
      toast({
        title: "PNR Not Verified",
        description: "Please verify your PNR before proceeding",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Prepare booking data to pass to available porters page
    const bookingData = {
      personalDetails: {
        fullName: formData.fullName,
        phone: formData.phone,
      },
      travelDetails: {
        pnr: formData.pnr,
        station: formData.station,
        trainNo: pnrInfo.trainNo,
        trainName: pnrInfo.trainName,
        coachNo: pnrInfo.coachNo,
        boardingStation: pnrInfo.boardingStation,
        boardingStationCode: pnrInfo.boardingStationCode,
        destinationStation: pnrInfo.destinationStation,
        destinationStationCode: pnrInfo.destinationStationCode,
        dateOfJourney: pnrInfo.dateOfJourney,
        arrivalTime: pnrInfo.arrivalTime,
      },
      luggageDetails: {
        numberOfBags: parseInt(formData.numberOfBags),
        weight: parseInt(formData.weight),
        isLateNight: formData.isLateNight,
        isPriority: formData.isPriority,
      },
      pricing: pricing,
      notes: formData.notes,
    };

    console.log('📦 Booking data prepared:', bookingData);

    // Simulate validation delay
    setTimeout(() => {
      setLoading(false);
      
      // Navigate to available porters page with booking data
      navigate("/available", { state: bookingData });
      
      toast({
        title: "Details Verified ✓",
        description: "Showing available porters for your booking",
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto shadow-elevated">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl text-center">
              Book Your Porter
            </CardTitle>
            <p className="text-center text-muted-foreground">
              Fill in your travel details for instant porter booking
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Personal Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                        })
                      }
                      placeholder="10 digit number"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Travel Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Travel Details</h3>
                <div className="space-y-2">
                  <Label htmlFor="pnr">PNR Number *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="pnr"
                      value={formData.pnr}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pnr: e.target.value.replace(/\D/g, "").slice(0, 10),
                        })
                      }
                      placeholder="10 digit PNR (try: 1234567890)"
                      maxLength={10}
                      required
                    />
                    <Button
                      type="button"
                      onClick={handlePNRLookup}
                      variant="secondary"
                      disabled={pnrLoading || formData.pnr.length !== 10}
                    >
                      {pnrLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify"
                      )}
                    </Button>
                  </div>
                  {pnrInfo && (
                    <div className="text-sm space-y-3 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 shadow-sm">
                      <p className="text-blue-900 font-semibold flex items-center mb-3">
                        <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
                        PNR Verified Successfully
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-3 rounded-md shadow-sm">
                          <div className="flex items-center text-xs text-muted-foreground uppercase mb-1">
                            <Train className="w-3 h-3 mr-1" />
                            Train
                          </div>
                          <p className="font-semibold text-blue-900">
                            {pnrInfo.trainNo} - {pnrInfo.trainName}
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-md shadow-sm">
                          <p className="text-xs text-muted-foreground uppercase mb-1">
                            Coach
                          </p>
                          <p className="font-semibold text-blue-900">
                            {pnrInfo.coachNo}
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-md shadow-sm">
                          <div className="flex items-center text-xs text-muted-foreground uppercase mb-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            From
                          </div>
                          <p className="font-semibold text-blue-900">
                            {pnrInfo.boardingStation}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {pnrInfo.boardingStationCode}
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-md shadow-sm">
                          <div className="flex items-center text-xs text-muted-foreground uppercase mb-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            To
                          </div>
                          <p className="font-semibold text-blue-900">
                            {pnrInfo.destinationStation}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {pnrInfo.destinationStationCode}
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-md shadow-sm">
                          <div className="flex items-center text-xs text-muted-foreground uppercase mb-1">
                            <Calendar className="w-3 h-3 mr-1" />
                            Date of Journey
                          </div>
                          <p className="font-semibold text-blue-900">
                            {pnrInfo.dateOfJourney}
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-md shadow-sm">
                          <div className="flex items-center text-xs text-muted-foreground uppercase mb-1">
                            <Clock className="w-3 h-3 mr-1" />
                            Arrival Time
                          </div>
                          <p className="font-semibold text-blue-900">
                            {pnrInfo.arrivalTime}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="station">Station *</Label>
                  <Input
                    id="station"
                    value={formData.station}
                    onChange={(e) =>
                      setFormData({ ...formData, station: e.target.value })
                    }
                    placeholder="e.g., New Delhi"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the station where you need porter service
                  </p>
                </div>
              </div>

              {/* Luggage Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Luggage Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numberOfBags">Number of Bags *</Label>
                    <Input
                      id="numberOfBags"
                      type="number"
                      min="1"
                      max="20"
                      value={formData.numberOfBags}
                      onChange={(e) => {
                        const updatedData = {
                          ...formData,
                          numberOfBags: e.target.value,
                        };
                        setFormData(updatedData);
                        handleCalculatePrice(updatedData);
                      }}
                      placeholder="e.g., 3"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Approx Weight (kg) *</Label>
                    <Input
                      id="weight"
                      type="number"
                      min="1"
                      max="200"
                      value={formData.weight}
                      onChange={(e) => {
                        const updatedData = { ...formData, weight: e.target.value };
                        setFormData(updatedData);
                        handleCalculatePrice(updatedData);
                      }}
                      placeholder="e.g., 35"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm font-medium">Additional Services</p>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="lateNight"
                      checked={formData.isLateNight}
                      onCheckedChange={(checked) => {
                        const updatedData = { ...formData, isLateNight: checked };
                        setFormData(updatedData);
                        handleCalculatePrice(updatedData);
                      }}
                    />
                    <Label htmlFor="lateNight" className="text-sm cursor-pointer">
                      Late Night Service (11 PM - 5 AM) <span className="font-semibold text-primary">+₹20</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="priority"
                      checked={formData.isPriority}
                      onCheckedChange={(checked) => {
                        const updatedData = { ...formData, isPriority: checked };
                        setFormData(updatedData);
                        handleCalculatePrice(updatedData);
                      }}
                    />
                    <Label htmlFor="priority" className="text-sm cursor-pointer">
                      Priority Service (Immediate assistance) <span className="font-semibold text-primary">+₹30</span>
                    </Label>
                  </div>
                </div>
              </div>

              {/* Pricing Display */}
              {pricing && (
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-5 rounded-lg border-2 border-primary/20 shadow-sm">
                  <h4 className="font-semibold flex items-center text-lg mb-3">
                    <IndianRupee className="w-5 h-5 mr-2 text-primary" />
                    Estimated Fare
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">{pricing.description}</span>
                      <span className="font-medium">₹{pricing.basePrice}</span>
                    </div>
                    {pricing.lateNightCharge > 0 && (
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Late Night Charge</span>
                        <span className="font-medium">₹{pricing.lateNightCharge}</span>
                      </div>
                    )}
                    {pricing.priorityCharge > 0 && (
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Priority Service</span>
                        <span className="font-medium">₹{pricing.priorityCharge}</span>
                      </div>
                    )}
                    <div className="border-t-2 border-primary/30 pt-3 mt-2 flex justify-between font-bold text-lg">
                      <span>Total Amount</span>
                      <span className="text-primary">₹{pricing.totalPrice}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Any special requirements or instructions for the porter..."
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading || !pnrInfo}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Find Available Porters →"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookPorter;