import React from 'react'
import 'react-phone-input-2/lib/style.css'
import {Route, BrowserRouter as Router, Routes} from 'react-router-dom'
import {ToastContainer} from 'react-toastify'
import {AuthProvider} from './context/AuthContext'
import {ModalProvider} from './context/ModalContext'
import routesConfig from './router/routes.config'

import 'react-toastify/dist/ReactToastify.css'
const App = () => {
	return (
		<AuthProvider>
			<ToastContainer
				position="top-right"
				autoClose={5000}
				hideProgressBar={false}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
			/>
			<ModalProvider>
				<Router>
					<Routes>
						{routesConfig.map(({layout: LayoutComponent, layoutProps, element: PageComponent, ...route}, index) => (
							<Route
								key={index}
								{...route}
								element={
									LayoutComponent ? (
										<LayoutComponent {...layoutProps}>
											<PageComponent />
										</LayoutComponent>
									) : (
										<PageComponent />
									)
								}
							/>
						))}
					</Routes>
				</Router>
			</ModalProvider>
		</AuthProvider>
	)
}

export default App
