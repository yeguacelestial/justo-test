import { useState } from 'react';
import TokenContext from '@component/TokenContext';

function MyApp({ Component, pageProps }) {
    const [token, setToken] = useState('');

    const useLogout = () => {
        setToken('');
        router.push('/');
    };

    return (
        <TokenContext.Provider value={{ token, setToken, useLogout }}>
            <Component {...pageProps} />
        </TokenContext.Provider>
    );
}

export default MyApp;