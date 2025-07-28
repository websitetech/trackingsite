import React, { useState, useEffect } from 'react';
import { 
  countryCodes, 
  validateAndFormatPhoneNumber,
  detectCountryFromPhoneNumber,
  findCountryByCode
} from '../utils/phoneValidation';
import type { CountryCode } from '../utils/phoneValidation';

interface PhoneInputProps {
  value: string;
  onChange: (value: string, country: CountryCode, isValid: boolean) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
  style?: React.CSSProperties;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder = "Enter phone number",
  required = false,
  error,
  className = "",
  style = {}
}) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(countryCodes[0]); // Default to first country
  const [isValid, setIsValid] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Auto-detect country on initial load
  useEffect(() => {
    if (value) {
      const detectedCountry = detectCountryFromPhoneNumber(value);
      if (detectedCountry) {
        setSelectedCountry(detectedCountry);
      }
    }
  }, []);

  // Validate phone number when value or country changes
  useEffect(() => {
    if (value) {
      const validation = validateAndFormatPhoneNumber(value, selectedCountry);
      setIsValid(validation.isValid);
      setValidationError(validation.error || '');
    } else {
      setIsValid(false);
      setValidationError('');
    }
  }, [value, selectedCountry]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Auto-detect country if no country is selected or if user starts typing with country code
    if (!selectedCountry || newValue.startsWith('+')) {
      const detectedCountry = detectCountryFromPhoneNumber(newValue);
      if (detectedCountry) {
        setSelectedCountry(detectedCountry);
      }
    }
    
    // Call the parent onChange handler with current validation state
    const validation = validateAndFormatPhoneNumber(newValue, selectedCountry);
    onChange(newValue, selectedCountry, validation.isValid);
  };

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setShowCountryDropdown(false);
    setSearchTerm('');
    
    // Re-validate the current phone number with the new country
    if (value) {
      const validation = validateAndFormatPhoneNumber(value, country);
      onChange(value, country, validation.isValid);
    }
  };

  const filteredCountries = countryCodes.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.dialCode.includes(searchTerm) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayError = error || validationError;

  return (
    <div className={`phone-input-container ${className}`} style={style}>
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem',
        position: 'relative'
      }}>
        {/* Country Selector */}
        <div style={{ position: 'relative', minWidth: '120px' }}>
                            <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      background: '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      minWidth: '120px',
                      color: '#1a1a1a'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <span style={{ color: '#1a1a1a' }}>{selectedCountry.name}</span>
                    <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{selectedCountry.dialCode}</span>
                  </button>

                            {/* Country Dropdown */}
                  {showCountryDropdown && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      zIndex: 1000,
                      maxHeight: '300px',
                      overflow: 'hidden',
                      marginTop: '0.25rem'
                    }}>
                      {/* Search Input */}
                      <div style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>
                        <input
                          type="text"
                          placeholder="Search countries..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.5rem 0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem',
                            background: '#ffffff',
                            fontSize: '0.875rem',
                            color: '#1a1a1a'
                          }}
                        />
                      </div>

                      {/* Country List */}
                      <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        {filteredCountries.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => handleCountrySelect(country)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.75rem 1rem',
                              width: '100%',
                              border: 'none',
                              background: selectedCountry.code === country.code ? '#3b82f6' : 'transparent',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                              transition: 'background 0.15s',
                              textAlign: 'left',
                              color: selectedCountry.code === country.code ? '#ffffff' : '#1a1a1a'
                            }}
                            onMouseEnter={(e) => {
                              if (selectedCountry.code !== country.code) {
                                e.currentTarget.style.background = '#f3f4f6';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (selectedCountry.code !== country.code) {
                                e.currentTarget.style.background = 'transparent';
                              }
                            }}
                          >
                            <span style={{ 
                              color: selectedCountry.code === country.code ? '#ffffff' : '#1a1a1a',
                              fontWeight: selectedCountry.code === country.code ? '500' : 'normal'
                            }}>
                              {country.name}
                            </span>
                            <span style={{ 
                              color: selectedCountry.code === country.code ? '#ffffff' : '#6b7280',
                              fontSize: '0.875rem'
                            }}>
                              {country.dialCode}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
        </div>

        {/* Phone Number Input */}
        <input
          type="tel"
          value={value}
          onChange={handlePhoneChange}
          placeholder={placeholder}
          required={required}
                     style={{
             flex: 1,
             padding: '1rem 1.2rem',
             border: `1px solid ${displayError ? 'rgba(220,38,38,0.4)' : 'rgba(220,38,38,0.15)'}`,
             borderRadius: '1rem',
             fontSize: '0.95rem',
             background: 'rgba(255,255,255,0.9)',
             backdropFilter: 'blur(10px)',
             transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
             color: '#1a1a1a'
           }}
          onFocus={(e) => {
            e.target.style.borderColor = 'rgba(220,38,38,0.4)';
            e.target.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.1), 0 4px 12px rgba(220,38,38,0.08)';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = displayError ? 'rgba(220,38,38,0.4)' : 'rgba(220,38,38,0.15)';
            e.target.style.boxShadow = 'none';
            e.target.style.transform = 'translateY(0)';
          }}
        />
      </div>

      {/* Validation Status */}
      {value && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          marginTop: '0.5rem',
          fontSize: '0.85rem'
        }}>
          {isValid ? (
            <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span>✅</span> Valid {selectedCountry.name} number
            </span>
          ) : (
            <span style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span>❌</span> {validationError}
            </span>
          )}
        </div>
      )}

      {/* Error Display */}
      {displayError && (
        <div style={{
          background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
          color: '#dc2626',
          padding: '0.75rem 1rem',
          borderRadius: '0.75rem',
          border: '1px solid #fecaca',
          fontSize: '0.85rem',
          fontWeight: 500,
          marginTop: '0.5rem'
        }}>
          {displayError}
        </div>
      )}

      {/* Format Hint */}
      {selectedCountry && (
        <div style={{
          fontSize: '0.8rem',
          color: '#666',
          marginTop: '0.25rem',
          fontStyle: 'italic'
        }}>
          Format: {selectedCountry.format} (e.g., {selectedCountry.dialCode} {selectedCountry.format.replace(/#/g, '1')})
        </div>
      )}
    </div>
  );
};

export default PhoneInput; 