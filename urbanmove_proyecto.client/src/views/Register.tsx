import { useNavigate } from "react-router-dom";
import AppButton from "../Components/AppButton";
import { ChevronLeft } from "lucide-react";

export default function Register() {
    const navigate = useNavigate();

    return (
        <div>
            <AppButton type='button' appearance='subtle' onClick={() => navigate('/login')} className='flex items-center justify-start gap-2 w-full'>
                <ChevronLeft/> Iniciar sesión
            </AppButton>
        </div>
    )
}