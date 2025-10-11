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
import { Loader2, CheckCircle2, IndianRupee } from "lucide-react";
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
          title: "PNR Verified!",
          description: `Train ${info.trainNo} - ${info.trainName}. Please review details and fill in your information.`,
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
          description: `Train ${info.trainNo} - ${info.trainName}. Please review details and fill in your information.`,
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
        numberOfBags: formData.numberOfBags,
        weight: formData.weight,
        isLateNight: formData.isLateNight,
        isPriority: formData.isPriority,
      },
      pricing: pricing,
      notes: formData.notes,
    };

    // Simulate validation delay
    setTimeout(() => {
      setLoading(false);
      
      // Navigate to available porters page with booking data
      navigate("/available", { state: bookingData });
      
      toast({
        title: "Details Verified",
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
                      placeholder="10 digit PNR"
                      maxLength={10}
                      required
                    />
                    <Button
                      type="button"
                      onClick={handlePNRLookup}
                      variant="secondary"
                      disabled={pnrLoading}
                    >
                      {pnrLoading ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify"
                      )}
                    </Button>
                  </div>
                  {pnrInfo && (
                    <div className="text-sm space-y-2 bg-blue-50 p-4 rounded-md border border-blue-200">
                      <p className="text-blue-900 font-semibold flex items-center mb-2">
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        PNR Verified - Train Details
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase">
                            Train
                          </p>
                          <p className="font-medium text-blue-900">
                            {pnrInfo.trainNo} - {pnrInfo.trainName}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase">
                            Coach
                          </p>
                          <p className="font-medium text-blue-900">
                            {pnrInfo.coachNo}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase">
                            From
                          </p>
                          <p className="font-medium text-blue-900">
                            {pnrInfo.boardingStation} (
                            {pnrInfo.boardingStationCode})
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase">
                            To
                          </p>
                          <p className="font-medium text-blue-900">
                            {pnrInfo.destinationStation} (
                            {pnrInfo.destinationStationCode})
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase">
                            Date of Journey
                          </p>
                          <p className="font-medium text-blue-900">
                            {pnrInfo.dateOfJourney}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase">
                            Arrival Time
                          </p>
                          <p className="font-medium text-blue-900">
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

                <div className="space-y-3">
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
                      Late Night Service (11 PM - 5 AM) +₹20
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
                      Priority Service +₹30
                    </Label>
                  </div>
                </div>
              </div>

              {/* Pricing Display */}
              {pricing && (
                <div className="bg-primary/5 p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold flex items-center">
                    <IndianRupee className="w-4 h-4 mr-1" />
                    Estimated Fare
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{pricing.description}</span>
                      <span>₹{pricing.basePrice}</span>
                    </div>
                    {pricing.lateNightCharge > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Late Night</span>
                        <span>₹{pricing.lateNightCharge}</span>
                      </div>
                    )}
                    {pricing.priorityCharge > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Priority</span>
                        <span>₹{pricing.priorityCharge}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between font-bold text-base">
                      <span>Total</span>
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
                  placeholder="Any special requirements or instructions..."
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "View Available Porters"
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