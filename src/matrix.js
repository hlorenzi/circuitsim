export class Matrix
{
	constructor(n, m)
	{
		this.n = n
		this.m = m
		this.cells = new Float64Array(n * m)
	}
	
	
	get(i, j)
	{
		return this.cells[j * this.n + i]
	}
	
	
	set(i, j, value)
	{
		this.cells[j * this.n + i] = value
	}
	
	
	add(i, j, value)
	{
		this.cells[j * this.n + i] += value
	}
	
	
	mult(i, j, value)
	{
		this.cells[j * this.n + i] *= value
	}
	
	
	clone()
	{
		let newMatrix = new Matrix(this.n, this.m)
		
		for (let y = 0; y < this.m; y++)
			for (let x = 0; x < this.n; x++)
				newMatrix.set(x, y, this.get(x, y))
			
		return newMatrix
	}
	
	
	copyTo(other, i, j)
	{
		for (let y = 0; y < this.m; y++)
			for (let x = 0; x < this.n; x++)
				other.set(i + x, j + y, this.get(x, y))
	}
	
	
	removeRow(j)
	{
		let newMatrix = new Matrix(this.n, this.m - 1)
		
		for (let x = 0; x < this.n; x++)
		{
			for (let y = 0; y < j; y++)
				newMatrix.set(x, y, this.get(x, y))
			
			for (let y = j + 1; y < this.m; y++)
				newMatrix.set(x, y - 1, this.get(x, y))
		}
		
		return newMatrix
	}
	
	
	removeColumn(i)
	{
		let newMatrix = new Matrix(this.n - 1, this.m)
		
		for (let y = 0; y < this.m; y++)
		{
			for (let x = 0; x < i; x++)
				newMatrix.set(x, y, this.get(x, y))
			
			for (let x = i + 1; x < this.n; x++)
				newMatrix.set(x - 1, y, this.get(x, y))
		}
		
		return newMatrix
	}
	
	
	insertRow(beforeJ)
	{
		let newMatrix = new Matrix(this.n, this.m + 1)
		
		for (let x = 0; x < this.n; x++)
		{
			for (let y = 0; y < beforeJ; y++)
				newMatrix.set(x, y, this.get(x, y))
			
			newMatrix.set(x, beforeJ, 0)
				
			for (let y = beforeJ; y < this.m; y++)
				newMatrix.set(x, y + 1, this.get(x, y))
		}
		
		return newMatrix
	}
	
	
	luDecompose()
	{
		// From https://github.com/pfalstad/circuitjs1
		
		let pivots = new Float64Array(this.n)

		// check for a possible singular matrix by scanning for rows that
		// are all zeroes
		for (let i = 0; i < this.n; i++)
		{ 
			let rowAllZeroes = true
			for (let j = 0; j < this.n; j++)
			{
				if (this.get(j, i) != 0)
					rowAllZeroes = false
			}
			
			if (rowAllZeroes)
				return null
		}

		// use Crout's method; loop through the columns
		for (let j = 0; j < this.n; j++)
		{
			// calculate upper triangular elements for this column
			for (let i = 0; i < j; i++)
			{
				let q = this.get(j, i)
				for (let k = 0; k < i; k++)
					q -= this.get(k, i) * this.get(j, k)
				
				this.set(j, i, q)
			}

			// calculate lower triangular elements for this column
			let largest = 0
			let largestRow = -1
			for (let i = j; i < this.n; i++)
			{
				let q = this.get(j, i)
				for (let k = 0; k < j; k++)
					q -= this.get(k, i) * this.get(j, k)
				
				this.set(j, i, q)
				
				const x = Math.abs(q)
				if (x >= largest)
				{
					largest = x
					largestRow = i
				}
			}	

			// pivoting
			if (j != largestRow)
			{
				for (let k = 0; k < this.n; k++)
				{
					const x = this.get(k, largestRow)
					this.set(k, largestRow, this.get(k, j))
					this.set(k, j, x)
				}
			}

			// keep track of row interchanges
			pivots[j] = largestRow

			// avoid zeros
			if (this.get(j, j) == 0)
			{
				console.log("avoided zero")
				this.set(j, j, 1e-18)
			}

			if (j != this.n - 1)
			{
				const mult = 1 / this.get(j, j)
				for (let i = j + 1; i < this.n; i++)
					this.mult(j, i, mult)
			}
		}
		
		return pivots
	}
	
	
	luSolve(pivots, rightHandSide)
	{
		// From https://github.com/pfalstad/circuitjs1
		
		let b = rightHandSide.clone()
		
		// find first nonzero b element
		let i = 0
		for (; i != this.n; i++)
		{
			const row = pivots[i]

			const swap = b.get(0, row)
			b.set(0, row, b.get(0, i))
			b.set(0, i, swap)
			
			if (swap != 0)
				break
		}
		
		let bi = i
		i += 1
		
		for (; i < this.n; i++)
		{
			let row = pivots[i]
			let tot = b.get(0, row)
			
			b.set(0, row, b.get(0, i))
			// forward substitution using the lower triangular matrix
			for (let j = bi; j < i; j++)
				tot -= this.get(j, i) * b.get(0, j)
			
			b.set(0, i, tot)
		}
		
		for (i = this.n - 1; i >= 0; i--)
		{
			let tot = b.get(0, i)
			
			// back-substitution using the upper triangular matrix
			for (let j = i + 1; j != this.n; j++)
				tot -= this.get(j, i) * b.get(0, j);
			
			b.set(0, i, tot / this.get(i, i))
		}
		
		return b
	}
	
	
	luDecompose2()
	{
		// From https://en.wikipedia.org/wiki/LU_decomposition#C_code_examples
		
		const tolerance = 1e-18
		
		let pivots = new Float32Array(this.n)
		for (let i = 0; i < this.n; i++)
			pivots[i] = i
		
		for (let i = 0; i < this.n; i++)
		{
			let maxA = 0
			let iMax = i
			
			for (let k = i; k < this.n; k++)
			{
				const abs = Math.abs(this.get(i, k))
				if (abs > maxA)
				{
					maxA = abs
					iMax = k
				}
			}
			
			if (maxA < tolerance)
				return null
			
			if (iMax != i)
			{
				// permute pivot
				const pivotTemp = pivots[i]
				pivots[i] = pivots[iMax]
				pivots[iMax] = pivots[i]
				
				// permute row
				for (let k = 0; k < this.n; k++)
				{
					const rowTemp = this.get(k, i)
					this.set(k, i, this.get(k, iMax))
					this.set(k, iMax, rowTemp)
				}
			}
			
			for (let j = i + 1; j < this.n; j++)
			{
				this.mult(i, j, 1 / this.get(i, i))
				
				for (let k = i + 1; k < this.n; k++)
					this.add(k, j, this.get(i, j) * this.get(k, i))
			}
		}

		return pivots
	}
	
	
	luSolve2(pivots, rightHandSide)
	{
		// From https://en.wikipedia.org/wiki/LU_decomposition#C_code_examples
		
		let result = new Matrix(1, this.n)
		
		for (let i = 0; i < this.n; i++)
		{
			result.set(0, i, rightHandSide.get(0, pivots[i]))
			
			for (let k = 0; k < i; k++)
				result.add(0, i, -this.get(k, i) * result[k])
		}
		
		for (let i = this.n - 1; i >= 0; i--)
		{
			for (let k = i + 1; k < this.n; k++)
				result.add(0, i, -this.get(k, i) * result[k])
			
			result.mult(0, i, 1 / this.get(i, i))
		}
		
		return result
	}
	
	
	toString()
	{
		let str = ""
		
		for (let y = 0; y < this.m; y++)
		{
			str += "[ "
			for (let x = 0; x < this.n; x++)
				str += this.get(x, y).toFixed(5).padStart(8) + " "
			
			str += "]\n"
		}
		
		return str
	}
}