export interface Team {
  id: number;
  name: string;
  displayname: string;
  latitude: number | null;
  longitude: number | null;
  locationdate?: string | null;
}
