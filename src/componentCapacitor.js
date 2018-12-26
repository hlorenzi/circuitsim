import { ComponentLine } from "./componentLine.js"


export class ComponentCapacitor extends ComponentLine
{
	constructor(pos)
	{
		super(pos)
		
		this.capacitance = 1e-5
		
		this.current = 0
		this.solverReplacementCurrent = 0
		this.solverReplacementCurrentPrev = 0
	}
	
	
	static getSaveId()
	{
		return "c"
	}
	
	
	saveToString(manager)
	{
		return this.nodes[0] + "," + this.nodes[1] + "," + this.capacitance + ","
	}
	
	
	loadFromString(manager, loadData, reader)
	{
		super.loadFromString(manager, loadData, reader)
		this.capacitance = parseFloat(reader.read())
	}
	
	
	step(manager)
	{
		this.stepCurrentAnim(-1)
	}
	
	
	stamp(manager, solver)
	{
		this.current = 0
		this.solverReplacementCurrent = 0
		this.solverReplacementCurrentPrev = 0
		
		const solverReplacementResistance = manager.timePerIteration / (2 * this.capacitance)
		solver.stampResistance(this.nodes[0], this.nodes[1], solverReplacementResistance)
	}
	
	
	solverBegin(manager, solver)
	{
		
	}
	
	
	solverIterationBegin(manager, solver)
	{
		const solverReplacementResistance = manager.timePerIteration / (2 * this.capacitance)
		const voltage = manager.getNodeVoltage(this.nodes[0]) - manager.getNodeVoltage(this.nodes[1])
		
		this.solverReplacementCurrent = -voltage / solverReplacementResistance - this.current
	}
	
	
	solverIteration(manager, solver)
	{
		solver.stampCurrentSource(this.nodes[0], this.nodes[1], this.solverReplacementCurrent)
		this.solverReplacementCurrentPrev = this.solverReplacementCurrent
	}
	
	
	solverIterationEnd(manager, solver)
	{
		const solverReplacementResistance = manager.timePerIteration / (2 * this.capacitance)
		const voltage = manager.getNodeVoltage(this.nodes[0]) - manager.getNodeVoltage(this.nodes[1])
		
		this.current = voltage / solverReplacementResistance + this.solverReplacementCurrent
	}
	
	
	draw(manager, ctx)
	{
		const symbolSize = Math.min(15, this.getLength())
		const plateSize  = 25
	
		this.drawSymbolBegin(manager, ctx, symbolSize)
		
		ctx.strokeStyle = manager.getVoltageColor(manager.getNodeVoltage(this.nodes[0]))
		ctx.beginPath()
		ctx.moveTo(-symbolSize / 2, -plateSize)
		ctx.lineTo(-symbolSize / 2,  plateSize)
		ctx.stroke()
		
		ctx.strokeStyle = manager.getVoltageColor(manager.getNodeVoltage(this.nodes[1]))
		ctx.beginPath()
		ctx.moveTo( symbolSize / 2, -plateSize)
		ctx.lineTo( symbolSize / 2,  plateSize)
		ctx.stroke()
		
		this.drawSymbolEnd(manager, ctx)
	}
}