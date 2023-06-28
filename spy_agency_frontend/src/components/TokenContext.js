import { createContext } from 'react'

const TokenContext = createContext({
    token: '',
    setToken: () => { },
    removeToken: () => { },
});
export default TokenContext
