const generateRoutes = routesConfig => {
	return routesConfig.map(({path, element: PageComponent, layout: LayoutComponent, layoutProps, ...rest}) => {
		return {
			path,
			element: LayoutComponent ? (
				<LayoutComponent {...layoutProps}>
					<PageComponent />
				</LayoutComponent>
			) : (
				<PageComponent />
			),
			...rest,
		}
	})
}

export default generateRoutes
