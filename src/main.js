import 'regenerator-runtime/runtime'

import Scene from '@pencil.js/scene'
import Rectangle from '@pencil.js/rectangle'
import Position from '@pencil.js/position'
import waitForSeconds from './waitForSeconds'

import generatePathBFS from './breadth-first-search'
import PriorityQueue from './PriorityQueue'

const scene = new Scene(document.getElementById('container'), { fill: '#421278' })

const grid = [
	[0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 4, 0, 0, 0, 0, 0, 0, 0],
	[0, 4, 0, 0, 0, 0, 1, 1, 1],
	[0, 4, 3, 3, 2, 0, 1, 0, 0],
	[0, 3, 0, 0, 0, 0, 1, 0, 0],
	[0, 3, 0, 0, 1, 1, 1, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0]
]

const costs = [
	[1, 1, 1, 1, 1, 1, 1, 1, 1],
	[1, 1, 1, 1, 1, 1, 1, 1, 1],
	[1, 10, 1, 1, 1, 1, 1, 1, 1],
	[1, 10, 1, 1, 1, 1, 1, 1, 1],
	[1, 100, 9, 9, 1, 1, 1, 1, 1],
	[1, 100, 1, 1, 1, 1, 1, 1, 1],
	[1, 100, 1, 1, 1, 1, 1, 1, 1],
	[1, 1, 1, 1, 1, 1, 1, 1, 1],
	[1, 1, 1, 1, 1, 1, 1, 1, 1]
] 

/** @type {Rectangle[][]} */
const cells = [
	[], [], [], [], [], [], [], [], []
]

let start
let startKey = ''
let startPos = { row: -1, col: -1 }

const resetGrid = () => {
	start.setOptions({ fill: '#ff0000' })
	for (let i = 0; i < grid.length; ++i)
	{
		const row = grid[i]
		for (let j = 0; j < row.length; ++j)
		{
			if (row[j] === 1 || row[j] === 2)
			{
				continue
			}

			if (row[j] === 0)
			{
				cells[i][j].setOptions({ fill: 'white' })
			}
			else if (row[j] === 3)
			{
				cells[i][j].setOptions({ fill: '#74eb34' })
			}
			else if (row[j] === 4)
			{
				cells[i][j].setOptions({ fill: '#d1ffa6' })
			}
		}
	}
}

let x = 0
let y = 0

for (let i = 0; i < grid.length; ++i)
{
	const row = grid[i]
	for (let j = 0; j < row.length; ++j)
	{
		const rect = new Rectangle(new Position(x, y), 50, 50, {
			fill: row[j] ? 'black' : 'white'
		})
		scene.add(rect)

		if (row[j] === 0 || row[j] > 2)
		{
			if (row[j] === 3)
			{
				rect.setOptions({ fill: '#74eb34' })	
			}
			else if (row[j] === 4)
			{
				rect.setOptions({ fill: '#d1ffa6' })	
			}

			rect.on('click', evt => {
				resetGrid()
				generatePath(i, j)
			})
		}
		else if (row[j] === 2)
		{
			start = rect
			startKey = `${i}x${j}`
			startPos = { row: i, col: j }
			rect.setOptions({ fill: '#ff0000' })
		}

		x += rect.width

		cells[i].push(rect)
	}

	x = 0
	y += 50
}

const generatePath = async (tRow, tCol) => {
	const queue = new PriorityQueue()
	const parentForCell = {}
	const costFromStart = {}
	const costToTarget = {}
	const targetKey = `${tRow}x${tCol}`

	parentForCell[startKey] = { key: startKey, cell: undefined }
	costFromStart[startKey] = 0

	queue.enqueue(startPos, 0)

	while (!queue.isEmpty())
	{
		const { row, col } = queue.dequeue().element
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

			const cost = costFromStart[currentKey] + costs[nRow][nCol]
			if (!(key in costFromStart) || cost < costFromStart[key])
			{
				parentForCell[key] = {
					key: currentKey,
					cell: current
				}

				costFromStart[key] = cost

				const dr = Math.pow(tRow - nRow, 2)
				const dc = Math.pow(tCol - nCol, 2)
				const distance = dr + dc
				const totalCost = cost + distance

				costToTarget[key] = totalCost

				queue.enqueue(neighbors[i], totalCost)

				cells[nRow][nCol].setOptions({ fill: '#0000ff' })

				await waitForSeconds(0.1)
			}
		}
	}

	const path = []

	let currentKey = `${tRow}x${tCol}`
	let current = cells[tRow][tCol]

	while (current !== start)
	{
		path.push(current)

		const { key, cell } = parentForCell[currentKey]
		current = cell
		currentKey = key
	}

	console.dir(path)

	path.forEach(cell => {
		cell.setOptions({ fill: '#FFAD00' })
	})
}

scene.startLoop()
