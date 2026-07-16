import { ApiClient } from "./api"

export const HealthCheckService = {
    Check: async (): Promise<boolean> => {
        try {
            const response = await ApiClient.get("/health");
            return response.status === 200;
        }catch (error) {
            console.error("Health check failed:", error);
            return false;
        }
    }
}