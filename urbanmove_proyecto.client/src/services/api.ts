import axios from "axios";

export const ApiClient = axios.create({
    baseURL: "/api",
    withCredentials: true,
})

export async function descargarArchivo(url: string, nombreArchivo: string) {
    const response = await ApiClient.get(url, { responseType: 'blob' });
    const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
}