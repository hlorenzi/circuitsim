import { ComponentLine } from "./componentLine.js"


export class ComponentCapacitor extends ComponentLine
{
	constructor(pos)
	{
		super(pos)
		
		this.capacitance = 1e-6
		
		this.useTrapezoidalIntegration = true
		this.companionModelResistance = 0
		this.companionModelCurrent = 0
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
		this.currentAnim = 0
		this.companionModelCurrent = 0
		
		if (this.useTrapezoidalIntegration)
		{
			this.companionModelResistance = manager.timePerIteration / (2 * this.capacitance)
			solver.stampResistance(this.nodes[0], this.nodes[1], this.companionModelResistance)
			//console.log("comp resistance (trapezoidal)", this.companionModelResistance)
		}
		else
		{
			this.companionModelResistance = manager.timePerIteration / this.capacitance
			solver.stampResistance(this.nodes[0], this.nodes[1], this.companionModelResistance)
			//console.log("comp resistance (back euler)", this.companionModelResistance)
		}
	}
	
	
	solverIterationBegin(manager, solver)
	{
		const voltage = manager.getNodeVoltage(this.nodes[0]) - manager.getNodeVoltage(this.nodes[1])
		
		if (this.useTrapezoidalIntegration)
		{
			this.companionModelCurrent = -voltage / this.companionModelResistance - this.current
			solver.stampCurrentSource(this.nodes[0], this.nodes[1], this.companionModelCurrent)
			//console.log("voltage, comp current (trapezoidal)", voltage, this.companionModelCurrent)
		}
		else
		{
			this.companionModelCurrent = -voltage / this.companionModelResistance
			solver.stampCurrentSource(this.nodes[0], this.nodes[1], this.companionModelCurrent)
			//console.log("voltage, comp current (back euler)", voltage, this.companionModelCurrent)
		}
	}
	
	
	solverIterationEnd(manager, solver)
	{
		const voltage = manager.getNodeVoltage(this.nodes[0]) - manager.getNodeVoltage(this.nodes[1])
		
		this.current = voltage / this.companionModelResistance + this.companionModelCurrent
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