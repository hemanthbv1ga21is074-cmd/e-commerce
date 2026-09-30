interface PincodeData {
  city: string;
  state: string;
  deliverable: boolean;
  estimatedDays: number;
  codAvailable: boolean;
}

export const pincodeMap: Record<string, PincodeData> = {
  '560001': { city: 'Bangalore', state: 'Karnataka', deliverable: true, estimatedDays: 3, codAvailable: true },
  '560034': { city: 'Bangalore', state: 'Karnataka', deliverable: true, estimatedDays: 3, codAvailable: true },
  '560100': { city: 'Bangalore', state: 'Karnataka', deliverable: true, estimatedDays: 4, codAvailable: true },
  '400001': { city: 'Mumbai', state: 'Maharashtra', deliverable: true, estimatedDays: 2, codAvailable: true },
  '400050': { city: 'Mumbai', state: 'Maharashtra', deliverable: true, estimatedDays: 3, codAvailable: true },
  '110001': { city: 'New Delhi', state: 'Delhi', deliverable: true, estimatedDays: 3, codAvailable: true },
  '110085': { city: 'New Delhi', state: 'Delhi', deliverable: true, estimatedDays: 4, codAvailable: true },
  '600001': { city: 'Chennai', state: 'Tamil Nadu', deliverable: true, estimatedDays: 3, codAvailable: true },
  '700001': { city: 'Kolkata', state: 'West Bengal', deliverable: true, estimatedDays: 4, codAvailable: true },
  '500001': { city: 'Hyderabad', state: 'Telangana', deliverable: true, estimatedDays: 3, codAvailable: true },
  '380001': { city: 'Ahmedabad', state: 'Gujarat', deliverable: true, estimatedDays: 4, codAvailable: true },
  '411001': { city: 'Pune', state: 'Maharashtra', deliverable: true, estimatedDays: 3, codAvailable: true },
  '302001': { city: 'Jaipur', state: 'Rajasthan', deliverable: true, estimatedDays: 5, codAvailable: true },
  '226001': { city: 'Lucknow', state: 'Uttar Pradesh', deliverable: true, estimatedDays: 5, codAvailable: false },
  '462001': { city: 'Bhopal', state: 'Madhya Pradesh', deliverable: true, estimatedDays: 5, codAvailable: false },
  '999999': { city: 'Remote Area', state: 'Assam', deliverable: false, estimatedDays: 0, codAvailable: false },
};
