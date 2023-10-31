
interface RawCoordinates {
  lat: string;
  lng: string;
}
interface Address {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
  geo: RawCoordinates;
}
interface Company {
  name: string;
  catchPhrase: string;
  bs: string;
}
export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: Address;
  phone: string;
  website: string;
  company: Company;
}
export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}
export interface UserWithPost {
  user: User;
  post: Post | undefined;
}
