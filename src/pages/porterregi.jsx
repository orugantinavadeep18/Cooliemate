import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/pages/Footer";

const API_BASE = 'https://cooliemate.onrender.com';

const PorterRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    badgeNumber: "",
    station: "Kurnool Station",
    password: "",
    image: null,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("⚠️ Image size must be less than 5MB");
        return;
      }
      
      setFormData((prev) => ({ ...prev, image: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.phone ||
      !formData.badgeNumber ||
      !formData.password ||
      !formData.image
    ) {
      toast.error("⚠️ Please fill in all required fields!");
      return;
    }

    // Validate phone number
    if (!/^[0-9]{10}$/.test(formData.phone)) {
      toast.error("⚠️ Please enter a valid 10-digit phone number");
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      toast.error("⚠️ Password must be at least 6 characters long");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('phone', formData.phone);
      submitData.append('badgeNumber', formData.badgeNumber);
      submitData.append('station', formData.station);
      submitData.append('password', formData.password);
      submitData.append('image', formData.image);

      console.log('📤 Submitting porter registration...');

      const response = await fetch(`${API_BASE}/api/porter/register`, {
        method: 'POST',
        body: submitData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      console.log('✅ Porter registered successfully:', data);
      
      // Store token in localStorage
      if (data.data.token) {
        localStorage.setItem('porterToken', data.data.token);
        localStorage.setItem('porterId', data.data.id);
        localStorage.setItem('porterBadgeNumber', data.data.badgeNumber);
      }

      toast.success("✅ Porter registered successfully! Redirecting to dashboard...");

      // Clear form after successful submission
      setFormData({
        name: "",
        phone: "",
        badgeNumber: "",
        station: "Kurnool Station",
        password: "",
        image: null,
      });
      setPreviewImage(null);

      // Redirect to porter dashboard after 1.5 seconds
      setTimeout(() => {
        navigate("/porter-dashboard");
      }, 1500);

    } catch (error) {
      console.error('❌ Registration Error:', error);
      toast.error(`❌ ${error.message || 'Registration failed. Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-blue-100">
      <Navbar />

      <div className="container mx-auto flex-grow px-4 py-16 flex flex-col items-center">
        <Card className="w-full max-w-lg shadow-2xl border border-blue-200">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-blue-700">
              Porter Registration
            </CardTitle>
            <p className="text-gray-500 mt-2 text-sm">
              Register yourself as a certified Coolie at your station
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Image Upload */}
              <div className="flex flex-col items-center">
                <Label className="mb-2 text-center">Profile Photo *</Label>
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Porter Preview"
                    className="w-28 h-28 rounded-full object-cover mb-3 border-4 border-blue-400"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mb-3 border-2 border-dashed border-gray-400">
                    <Upload size={32} />
                  </div>
                )}
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Choose Photo
                </label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isSubmitting}
                  required
                />
                <p className="text-xs text-gray-500 mt-2">Max size: 5MB</p>
              </div>

              {/* Name */}
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  pattern="[0-9]{10}"
                  maxLength="10"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter 10-digit phone number"
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Badge Number */}
              <div>
                <Label htmlFor="badgeNumber">Coolie Badge Number *</Label>
                <Input
                  id="badgeNumber"
                  name="badgeNumber"
                  value={formData.badgeNumber}
                  onChange={handleChange}
                  placeholder="Enter badge number"
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Station */}
              <div>
                <Label htmlFor="station">Station Location *</Label>
                <Input
                  id="station"
                  name="station"
                  value={formData.station}
                  onChange={handleChange}
                  placeholder="Enter station"
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password">Password * (min 6 characters)</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    className="pr-10"
                    disabled={isSubmitting}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Register'
                )}
              </Button>

              {/* Login Link */}
              <div className="text-center text-sm text-gray-600">
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/porter-login")}
                  className="text-blue-600 hover:underline font-medium"
                  disabled={isSubmitting}
                >
                  Login here
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default PorterRegistration;