import { ComponentLine } from "./componentLine.js"


export class ComponentInductor extends ComponentLine
{
	constructor(pos)
	{
		super(pos)
		
		this.inductance = 1
		
		this.current = 0
		this.solverReplacementCurrent = 0
		this.solverReplacementCurrentPrev = 0
	}
	
	
	static getSaveId()
	{
		return "l"
	}
	
	
	saveToString(manager)
	{
		return this.nodes[0] + "," + this.nodes[1] + "," + this.inductance + ","
	}
	
	
	loadFromString(manager, loadData, reader)
	{
		super.loadFromString(manager, loadData, reader)
		this.inductance = parseFloat(reader.read())
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
		
		const solverReplacementResistance = (2 * this.inductance) / manager.timePerIteration
		solver.stampResistance(this.nodes[0], this.nodes[1], solverReplacementResistance)
	}
	
	
	solverBegin(manager, solver)
	{
		
	}
	
	
	solverIterationBegin(manager, solver)
	{
		const solverReplacementResistance = (2 * this.inductance) / manager.timePerIteration
		const voltage = manager.getNodeVoltage(this.nodes[0]) - manager.getNodeVoltage(this.nodes[1])
		
		this.solverReplacementCurrent = voltage / solverReplacementResistance + this.current
	}
	
	
	solverIteration(manager, solver)
	{
		solver.stampCurrentSource(this.nodes[0], this.nodes[1], this.solverReplacementCurrent)
		this.solverReplacementCurrentPrev = this.solverReplacementCurrent
	}
	
	
	solverIterationEnd(manager, solver)
	{
		const solverReplacementResistance = (2 * this.inductance) / manager.timePerIteration
		const voltage = manager.getNodeVoltage(this.nodes[0]) - manager.getNodeVoltage(this.nodes[1])
		
		this.current = voltage / solverReplacementResistance + this.solverReplacementCurrent
	}
	
	
	draw(manager, ctx)
	{
		const symbolSize   = Math.min(75, this.getLength())
		const arcNum       = 3
		const arcAmplitude = 25
	
		this.drawSymbolBegin(manager, ctx, symbolSize)
		this.drawSymbolSetGradient(manager, ctx, symbolSize,
			manager.getVoltageColor(manager.getNodeVoltage(this.nodes[0])),
			manager.getVoltageColor(manager.getNodeVoltage(this.nodes[1])))
			
		ctx.lineJoin = "round"
		
		ctx.beginPath()
		ctx.moveTo(-symbolSize / 2, 0)
		
		for (let arc = 0; arc < arcNum; arc++)
		{
			const arcX1 = -symbolSize / 2 + symbolSize / arcNum * (arc + 0)
			const arcX2 = -symbolSize / 2 + symbolSize / arcNum * (arc + 1)
			
			ctx.bezierCurveTo(
				arcX1, -arcAmplitude,
				arcX2, -arcAmplitude,
				arcX2, 0)
		}
		
		ctx.stroke()
		
		this.drawSymbolEnd(manager, ctx)
	}
}