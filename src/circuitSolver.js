import { Matrix } from "./matrix.js"


// From http://www.swarthmore.edu/NatSci/echeeve1/Ref/mna/MNA3.html


export class CircuitSolver
{
	constructor()
	{
		this.readyToStamp = false
		this.readyToRun = false
		
		this.matrixG = null
		this.matrixB = null
		this.matrixC = null
		this.matrixI = null
		this.matrixE = null
		this.matrixIOriginal = null
		this.matrixEOriginal = null
		this.matrixA = null
		this.matrixZ = null
		this.matrixAPivots = null
		
		this.solution = null
	}
	
	
	stampBegin(nodeNum, voltNum, groundNodeIndex)
	{
		this.readyToStamp = true
		this.readyToRun = false
		
		this.nodeNum = nodeNum
		this.voltNum = voltNum
		this.groundNodeIndex = groundNodeIndex
		
		this.matrixG = new Matrix(nodeNum, nodeNum)
		this.matrixB = new Matrix(voltNum, nodeNum)
		this.matrixC = new Matrix(nodeNum, voltNum)
		
		this.matrixI = new Matrix(1, nodeNum)
		this.matrixE = new Matrix(1, voltNum)
		
		this.matrixIOriginal = null
		this.matrixEOriginal = null
		
		this.matrixA = null
		this.matrixZ = null
		this.matrixAPivots = null
		
		this.solution = null
	}
	
	
	stampResistance(node1, node2, resistance)
	{
		this.matrixG.add(node1, node1,  1 / resistance)
		this.matrixG.add(node2, node2,  1 / resistance)
		this.matrixG.add(node1, node2, -1 / resistance)
		this.matrixG.add(node2, node1, -1 / resistance)
	}


	stampVoltage(voltageSourceIndex, negNode, posNode, voltage)
	{
		this.matrixB.set(voltageSourceIndex, posNode,  1)
		this.matrixB.set(voltageSourceIndex, negNode, -1)
		
		this.matrixC.set(posNode, voltageSourceIndex,  1)
		this.matrixC.set(negNode, voltageSourceIndex, -1)
		
		this.matrixE.set(0, voltageSourceIndex, voltage)
	}
	
	
	stampCurrentSource(negNode, posNode, current)
	{
		this.matrixI.add(0, posNode,  current)
		this.matrixI.add(0, negNode, -current)
	}
	
	
	stampEnd()
	{
		// Consolidate into bigger matrices.
		this.matrixA = new Matrix(this.nodeNum + this.voltNum, this.nodeNum + this.voltNum)
		this.matrixG.copyTo(this.matrixA,            0,            0)
		this.matrixB.copyTo(this.matrixA, this.nodeNum,            0)
		this.matrixC.copyTo(this.matrixA,            0, this.nodeNum)
		
		//console.log("---")
		//console.log(this.matrixA.toString())
		//console.log(this.matrixZ.toString())
		
		if (this.nodeNum + this.voltNum <= 1)
			return
		
		// Remove ground node rows and columns.
		this.matrixA = this.matrixA.removeRow(this.groundNodeIndex)
		this.matrixA = this.matrixA.removeColumn(this.groundNodeIndex)
		
		//console.log(this.matrixA.toString())
		//console.log(this.matrixZ.toString())
		
		//console.log("matrixA:")
		//console.log(this.matrixA.toString())
		
		this.matrixAPivots = this.matrixA.luDecompose()
		if (this.matrixAPivots == null)
		{
			console.log("singular matrix")
			return
		}
		
		//console.log("matrixA decomposed:")
		//console.log(this.matrixA.toString())
		//console.log("matrixA pivots:")
		//console.log(this.matrixAPivots.toString())
		
		
		this.matrixIOriginal = this.matrixI.clone()
		this.matrixEOriginal = this.matrixE.clone()
		
		this.readyToRun = true
	}
	
	
	beginIteration()
	{
		this.matrixI = this.matrixIOriginal.clone()
		this.matrixE = this.matrixEOriginal.clone()
	}
	
	
	solve()
	{
		if (this.matrixAPivots == null)
			return
		
		this.matrixZ = new Matrix(1, this.nodeNum + this.voltNum)
		this.matrixI.copyTo(this.matrixZ, 0,            0)
		this.matrixE.copyTo(this.matrixZ, 0, this.nodeNum)
		this.matrixZ = this.matrixZ.removeRow(this.groundNodeIndex)
		
		this.solution = this.matrixA.luSolve(this.matrixAPivots, this.matrixZ).insertRow(this.groundNodeIndex)
		
		//console.log("solution:")
		//console.log(this.solution.toString())
	}
	
	
	getNodeVoltage(index)
	{
		if (this.solution == null)
			return 0
		
		const v = this.solution.get(0, index)
		if (isNaN(v))
			return 0
		
		return v
	}
	
	
	getVoltageSourceCurrent(voltageSourceIndex)
	{
		if (this.solution == null)
			return 0
		
		const a = this.solution.get(0, this.nodeNum + voltageSourceIndex)
		if (isNaN(a))
			return 0
		
		return a
	}
}