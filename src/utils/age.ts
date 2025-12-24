export function calculateAgeYears(dobISO: string) {
  const dob = new Date(dobISO + 'T00:00:00');
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age -= 1;
  return age;
}


