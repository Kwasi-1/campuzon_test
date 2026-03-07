
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Star, MapPin, Phone, Mail, Calendar, AlertTriangle, Trash2, Clock } from 'lucide-react';

interface Rider {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  status: string;
  location: string;
  rating: number;
  totalDeliveries: number;
  completedDeliveries: number;
  cancelledDeliveries: number;
  earnings: number;
  joinDate: string;
  vehicleType: string;
  licenseNumber: string;
  lastDelivery: string;
  currentOrders: number;
  reviews: Array<{
    customer: string;
    rating: number;
    comment: string;
  }>;
}

interface RiderModalProps {
  isOpen: boolean;
  onClose: () => void;
  rider: Rider | null;
  mode: 'view' | 'edit' | 'suspend' | 'remove';
  onSave: (rider: Rider) => void;
  onSuspend: (riderId: string, reason: string, duration: string) => void;
  onRemove: (riderId: string, reason: string) => void;
}

const RiderModal: React.FC<RiderModalProps> = ({
  isOpen,
  onClose,
  rider,
  mode,
  onSave,
  onSuspend,
  onRemove
}) => {
  const [formData, setFormData] = useState({
    name: rider?.name || '',
    email: rider?.email || '',
    phone: rider?.phone || '',
    location: rider?.location || '',
    vehicleType: rider?.vehicleType || '',
    licenseNumber: rider?.licenseNumber || '',
    status: rider?.status || 'Active'
  });

  const [actionData, setActionData] = useState({
    reason: '',
    duration: '7-days'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'edit' && rider) {
      onSave({ ...rider, ...formData });
    } else if (mode === 'suspend' && rider) {
      onSuspend(rider.id, actionData.reason, actionData.duration);
    } else if (mode === 'remove' && rider) {
      onRemove(rider.id, actionData.reason);
    }
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      case 'Suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'view': return 'Rider Details';
      case 'edit': return 'Edit Rider';
      case 'suspend': return 'Suspend Rider';
      case 'remove': return 'Remove Rider';
      default: return 'Rider';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {getTitle()}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'view' && rider && (
            <Tabs defaultValue="details" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Rider Details</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={rider.avatar} alt={rider.name} />
                    <AvatarFallback className="text-lg">{rider.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{rider.name}</h3>
                    <p className="text-gray-600">{rider.id}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getStatusColor(rider.status)}>
                        {rider.status}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        {renderStars(Math.floor(rider.rating))}
                        <span className="text-sm font-medium ml-1">{rider.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <div>
                        <Label className="text-sm text-gray-600">Email</Label>
                        <p className="font-medium">{rider.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <div>
                        <Label className="text-sm text-gray-600">Phone</Label>
                        <p className="font-medium">{rider.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <div>
                        <Label className="text-sm text-gray-600">Location</Label>
                        <p className="font-medium">{rider.location}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm text-gray-600">Vehicle Type</Label>
                      <p className="font-medium">{rider.vehicleType}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">License Number</Label>
                      <p className="font-medium">{rider.licenseNumber}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <div>
                        <Label className="text-sm text-gray-600">Join Date</Label>
                        <p className="font-medium">{new Date(rider.joinDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-800">Total Deliveries</h4>
                      <p className="text-2xl font-bold text-blue-600">{rider.totalDeliveries}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-800">Completed</h4>
                      <p className="text-2xl font-bold text-green-600">{rider.completedDeliveries}</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <h4 className="font-medium text-red-800">Cancelled</h4>
                      <p className="text-2xl font-bold text-red-600">{rider.cancelledDeliveries}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h4 className="font-medium text-yellow-800">Total Earnings</h4>
                      <p className="text-2xl font-bold text-yellow-600">₵{rider.earnings.toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-800">Success Rate</h4>
                      <p className="text-2xl font-bold text-purple-600">
                        {((rider.completedDeliveries / rider.totalDeliveries) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-4 bg-indigo-50 rounded-lg">
                      <h4 className="font-medium text-indigo-800">Current Orders</h4>
                      <p className="text-2xl font-bold text-indigo-600">{rider.currentOrders}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Last Delivery</Label>
                  <p className="font-medium">{new Date(rider.lastDelivery).toLocaleDateString()}</p>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                <div className="space-y-4">
                  {rider.reviews.map((review, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{review.customer}</p>
                          <div className="flex items-center space-x-1 mt-1">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">Rating: {review.rating}/5</span>
                      </div>
                      <p className="text-gray-600 mt-2">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}

          {mode === 'suspend' && rider && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Suspend Rider: {rider.name}</p>
                  <p className="text-sm text-yellow-600">This action will temporarily restrict the rider's access</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Suspension</Label>
                <Textarea
                  id="reason"
                  placeholder="Enter reason for suspension..."
                  value={actionData.reason}
                  onChange={(e) => setActionData({ ...actionData, reason: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Select value={actionData.duration} onValueChange={(value) => setActionData({ ...actionData, duration: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7-days">7 Days</SelectItem>
                    <SelectItem value="30-days">30 Days</SelectItem>
                    <SelectItem value="90-days">90 Days</SelectItem>
                    <SelectItem value="6-months">6 Months</SelectItem>
                    <SelectItem value="1-year">1 Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {mode === 'remove' && rider && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">Remove Rider: {rider.name}</p>
                  <p className="text-sm text-red-600">This action will permanently remove the rider from the platform</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="removeReason">Reason for Removal</Label>
                <Textarea
                  id="removeReason"
                  placeholder="Enter reason for removal..."
                  value={actionData.reason}
                  onChange={(e) => setActionData({ ...actionData, reason: e.target.value })}
                  required
                />
              </div>
            </div>
          )}

          {mode === 'edit' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleType">Vehicle Type</Label>
                  <Select value={formData.vehicleType} onValueChange={(value) => setFormData({ ...formData, vehicleType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Motorbike">Motorbike</SelectItem>
                      <SelectItem value="Bicycle">Bicycle</SelectItem>
                      <SelectItem value="Car">Car</SelectItem>
                      <SelectItem value="Van">Van</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input
                    id="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {mode !== 'view' && (
              <Button type="submit" className={mode === 'remove' ? 'bg-red-600 hover:bg-red-700' : mode === 'suspend' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}>
                {mode === 'edit' ? 'Save Changes' : mode === 'suspend' ? 'Suspend Rider' : 'Remove Rider'}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RiderModal;
