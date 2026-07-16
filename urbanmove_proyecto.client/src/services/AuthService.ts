import {ApiClient} from "./api";
import type { LoginType, RegisterType } from "../Types/authType";

export const AuthService ={
    Login: async (loginData: LoginType): Promise<RegisterType> => {
        const response = await ApiClient.post("/auth", loginData);
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