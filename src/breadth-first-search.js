import waitForSeconds from './waitForSeconds'

const generatePath = async (row, col, start, startKey, startPos, grid, cells) => {
	const queue = []
	const parentForCell = {}
	const targetKey = `${row}x${col}`

	parentForCell[startKey] = { key: startKey, cell: undefined }

	queue.push(startPos)

	while (queue.length > 0)
	{
		const { row, col } = queue.shift()
		const currentKey = `${row}x${col}`
		const current = cells[row][col]

		if (currentKey !== startKey)
		{
			current.setOptions({ fill: '#b0b1ff' })
		}

		if (currentKey === targetKey)
		{
			break
		}

		const neighbors = [
			{ row: row - 1, col },
			{ row, col: col + 1 },
			{ row: row + 1, col },
			{ row, col: col - 1 }
		]

		for (let i = 0; i < neighbors.length; ++i)
		{
			const nRow = neighbors[i].row
			const nCol = neighbors[i].col

			if (nRow < 0 || nRow > cells.length - 1)
			{
				continue
			}

			if (nCol < 0 || nCol > cells[nRow].length - 1)
			{
				continue
			}

			if (grid[nRow][nCol] === 1)
			{
				continue
			}

			const key = `${nRow}x${nCol}`

			if (key in parentForCell)
			{
				continue
			}
			
			parentForCell[key] = {
				key: currentKey,
				cell: current
			}

			queue.push(neighbors[i])

			cells[nRow][nCol].setOptions({ fill: '#0000ff' })

			await waitForSeconds(0.1)
		}
	}

	const path = []

	let currentKey = `${row}x${col}`
	let current = cells[row][col]

	while (current !== start)
	{
		path.push(current)

		const { key, cell } = parentForCell[currentKey]
		current = cell
		currentKey = key
	}

	return path
}

export default generatePath
