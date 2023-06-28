import { useState } from 'react';
import TokenContext from '@component/TokenContext';

function MyApp({ Component, pageProps }) {
    const [token, setToken] = useState('');

    return (
        <TokenContext.Provider value={{ token, setToken }}>
            <Component {...pageProps} />
        </TokenContext.Provider>
    );
}

export default MyApp;