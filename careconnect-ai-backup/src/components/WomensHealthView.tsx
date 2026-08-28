import React, { useEffect, useState } from 'react';
import { 
  Flower2, 
  Calendar, 
  Sparkles, 
  Droplets, 
  Moon, 
  Heart, 
  AlertCircle, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Utensils, 
  TrendingUp, 
  Clock, 
  Info,
  ClipboardCheck,
  Stethoscope,
  Smile,
  X
} from 'lucide-react';
import { CycleData, SymptomLog, RecipeRecommendation, UserProfile } from '../types';
import { nutritionRecipes } from '../data/mockData';
import { api } from '../services/api';

const parseCycleDate = (dateValue: string) => {
  const dateOnlyMatch = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnlyMatch) {
    return new Date(
      Number(dateOnlyMatch[1]),
      Number(dateOnlyMatch[2]) - 1,
      Number(dateOnlyMatch[3])
    );
  }
  const parsedDate = new Date(dateValue);
  return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
};

const toInputDate = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const isSameDate = (firstDate: Date, secondDate: Date) =>
  firstDate.getFullYear() === secondDate.getFullYear() &&
  firstDate.getMonth() === secondDate.getMonth() &&
  firstDate.getDate() === secondDate.getDate();

interface WomensHealthViewProps {
  cycleData: CycleData;
  symptomLogs: SymptomLog[];
  onLogSymptom: (log: Omit<SymptomLog, 'id'>) => Promise<void>;
  onUpdateCycle: (
    newDay: number,
    phase: CycleData['currentPhase'],
    cycleDetails?: { periodStartDate?: string; periodLength?: number; cycleLength?: number }
  ) => void;
  userProfile: UserProfile;
}

