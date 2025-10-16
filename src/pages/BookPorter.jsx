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
import { Loader2, CheckCircle2, IndianRupee, Train, MapPin, Calendar, Clock, User, Phone, Luggage, Sparkles, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const BookPorter = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    pnr: "",
    station: "Kurnool Station",
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

    setTimeout(() => {
      setLoading(false);
      navigate("/available", { state: bookingData });
      toast({
        title: "Details Verified ✓",
        description: "Showing available porters for your booking",
      });
    }, 1500);
  };

  const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400 rounded-full filter blur-3xl"></div>
      </div>

      <Navbar />
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-blue-900 text-sm font-semibold">Quick & Easy Booking</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
            Book Your Porter
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Fill in your travel details for instant porter booking
          </p>
        </motion.div>

        {/* Main Form Card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="max-w-4xl mx-auto shadow-2xl border-2 border-gray-100 rounded-3xl overflow-hidden bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Personal Details Section */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-black text-2xl bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">
                      Personal Details
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600" />
                        Full Name *
                      </Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        placeholder="Enter your full name"
                        className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-blue-600" />
                        Phone Number *
                      </Label>
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
                        className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Travel Details Section */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                      <Train className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-black text-2xl bg-gradient-to-r from-green-900 to-emerald-900 bg-clip-text text-transparent">
                      Travel Details
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="pnr" className="text-sm font-semibold text-gray-700">
                      PNR Number *
                    </Label>
                    <div className="flex gap-3">
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
                        className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-all flex-1"
                        required
                      />
                      <Button
                        type="button"
                        onClick={handlePNRLookup}
                        className="h-12 px-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-bold shadow-lg hover:shadow-xl transition-all"
                        disabled={pnrLoading || formData.pnr.length !== 10}
                      >
                        {pnrLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          "Verify PNR"
                        )}
                      </Button>
                    </div>
                    
                    {pnrInfo && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200 shadow-lg mt-4"
                      >
                        <div className="flex items-center mb-4">
                          <CheckCircle2 className="w-6 h-6 mr-2 text-green-600" />
                          <p className="text-green-900 font-bold text-lg">
                            PNR Verified Successfully
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center text-xs text-gray-500 uppercase mb-2 font-semibold">
                              <Train className="w-3 h-3 mr-1" />
                              Train Details
                            </div>
                            <p className="font-bold text-gray-900 text-lg">
                              {pnrInfo.trainNo}
                            </p>
                            <p className="text-sm text-gray-600">{pnrInfo.trainName}</p>
                          </div>
                          
                          <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <p className="text-xs text-gray-500 uppercase mb-2 font-semibold">
                              Coach Number
                            </p>
                            <p className="font-bold text-gray-900 text-2xl">
                              {pnrInfo.coachNo}
                            </p>
                          </div>
                          
                          <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center text-xs text-gray-500 uppercase mb-2 font-semibold">
                              <MapPin className="w-3 h-3 mr-1" />
                              From
                            </div>
                            <p className="font-bold text-gray-900">
                              {pnrInfo.boardingStation}
                            </p>
                            <p className="text-sm text-gray-600">
                              {pnrInfo.boardingStationCode}
                            </p>
                          </div>
                          
                          <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center text-xs text-gray-500 uppercase mb-2 font-semibold">
                              <MapPin className="w-3 h-3 mr-1" />
                              To
                            </div>
                            <p className="font-bold text-gray-900">
                              {pnrInfo.destinationStation}
                            </p>
                            <p className="text-sm text-gray-600">
                              {pnrInfo.destinationStationCode}
                            </p>
                          </div>
                          
                          <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center text-xs text-gray-500 uppercase mb-2 font-semibold">
                              <Calendar className="w-3 h-3 mr-1" />
                              Journey Date
                            </div>
                            <p className="font-bold text-gray-900">
                              {pnrInfo.dateOfJourney}
                            </p>
                          </div>
                          
                          <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center text-xs text-gray-500 uppercase mb-2 font-semibold">
                              <Clock className="w-3 h-3 mr-1" />
                              Arrival Time
                            </div>
                            <p className="font-bold text-gray-900 text-xl">
                              {pnrInfo.arrivalTime}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="station" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-green-600" />
                      Station *
                    </Label>
                    <Input
                      id="station"
                      value={formData.station}
                      onChange={(e) =>
                        setFormData({ ...formData, station: e.target.value })
                      }
                      placeholder="e.g., New Delhi"
                      className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-all"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Enter the station where you need porter service
                    </p>
                  </div>
                </motion.div>

                {/* Luggage Details Section */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                      <Luggage className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-black text-2xl bg-gradient-to-r from-orange-900 to-red-900 bg-clip-text text-transparent">
                      Luggage Details
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="numberOfBags" className="text-sm font-semibold text-gray-700">
                        Number of Bags *
                      </Label>
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
                        className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="weight" className="text-sm font-semibold text-gray-700">
                        Approx Weight (kg) *
                      </Label>
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
                        className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border-2 border-gray-200">
                    <p className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      Additional Services
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-4 bg-white rounded-xl hover:shadow-md transition-shadow">
                        <Checkbox
                          id="lateNight"
                          checked={formData.isLateNight}
                          onCheckedChange={(checked) => {
                            const updatedData = { ...formData, isLateNight: checked };
                            setFormData(updatedData);
                            handleCalculatePrice(updatedData);
                          }}
                          className="w-5 h-5"
                        />
                        <Label htmlFor="lateNight" className="text-sm cursor-pointer font-medium flex-1">
                          Late Night Service (11 PM - 5 AM)
                        </Label>
                        <span className="font-bold text-blue-600">+₹20</span>
                      </div>
                      <div className="flex items-center space-x-3 p-4 bg-white rounded-xl hover:shadow-md transition-shadow">
                        <Checkbox
                          id="priority"
                          checked={formData.isPriority}
                          onCheckedChange={(checked) => {
                            const updatedData = { ...formData, isPriority: checked };
                            setFormData(updatedData);
                            handleCalculatePrice(updatedData);
                          }}
                          className="w-5 h-5"
                        />
                        <Label htmlFor="priority" className="text-sm cursor-pointer font-medium flex-1">
                          Priority Service (Immediate assistance)
                        </Label>
                        <span className="font-bold text-blue-600">+₹30</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Pricing Display */}
                {pricing && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 rounded-3xl shadow-2xl text-white"
                  >
                    <h4 className="font-black text-2xl mb-6 flex items-center">
                      <IndianRupee className="w-7 h-7 mr-2" />
                      Estimated Fare
                    </h4>
                    <div className="space-y-4 text-lg">
                      <div className="flex justify-between items-center py-2 border-b border-white/20">
                        <span className="text-blue-100">{pricing.description}</span>
                        <span className="font-bold text-xl">₹{pricing.basePrice}</span>
                      </div>
                      {pricing.lateNightCharge > 0 && (
                        <div className="flex justify-between items-center py-2 border-b border-white/20">
                          <span className="text-blue-100">Late Night Charge</span>
                          <span className="font-bold text-xl">₹{pricing.lateNightCharge}</span>
                        </div>
                      )}
                      {pricing.priorityCharge > 0 && (
                        <div className="flex justify-between items-center py-2 border-b border-white/20">
                          <span className="text-blue-100">Priority Service</span>
                          <span className="font-bold text-xl">₹{pricing.priorityCharge}</span>
                        </div>
                      )}
                      <div className="pt-4 mt-2 flex justify-between items-center">
                        <span className="font-black text-2xl">Total Amount</span>
                        <span className="font-black text-4xl text-yellow-300">₹{pricing.totalPrice}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Additional Notes */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="space-y-3"
                >
                  <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">
                    Additional Notes (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Any special requirements or instructions for the porter..."
                    rows={4}
                    className="rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-all resize-none"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <Button
                    type="submit"
                    className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 hover:scale-[1.02] group"
                    disabled={loading || !pnrInfo}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing Your Booking...
                      </>
                    ) : (
                      <>
                        Find Available Porters
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default BookPorter;