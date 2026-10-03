import { Facility } from '../types';

export const api = {
  async getFacilities(): Promise<Facility[]> {
    const res = await fetch('/api/facilities');
    if (!res.ok) throw new Error('Failed to fetch facilities');
    const json = await res.json();
    return json.data;
  }
};
