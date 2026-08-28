import React, { useState } from 'react';
import {
  Activity,
  Apple,
  CheckCircle2,
  Dumbbell,
  House,
  Scale,
  Target,
  Utensils,
} from 'lucide-react';

type FitnessGoal = 'lose_weight' | 'gain_weight' | 'lean_muscle';

type PlanResult = {
  bmi: number;
  idealWeight: string;
  calories: string;
  protein: string;
  goalLabel: string;
};

const goalOptions: { value: FitnessGoal; label: string }[] = [
  { value: 'lose_weight', label: 'Lose weight' },
  { value: 'gain_weight', label: 'Gain weight' },
  { value: 'lean_muscle', label: 'Gain lean muscle' },
];

const getPlanResult = (
  height: number,
  weight: number,
  activity: boolean,
  goal: FitnessGoal
): PlanResult | null => {
  if (!height || !weight || height < 100 || weight < 20) return null;

  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  const healthyMinimum = 18.5 * heightInMeters * heightInMeters;
  const healthyMaximum = 24.9 * heightInMeters * heightInMeters;
  const goalLabel = goalOptions.find((option) => option.value === goal)?.label || '';

  let idealMinimum = healthyMinimum;
  let idealMaximum = healthyMaximum;
  let calorieAdjustment = -300;
  let proteinPerKg = 1.2;

  if (goal === 'gain_weight') {
    idealMinimum = healthyMaximum;
    idealMaximum = healthyMaximum + 5;
    calorieAdjustment = 300;
    proteinPerKg = 1.4;
  } else if (goal === 'lean_muscle') {
    idealMinimum = Math.max(healthyMinimum, weight);
    idealMaximum = healthyMaximum + 3;
    calorieAdjustment = 200;
    proteinPerKg = 1.6;
  }

  const baseCalories = weight * (activity ? 33 : 28);
  const recommendedCalories = Math.round(baseCalories + calorieAdjustment);
  const recommendedProtein = Math.round(weight * proteinPerKg);

  return {
    bmi: Number(bmi.toFixed(1)),
    idealWeight: `${Math.round(idealMinimum)}-${Math.round(idealMaximum)} kg`,
    calories: `${recommendedCalories} kcal/day`,
    protein: `${recommendedProtein} g/day`,
    goalLabel,
  };
};

const getHomeWorkoutPlan = (height: number, weight: number, goal: FitnessGoal) => {
  const bmi = weight / Math.pow(height / 100, 2);
  const isHigherImpactSuitable = bmi < 27 && height >= 160;

  if (goal === 'lose_weight') {
    return isHigherImpactSuitable
      ? ['12 bodyweight squats', '10 reverse lunges', '8 incline push-ups', '30-second mountain climbers', '12 glute bridges', '12-minute brisk walk']
      : ['10 chair squats', '8 step-back taps per side', '8 wall push-ups', '20-second standing knee lifts', '10 glute bridges', '10-minute gentle walk'];
  }

  if (goal === 'gain_weight') {
    return height >= 175
      ? ['8 supported squats', '10 elevated push-ups', '10 backpack rows', '12 glute bridges', '20-second side plank per side', '8-minute easy walk']
      : ['10 slow squats', '8 wall push-ups', '10 backpack rows', '10 hip hinges', '20-second plank', '6-minute easy walk'];
  }

  return bmi < 25
    ? ['10 split squats per side', '10 incline push-ups', '12 backpack rows', '12 single-leg glute bridges', '25-second plank', '10-minute mobility routine']
    : ['10 supported split squats per side', '8 wall push-ups', '10 backpack rows', '12 glute bridges', '20-second elevated plank', '8-minute mobility routine'];
};

