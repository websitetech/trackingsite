// Phone number validation utility with country codes
export interface CountryCode {
  name: string;
  code: string;
  dialCode: string;
  format: string;
  minLength: number;
  maxLength: number;
  pattern: RegExp;
}

// Comprehensive list of country codes with validation patterns
export const countryCodes: CountryCode[] = [
  // North America
  { name: 'Canada', code: 'CA', dialCode: '+1', format: '(###) ###-####', minLength: 10, maxLength: 10, pattern: /^[2-9]\d{9}$/ },
  { name: 'United States', code: 'US', dialCode: '+1', format: '(###) ###-####', minLength: 10, maxLength: 10, pattern: /^[2-9]\d{9}$/ },
  
  // Europe
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', format: '#### ######', minLength: 10, maxLength: 11, pattern: /^[1-9]\d{9,10}$/ },
  { name: 'Germany', code: 'DE', dialCode: '+49', format: '### #######', minLength: 10, maxLength: 12, pattern: /^[1-9]\d{9,11}$/ },
  { name: 'France', code: 'FR', dialCode: '+33', format: '# ## ## ## ##', minLength: 9, maxLength: 10, pattern: /^[1-9]\d{8,9}$/ },
  { name: 'Italy', code: 'IT', dialCode: '+39', format: '### ### ####', minLength: 9, maxLength: 10, pattern: /^[3-9]\d{8,9}$/ },
  { name: 'Spain', code: 'ES', dialCode: '+34', format: '### ### ###', minLength: 9, maxLength: 9, pattern: /^[6-9]\d{8}$/ },
  { name: 'Netherlands', code: 'NL', dialCode: '+31', format: '## ### ####', minLength: 9, maxLength: 9, pattern: /^[1-9]\d{8}$/ },
  { name: 'Belgium', code: 'BE', dialCode: '+32', format: '### ### ###', minLength: 9, maxLength: 9, pattern: /^[1-9]\d{8}$/ },
  { name: 'Switzerland', code: 'CH', dialCode: '+41', format: '## ### ####', minLength: 9, maxLength: 9, pattern: /^[1-9]\d{8}$/ },
  { name: 'Austria', code: 'AT', dialCode: '+43', format: '### ### ####', minLength: 10, maxLength: 12, pattern: /^[1-9]\d{9,11}$/ },
  { name: 'Sweden', code: 'SE', dialCode: '+46', format: '## ### ####', minLength: 9, maxLength: 9, pattern: /^[1-9]\d{8}$/ },
  { name: 'Norway', code: 'NO', dialCode: '+47', format: '### ## ###', minLength: 8, maxLength: 8, pattern: /^[2-9]\d{7}$/ },
  { name: 'Denmark', code: 'DK', dialCode: '+45', format: '## ## ## ##', minLength: 8, maxLength: 8, pattern: /^[2-9]\d{7}$/ },
  { name: 'Finland', code: 'FI', dialCode: '+358', format: '### ### ####', minLength: 9, maxLength: 9, pattern: /^[1-9]\d{8}$/ },
  { name: 'Poland', code: 'PL', dialCode: '+48', format: '### ### ###', minLength: 9, maxLength: 9, pattern: /^[1-9]\d{8}$/ },
  { name: 'Czech Republic', code: 'CZ', dialCode: '+420', format: '### ### ###', minLength: 9, maxLength: 9, pattern: /^[1-9]\d{8}$/ },
  { name: 'Hungary', code: 'HU', dialCode: '+36', format: '## ### ####', minLength: 9, maxLength: 9, pattern: /^[1-9]\d{8}$/ },
  { name: 'Romania', code: 'RO', dialCode: '+40', format: '### ### ###', minLength: 9, maxLength: 9, pattern: /^[1-9]\d{8}$/ },
  { name: 'Bulgaria', code: 'BG', dialCode: '+359', format: '### ### ###', minLength: 9, maxLength: 9, pattern: /^[1-9]\d{8}$/ },
  { name: 'Greece', code: 'GR', dialCode: '+30', format: '### ### ####', minLength: 10, maxLength: 10, pattern: /^[2-9]\d{9}$/ },
  { name: 'Portugal', code: 'PT', dialCode: '+351', format: '### ### ###', minLength: 9, maxLength: 9, pattern: /^[2-9]\d{8}$/ },
  { name: 'Ireland', code: 'IE', dialCode: '+353', format: '## ### ####', minLength: 9, maxLength: 9, pattern: /^[1-9]\d{8}$/ },
  
  // Asia
  { name: 'China', code: 'CN', dialCode: '+86', format: '### #### ####', minLength: 11, maxLength: 11, pattern: /^1[3-9]\d{9}$/ },
  { name: 'Japan', code: 'JP', dialCode: '+81', format: '## #### ####', minLength: 10, maxLength: 10, pattern: /^[1-9]\d{9}$/ },
  { name: 'South Korea', code: 'KR', dialCode: '+82', format: '## #### ####', minLength: 10, maxLength: 10, pattern: /^[1-9]\d{9}$/ },
  { name: 'India', code: 'IN', dialCode: '+91', format: '##### #####', minLength: 10, maxLength: 10, pattern: /^[6-9]\d{9}$/ },
  { name: 'Pakistan', code: 'PK', dialCode: '+92', format: '### #######', minLength: 10, maxLength: 10, pattern: /^[1-9]\d{9}$/ },
  { name: 'Bangladesh', code: 'BD', dialCode: '+880', format: '### ### ###', minLength: 10, maxLength: 10, pattern: /^[1-9]\d{9}$/ },
  { name: 'Thailand', code: 'TH', dialCode: '+66', format: '## ### ####', minLength: 9, maxLength: 9, pattern: /^[1-9]\d{8}$/ },
  { name: 'Vietnam', code: 'VN', dialCode: '+84', format: '### ### ###', minLength: 9, maxLength: 9, pattern: /^[1-9]\d{8}$/ },
  { name: 'Malaysia', code: 'MY', dialCode: '+60', format: '## ### ####', minLength: 9, maxLength: 10, pattern: /^[1-9]\d{8,9}$/ },
  { name: 'Singapore', code: 'SG', dialCode: '+65', format: '#### ####', minLength: 8, maxLength: 8, pattern: /^[6-9]\d{7}$/ },
  { name: 'Indonesia', code: 'ID', dialCode: '+62', format: '### ### ####', minLength: 9, maxLength: 11, pattern: /^[1-9]\d{8,10}$/ },
  { name: 'Philippines', code: 'PH', dialCode: '+63', format: '### ### ####', minLength: 10, maxLength: 10, pattern: /^[1-9]\d{9}$/ },
  { name: 'Taiwan', code: 'TW', dialCode: '+886', format: '## #### ####', minLength: 9, maxLength: 9, pattern: /^[1-9]\d{8}$/ },
  { name: 'Hong Kong', code: 'HK', dialCode: '+852', format: '#### ####', minLength: 8, maxLength: 8, pattern: /^[1-9]\d{7}$/ },
  { name: 'Israel', code: 'IL', dialCode: '+972', format: '## ### ####', minLength: 9, maxLength: 9, pattern: /^[1-9]\d{8}$/ },
  { name: 'Saudi Arabia', code: 'SA', dialCode: '+966', format: '## ### ####', minLength: 9, maxLength: 9, pattern: /^[1-9]\d{8}$/ },
  { name: 'UAE', code: 'AE', dialCode: '+971', format: '## ### ####', minLength: 9, maxLength: 9, pattern: /^[1-9]\d{8}$/ },
  { name: 'Turkey', code: 'TR', dialCode: '+90', format: '### ### ####', minLength: 10, maxLength: 10, pattern: /^[1-9]\d{9}$/ },
  
  // Oceania
  { name: 'Australia', code: 'AU', dialCode: '+61', format: '### ### ###', minLength: 9, maxLength: 9, pattern: /^[2-9]\d{8}$/ },
  { name: 'New Zealand', code: 'NZ', dialCode: '+64', format: '### ### ###', minLength: 9, maxLength: 9, pattern: /^[2-9]\d{8}$/ },
  
  // South America
  { name: 'Brazil', code: 'BR', dialCode: '+55', format: '## ##### ####', minLength: 10, maxLength: 11, pattern: /^[1-9]\d{9,10}$/ },
  { name: 'Argentina', code: 'AR', dialCode: '+54', format: '## #### ####', minLength: 10, maxLength: 10, pattern: /^[1-9]\d{9}$/ },
  { name: 'Chile', code: 'CL', dialCode: '+56', format: '## #### ####', minLength: 9, maxLength: 9, pattern: /^[1-9]\d{8}$/ },
  { name: 'Colombia', code: 'CO', dialCode: '+57', format: '### ### ####', minLength: 10, maxLength: 10, pattern: /^[1-9]\d{9}$/ },
  { name: 'Peru', code: 'PE', dialCode: '+51', format: '### ### ###', minLength: 9, maxLength: 9, pattern: /^[1-9]\d{8}$/ },
  { name: 'Venezuela', code: 'VE', dialCode: '+58', format: '### ### ####', minLength: 10, maxLength: 10, pattern: /^[1-9]\d{9}$/ },
  { name: 'Uruguay', code: 'UY', dialCode: '+598', format: '## ### ###', minLength: 8, maxLength: 8, pattern: /^[1-9]\d{7}$/ },
  
  // Africa
  { name: 'South Africa', code: 'ZA', dialCode: '+27', format: '## ### ####', minLength: 9, maxLength: 9, pattern: /^[1-9]\d{8}$/ },
  { name: 'Egypt', code: 'EG', dialCode: '+20', format: '## #### ####', minLength: 10, maxLength: 10, pattern: /^[1-9]\d{9}$/ },
  { name: 'Nigeria', code: 'NG', dialCode: '+234', format: '### ### ####', minLength: 10, maxLength: 10, pattern: /^[1-9]\d{9}$/ },
  { name: 'Kenya', code: 'KE', dialCode: '+254', format: '### ### ###', minLength: 9, maxLength: 9, pattern: /^[1-9]\d{8}$/ },
  { name: 'Morocco', code: 'MA', dialCode: '+212', format: '## #### ###', minLength: 9, maxLength: 9, pattern: /^[1-9]\d{8}$/ },
  { name: 'Ghana', code: 'GH', dialCode: '+233', format: '## ### ####', minLength: 9, maxLength: 9, pattern: /^[1-9]\d{8}$/ },
  { name: 'Ethiopia', code: 'ET', dialCode: '+251', format: '## ### ####', minLength: 9, maxLength: 9, pattern: /^[1-9]\d{8}$/ },
  { name: 'Tanzania', code: 'TZ', dialCode: '+255', format: '## ### ####', minLength: 9, maxLength: 9, pattern: /^[1-9]\d{8}$/ },
  { name: 'Uganda', code: 'UG', dialCode: '+256', format: '## ### ####', minLength: 9, maxLength: 9, pattern: /^[1-9]\d{8}$/ },
  
  // Central America & Caribbean
  { name: 'Mexico', code: 'MX', dialCode: '+52', format: '### ### ####', minLength: 10, maxLength: 10, pattern: /^[1-9]\d{9}$/ },
  { name: 'Costa Rica', code: 'CR', dialCode: '+506', format: '#### ####', minLength: 8, maxLength: 8, pattern: /^[1-9]\d{7}$/ },
  { name: 'Panama', code: 'PA', dialCode: '+507', format: '#### ####', minLength: 8, maxLength: 8, pattern: /^[1-9]\d{7}$/ },
  { name: 'Jamaica', code: 'JM', dialCode: '+1', format: '(###) ###-####', minLength: 10, maxLength: 10, pattern: /^[2-9]\d{9}$/ },
  { name: 'Bahamas', code: 'BS', dialCode: '+1', format: '(###) ###-####', minLength: 10, maxLength: 10, pattern: /^[2-9]\d{9}$/ },
  
  // Other major countries
  { name: 'Russia', code: 'RU', dialCode: '+7', format: '### ### ####', minLength: 10, maxLength: 10, pattern: /^[1-9]\d{9}$/ },
  { name: 'Ukraine', code: 'UA', dialCode: '+380', format: '## ### ####', minLength: 9, maxLength: 9, pattern: /^[1-9]\d{8}$/ },
  { name: 'Belarus', code: 'BY', dialCode: '+375', format: '## ### ####', minLength: 9, maxLength: 9, pattern: /^[1-9]\d{8}$/ },
  { name: 'Kazakhstan', code: 'KZ', dialCode: '+7', format: '### ### ####', minLength: 10, maxLength: 10, pattern: /^[1-9]\d{9}$/ },
  { name: 'Uzbekistan', code: 'UZ', dialCode: '+998', format: '## ### ####', minLength: 9, maxLength: 9, pattern: /^[1-9]\d{8}$/ },
  { name: 'Azerbaijan', code: 'AZ', dialCode: '+994', format: '## ### ####', minLength: 9, maxLength: 9, pattern: /^[1-9]\d{8}$/ },
  { name: 'Georgia', code: 'GE', dialCode: '+995', format: '## ### ####', minLength: 9, maxLength: 9, pattern: /^[1-9]\d{8}$/ },
  { name: 'Armenia', code: 'AM', dialCode: '+374', format: '## ### ###', minLength: 8, maxLength: 8, pattern: /^[1-9]\d{7}$/ },
  { name: 'Moldova', code: 'MD', dialCode: '+373', format: '## ### ###', minLength: 8, maxLength: 8, pattern: /^[1-9]\d{7}$/ },
  { name: 'Latvia', code: 'LV', dialCode: '+371', format: '## ### ###', minLength: 8, maxLength: 8, pattern: /^[1-9]\d{7}$/ },
  { name: 'Lithuania', code: 'LT', dialCode: '+370', format: '## ### ###', minLength: 8, maxLength: 8, pattern: /^[1-9]\d{7}$/ },
  { name: 'Estonia', code: 'EE', dialCode: '+372', format: '## ### ###', minLength: 8, maxLength: 8, pattern: /^[1-9]\d{7}$/ },
  { name: 'Slovenia', code: 'SI', dialCode: '+386', format: '## ### ###', minLength: 8, maxLength: 8, pattern: /^[1-9]\d{7}$/ },
  { name: 'Croatia', code: 'HR', dialCode: '+385', format: '## ### ###', minLength: 8, maxLength: 8, pattern: /^[1-9]\d{7}$/ },
  { name: 'Slovakia', code: 'SK', dialCode: '+421', format: '### ### ###', minLength: 9, maxLength: 9, pattern: /^[1-9]\d{8}$/ },
  { name: 'Serbia', code: 'RS', dialCode: '+381', format: '## ### ####', minLength: 9, maxLength: 9, pattern: /^[1-9]\d{8}$/ },
  { name: 'Bosnia and Herzegovina', code: 'BA', dialCode: '+387', format: '## ### ###', minLength: 8, maxLength: 8, pattern: /^[1-9]\d{7}$/ },
  { name: 'Montenegro', code: 'ME', dialCode: '+382', format: '## ### ###', minLength: 8, maxLength: 8, pattern: /^[1-9]\d{7}$/ },
  { name: 'North Macedonia', code: 'MK', dialCode: '+389', format: '## ### ###', minLength: 8, maxLength: 8, pattern: /^[1-9]\d{7}$/ },
  { name: 'Albania', code: 'AL', dialCode: '+355', format: '## ### ###', minLength: 8, maxLength: 8, pattern: /^[1-9]\d{7}$/ },
  { name: 'Kosovo', code: 'XK', dialCode: '+383', format: '## ### ###', minLength: 8, maxLength: 8, pattern: /^[1-9]\d{7}$/ },
];

