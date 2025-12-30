import React from 'react';
import type { FieldDefinition } from '../../../types';
import { TextField } from './TextField';
import { DropdownField } from './DropdownField';
import { getStateOptions } from '../../../data/states';
import { getCountries } from '../../../data/countries';

interface AddressFieldProps {
  field: FieldDefinition;
  value: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
  error?: string;
  disabled?: boolean;
  countryCode?: string;
}

export const AddressField: React.FC<AddressFieldProps> = ({
  field,
  value = {},
  onChange,
  error,
  disabled = false,
  countryCode,
}) => {
  const updateField = (key: string, fieldValue: string) => {
    onChange({ ...value, [key]: fieldValue });
  };

  const country = value.country || countryCode || '';
  const stateOptions = country ? getStateOptions(country) : [];

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-white">
        {field.label}
        {field.validation_rules?.required && (
          <span className="text-red-400 ml-1">*</span>
        )}
      </label>
      {field.description && (
        <p className="text-xs text-gray-400 mb-2">{field.description}</p>
      )}

      <div className="space-y-4 bg-[rgba(26,22,37,0.4)] rounded-xl p-4 border border-white/5">
        <TextField
          field={{
            ...field,
            field_key: 'street_address',
            label: 'Street Address',
            validation_rules: { required: field.validation_rules?.required },
          }}
          value={value.street_address || ''}
          onChange={(val) => updateField('street_address', val)}
          disabled={disabled}
        />

        <TextField
          field={{
            ...field,
            field_key: 'address_line_2',
            label: 'Apartment/Unit (Optional)',
            validation_rules: {},
          }}
          value={value.address_line_2 || ''}
          onChange={(val) => updateField('address_line_2', val)}
          disabled={disabled}
        />

        <div className="grid grid-cols-2 gap-4">
          <TextField
            field={{
              ...field,
              field_key: 'city',
              label: 'City',
              validation_rules: { required: field.validation_rules?.required },
            }}
            value={value.city || ''}
            onChange={(val) => updateField('city', val)}
            disabled={disabled}
          />

          {stateOptions.length > 0 ? (
            <DropdownField
              field={{
                ...field,
                field_key: 'state_province',
                label: 'State/Province',
                default_options: stateOptions,
                validation_rules: {},
              }}
              value={value.state_province || ''}
              onChange={(val) => updateField('state_province', val)}
              disabled={disabled}
            />
          ) : (
            <TextField
              field={{
                ...field,
                field_key: 'state_province',
                label: 'State/Province',
                validation_rules: {},
              }}
              value={value.state_province || ''}
              onChange={(val) => updateField('state_province', val)}
              disabled={disabled}
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <TextField
            field={{
              ...field,
              field_key: 'postal_code',
              label: 'ZIP/Postal Code',
              validation_rules: { required: field.validation_rules?.required },
            }}
            value={value.postal_code || ''}
            onChange={(val) => updateField('postal_code', val)}
            disabled={disabled}
          />

          <DropdownField
            field={{
              ...field,
              field_key: 'country',
              label: 'Country',
              default_options: getCountries(),
              validation_rules: { required: field.validation_rules?.required },
            }}
            value={value.country || ''}
            onChange={(val) => {
              updateField('country', val);
              // Clear state when country changes
              if (value.country !== val) {
                updateField('state_province', '');
              }
            }}
            disabled={disabled}
          />
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
};

