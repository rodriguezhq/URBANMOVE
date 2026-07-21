import { ApiClient } from "./api";
import type { LoginType, UserType, OperadorPendienteType, RegisterResultType } from "../Types/authType";
import type { RegisterType } from "../Types/RegisterType";

export const AuthService = {
  Login: async (loginData: LoginType): Promise<UserType> => {
    const response = await ApiClient.post("/auth", loginData);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await ApiClient.post("/auth/logout");
  },

  getCurrentUser: async (): Promise<UserType | null> => {
    try {
      const response = await ApiClient.get("/auth/me");
      return response.data;
    } catch {
      return null;
    }
  },

  register: async (registerData: RegisterType): Promise<RegisterResultType> => {
    const response = await ApiClient.post("/auth/register", registerData);
    return response.data;
  },
  sendRecoverPasswordEmail: async (email: string): Promise<void> => {
    const response = await ApiClient.post("/auth/send-password-reset", { email });
    return response.data;
  },
  sendResetPassword: async (email: string , token: string, newPassword: string, confirmPassword: string): Promise<void> => {
    const response = await ApiClient.post("/auth/reset-password", { email, token, newPassword, confirmPassword });
    return response.data;
  },
  sendVerificationEmail: async (email: string): Promise<void> => {
    const response = await ApiClient.post("/auth/send-verification-email", { email });
    return response.data;
  },
  sendConfirmEmail: async (email: string, token: string): Promise<void> => {
    const response = await ApiClient.post("/auth/verify-email", { email, token });
    return response.data;
  },
  listarOperadoresPendientes: async (): Promise<OperadorPendienteType[]> => {
    const response = await ApiClient.get("/auth/operadores/pendientes");
    return response.data;
  },
  aprobarOperador: async (id: string): Promise<void> => {
    await ApiClient.post(`/auth/operadores/${id}/aprobar`);
  },
  rechazarOperador: async (id: string, motivo: string): Promise<void> => {
    await ApiClient.post(`/auth/operadores/${id}/rechazar`, { motivo });
  },
};