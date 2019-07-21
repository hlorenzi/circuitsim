import { ComponentDoubleEnded } from "./componentDoubleEnded.js"
import * as MathUtils from "./math.js"


export class ComponentBattery extends ComponentDoubleEnded
{
	constructor(pos)
	{
		super(pos)
		
		this.voltage = 5
		this.isVoltageSource = true
	}
	
	
	static getSaveId()
	{
		return "v"
	}
	
	
	static getName()
	{
		return "Battery"
	}
	
	
	saveToString(manager)
	{
		return this.joints[0] + "," + this.joints[1] + "," + MathUtils.valueToStringWithUnitPrefix(this.voltage) + ","
	}
	
	
	loadFromString(manager, loadData, reader)
	{
		super.loadFromString(manager, loadData, reader)
		this.voltage = reader.readNumber()
	}
	
	
	solverBegin(manager, solver)
	{
		solver.stampVoltage(this.voltageSourceIndex, this.nodes[0], this.nodes[1], this.voltage)
	}
	
	
	solverIterationEnd(manager, solver)
	{
		this.current = -manager.getVoltageSourceCurrent(this.voltageSourceIndex)
	}
	
	
	getEditBox(editBoxDef)
	{
		editBoxDef.addNumberInput("Voltage", "V", this.voltage, (x) => { this.voltage = x })
	}
	
	
	render(manager, ctx)
	{
		const symbolSize     = Math.min(15, this.getLength())
		const smallPlateSize = 12.5
		const bigPlateSize   = 25
	
		this.drawSymbolBegin(manager, ctx, symbolSize)
		
		ctx.strokeStyle = manager.getVoltageColor(manager.getNodeVoltage(this.nodes[0]))
		ctx.beginPath()
		ctx.moveTo(-symbolSize / 2, -smallPlateSize)
		ctx.lineTo(-symbolSize / 2,  smallPlateSize)
		ctx.stroke()
		
		ctx.strokeStyle = manager.getVoltageColor(manager.getNodeVoltage(this.nodes[1]))
		ctx.beginPath()
		ctx.moveTo( symbolSize / 2, -bigPlateSize)
		ctx.lineTo( symbolSize / 2,  bigPlateSize)
		ctx.stroke()
		
		this.drawSymbolEnd(manager, ctx)
		this.drawRatingText(manager, ctx, this.voltage, "V")
	}
}