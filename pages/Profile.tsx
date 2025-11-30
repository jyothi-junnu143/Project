
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { MockService } from '../services/mockService';
import { User as UserIcon, Mail, Briefcase, Hash, Calendar, Camera, Upload, X } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    avatar: ''
  });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Camera Refs and State
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Sync formData with user data whenever user context changes or editing mode is toggled
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        avatar: user.avatar || ''
      });
    }
  }, [user, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      // 1. Update the "Backend"
      await MockService.updateProfile(user.id, formData);
      // 2. Update the "Session" context (triggers Sidebar/Header updates)
      updateUser(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Basic validation: Check if image and size < 1MB (to respect localStorage limits)
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file.');
        return;
      }
      if (file.size > 1024 * 1024) { // 1MB limit
        alert('File size is too large. Please upload an image under 1MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // Use functional update to ensure we don't lose other form changes (like name)
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    if (user) {
      setFormData({
        name: user.name || '',
        avatar: user.avatar || ''
      });
    }
    setIsEditing(false);
    stopCamera();
  };

  // Camera Functions
  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setFormData(prev => ({ ...prev, avatar: dataUrl }));
        stopCamera();
      }
    }
  };

  if (!user) return null;

  const InfoGroup = ({ icon: Icon, label, value }: any) => (
    <div className="flex items-start p-4 bg-slate-50 rounded-lg">
      <div className="p-2 bg-white rounded-lg border border-slate-200 mr-4">
        <Icon className="w-5 h-5 text-slate-500" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-slate-900 font-medium mt-1">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-32 bg-emerald-600 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600"></div>
        </div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="relative group">
              <img 
                src={formData.avatar} 
                alt={user.name} 
                className="w-32 h-32 rounded-full border-4 border-white shadow-md bg-white object-cover"
              />
              
              {/* Image Upload/Edit Icon (only visual here, handled by buttons below) */}
              {isEditing && (
                <div 
                  className="absolute inset-0 rounded-full flex items-center justify-center border-4 border-transparent z-10 pointer-events-none"
                >
                </div>
              )}
            </div>

            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                Edit Profile
              </Button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <p className="text-sm font-medium text-slate-700">Change Profile Photo</p>
                <div className="flex gap-3">
                   <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload File
                   </Button>
                   <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={startCamera}
                   >
                      <Camera className="w-4 h-4 mr-2" />
                      Take Photo
                   </Button>
                   <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Avatar URL (Optional)</label>
                <input
                  type="text"
                  value={formData.avatar}
                  onChange={e => setFormData({...formData, avatar: e.target.value})}
                  placeholder="https://..."
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-500"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <Button type="submit" isLoading={loading}>Save Changes</Button>
                <Button type="button" variant="ghost" onClick={handleCancel}>Cancel</Button>
              </div>
            </form>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
              <p className="text-slate-500 capitalize">{user.role} • {user.department}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoGroup icon={Mail} label="Email Address" value={user.email} />
        <InfoGroup icon={Hash} label="Employee ID" value={user.employeeId} />
        <InfoGroup icon={Briefcase} label="Department" value={user.department} />
        <InfoGroup icon={Calendar} label="Joined Date" value={new Date(user.createdAt).toLocaleDateString()} />
      </div>

      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
               <h3 className="font-bold text-slate-900 flex items-center">
                 <Camera className="w-5 h-5 mr-2" />
                 Take Profile Photo
               </h3>
               <button onClick={stopCamera} className="p-1 hover:bg-slate-100 rounded-lg">
                 <X className="w-5 h-5 text-slate-500" />
               </button>
            </div>
            <div className="p-4 bg-black flex justify-center">
               <video ref={videoRef} autoPlay playsInline className="max-h-[400px] rounded-lg" />
               <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="p-4 flex justify-center gap-3 bg-white">
               <Button onClick={capturePhoto} className="w-full">
                 <Camera className="w-4 h-4 mr-2" />
                 Capture Photo
               </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
