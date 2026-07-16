import { useEffect, useState } from 'react';
import './App.css';
import { HealthCheckService } from './services/HealthCheckService';

interface Forecast {
    date: string;
    temperatureC: number;
    temperatureF: number;
    summary: string;
}

function App() {
    const [status, setStatus] = useState<string | null>(null);

    const fetchHealthCheck = async () => {
        try {
            const response = await HealthCheckService.Check();
            setStatus(response ? "Healthy" : "Unhealthy");
        }catch (error) {
            setStatus("Error");
        }
    }

    useEffect(() => {
        fetchHealthCheck();
    }, []);

    return (
        <div>
            <h1>Health Check</h1>
            <p>Status: {status}</p>
        </div>
    );
}

export default App;