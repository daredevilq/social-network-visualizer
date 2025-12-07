'use client';

import CountUp from 'react-countup';
import { LucideIcon } from 'lucide-react';

interface Props {
  label: string;
  value: number | string;
  icon?: LucideIcon;
}

export default function MetricCard({ label, value, icon: Icon }: Props) {
  const numericValue = Number(value);
  const hasDecimals = !Number.isInteger(numericValue);

  const decimals = hasDecimals ? (value.toString().split('.')[1]?.length ?? 0) : 0;

  return (
    <div className="bg-[#3D3D4E] p-4 rounded-lg flex flex-col items-center">
      <span className="text-gray-400">{label}</span>

      <CountUp
        key={numericValue}
        start={0}
        end={numericValue}
        duration={2}
        decimals={decimals}
        decimal="."
        separator=" "
        className="text-3xl font-bold"
      />
    </div>
  );
}
