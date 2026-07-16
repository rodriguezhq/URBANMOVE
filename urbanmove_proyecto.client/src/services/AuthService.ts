import {ApiClient} from "./api";

export interface LoginType{
    email: string;
    password:string;
}

export interface RegisterType{
    id: string;
    fullName:string;
    email: string;
}

export const AuthService ={
    Login: async (loginData: LoginType): Promise<RegisterType> => {
        const response = await ApiClient.post("/auth/login", loginData);
        return response.data.user;
    },

    logout: async (): Promise<void> => {
        await ApiClient.post("/auth/logout");
    },

    getCurrentUser: async (): Promise<RegisterType | null> => {
      try{
        const response = await ApiClient.get("/auth/me");
        return response.data;
      } catch {
        return null;
      }
    },
};