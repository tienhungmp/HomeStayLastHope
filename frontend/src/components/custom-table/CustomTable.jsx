import {Pagination, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from '@nextui-org/react'
import React from 'react'

export function CustomTable({columns, data, page = 1, total = 1, limit = 10, setPage, isLoading, isShowPagination = false}) {
	const totalPage = Math.ceil(total / limit)
	return (
		<Table
			isStriped
			aria-label="Example static collection table"
			bottomContent={
				<div className="flex w-full justify-center">
					{isShowPagination && (
						<Pagination
							isCompact
							showControls
							showShadow
							color="primary"
							page={page}
							total={totalPage}
							onChange={page => setPage(page)}
						/>
					)}
				</div>
			}
		>
			<TableHeader>
				{columns.map(column => (
					<TableColumn key={column.id}>{column.headCell ? column.headCell() : column.label}</TableColumn>
				))}
			</TableHeader>
			<TableBody
				isLoading={isLoading}
				loadingContent={<Spinner label="Loading..." />}
			>
				{!isLoading &&
					data.map(row => (
						<TableRow key={row.id}>
							{columns.map(column => (
								<TableCell key={column.id}>{column.renderCell ? column.renderCell(row) : row[column.id]}</TableCell>
							))}
						</TableRow>
					))}
			</TableBody>
		</Table>
	)
}
