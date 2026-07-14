/** Project-wide formatter for every numeric value shown to the user. */
export const projectNumberFormat = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 1,
});

export const formatNumber = (value: number) => projectNumberFormat.format(value);
