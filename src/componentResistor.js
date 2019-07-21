import { ComponentDoubleEnded } from "./componentDoubleEnded.js"
import * as MathUtils from "./math.js"


export class ComponentResistor extends ComponentDoubleEnded
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
	
	
	static getName()
	{
		return "Resistor"
	}
	
	
	saveToString(manager)
	{
		return this.joints[0] + "," + this.joints[1] + "," + MathUtils.valueToStringWithUnitPrefix(this.resistance) + ","
	}
	
	
	loadFromString(manager, loadData, reader)
	{
		super.loadFromString(manager, loadData, reader)
		this.resistance = reader.readNumber()
	}
	
	
	solverBegin(manager, solver)
	{
		solver.stampResistance(this.nodes[0], this.nodes[1], this.resistance)
	}
	
	
	solverIterationEnd(manager, solver)
	{
		const v0 = manager.getNodeVoltage(this.nodes[0])
		const v1 = manager.getNodeVoltage(this.nodes[1])
		this.current = (v0 - v1) / this.resistance
	}
	
	
	getEditBox(editBoxDef)
	{
		editBoxDef.addNumberInput("Resistance", "Ω", this.resistance, (x) => { this.resistance = x })
	}
	
	
	render(manager, ctx)
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
		this.drawRatingText(manager, ctx, this.resistance, "Ω", 25)
	}
}