export const HealthDietView: React.FC = () => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [goal, setGoal] = useState<FitnessGoal>('lose_weight');
  const [planResult, setPlanResult] = useState<PlanResult | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setPlanResult(getPlanResult(Number(height), Number(weight), isActive, goal));
  };

  const mealPlan = goal === 'lose_weight'
    ? ['Vegetable omelette with whole-grain toast', 'Dal, grilled paneer or chicken with salad', 'Fruit with unsweetened yogurt', 'Vegetable soup with a protein serving']
    : goal === 'gain_weight'
      ? ['Oats with banana, milk and nuts', 'Rice or roti with dal, paneer or chicken', 'Smoothie with milk, fruit and nut butter', 'Khichdi with vegetables and curd']
      : ['Eggs or paneer with oats and fruit', 'Rice, dal and lean protein with vegetables', 'Greek yogurt with nuts and fruit', 'Whole-grain roti with tofu, paneer or chicken'];
  const homeWorkoutPlan = getHomeWorkoutPlan(Number(height), Number(weight), goal);

  return (
    <div className="space-y-6 pb-16">
      <section className="bg-linear-to-br from-teal-900 via-teal-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-teal-400/20 border border-teal-300/30">
            <Apple className="w-6 h-6 text-teal-200" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">Health & Diet Planner</h1>
            <p className="text-sm text-teal-100 mt-1">Create a personal nutrition and fitness plan.</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div>
            <h2 className="font-bold text-lg text-slate-900">Your health details</h2>
            <p className="text-xs text-slate-500 mt-1">Enter your details to generate your plan.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-bold text-slate-700">
              Height (cm)
              <input
                type="number"
                min="100"
                max="250"
                value={height}
                onChange={(event) => setHeight(event.target.value)}
                placeholder="170"
                required
                className="w-full mt-1.5 rounded-xl border border-slate-200 px-3 py-2.5 font-normal text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </label>
            <label className="text-xs font-bold text-slate-700">
              Weight (kg)
              <input
                type="number"
                min="20"
                max="300"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
                placeholder="65"
                required
                className="w-full mt-1.5 rounded-xl border border-slate-200 px-3 py-2.5 font-normal text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </label>
          </div>

          <fieldset>
            <legend className="text-xs font-bold text-slate-700 mb-2">Are you physically active?</legend>
            <div className="grid grid-cols-2 gap-2">
              {[true, false].map((active) => (
                <button
                  key={String(active)}
                  type="button"
                  onClick={() => setIsActive(active)}
                  className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    isActive === active
                      ? 'bg-teal-600 border-teal-600 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {active ? 'Yes, I exercise' : 'No, not currently'}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-xs font-bold text-slate-700 mb-2">Your goal</legend>
            <div className="space-y-2">
              {goalOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer text-xs font-semibold transition-all ${
                    goal === option.value ? 'bg-teal-50 border-teal-300 text-teal-900' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="fitness-goal"
                    value={option.value}
                    checked={goal === option.value}
                    onChange={() => setGoal(option.value)}
                    className="accent-teal-600"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>

          <button type="submit" className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold flex items-center justify-center gap-2">
            <Target className="w-4 h-4" />
            Generate my plan
          </button>
        </form>

        <section className="lg:col-span-3 space-y-6">
          {!planResult ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-10 text-center shadow-sm">
              <Scale className="w-10 h-10 text-teal-600 mx-auto mb-3" />
              <h2 className="font-bold text-slate-900">Your plan will appear here</h2>
              <p className="text-xs text-slate-500 mt-1">Add your height, weight, activity level and goal.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'BMI', value: planResult.bmi, icon: Scale },
                  { label: 'Ideal weight', value: planResult.idealWeight, icon: Target },
                  { label: 'Calories', value: planResult.calories, icon: Activity },
                  { label: 'Protein', value: planResult.protein, icon: Dumbbell },
                ].map((metric) => {
                  const Icon = metric.icon;
                  return (
                    <div key={metric.label} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                      <Icon className="w-4 h-4 text-teal-600 mb-2" />
                      <p className="text-[11px] text-slate-500">{metric.label}</p>
                      <p className="text-sm font-black text-slate-900 mt-1">{metric.value}</p>
                    </div>
                  );
                })}
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
                <div>
                  <h2 className="font-bold text-lg text-slate-900">Dietary plan for {planResult.goalLabel}</h2>
                  <p className="text-xs text-slate-500 mt-1">A balanced starting plan based on the details you entered.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {mealPlan.map((meal, index) => (
                    <div key={meal} className="p-3 rounded-2xl bg-teal-50/70 border border-teal-100 flex items-start gap-2.5">
                      <Utensils className="w-4 h-4 text-teal-700 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold uppercase text-teal-700">Meal {index + 1}</p>
                        <p className="text-xs font-semibold text-slate-800 mt-0.5">{meal}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500">Drink water regularly and adjust portions to your hunger, health needs and clinician advice.</p>
              </div>

              {!isActive && (
                <div className="bg-amber-50 rounded-3xl border border-amber-200 p-6 shadow-sm">
                  <div className="flex items-center gap-2">
                    <House className="w-5 h-5 text-amber-700" />
                    <h2 className="font-bold text-amber-950">Home workout starter plan</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-semibold text-amber-950">
                    {homeWorkoutPlan.map((exercise) => (
                      <div key={exercise} className="flex items-center gap-2 bg-white/70 rounded-xl p-2.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        {exercise}
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-amber-800 mt-4">Start with 2-3 rounds, 3 days per week, and increase gradually.</p>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};
