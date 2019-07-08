import { ComponentLine } from "./componentLine.js"


export class ComponentResistor extends ComponentLine
{
	constructor(pos)
	{
		super(pos)
		
		this.resistance = 1000
	}
	
	
	static getSaveId()
	{
		return "r"
	}
	
	
	saveToString(manager)
	{
		return this.nodes[0] + "," + this.nodes[1] + "," + this.resistance + ","
	}
	
	
	loadFromString(manager, loadData, reader)
	{
		super.loadFromString(manager, loadData, reader)
		this.resistance = parseFloat(reader.read())
	}
	
	
	step(manager)
	{
		const v0 = manager.getNodeVoltage(this.nodes[0])
		const v1 = manager.getNodeVoltage(this.nodes[1])
		this.current = (v1 - v0) / this.resistance
		
		super.step(manager)
	}
	
	
	stamp(manager, solver)
	{
		solver.stampResistance(this.nodes[0], this.nodes[1], this.resistance)
	}
	
	
	draw(manager, ctx)
	{
		const symbolSize        = Math.min(75, this.getLength())
		const symbolAmplitude   = 12.5
		const symbolSegments    = 9
		const symbolSegmentSize = symbolSize / symbolSegments
	
		this.drawSymbolBegin(manager, ctx, symbolSize)
		this.drawSymbolSetGradient(manager, ctx, symbolSize,
			manager.getVoltageColor(manager.getNodeVoltage(this.nodes[0])),
			manager.getVoltageColor(manager.getNodeVoltage(this.nodes[1])))
		
		ctx.beginPath()
		ctx.moveTo(-symbolSize / 2, 0)
		ctx.lineTo(-symbolSize / 2 + symbolSegmentSize / 2, 0)
		
		let segmentX    = -symbolSize / 2
		let segmentSide = 1
		for (let i = 0; i < symbolSegments - 1; i++)
		{
			segmentX    += symbolSegmentSize
			segmentSide *= -1
			ctx.lineTo(segmentX, symbolAmplitude * segmentSide)
		}
		
		ctx.lineTo(symbolSize / 2 - symbolSegmentSize / 2, 0)
		ctx.lineTo(symbolSize / 2, 0)
		ctx.stroke()
		
		this.drawSymbolEnd(manager, ctx)
	}
}