import { createBrowserRouter } from 'react-router-dom';
import Login from '../views/Login';
import App from '../App';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
    },
    {
        path: '/login',
        element: <Login />,
    },
]);