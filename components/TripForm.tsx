import React, { useState, useRef, useEffect } from 'react';
import { Trip } from '../types';
import { CameraIcon } from './icons/CameraIcon';

interface TripFormProps {
  onSubmit: (data: Omit<Trip, 'id' | 'date' | 'mpg'>) => void;
  onImageUpload: (file: File) => void;
  isAnalyzing: boolean;
  extractedGallons: number | null;
}

const TripForm: React.FC<TripFormProps> = ({ onSubmit, onImageUpload, isAnalyzing, extractedGallons }) => {
  const [startOdometer, setStartOdometer] = useState('');
  const [endOdometer, setEndOdometer] = useState('');
  const [gallons, setGallons] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (extractedGallons !== null) {
      setGallons(extractedGallons.toString());
    }
  }, [extractedGallons]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startOdometer || !endOdometer || !gallons) {
      return;
    }
    onSubmit({
      startOdometer: parseFloat(startOdometer),
      endOdometer: parseFloat(endOdometer),
      gallons: parseFloat(gallons),
    });
    // Reset form
    setStartOdometer('');
    setEndOdometer('');
    setGallons('');
    setImagePreview(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      onImageUpload(file);
    }
  };
  
  const handleScanClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="startOdometer" className="block text-sm font-medium text-slate-600">
          Start Odometer
        </label>
        <input
          id="startOdometer"
          type="number"
          value={startOdometer}
          onChange={(e) => setStartOdometer(e.target.value)}
          placeholder="e.g., 50000"
          required
          disabled={isAnalyzing}
          className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm disabled:bg-slate-100"
        />
      </div>
      <div>
        <label htmlFor="endOdometer" className="block text-sm font-medium text-slate-600">
          End Odometer
        </label>
        <input
          id="endOdometer"
          type="number"
          value={endOdometer}
          onChange={(e) => setEndOdometer(e.target.value)}
          placeholder="e.g., 50350"
          required
          disabled={isAnalyzing}
          className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm disabled:bg-slate-100"
        />
      </div>
      <div>
        <div className="flex justify-between items-center">
            <label htmlFor="gallons" className="block text-sm font-medium text-slate-600">
                Gallons Used
            </label>
            <button
              type="button"
              onClick={handleScanClick}
              disabled={isAnalyzing}
              className="flex items-center text-sm font-medium text-brand-primary hover:text-brand-secondary disabled:text-slate-400 transition-colors"
            >
              <CameraIcon className="h-4 w-4 mr-1" />
              {isAnalyzing ? 'Scanning...' : 'Scan Pump'}
            </button>
        </div>
        <input
          id="gallons"
          type="number"
          step="0.01"
          value={gallons}
          onChange={(e) => setGallons(e.target.value)}
          placeholder="e.g., 10.5"
          required
          disabled={isAnalyzing}
          className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm disabled:bg-slate-100"
        />
         <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
          capture="environment"
        />
      </div>

       {imagePreview && (
         <div className="relative">
            <img src={imagePreview} alt="Gas pump preview" className="w-full h-auto rounded-md" />
            {isAnalyzing && (
                 <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-md">
                    <div className="w-8 h-8 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
                 </div>
            )}
         </div>
       )}

      <button
        type="submit"
        disabled={isAnalyzing}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition-colors disabled:bg-slate-400"
      >
        Add Trip
      </button>
    </form>
  );
};

export default TripForm;
