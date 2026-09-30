import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Ruler } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
}

export const SizeChartModal: React.FC<SizeChartModalProps> = ({
  isOpen,
  onClose,
  category = 'Topwear',
}) => {
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');

  const sizeData = [
    { size: 'S', chestIn: 38, chestCm: 96.5, shoulderIn: 16.5, shoulderCm: 42, lengthIn: 27, lengthCm: 68.5 },
    { size: 'M', chestIn: 40, chestCm: 101.5, shoulderIn: 17.5, shoulderCm: 44.5, lengthIn: 28, lengthCm: 71 },
    { size: 'L', chestIn: 42, chestCm: 106.5, shoulderIn: 18.5, shoulderCm: 47, lengthIn: 29, lengthCm: 73.5 },
    { size: 'XL', chestIn: 44, chestCm: 112, shoulderIn: 19.5, shoulderCm: 49.5, lengthIn: 30, lengthCm: 76 },
    { size: 'XXL', chestIn: 46, chestCm: 117, shoulderIn: 20.5, shoulderCm: 52, lengthIn: 31, lengthCm: 78.5 },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${category} Size Guide`} size="lg">
      <div className="space-y-6">
        {/* Unit toggle */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">All measurements are garment dimensions</span>
          <div className="inline-flex rounded-lg border border-border p-1 bg-surface">
            <button
              type="button"
              onClick={() => setUnit('inches')}
              className={cn(
                'px-3 py-1 text-xs font-semibold rounded-md transition-all',
                unit === 'inches' ? 'bg-white shadow text-primary' : 'text-muted hover:text-primary'
              )}
            >
              Inches
            </button>
            <button
              type="button"
              onClick={() => setUnit('cm')}
              className={cn(
                'px-3 py-1 text-xs font-semibold rounded-md transition-all',
                unit === 'cm' ? 'bg-white shadow text-primary' : 'text-muted hover:text-primary'
              )}
            >
              CM
            </button>
          </div>
        </div>

        {/* Measurement Table */}
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-surface border-b border-border">
              <tr>
                <th className="py-3 px-4 font-bold text-primary">Size</th>
                <th className="py-3 px-4 font-bold text-primary">Chest ({unit === 'inches' ? 'in' : 'cm'})</th>
                <th className="py-3 px-4 font-bold text-primary">Shoulder ({unit === 'inches' ? 'in' : 'cm'})</th>
                <th className="py-3 px-4 font-bold text-primary">Length ({unit === 'inches' ? 'in' : 'cm'})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sizeData.map((row) => (
                <tr key={row.size} className="hover:bg-gray-50/50">
                  <td className="py-3 px-4 font-bold text-primary">{row.size}</td>
                  <td className="py-3 px-4 text-gray-700">
                    {unit === 'inches' ? row.chestIn : row.chestCm}
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    {unit === 'inches' ? row.shoulderIn : row.shoulderCm}
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    {unit === 'inches' ? row.lengthIn : row.lengthCm}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* How to measure tips */}
        <div className="bg-surface rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
            <Ruler size={14} className="text-accent" />
            How to Measure
          </div>
          <ul className="text-xs text-muted space-y-1 list-disc list-inside">
            <li><strong>Chest:</strong> Measure around the fullest part of the chest, keeping tape horizontal.</li>
            <li><strong>Shoulder:</strong> Measure from the tip of one shoulder across the back to the other tip.</li>
            <li><strong>Length:</strong> Measure from highest point of the shoulder down to the bottom hem.</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};
