import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AuthRouteRedirect({ modal = 'login' }) {
    const navigate = useNavigate();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.sessionStorage.setItem(`open-${modal}-modal`, '1');
        }
        navigate('/', { replace: true });
    }, [modal, navigate]);

    return null;
}

export default AuthRouteRedirect;