export const WomensHealthView: React.FC<WomensHealthViewProps> = ({
  cycleData,
  symptomLogs,
  onLogSymptom,
  onUpdateCycle,
  userProfile,
}) => {
  // Local states
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['Mild Headache']);
  const [severityScore, setSeverityScore] = useState<number>(2);
  const [symptomNotes, setSymptomNotes] = useState('');
  const [isSubmittingSymptom, setIsSubmittingSymptom] = useState(false);
  const [selectedRecipeModal, setSelectedRecipeModal] = useState<RecipeRecommendation | null>(null);
  const [showLogPeriodModal, setShowLogPeriodModal] = useState(false);
  const [periodFlow, setPeriodFlow] = useState<'Light' | 'Medium' | 'Heavy' | 'Spotting'>('Medium');
  const [periodStartDate, setPeriodStartDate] = useState('');
  const [periodLength, setPeriodLength] = useState(cycleData.averagePeriodLength);
  const [cycleLength, setCycleLength] = useState(cycleData.averageCycleLength);
  const [wellnessAnswers, setWellnessAnswers] = useState<Record<string, string>>({});
  const [wellnessSymptoms, setWellnessSymptoms] = useState<string[]>([]);
  const [selectedFoodPhase, setSelectedFoodPhase] = useState<CycleData['currentPhase']>(cycleData.currentPhase);
  const [guidanceLanguage, setGuidanceLanguage] = useState<'English' | 'Bengali' | 'Hindi'>('English');
  const [translatedGuidance, setTranslatedGuidance] = useState<string | null>(null);
  const [isTranslatingGuidance, setIsTranslatingGuidance] = useState(false);

  useEffect(() => {
    if (showLogPeriodModal) {
      const parsedDate = new Date(cycleData.lastPeriodStartDate);
      setPeriodStartDate(Number.isNaN(parsedDate.getTime()) ? '' : toInputDate(parseCycleDate(cycleData.lastPeriodStartDate)));
      setPeriodLength(cycleData.averagePeriodLength);
      setCycleLength(cycleData.averageCycleLength);
    }
  }, [showLogPeriodModal, cycleData.lastPeriodStartDate, cycleData.averagePeriodLength]);

  // Hydration state
  const [waterCurrentMl, setWaterCurrentMl] = useState(1750);
  const waterGoalMl = 2500;

  // Sleep state
  const [sleepHours, setSleepHours] = useState(7.5);
  const [sleepQuality, setSleepQuality] = useState('Restful');

  // Calendar month state
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const cycleStartDate = parseCycleDate(cycleData.lastPeriodStartDate);
    return new Date(cycleStartDate.getFullYear(), cycleStartDate.getMonth(), 1);
  });

  useEffect(() => {
    const cycleStartDate = parseCycleDate(cycleData.lastPeriodStartDate);
    setCalendarMonth(new Date(cycleStartDate.getFullYear(), cycleStartDate.getMonth(), 1));
  }, [cycleData.lastPeriodStartDate]);

  const latestSymptomLog = symptomLogs[0];

  const symptomOptions = [
    'Cramps',
    'Headache',
    'Fatigue',
    'Bloating',
    'Mood Swings',
    'Acne',
    'Breast Tenderness',
    'Lower Back Pain',
    'Anxiety',
    'Food Cravings',
    'High Energy',
    'Insomnia',
  ];

  const handleSaveSymptomLog = async () => {
    if (selectedSymptoms.length === 0) return;
    setIsSubmittingSymptom(true);
    try {
      const severityMap: Record<number, 'Mild' | 'Moderate' | 'Severe'> = {
        1: 'Mild',
        2: 'Mild',
        3: 'Moderate',
        4: 'Severe',
        5: 'Severe',
      };

      await onLogSymptom({
        date: 'Today, Oct 24',
        cycleDay: currentCycleDay,
        symptoms: selectedSymptoms,
        severity: severityMap[severityScore] || 'Mild',
        severityScore,
        notes: symptomNotes,
      });

      setSymptomNotes('');
    } finally {
      setIsSubmittingSymptom(false);
    }
  };

  const handleAddWater = (amount: number) => {
    setWaterCurrentMl(prev => Math.min(prev + amount, 4000));
  };

  const guidanceText = latestSymptomLog?.aiInsight || `For the ${cycleData.currentPhase} phase, focus on balanced food, regular hydration, 7-9 hours of sleep, gentle movement, and monitoring any worsening symptoms.`;

  const handleGuidanceLanguageChange = async (language: 'English' | 'Bengali' | 'Hindi') => {
    setGuidanceLanguage(language);
    if (language === 'English') {
      setTranslatedGuidance(null);
      return;
    }
    setIsTranslatingGuidance(true);
    try {
      const result = await api.translateGuidance(guidanceText, language);
      setTranslatedGuidance(result.text);
    } finally {
      setIsTranslatingGuidance(false);
    }
  };

  // SVG Gauge calculations
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const cycleStartDate = parseCycleDate(cycleData.lastPeriodStartDate);
  const enteredCycleLength = Math.max(21, Math.min(45, cycleLength || cycleData.averageCycleLength));
  const elapsedCycleDays = Math.floor((new Date().getTime() - cycleStartDate.getTime()) / 86400000);
  const currentCycleDay = elapsedCycleDays < 0 ? 1 : (elapsedCycleDays % enteredCycleLength) + 1;
  const phaseForDay = (day: number): CycleData['currentPhase'] => day <= periodLength ? 'Menstrual' : day < Math.round(enteredCycleLength / 2) ? 'Follicular' : day <= Math.round(enteredCycleLength / 2) + 1 ? 'Ovulation' : 'Luteal';
  const currentPhase = phaseForDay(currentCycleDay);
  const progress = currentCycleDay / enteredCycleLength;
  const strokeDashoffset = circumference - progress * circumference;
  const displayedMonthStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
  const daysInDisplayedMonth = new Date(
    displayedMonthStart.getFullYear(),
    displayedMonthStart.getMonth() + 1,
    0
  ).getDate();
  const calendarOffset = displayedMonthStart.getDay();
  const ovulationDate = addDays(cycleStartDate, Math.max(enteredCycleLength - 14, 0));
  const fertileWindowStart = addDays(ovulationDate, -5);
  const fertileWindowEnd = addDays(ovulationDate, 1);
  const expectedNextPeriod = addDays(cycleStartDate, enteredCycleLength);
  const phaseDates = [
    { phase: 'Menstrual', start: cycleStartDate, end: addDays(cycleStartDate, periodLength - 1) },
    { phase: 'Follicular', start: addDays(cycleStartDate, periodLength), end: addDays(cycleStartDate, Math.round(enteredCycleLength / 2) - 2) },
    { phase: 'Ovulation', start: addDays(cycleStartDate, Math.round(enteredCycleLength / 2) - 1), end: addDays(cycleStartDate, Math.round(enteredCycleLength / 2) + 1) },
    { phase: 'Luteal', start: addDays(cycleStartDate, Math.round(enteredCycleLength / 2) + 2), end: addDays(cycleStartDate, enteredCycleLength - 1) },
  ];  const formatShortDate = (date: Date) => date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const wellnessQuestions = [
    { id: 'cycle', label: 'Cycles often shorter than 21 or longer than 35 days, or unpredictable?' },
    { id: 'hair', label: 'Increased facial/body hair or scalp hair thinning?' },
    { id: 'skin', label: 'Persistent acne or unusually oily skin?' },
    { id: 'weight', label: 'Unexplained weight changes or difficulty managing weight?' },
    { id: 'periods', label: 'Missed periods for 3 months or more (when not pregnant)?' },
  ];
  const wellnessScore = Object.values(wellnessAnswers).filter((answer) => answer === 'yes').length + wellnessSymptoms.length;
  const wellnessResult = wellnessScore >= 4 ? 'Several patterns are present that may be worth discussing with a doctor.' : wellnessScore >= 2 ? 'A few patterns are present. Track them and discuss persistent concerns with a doctor.' : 'No strong pattern was identified in this check, but ongoing concerns still deserve professional advice.';
  const phaseFoods: Record<CycleData['currentPhase'], { focus: string; foods: string[]; tip: string }> = {
    Menstrual: { focus: 'Iron, hydration, and comfort', foods: ['Palak dal', 'Rajma or chana', 'Sesame laddoo', 'Dates and citrus fruit', 'Vegetable khichdi'], tip: 'Pair plant iron with lemon, amla, or other vitamin-C foods.' },
    Follicular: { focus: 'Fibre, protein, and fresh produce', foods: ['Moong chilla', 'Sprouts chaat', 'Curd rice with vegetables', 'Paneer bhurji', 'Guava or papaya'], tip: 'Build meals around protein, whole grains, and colourful vegetables.' },
    Ovulation: { focus: 'Antioxidants and steady energy', foods: ['Bajra roti', 'Paneer tikka', 'Cucumber raita', 'Pomegranate bowl', 'Methi thepla'], tip: 'Choose hydrating produce and balanced plates.' },
    Luteal: { focus: 'Magnesium, complex carbs, and calm energy', foods: ['Ragi dosa', 'Oats with nuts', 'Banana and peanut chaat', 'Lentil soup', 'Dark chocolate in moderation'], tip: 'Regular meals and complex carbohydrates may help with cravings and energy dips.' },
  };
  const calendarMonthLabel = displayedMonthStart.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Banner Disclaimer */}
      <div className="bg-rose-50/80 border border-rose-200/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
        <div className="p-2 rounded-xl bg-rose-500 text-white shrink-0">
          <Flower2 className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h2 className="font-bold text-sm sm:text-base text-rose-950">
            Hormonal Health & Cycle Tracking Hub
          </h2>
          <p className="text-xs text-rose-800 leading-relaxed">
            Scientifically aligned cycle tracking, phase-based nutrition, and personalized AI physiological insights.
          </p>
        </div>
      </div>

      {/* Cycle Gauge & Daily Status Overview */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Interactive Circular Cycle Gauge */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col items-center justify-between text-center relative overflow-hidden">
          
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Menstrual Cycle Rhythm
            </span>
            <button
              id="log-period-trigger-btn"
              onClick={() => setShowLogPeriodModal(true)}
              className="px-3 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors"
            >
              + Log Period
            </button>
          </div>

          {/* Circular SVG Gauge */}
          <div className="relative my-4 flex items-center justify-center">
            <svg className="w-48 h-48 sm:w-56 sm:h-56 transform -rotate-90">
              {/* Background Track */}
              <circle
                cx="50%"
                cy="50%"
                r={radius}
                className="stroke-slate-100"
                strokeWidth="14"
                fill="transparent"
              />
              {/* Active Progress */}
              <circle
                cx="50%"
                cy="50%"
                r={radius}
                className="stroke-rose-500 transition-all duration-1000 ease-out"
                strokeWidth="14"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Center Content */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xs font-semibold text-slate-400">Current Phase</span>
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Day {currentCycleDay}
              </span>
              <span className="text-xs font-bold text-rose-600 px-2.5 py-0.5 mt-1 rounded-full bg-rose-50 border border-rose-200">
                {currentPhase}
              </span>
              <span className="text-[11px] text-slate-500 mt-1">
                of {enteredCycleLength}-day cycle
              </span>
            </div>
          </div>

          {/* Phase Indicators */}
          <div className="w-full grid grid-cols-4 gap-1 pt-3 border-t border-slate-100 text-[11px]">
            <div 
              onClick={() => onUpdateCycle(3, 'Menstrual')}
              className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                currentPhase === 'Menstrual' 
                  ? 'bg-rose-100 text-rose-900 font-bold' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-rose-600 mx-auto mb-1" />
              Menstrual
            </div>
            <div 
              onClick={() => onUpdateCycle(8, 'Follicular')}
              className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                currentPhase === 'Follicular' 
                  ? 'bg-teal-100 text-teal-900 font-bold' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-teal-500 mx-auto mb-1" />
              Follicular
            </div>
            <div 
              onClick={() => onUpdateCycle(14, 'Ovulation')}
              className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                currentPhase === 'Ovulation' 
                  ? 'bg-purple-100 text-purple-900 font-bold' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-purple-600 mx-auto mb-1" />
              Ovulation
            </div>
            <div 
              onClick={() => onUpdateCycle(22, 'Luteal')}
              className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                currentPhase === 'Luteal' 
                  ? 'bg-amber-100 text-amber-900 font-bold' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-amber-500 mx-auto mb-1" />
              Luteal
            </div>
          </div>

          <div className="w-full mt-3 p-2.5 rounded-xl bg-slate-50 text-xs text-slate-700 flex items-center justify-between">
            <span className="text-slate-500">Next Period Forecast:</span>
            <span className="font-bold text-slate-900">{formatShortDate(expectedNextPeriod)} ({Math.max(enteredCycleLength - currentCycleDay, 0)} days)</span>
          </div>

        </div>

        {/* Right: Monthly Interactive Calendar & Phase Timeline */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Cycle Calendar • {calendarMonthLabel}
                </h3>
                <p className="text-xs text-slate-500">
                  Fertile window: {fertileWindowStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {' - '}
                  {fertileWindowEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {' • Peak Ovulation: '}
                  {ovulationDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 mb-2">
              <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
            </div>

            {/* Calendar Grid Cells */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
              {Array.from({ length: calendarOffset }, (_, index) => (
                <div key={`empty-${index}`} className="p-2 text-slate-300" />
              ))}

              {Array.from({ length: daysInDisplayedMonth }, (_, i) => {
                const dayNum = i + 1;
                const calendarDate = new Date(
                  displayedMonthStart.getFullYear(),
                  displayedMonthStart.getMonth(),
                  dayNum
                );
                const cycleDay = Math.floor(
                  (calendarDate.getTime() - cycleStartDate.getTime()) / (24 * 60 * 60 * 1000)
                ) + 1;
                const isPeriod = cycleDay >= 1 && cycleDay <= cycleData.averagePeriodLength;
                const isFertile = calendarDate >= fertileWindowStart && calendarDate <= fertileWindowEnd;
                const isToday = isSameDate(calendarDate, ovulationDate);
                const isExpectedNext = isSameDate(calendarDate, expectedNextPeriod);

                return (
                  <div
                    key={dayNum}
                    className={`p-2 rounded-xl text-xs font-semibold relative transition-all cursor-pointer ${
                      isToday
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 scale-105 font-bold'
                        : isPeriod
                        ? 'bg-rose-100 text-rose-900 border border-rose-200'
                        : isFertile
                        ? 'bg-purple-50 text-purple-900 border border-purple-200'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>{dayNum}</span>
                    {/* Small indicator dots */}
                    {(isToday || isExpectedNext) && (
                      <span className="w-1 h-1 rounded-full bg-white absolute bottom-1 left-1/2 -translate-x-1/2" />
                    )}
                    {isPeriod && !isToday && (
                      <span className="w-1 h-1 rounded-full bg-rose-500 absolute bottom-1 left-1/2 -translate-x-1/2" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              Menstrual Flow
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              Fertile Window
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 ring-2 ring-rose-200" />
              Today (Ovulation)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              Luteal Phase
            </span>
          </div>

        </div>

      </section>

      {/* Live Menstrual Cycle Graph */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <h3 className="font-bold text-base text-slate-900">Live Menstrual Cycle</h3>
            <p className="text-xs text-slate-500">Your current position updates as the cycle day changes</p>
          </div>
          <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-xl">
            Day {currentCycleDay} of {enteredCycleLength} • {currentPhase}
          </span>
        </div>

        <div className="overflow-x-auto pb-1">
          <div className="min-w-155">
            <div className="relative h-20 flex items-end gap-1.5 px-1">
              <div className="absolute left-1 right-1 bottom-0 h-1 rounded-full bg-slate-100" />
              {Array.from({ length: enteredCycleLength }, (_, index) => {
                const day = index + 1;
                const isCurrentDay = day === currentCycleDay;
                const isMenstrual = day <= 5;
                const isOvulation = day === 14;
                const isFertile = day >= 11 && day <= 16;
                const phaseColor = isMenstrual
                  ? 'bg-rose-400'
                  : isOvulation
                  ? 'bg-purple-500'
                  : day > 14
                  ? 'bg-amber-400'
                  : 'bg-teal-400';

                return (
                  <div key={day} className="relative flex-1 h-full flex flex-col items-center justify-end gap-1">
                    {isCurrentDay && (
                      <span className="absolute -top-1 text-[10px] font-black text-slate-900">Today</span>
                    )}
                    <div
                      className={`w-full max-w-7 rounded-t-lg transition-all duration-500 ${phaseColor} ${
                        isCurrentDay ? 'h-14 ring-2 ring-slate-900 ring-offset-2' : isFertile ? 'h-10' : 'h-7'
                      }`}
                      title={`Cycle day ${day}`}
                    />
                    <span className={`text-[10px] ${isCurrentDay ? 'font-black text-slate-900' : 'text-slate-400'}`}>
                      {day}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-4 gap-2 mt-5 text-[10px] font-semibold text-slate-600">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-rose-400" />Menstrual</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-teal-400" />Follicular</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-purple-500" />Ovulation</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />Luteal</span>
            </div>
          </div>
        </div>
      </section>

      {/* Log Symptoms Today Widget & AI Insight */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Symptom Logger Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Log Today's Body & Mood Signals
              </h3>
              <p className="text-xs text-slate-500">
                Select your symptoms on Day {currentCycleDay} ({currentPhase})
              </p>
            </div>
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg">
              {selectedSymptoms.length} Selected
            </span>
          </div>

          {/* Symptom Chips */}
          <div className="flex flex-wrap gap-2">
            {symptomOptions.map((symptom) => {
              const isSelected = selectedSymptoms.includes(symptom);
              return (
                <button
                  key={symptom}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      setSelectedSymptoms(prev => prev.filter(s => s !== symptom));
                    } else {
                      setSelectedSymptoms(prev => [...prev, symptom]);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'bg-rose-500 border-rose-500 text-white shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {symptom}
                </button>
              );
            })}
          </div>

          {/* Severity Slider */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Overall Discomfort / Intensity:</span>
              <span className="font-bold text-rose-600">
                Level {severityScore}/5 ({severityScore <= 2 ? 'Mild' : severityScore === 3 ? 'Moderate' : 'Severe'})
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={severityScore}
              onChange={(e) => setSeverityScore(Number(e.target.value))}
              className="w-full accent-rose-500 h-2 bg-slate-100 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>1 - Subtle</span>
              <span>3 - Moderate</span>
              <span>5 - Severe / Debilitating</span>
            </div>
          </div>

          {/* Notes Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Personal Observations (Optional)</label>
            <input
              type="text"
              value={symptomNotes}
              onChange={(e) => setSymptomNotes(e.target.value)}
              placeholder="e.g. Mild headache after afternoon meeting, took 500ml water..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <button
            id="save-symptom-log-btn"
            onClick={handleSaveSymptomLog}
            disabled={selectedSymptoms.length === 0 || isSubmittingSymptom}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2"
          >
            {isSubmittingSymptom ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-rose-400" />
                <span>Syncing & Analyzing with AI...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Save Symptoms & Refresh AI Insight</span>
              </>
            )}
          </button>
        </div>

        {/* AI Phase Insight Card */}
        <div className="lg:col-span-5 bg-linear-to-br from-rose-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-rose-200 text-xs font-bold border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-rose-300" />
                AI Cycle Intelligence
              </span>
              <span className="text-[10px] text-slate-300">Phase Day 14</span>
            </div>

            <h4 className="text-base sm:text-lg font-bold text-white leading-snug">
              Guidance for {latestSymptomLog?.symptoms.join(', ') || 'your current symptoms'}
            </h4>

            <div className="flex gap-2" role="group" aria-label="Translate guidance">
              {(['English', 'Bengali', 'Hindi'] as const).map((language) => (
                <button
                  key={language}
                  type="button"
                  onClick={() => void handleGuidanceLanguageChange(language)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                    guidanceLanguage === language
                      ? 'bg-white text-slate-900 border-white'
                      : 'bg-white/10 text-rose-100 border-white/20 hover:bg-white/20'
                  }`}
                >
                  {language === 'Bengali' ? 'বাংলা' : language === 'Hindi' ? 'हिन्दी' : language}
                </button>
              ))}
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
              {isTranslatingGuidance ? 'Translating guidance...' : translatedGuidance || guidanceText}
            </p>

          </div>

          <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
            <span>Specialist Match: OB-GYN</span>
            <span className="font-bold text-teal-300">Dr. Sunita Banerjee, MD</span>
          </div>
        </div>

      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3 mb-5"><div><h3 className="font-bold text-base text-slate-900">Your cycle forecast</h3><p className="text-xs text-slate-500">Estimates based on your last period and cycle length.</p></div><div className="p-2 rounded-xl bg-rose-50 text-rose-600"><Calendar className="w-5 h-5" /></div></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">{phaseDates.map(({ phase, start, end }) => <div key={phase} className={`rounded-2xl border p-3 ${phaseForDay(currentCycleDay) === phase ? 'border-rose-300 bg-rose-50' : 'border-slate-100 bg-slate-50'}`}><p className="text-[10px] font-bold uppercase text-slate-500">{phase}</p><p className="text-sm font-black text-slate-900 mt-1">{formatShortDate(start)}</p><p className="text-[10px] text-slate-500">to {formatShortDate(end)}</p></div>)}</div>
          <div className="rounded-2xl bg-slate-900 text-white p-4 flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] uppercase tracking-wider text-slate-300">Current estimate</p><p className="font-bold">Day {currentCycleDay} · {phaseForDay(currentCycleDay)} phase</p></div><div className="text-right"><p className="text-[10px] text-slate-300">Next period</p><p className="font-bold text-rose-200">{formatShortDate(expectedNextPeriod)}</p></div></div>
        </div>
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-start gap-3 mb-4"><div className="p-2 rounded-xl bg-violet-50 text-violet-600"><ClipboardCheck className="w-5 h-5" /></div><div><h3 className="font-bold text-base text-slate-900">PCOS / PCOD wellness check</h3><p className="text-xs text-slate-500">A pattern check, never a diagnosis.</p></div></div>
          <div className="space-y-3">{wellnessQuestions.map((question) => <div key={question.id} className="flex items-center justify-between gap-2"><span className="text-xs text-slate-700 leading-snug">{question.label}</span><div className="flex gap-1 shrink-0">{['yes', 'no'].map((answer) => <button key={answer} type="button" onClick={() => setWellnessAnswers((previous) => ({ ...previous, [question.id]: answer }))} className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${wellnessAnswers[question.id] === answer ? 'bg-violet-600 border-violet-600 text-white' : 'border-slate-200 text-slate-500'}`}>{answer}</button>)}</div></div>)}</div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-5 mb-2">Symptoms you notice</p><div className="flex flex-wrap gap-1.5">{['Irregular periods', 'Acne', 'Facial hair growth', 'Hair thinning', 'Darkened skin folds', 'Pelvic discomfort'].map((symptom) => <button key={symptom} type="button" onClick={() => setWellnessSymptoms((previous) => previous.includes(symptom) ? previous.filter((item) => item !== symptom) : [...previous, symptom])} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border ${wellnessSymptoms.includes(symptom) ? 'bg-violet-100 border-violet-300 text-violet-900' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>{symptom}</button>)}</div>
          <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-950"><p>{wellnessResult}</p>{wellnessScore >= 2 && <p className="mt-1 font-semibold flex items-center gap-1"><Stethoscope className="w-3.5 h-3.5" />Consult an OB-GYN or endocrinologist if symptoms persist.</p>}</div><p className="text-[10px] text-slate-400 mt-3">Only a clinician can assess PCOS/PCOD using your history, examination, and tests.</p>
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4"><div><h3 className="font-bold text-base text-slate-900">Food for this phase</h3><p className="text-xs text-slate-500">Healthy Indian choices to support everyday wellbeing.</p></div><div className="flex gap-1.5 flex-wrap">{(['Menstrual', 'Follicular', 'Ovulation', 'Luteal'] as const).map((phase) => <button key={phase} type="button" onClick={() => setSelectedFoodPhase(phase)} className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border ${selectedFoodPhase === phase ? 'bg-rose-600 border-rose-600 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{phase}</button>)}</div></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3"><div className="md:col-span-1 rounded-2xl bg-rose-50 p-4"><p className="text-[10px] uppercase tracking-wider font-bold text-rose-600">Focus</p><p className="font-bold text-slate-900 mt-1">{phaseFoods[selectedFoodPhase].focus}</p><p className="text-xs text-slate-600 mt-2 leading-relaxed">{phaseFoods[selectedFoodPhase].tip}</p></div><div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-2">{phaseFoods[selectedFoodPhase].foods.map((food) => <div key={food} className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs font-semibold text-slate-800 flex items-center gap-2"><Utensils className="w-3.5 h-3.5 text-rose-500 shrink-0" />{food}</div>)}</div></div>
      </section>

      {/* Hydration & Sleep Trackers */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Hydration Tracker */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Hydration Progress</h4>
                <p className="text-xs text-slate-500">Crucial for luteal & ovulation headaches</p>
              </div>
            </div>
            <span className="text-xs font-bold text-cyan-700">
              {waterCurrentMl} / {waterGoalMl} ml
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div 
              className="bg-cyan-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min((waterCurrentMl / waterGoalMl) * 100, 100)}%` }}
            />
          </div>

          {/* Quick Add Buttons */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              onClick={() => handleAddWater(250)}
              className="flex-1 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-900 text-xs font-bold border border-cyan-200 transition-colors"
            >
              + 250 ml (Glass)
            </button>
            <button
              onClick={() => handleAddWater(500)}
              className="flex-1 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-900 text-xs font-bold border border-cyan-200 transition-colors"
            >
              + 500 ml (Bottle)
            </button>
            <button
              onClick={() => setWaterCurrentMl(0)}
              className="px-3 py-2 rounded-xl text-slate-400 hover:text-slate-600 text-xs"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Sleep Tracker */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Sleep & Rest Quality</h4>
                <p className="text-xs text-slate-500">Recorded last night</p>
              </div>
            </div>
            <span className="text-xs font-bold text-indigo-700">
              {sleepHours} Hours ({sleepQuality})
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <input
                type="range"
                min="4"
                max="12"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(Number(e.target.value))}
                className="w-full accent-indigo-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
              />
            </div>
            <span className="text-xs font-bold text-slate-700 w-12 text-right">
              {sleepHours} hrs
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            {['Restful', 'Moderate', 'Interrupted'].map((qual) => (
              <button
                key={qual}
                onClick={() => setSleepQuality(qual)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  sleepQuality === qual
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {qual}
              </button>
            ))}
          </div>
        </div>

      </section>

      {/* Phase-Aligned Nutrition & Recipes */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-slate-900">
              Targeted Nutrition & Recipes for Phase {currentPhase}
            </h3>
            <p className="text-xs text-slate-500">
              Meals formulated with iron, healthy fats, and magnesium to balance neurotransmitters & prostaglandin
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {nutritionRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="h-44 w-full overflow-hidden relative">
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-900/80 text-white backdrop-blur-sm">
                    {recipe.category}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-rose-600 transition-colors">
                    {recipe.name}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {recipe.benefit}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span>🔥 {recipe.calories} kcal</span>
                    <span>🌿 {recipe.ironMg}mg Iron</span>
                    <span>💪 {recipe.proteinG}g Protein</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-100">
                <button
                  onClick={() => setSelectedRecipeModal(recipe)}
                  className="w-full py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Utensils className="w-3.5 h-3.5 text-rose-500" />
                  <span>View Prep Recipe & Ingredients</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recipe Modal */}
      {selectedRecipeModal && (
        <div 
          id="recipe-details-modal"
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="relative h-48 sm:h-56">
              <img
                src={selectedRecipeModal.imageUrl}
                alt={selectedRecipeModal.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setSelectedRecipeModal(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-600 text-white">
                  {selectedRecipeModal.category}
                </span>
                <h3 className="text-lg font-black mt-1 drop-shadow-md">{selectedRecipeModal.name}</h3>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-100 text-xs text-rose-950">
                <p className="font-bold mb-1">Clinical Hormonal Benefit:</p>
                <p>{selectedRecipeModal.benefit}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Ingredients Needed</h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {selectedRecipeModal.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span>{ing}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Preparation Instructions</h4>
                <ol className="space-y-2 text-xs text-slate-700 list-decimal list-inside">
                  {selectedRecipeModal.instructions.map((step, i) => (
                    <li key={i} className="leading-relaxed">
                      <span className="text-slate-800 font-medium">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedRecipeModal(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Period Modal */}
      {showLogPeriodModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">Log Period & Menstrual Flow</h3>
              <button onClick={() => setShowLogPeriodModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Record start of flow to calibrate future ovulation forecasts.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label htmlFor="period-start-date" className="text-xs font-bold text-slate-700">Period Start Date:</label>
                <input
                  id="period-start-date"
                  type="date"
                  value={periodStartDate}
                  onChange={(event) => setPeriodStartDate(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="cycle-length" className="text-xs font-bold text-slate-700">Cycle Length (days):</label>
                <input
                  id="cycle-length"
                  type="number"
                  min="21"
                  max="45"
                  value={cycleLength}
                  onChange={(event) => setCycleLength(Number(event.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="period-length" className="text-xs font-bold text-slate-700">Period Length (days):</label>
                <input
                  id="period-length"
                  type="number"
                  min="1"
                  max="14"
                  value={periodLength}
                  onChange={(event) => setPeriodLength(Number(event.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Flow Intensity:</label>
              <div className="grid grid-cols-4 gap-2">
                {(['Light', 'Medium', 'Heavy', 'Spotting'] as const).map((flow) => (
                  <button
                    key={flow}
                    onClick={() => setPeriodFlow(flow)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      periodFlow === flow
                        ? 'bg-rose-500 border-rose-500 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {flow}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setShowLogPeriodModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onUpdateCycle(1, 'Menstrual', { periodStartDate, periodLength, cycleLength });
                  setShowLogPeriodModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20"
              >
                Save Period Entry
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
