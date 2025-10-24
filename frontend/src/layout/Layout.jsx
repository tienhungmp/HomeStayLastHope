import React from 'react'
import Footer from '../components/footer/Footer'
import Header from '../components/header/Header'

const Layout = ({children, isShowFooter = true, showText = false, showSearch}) => {
	return (
		<>
			<Header
				showText={showText}
				showSearch={showSearch}
			/>
			<main>{children}</main>
			{isShowFooter && <Footer />}
		</>
	)
}

export default Layout
