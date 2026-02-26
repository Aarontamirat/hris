export type AuthUserDto = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string | null;
  status: "ACTIVE" | "SUSPENDED" | "TERMINATED";
};
