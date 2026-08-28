import React, { useState } from 'react';
import { X, CheckCircle2, Sparkles } from 'lucide-react';
import { SymptomLog } from '../types';

interface LogSymptomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSymptom: (log: Omit<SymptomLog, 'id'>) => Promise<void>;
  currentCycleDay?: number;
}

export const LogSymptomModal: React.FC<LogSymptomModalProps> = ({
  isOpen,
  onClose,
  onSaveSymptom,
  currentCycleDay = 14,
}) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['Headache']);
  const [severityScore, setSeverityScore] = useState(2);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const symptomList = [
    'Headache',
    'Migraine',
    'Cramps',
    'Fatigue',
    'Bloating',
    'Nausea',
    'Dizziness',
    'Lower Back Pain',
    'Mood Swings',
    'Anxiety',
    'Acne',
    'Insomnia',
  ];

  const handleSave = async () => {
    if (selectedSymptoms.length === 0) return;
    setIsSubmitting(true);
    try {
      const severityMap: Record<number, 'Mild' | 'Moderate' | 'Severe'> = {
        1: 'Mild',
        2: 'Mild',
        3: 'Moderate',
        4: 'Severe',
        5: 'Severe',
      };

      await onSaveSymptom({
        date: 'Today, Oct 24',
        cycleDay: currentCycleDay,
        symptoms: selectedSymptoms,
        severity: severityMap[severityScore] || 'Mild',
        severityScore,
        notes,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-base text-slate-900">Log Symptoms & Body Signals</h3>
            <p className="text-xs text-slate-500">Record for AI correlation & physician review</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Select Symptoms Occurring Today:</label>
            <div className="flex flex-wrap gap-1.5">
              {symptomList.map((symp) => {
                const isSelected = selectedSymptoms.includes(symp);
                return (
                  <button
                    key={symp}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedSymptoms(prev => prev.filter(s => s !== symp));
                      } else {
                        setSelectedSymptoms(prev => [...prev, symp]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl font-semibold border transition-all ${
                      isSelected
                        ? 'bg-teal-600 border-teal-600 text-white shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {symp}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between font-bold text-slate-700">
              <span>Severity Level:</span>
              <span className="text-teal-700">Level {severityScore}/5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={severityScore}
              onChange={(e) => setSeverityScore(Number(e.target.value))}
              className="w-full accent-teal-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Additional Notes / Triggers:</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Started after 4 hours of screen time, drank 1 cup coffee..."
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="pt-2 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={selectedSymptoms.length === 0 || isSubmitting}
            className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 flex items-center justify-center gap-1.5"
          >
            {isSubmitting ? (
              <Sparkles className="w-4 h-4 animate-spin text-teal-200" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>Save Symptom Log</span>
          </button>
        </div>
      </div>
    </div>
  );
};
