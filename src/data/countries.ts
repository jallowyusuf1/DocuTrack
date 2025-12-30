// Country data with flags for dropdowns
export interface Country {
  code: string;
  name: string;
  flag: string;
  nationality: string;
}

export const COUNTRIES: Country[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸', nationality: 'American' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', nationality: 'Canadian' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', nationality: 'British' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', nationality: 'Australian' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', nationality: 'German' },
  { code: 'FR', name: 'France', flag: '🇫🇷', nationality: 'French' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', nationality: 'Italian' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', nationality: 'Spanish' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', nationality: 'Dutch' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', nationality: 'Belgian' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', nationality: 'Swiss' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', nationality: 'Austrian' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', nationality: 'Swedish' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', nationality: 'Norwegian' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', nationality: 'Danish' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', nationality: 'Finnish' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', nationality: 'Polish' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', nationality: 'Portuguese' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷', nationality: 'Greek' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', nationality: 'Irish' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', nationality: 'New Zealander' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', nationality: 'Japanese' },
  { code: 'CN', name: 'China', flag: '🇨🇳', nationality: 'Chinese' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', nationality: 'South Korean' },
  { code: 'IN', name: 'India', flag: '🇮🇳', nationality: 'Indian' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', nationality: 'Brazilian' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', nationality: 'Mexican' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', nationality: 'Argentine' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', nationality: 'South African' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', nationality: 'Egyptian' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', nationality: 'Saudi' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', nationality: 'Emirati' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', nationality: 'Turkish' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺', nationality: 'Russian' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', nationality: 'Pakistani' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', nationality: 'Bangladeshi' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', nationality: 'Indonesian' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', nationality: 'Filipino' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', nationality: 'Thai' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', nationality: 'Vietnamese' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', nationality: 'Malaysian' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', nationality: 'Singaporean' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱', nationality: 'Israeli' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', nationality: 'Nigerian' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', nationality: 'Kenyan' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', nationality: 'Ghanaian' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', nationality: 'Chilean' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', nationality: 'Colombian' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪', nationality: 'Peruvian' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪', nationality: 'Venezuelan' },
];

export const getCountryByCode = (code: string): Country | undefined => {
  return COUNTRIES.find(c => c.code === code);
};

export const getCountryByName = (name: string): Country | undefined => {
  return COUNTRIES.find(c => c.name.toLowerCase() === name.toLowerCase());
};

// Type for dropdown options
interface DropdownOption {
  value: string;
  label: string;
  flag?: string;
}

export const getNationalities = (): DropdownOption[] => {
  return COUNTRIES.map(c => ({
    value: c.nationality,
    label: `${c.flag} ${c.nationality}`,
    flag: c.flag,
  }));
};

export const getCountries = (): DropdownOption[] => {
  return COUNTRIES.map(c => ({
    value: c.code,
    label: `${c.flag} ${c.name}`,
    flag: c.flag,
  }));
};