// Sort countries alphabetically by name
countryCodes.sort((a, b) => a.name.localeCompare(b.name));

// Find country by dial code
export const findCountryByDialCode = (dialCode: string): CountryCode | undefined => {
  return countryCodes.find(country => country.dialCode === dialCode);
};

// Find country by country code
export const findCountryByCode = (code: string): CountryCode | undefined => {
  return countryCodes.find(country => country.code === code.toUpperCase());
};

// Clean phone number (remove all non-digit characters)
export const cleanPhoneNumber = (phoneNumber: string): string => {
  return phoneNumber.replace(/\D/g, '');
};

// Format phone number according to country format
export const formatPhoneNumber = (phoneNumber: string, country: CountryCode): string => {
  const cleaned = cleanPhoneNumber(phoneNumber);
  if (cleaned.length === 0) return '';
  
  // Remove country code if present
  const countryCodeDigits = country.dialCode.replace(/\D/g, '');
  let numberWithoutCountryCode = cleaned;
  
  if (cleaned.startsWith(countryCodeDigits)) {
    numberWithoutCountryCode = cleaned.substring(countryCodeDigits.length);
  }
  
  // Apply format
  const format = country.format.replace(/#/g, '');
  let formatted = '';
  let digitIndex = 0;
  
  for (let i = 0; i < format.length && digitIndex < numberWithoutCountryCode.length; i++) {
    if (format[i] === '#') {
      formatted += numberWithoutCountryCode[digitIndex];
      digitIndex++;
    } else {
      formatted += format[i];
    }
  }
  
  return formatted;
};

// Validate phone number for a specific country
export const validatePhoneNumber = (phoneNumber: string, country: CountryCode): { isValid: boolean; error?: string } => {
  const cleaned = cleanPhoneNumber(phoneNumber);
  
  // Remove country code if present
  const countryCodeDigits = country.dialCode.replace(/\D/g, '');
  let numberWithoutCountryCode = cleaned;
  
  if (cleaned.startsWith(countryCodeDigits)) {
    numberWithoutCountryCode = cleaned.substring(countryCodeDigits.length);
  }
  
  // Check length
  if (numberWithoutCountryCode.length < country.minLength) {
    return { 
      isValid: false, 
      error: `Phone number must be at least ${country.minLength} digits for ${country.name}` 
    };
  }
  
  if (numberWithoutCountryCode.length > country.maxLength) {
    return { 
      isValid: false, 
      error: `Phone number cannot exceed ${country.maxLength} digits for ${country.name}` 
    };
  }
  
  // Check pattern
  if (!country.pattern.test(numberWithoutCountryCode)) {
    return { 
      isValid: false, 
      error: `Invalid phone number format for ${country.name}` 
    };
  }
  
  return { isValid: true };
};

// Auto-detect country from phone number
export const detectCountryFromPhoneNumber = (phoneNumber: string): CountryCode | null => {
  const cleaned = cleanPhoneNumber(phoneNumber);
  
  // Try to match by country code
  for (const country of countryCodes) {
    const countryCodeDigits = country.dialCode.replace(/\D/g, '');
    if (cleaned.startsWith(countryCodeDigits)) {
      const numberWithoutCountryCode = cleaned.substring(countryCodeDigits.length);
      if (numberWithoutCountryCode.length >= country.minLength && 
          numberWithoutCountryCode.length <= country.maxLength &&
          country.pattern.test(numberWithoutCountryCode)) {
        return country;
      }
    }
  }
  
  return null;
};

// Get full international phone number
export const getFullPhoneNumber = (phoneNumber: string, country: CountryCode): string => {
  const cleaned = cleanPhoneNumber(phoneNumber);
  const countryCodeDigits = country.dialCode.replace(/\D/g, '');
  
  // If number already includes country code, return as is
  if (cleaned.startsWith(countryCodeDigits)) {
    return country.dialCode + ' ' + formatPhoneNumber(phoneNumber, country);
  }
  
  // Add country code
  return country.dialCode + ' ' + formatPhoneNumber(phoneNumber, country);
};

// Validate and format phone number with country detection
export const validateAndFormatPhoneNumber = (phoneNumber: string, selectedCountry?: CountryCode): {
  isValid: boolean;
  error?: string;
  formattedNumber?: string;
  detectedCountry?: CountryCode;
  fullNumber?: string;
} => {
  // If no country selected, try to detect
  const country = selectedCountry || detectCountryFromPhoneNumber(phoneNumber);
  
  if (!country) {
    return {
      isValid: false,
      error: 'Unable to detect country. Please select a country from the dropdown.'
    };
  }
  
  const validation = validatePhoneNumber(phoneNumber, country);
  
  if (!validation.isValid) {
    return {
      isValid: false,
      error: validation.error,
      detectedCountry: country
    };
  }
  
  const formattedNumber = formatPhoneNumber(phoneNumber, country);
  const fullNumber = getFullPhoneNumber(phoneNumber, country);
  
  return {
    isValid: true,
    formattedNumber,
    detectedCountry: country,
    fullNumber
  };
}; 