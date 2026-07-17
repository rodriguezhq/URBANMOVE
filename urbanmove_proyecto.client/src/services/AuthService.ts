import {ApiClient} from "./api";
import type { LoginType, UserType } from "../Types/authType";

export const AuthService ={
    Login: async (loginData: LoginType): Promise<UserType> => {
        const response = await ApiClient.post("/auth", loginData);
        return response.data;
    },

    logout: async (): Promise<void> => {
        await ApiClient.post("/auth/logout");
    },

    getCurrentUser: async (): Promise<UserType | null> => {
      try{
        const response = await ApiClient.get("/auth/me");
        return response.data;
      } catch {
        return null;
      }
    },
};