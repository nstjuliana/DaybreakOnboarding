/**
 * @file Patient Type Definitions
 * @description TypeScript types for patient demographics data.
 *
 * @see {@link _docs/phases/phase-3-insurance-matching.md}
 */

/**
 * Gender options for patient
 */
export type Gender =
  | 'male'
  | 'female'
  | 'non_binary'
  | 'other'
  | 'prefer_not_to_say';

/**
 * Gender configuration with labels
 */
export const GENDER_OPTIONS: Record<Gender, string> = {
  male: 'Male',
  female: 'Female',
  non_binary: 'Non-binary',
  other: 'Other',
  prefer_not_to_say: 'Prefer not to say',
};

/**
 * Pronouns options
 */
export const PRONOUN_OPTIONS = {
  'he/him': 'He/Him',
  'she/her': 'She/Her',
  'they/them': 'They/Them',
  other: 'Other',
};

/**
 * US State options for address
 */
export const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

/**
 * Patient data from the API
 */
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  displayName: string;
  dateOfBirth: string | null;
  age: number | null;
  gender: Gender | null;
  genderLabel: string | null;
  pronouns: string | null;
  preferredName: string | null;
  email: string | null;
  phone: string | null;
  school: string | null;
  grade: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  emergencyContactName: string | null;
  emergencyContactRelationship: string | null;
  emergencyContactPhone: string | null;
  hasEmergencyContact: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Patient form data for creation/update
 */
export interface PatientFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender?: Gender;
  pronouns?: string;
  preferredName?: string;
  email?: string;
  phone?: string;
  school?: string;
  grade?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
}

/**
 * Maps API patient response to frontend type
 */
export function mapApiPatient(apiPatient: Record<string, unknown>): Patient {
  return {
    id: apiPatient.id as string,
    firstName: apiPatient.first_name as string,
    lastName: apiPatient.last_name as string,
    fullName: apiPatient.full_name as string,
    displayName: apiPatient.display_name as string,
    dateOfBirth: apiPatient.date_of_birth as string | null,
    age: apiPatient.age as number | null,
    gender: apiPatient.gender as Gender | null,
    genderLabel: apiPatient.gender_label as string | null,
    pronouns: apiPatient.pronouns as string | null,
    preferredName: apiPatient.preferred_name as string | null,
    email: apiPatient.email as string | null,
    phone: apiPatient.phone as string | null,
    school: apiPatient.school as string | null,
    grade: apiPatient.grade as string | null,
    addressLine1: apiPatient.address_line1 as string | null,
    addressLine2: apiPatient.address_line2 as string | null,
    city: apiPatient.city as string | null,
    state: apiPatient.state as string | null,
    zipCode: apiPatient.zip_code as string | null,
    emergencyContactName: apiPatient.emergency_contact_name as string | null,
    emergencyContactRelationship: apiPatient.emergency_contact_relationship as string | null,
    emergencyContactPhone: apiPatient.emergency_contact_phone as string | null,
    hasEmergencyContact: apiPatient.has_emergency_contact as boolean,
    createdAt: apiPatient.created_at as string,
    updatedAt: apiPatient.updated_at as string,
  };
}


