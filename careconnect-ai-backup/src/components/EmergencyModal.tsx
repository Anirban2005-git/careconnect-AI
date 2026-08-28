import React, { useEffect, useState } from 'react';
import { 
  AlertOctagon, 
  PhoneCall, 
  MapPin, 
  Clock, 
  Navigation, 
  ShieldAlert, 
  X, 
  HeartHandshake, 
  Activity, 
  Zap,
  Info
} from 'lucide-react';
import { api } from '../services/api';

interface LiveEmergencyResource {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance: string;
  eta: string;
  waitTime: string;
  notes: string;
  latitude: number;
  longitude: number;
}

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  const [activeFirstAidTab, setActiveFirstAidTab] = useState<'chest_pain' | 'choking' | 'allergic' | 'bleeding'>('chest_pain');
  const [nearbyHospitals, setNearbyHospitals] = useState<LiveEmergencyResource[]>([]);
  const [locationLabel, setLocationLabel] = useState('Locating your current region...');
  const [locationError, setLocationError] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (!isOpen || !navigator.geolocation) {
      if (isOpen) setLocationError('Live GPS is not supported by this browser.');
      return;
    }

    let isActive = true;
    let lastLookup = 0;
    let lastLookupLatitude = 0;
    let lastLookupLongitude = 0;
    const updateCurrentRegion = async (latitude: number, longitude: number) => {
      try {
        const regionResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
        if (!regionResponse.ok || !isActive) return;
        const regionData = await regionResponse.json();
        const address = regionData.address || {};
        setLocationLabel([address.city || address.town || address.village, address.state, address.country].filter(Boolean).join(', ') || 'Current GPS location');
      } catch {
        // Keep the last known region while the next GPS update is attempted.
      }
    };
    const lookupLiveHospitals = async (latitude: number, longitude: number) => {
      const locationMoved = Math.abs(latitude - lastLookupLatitude) > 0.01 || Math.abs(longitude - lastLookupLongitude) > 0.01;
      if (!isActive || (Date.now() - lastLookup < 30000 && !locationMoved)) return;
      lastLookup = Date.now();
      lastLookupLatitude = latitude;
      lastLookupLongitude = longitude;
      setIsLocating(true);
      setLocationError('');
      try {
        const { hospitals } = await api.getNearbyHospitals({
          lat: String(latitude),
          lng: String(longitude),
          radius: '10000',
        });
        if (!isActive) return;
        setNearbyHospitals(hospitals);
        if (hospitals.length === 0) setLocationError('No nearby hospitals were found within 10 km of your live location.');

      } catch {
        if (isActive) setLocationError('Unable to load live hospitals. Check your internet connection and GPS permission.');
      } finally {
        if (isActive) setIsLocating(false);
      }
    };
    const handlePosition = (position: GeolocationPosition) => {
      void updateCurrentRegion(position.coords.latitude, position.coords.longitude);
      void lookupLiveHospitals(position.coords.latitude, position.coords.longitude);
    };
    const handlePositionError = () => {
      if (isActive) {
        setIsLocating(false);
        setLocationError('Allow location access to find hospitals near you.');
      }
    };
    const watchId = navigator.geolocation.watchPosition(handlePosition, handlePositionError, { enableHighAccuracy: true, maximumAge: 0, timeout: 30000 });
    return () => {
      isActive = false;
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const firstAidGuides = {
    chest_pain: {
      title: 'Severe Chest Pain / Suspected Heart Attack',
      steps: [
        'Call 112 or 108 immediately for an emergency cardiac ambulance. Do not attempt to drive yourself.',
        'Have the person sit down in a comfortable "W" sitting position and loosen tight clothing.',
        'If not allergic and advised by medical dispatch, chew a soluble 300mg Aspirin (Disprin) with water.',
        'If the person collapses and stops breathing normally, immediately start Hands-Only CPR (100–120 compressions/min in the center of the chest).',
      ],
    },
    choking: {
      title: 'Adult / Child Choking (Heimlich Maneuver)',
      steps: [
        'Ask "Are you choking?" If the person cannot speak, breathe, or cough forcefully, act immediately.',
        'Stand behind them, wrap your arms around their waist.',
        'Make a fist with one hand, place thumb side just above their navel (below the ribcage).',
        'Grasp fist with your other hand and deliver quick, inward and upward abdominal thrusts until the airway is clear.',
      ],
    },
    allergic: {
      title: 'Severe Allergic Reaction / Anaphylaxis',
      steps: [
        'Check for swollen lips/face/tongue, wheezing, throat constriction, or severe hives.',
        'Call 112 / 108 immediately and administer an Epinephrine Auto-Injector (EpiPen) if available.',
        'Inject firmly into the outer mid-thigh, hold for 5–10 seconds, then gently massage the injection site.',
        'Keep the individual lying flat with legs elevated unless they find breathing easier sitting upright.',
      ],
    },
    bleeding: {
      title: 'Severe Uncontrolled Bleeding / Trauma',
      steps: [
        'Apply firm, continuous direct pressure over the wound using a clean cloth, sterile gauze, or hands.',
        'Do not remove blood-soaked dressings; add more layers on top and keep pressure steady.',
        'Elevate the injured limb above heart level if no fracture is suspected.',
        'Call 112 / 108 or proceed immediately to the nearest Emergency/Trauma department.',
      ],
    },
  };

  return (
    <div 
      id="emergency-modal-backdrop" 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div 
        id="emergency-modal-card" 
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border-2 border-red-500 overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Header Alert Header */}
        <div className="bg-red-600 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20">
              <AlertOctagon className="w-6 h-6 animate-bounce text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-wide">
                Emergency Medical Protocol
              </h2>
              <p className="text-xs text-red-100 font-medium">
                Immediate response & urgent care dispatch
              </p>
            </div>
          </div>
          <button
            id="close-emergency-modal-btn"
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/25 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-slate-800">
          
          {/* Main 112 / 108 Call Out banner */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-md shadow-red-600/30">
                112
              </div>
              <div>
                <h3 className="font-bold text-base text-red-950">National Emergency / Ambulance Helpline</h3>
                <p className="text-xs text-red-800">
                  Unconscious, severe cardiac event, stroke symptoms, or major trauma? Call 112 or 108 immediately.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                id="call-112-direct-link"
                href="tel:112"
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/30 transition-transform active:scale-95 text-center whitespace-nowrap"
              >
                <PhoneCall className="w-4 h-4" />
                Call 112 (National)
              </a>
              <a
                id="call-108-direct-link"
                href="tel:108"
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-transform active:scale-95 text-center whitespace-nowrap"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                108 (Ambulance)
              </a>
            </div>
          </div>

          {/* Nearest Emergency Rooms */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-600" />
                Nearest Emergency Departments
              </h4>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {isLocating ? 'Updating GPS...' : 'GPS Live Tracking Active'}
              </span>
            </div>

            <p className="mb-2 text-[11px] text-slate-500">Current region: <span className="font-semibold text-slate-700">{locationLabel}</span></p>

            <div className="space-y-2.5">
              {nearbyHospitals.map((res) => (
                <div 
                  key={res.id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-red-300 bg-slate-50/70 hover:bg-white transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{res.name}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-800">
                        {res.waitTime}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <span>{res.address}</span>
                      <span className="text-slate-300">•</span>
                      <span className="font-semibold text-teal-700">{res.distance} ({res.eta})</span>
                    </p>
                    <p className="text-[11px] text-slate-600">{res.notes}</p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <a
                      href={`tel:${res.phone}`}
                      className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-white text-slate-800 text-xs font-semibold flex items-center justify-center gap-1"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-red-600" />
                      {res.phone}
                    </a>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${res.latitude},${res.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center justify-center gap-1"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Directions
                    </a>
                  </div>
                </div>
              ))}
              {nearbyHospitals.length === 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  {locationError || 'Waiting for live GPS and nearby hospital data...'}
                </div>
              )}
            </div>
          </div>

          {/* Quick First-Aid Guides */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              Instant First-Aid Protocols
            </h4>
            
            {/* Guide tabs */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {(Object.keys(firstAidGuides) as Array<keyof typeof firstAidGuides>).map((tabKey) => (
                <button
                  key={tabKey}
                  onClick={() => setActiveFirstAidTab(tabKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeFirstAidTab === tabKey
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tabKey === 'chest_pain' && 'Chest Pain'}
                  {tabKey === 'choking' && 'Choking'}
                  {tabKey === 'allergic' && 'Anaphylaxis'}
                  {tabKey === 'bleeding' && 'Heavy Bleeding'}
                </button>
              ))}
            </div>

            {/* Guide details */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h5 className="font-bold text-xs sm:text-sm text-slate-900 mb-2">
                {firstAidGuides[activeFirstAidTab].title}
              </h5>
              <ol className="space-y-1.5 text-xs text-slate-700 list-decimal list-inside">
                {firstAidGuides[activeFirstAidTab].steps.map((step, idx) => (
                  <li key={idx} className="leading-relaxed">
                    <span className="font-medium text-slate-800">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Crisis & Poison Control Hotlines (India) */}
          <div className="border-t border-slate-200 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-teal-50/70 border border-teal-100 flex items-center justify-between">
              <div>
                <p className="font-bold text-teal-950">AIIMS National Poison Centre</p>
                <p className="text-[11px] text-teal-800">24/7 Toxicology Emergency (Toll Free)</p>
              </div>
              <a 
                href="tel:1800116117" 
                className="font-bold text-teal-700 hover:text-teal-900 bg-white px-2.5 py-1 rounded-md border border-teal-200"
              >
                1800-11-6117
              </a>
            </div>

            <div className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
              <div>
                <p className="font-bold text-indigo-950">Tele-MANAS Mental Health</p>
                <p className="text-[11px] text-indigo-800">Govt. of India 24/7 Helpline</p>
              </div>
              <a 
                href="tel:14416" 
                className="font-bold text-indigo-700 hover:text-indigo-900 bg-white px-2.5 py-1 rounded-md border border-indigo-200"
              >
                Dial 14416
              </a>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            Always follow emergency operator & paramedic guidance.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Close Sheet
          </button>
        </div>

      </div>
    </div>
  );
};
