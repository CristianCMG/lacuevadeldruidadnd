import { LucideIcon } from 'lucide-react';

interface StatusCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  status: 'success' | 'warning' | 'error' | 'neutral';
}

export default function StatusCard({ title, value, subtitle, icon: Icon, status }: StatusCardProps) {
  const colors = {
    success: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400',
    neutral: 'text-blue-400',
  };

  const borderColors = {
    success: 'border-green-900/50',
    warning: 'border-yellow-900/50',
    error: 'border-red-900/50',
    neutral: 'border-gray-700',
  };

  return (
    <div className={`bg-gray-800 p-6 rounded-lg border ${borderColors[status]} flex items-start justify-between`}>
      <div>
        <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
        <p className="text-3xl font-bold text-white mt-2">{value}</p>
        <span className={`${colors[status]} text-xs mt-1 block`}>{subtitle}</span>
      </div>
      <div className={`p-3 rounded-full bg-gray-700/50 ${colors[status]}`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  );
}
