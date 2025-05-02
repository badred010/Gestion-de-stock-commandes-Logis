export interface IUser {
  name: string;
  email: string;
  title?: string;
  description?: string;
  role: string;
  password: string;
  status: string;
  address?: string;
  phone?: string
  city?: string;
}

export const profileKeys = [
  { keyName: 'name' },
  { keyName: 'email' },
  { keyName: 'title' },
  { keyName: 'description' },
  { keyName: 'status' },
  { keyName: 'address' },
  { keyName: 'phone' },
  { keyName: 'city' }
]

export const profileInputFields = [
  { id: 1, name: 'name', label: 'Nom' },
  { id: 2, name: 'email', label: 'Email' },
  { id: 3, name: 'title', label: 'Post' },
  { id: 4, name: 'description', label: 'Description' },
  { id: 7, name: 'address', label: 'Addresse' },
  { id: 8, name: 'phone', label: 'Téléphone' },
  { id: 9, name: 'city', label: 'Ville' },
]