export type Role = "customer" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}
