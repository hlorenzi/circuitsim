export class Matrix
{
	constructor(n, m)
	{
		this.n = n
		this.m = m
		this.cells = new Float32Array(n * m)
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
	
	
	luFactor()
	{
		// From https://github.com/pfalstad/circuitjs1
		
		let scaleFactors = new Float32Array(this.n)
		let pivots = new Float32Array(this.n)

		// divide each row by its largest element, keeping track of the
		// scaling factors
		for (let i = 0; i < this.n; i++)
		{ 
			let largest = 0
			for (let j = 0; j < this.n; j++)
			{
				const x = Math.abs(this.get(i, j))
				if (x > largest)
					largest = x
			}
			
			// if all zeros, it's a singular matrix
			if (largest == 0)
				return null
			
			scaleFactors[i] = 1 / largest
		}

		// use Crout's method; loop through the columns
		for (let j = 0; j < this.n; j++)
		{
			// calculate upper triangular elements for this column
			for (let i = 0; i < j; i++)
			{
				let q = this.get(i, j)
				for (let k = 0; k < i; k++)
					q -= this.get(i, k) * this.get(k, j)
				
				this.set(i, j, q)
			}

			// calculate lower triangular elements for this column
			let largest = 0
			let largestRow = -1
			for (let i = j; i < this.n; i++)
			{
				let q = this.get(i, j)
				for (let k = 0; k < j; k++)
					q -= this.get(i, k) * this.get(k, j)
				
				this.set(i, j, q)
				
				let x = Math.abs(q)
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
					const x = this.get(largestRow, k)
					this.set(largestRow, k, this.get(j, k))
					this.set(j, k, x)
				}
				scaleFactors[largestRow] = scaleFactors[j]
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
					this.mult(i, j, mult)
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
		
		let bi = i++
		
		for (; i < this.n; i++)
		{
			let row = pivots[i]
			let tot = b.get(0, row)
			
			b.set(0, row, b.get(0, i))
			// forward substitution using the lower triangular matrix
			for (let j = bi; j < i; j++)
				tot -= this.get(i, j) * b.get(0, j)
			
			b.set(0, i, tot)
		}
		
		for (i = this.n - 1; i >= 0; i--)
		{
			let tot = b.get(0, i)
			
			// back-substitution using the upper triangular matrix
			for (let j = i + 1; j != this.n; j++)
				tot -= this.get(i, j) * b.get(0, j);
			
			b.set(0, i, tot / this.get(i, i))
		}
		
		return b
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