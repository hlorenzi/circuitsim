import { ComponentLine } from "./componentLine.js"


export class ComponentBattery extends ComponentLine
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
	
	
	saveToString(manager)
	{
		return this.nodes[0] + "," + this.nodes[1] + "," + this.voltage + ","
	}
	
	
	loadFromString(manager, loadData, reader)
	{
		super.loadFromString(manager, loadData, reader)
		this.voltage = parseFloat(reader.read())
	}
	
	
	step(manager)
	{
		this.current = manager.getVoltageSourceCurrent(this.voltageSourceIndex)
		super.step(manager)
	}
	
	
	stamp(manager, solver)
	{
		solver.stampVoltage(this.voltageSourceIndex, this.nodes[0], this.nodes[1], this.voltage)
	}
	
	
	draw(manager, ctx)
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
	}
}