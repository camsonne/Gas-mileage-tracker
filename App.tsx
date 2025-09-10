import React, { useState, useMemo, useCallback } from 'react';
import { Trip } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import TripForm from './components/TripForm';
import TripHistory from './components/TripHistory';
import MpgChart from './components/MpgChart';
import StatCard from './components/StatCard';
import { getMileageTip, extractGallonsFromImage } from './services/geminiService';
import { GasPumpIcon } from './components/icons/GasPumpIcon';
import { SparklesIcon } from './components/icons/SparklesIcon';

const App: React.FC = () => {
  const [trips, setTrips] = useLocalStorage<Trip[]>('mileage-trips', []);
  const [tip, setTip] = useState<string>('');
  const [isFetchingTip, setIsFetchingTip] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isAnalyzingImage, setIsAnalyzingImage] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [extractedGallons, setExtractedGallons] = useState<number | null>(null);

  const addTrip = (newTripData: Omit<Trip, 'id' | 'date' | 'mpg'>) => {
    const { startOdometer, endOdometer, gallons } = newTripData;
    if (endOdometer <= startOdometer || gallons <= 0) {
      setError('Invalid input. End odometer must be greater than start, and gallons must be positive.');
      return;
    }
    setError(null);
    setAnalysisError(null);
    const distance = endOdometer - startOdometer;
    const mpg = parseFloat((distance / gallons).toFixed(2));

    const newTrip: Trip = {
      id: new Date().toISOString(),
      date: new Date().toLocaleDateString(),
      ...newTripData,
      mpg,
    };
    setTrips(prevTrips => [newTrip, ...prevTrips]);
    setExtractedGallons(null); // Clear after successful submission
  };
  
  const deleteTrip = (id: string) => {
    setTrips(prevTrips => prevTrips.filter(trip => trip.id !== id));
  };

  const stats = useMemo(() => {
    if (trips.length === 0) {
      return {
        avgMpg: 0,
        bestMpg: 0,
        totalMiles: 0,
        lastMpg: 0,
      };
    }

    const totalMiles = trips.reduce((sum, trip) => sum + (trip.endOdometer - trip.startOdometer), 0);
    const totalGallons = trips.reduce((sum, trip) => sum + trip.gallons, 0);
    const avgMpg = totalGallons > 0 ? parseFloat((totalMiles / totalGallons).toFixed(2)) : 0;
    const bestMpg = Math.max(...trips.map(trip => trip.mpg));
    const lastMpg = trips[0]?.mpg || 0;

    return { avgMpg, bestMpg, totalMiles, lastMpg };
  }, [trips]);

  const handleGetTip = useCallback(async () => {
    if (trips.length < 3) {
      setTip("Add at least 3 trips to get personalized mileage tips.");
      return;
    }
    setIsFetchingTip(true);
    setTip('');
    try {
      const mpgHistory = trips.slice(0, 5).map(t => t.mpg);
      const newTip = await getMileageTip(mpgHistory);
      setTip(newTip);
    } catch (e) {
      console.error(e);
      setTip("Sorry, I couldn't fetch a tip right now. Please try again later.");
    } finally {
      setIsFetchingTip(false);
    }
  }, [trips]);

  const handleImageAnalysis = (file: File) => {
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
        setAnalysisError("Please upload a valid image file.");
        return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
        try {
            setIsAnalyzingImage(true);
            setAnalysisError(null);
            setExtractedGallons(null);
            const base64String = (reader.result as string).split(',')[1];
            const result = await extractGallonsFromImage(base64String, file.type);
            if (result !== null) {
                setExtractedGallons(result);
            } else {
                setAnalysisError("Could not read gallons from the image. Please enter it manually.");
            }
        } catch (e) {
            console.error(e);
            setAnalysisError("An error occurred during image analysis. Please try again.");
        } finally {
            setIsAnalyzingImage(false);
        }
    };
    reader.onerror = () => {
        setAnalysisError("Failed to read the image file.");
    }
    reader.readAsDataURL(file);
  };


  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-brand-primary shadow-md">
        <div className="container mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <GasPumpIcon className="h-8 w-8 text-white" />
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Gas Mileage Tracker
            </h1>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Average MPG" value={stats.avgMpg.toString()} />
          <StatCard title="Best MPG" value={stats.bestMpg.toString()} unit="mpg" />
          <StatCard title="Last Trip MPG" value={stats.lastMpg.toString()} />
          <StatCard title="Total Miles Tracked" value={stats.totalMiles.toLocaleString()} unit="miles" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-slate-700">Add New Trip</h2>
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
            {analysisError && <p className="text-orange-600 bg-orange-100 p-3 rounded-md mb-4">{analysisError}</p>}
            <TripForm 
              onSubmit={addTrip}
              onImageUpload={handleImageAnalysis}
              isAnalyzing={isAnalyzingImage}
              extractedGallons={extractedGallons}
            />
          </div>

          <div className="lg:col-span-2 space-y-8">
             <div className="bg-white p-6 rounded-xl shadow-lg">
               <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-700">AI Mileage Tip</h2>
                    <p className="text-sm text-slate-500">Get suggestions to improve your fuel efficiency.</p>
                  </div>
                  <button
                    onClick={handleGetTip}
                    disabled={isFetchingTip}
                    className="flex items-center justify-center px-4 py-2 bg-brand-accent text-white rounded-lg hover:bg-brand-secondary transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    <SparklesIcon className="h-5 w-5 mr-2" />
                    {isFetchingTip ? 'Thinking...' : 'Get Tip'}
                  </button>
               </div>
                {tip && (
                  <div className="bg-blue-50 border-l-4 border-brand-accent text-brand-primary p-4 rounded-r-lg">
                    <p className="text-slate-700">{tip}</p>
                  </div>
                )}
             </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-slate-700">MPG History</h2>
              {trips.length > 0 ? (
                <MpgChart data={trips} />
              ) : (
                <p className="text-center text-slate-500 py-8">No trip data yet. Your chart will appear here.</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
           <h2 className="text-xl font-semibold mb-4 text-slate-700">Trip Log</h2>
           <TripHistory trips={trips} onDelete={deleteTrip} />
        </div>
      </main>

       <footer className="text-center py-6 text-slate-500 text-sm mt-8">
        <p>Built with React, Tailwind CSS, and Gemini API.</p>
      </footer>
    </div>
  );
};

export default App;
