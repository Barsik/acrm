/** Подпись оси Y для графиков recharts в аналитике портфеля. */
export const yAxisLabel = (value: string) => ({
  value,
  angle: -90,
  position: 'insideLeft' as const,
  offset: 2,
  style: { fill: '#64748B', fontSize: 10 },
});
