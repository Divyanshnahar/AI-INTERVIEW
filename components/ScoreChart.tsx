"use client";

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from "recharts";

interface ScoreChartProps {
  data: { subject: string; score: number }[];
}

export default function ScoreChart({ data }: ScoreChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-white/40 flex h-full items-center justify-center italic text-sm">
        Insufficient data to generate radar chart.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
        <PolarGrid stroke="rgba(255,255,255,0.1)" />
        <PolarAngleAxis 
          dataKey="subject" 
          tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500 }} 
        />
        <PolarRadiusAxis 
          angle={30} 
          domain={[0, 100]} 
          tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} 
          axisLine={false}
        />
        <Radar 
          name="Candidate Score" 
          dataKey="score" 
          stroke="#3b82f6" 
          strokeWidth={2}
          fill="#3b82f6" 
          fillOpacity={0.3} 
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgba(0,0,0,0.9)', 
            borderColor: 'rgba(255,255,255,0.1)', 
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
          }}
          itemStyle={{ color: '#60a5fa', fontWeight: 'bold' }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
