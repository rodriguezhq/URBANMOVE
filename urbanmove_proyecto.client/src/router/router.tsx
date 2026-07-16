import { createBrowserRouter } from 'react-router-dom';
import Login from '../views/Login';
import Home from '../views/Home';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Home />,
    },
    {
        path: '/login',
        element: <Login />,
    },
]);