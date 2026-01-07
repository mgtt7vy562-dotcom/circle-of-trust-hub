import React from 'react';
import { 
  Trash2, 
  TreeDeciduous, 
  Droplets, 
  Car, 
  Home, 
  Wrench, 
  Sparkles, 
  PawPrint, 
  Hammer, 
  Dumbbell 
} from 'lucide-react';

export const SERVICE_CATEGORIES = [
  { id: 'junk_removal', name: 'Junk Removal', icon: Trash2, color: 'bg-orange-500' },
  { id: 'lawn_care', name: 'Lawn Care', icon: TreeDeciduous, color: 'bg-green-500' },
  { id: 'pressure_washing', name: 'Pressure Washing', icon: Droplets, color: 'bg-blue-500' },
  { id: 'car_detailing', name: 'Car Detailing', icon: Car, color: 'bg-red-500' },
  { id: 'house_cleaning', name: 'House Cleaning', icon: Home, color: 'bg-purple-500' },
  { id: 'mobile_mechanic', name: 'Mobile Mechanic', icon: Wrench, color: 'bg-gray-600' },
  { id: 'window_cleaning', name: 'Window Cleaning', icon: Sparkles, color: 'bg-cyan-500' },
  { id: 'pet_sitting', name: 'Pet Sitting', icon: PawPrint, color: 'bg-amber-500' },
  { id: 'handyman', name: 'Handyman Service', icon: Hammer, color: 'bg-yellow-600' },
  { id: 'personal_trainer', name: 'Personal Trainer', icon: Dumbbell, color: 'bg-pink-500' },
];

export const getCategoryById = (id) => SERVICE_CATEGORIES.find(c => c.id === id);

export const CategoryIcon = ({ categoryId, size = 'md', showLabel = false }) => {
  const category = getCategoryById(categoryId);
  if (!category) return null;
  
  const Icon = category.icon;
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };
  
  return (
    <div className="flex items-center gap-2">
      <div className={`${category.color} p-2 rounded-lg`}>
        <Icon className={`${sizeClasses[size]} text-white`} />
      </div>
      {showLabel && <span className="text-sm font-medium">{category.name}</span>}
    </div>
  );
};

export default SERVICE_CATEGORIES;