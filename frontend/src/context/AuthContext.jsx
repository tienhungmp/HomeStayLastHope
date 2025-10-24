import Cookies from 'js-cookie'
import React, {createContext, useContext, useEffect, useState} from 'react'
const AuthContext = createContext()

export const AuthProvider = ({children}) => {
	const [auth, setAuth] = useState(null)
	const [loading, setIsLoading] = useState(true)

	const login = user => {
		Cookies.set('auth', JSON.stringify(user), {expires: 7})
		setAuth(user)
	}

	const logout = () => {
		Cookies.remove('auth')
		setAuth(null)
	}

	useEffect(() => {
		setIsLoading(true)
		const storedAuth = Cookies.get('auth')
		if (storedAuth) {
			setAuth(JSON.parse(storedAuth))
			setIsLoading(false)
		}
	}, [])
	return <AuthContext.Provider value={{auth, login, logout, loading}}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
