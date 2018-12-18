import { ComponentLine } from "./componentLine.js"


export class ComponentResistor extends ComponentLine
{
	constructor(pos)
	{
		super(pos)
		
		this.resistance = 1000
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
		const symbolSize      = Math.min(75, this.getLength())
		const symbolAmplitude = 12.5
		const symbolSegments  = 9
	
		this.drawSymbolBegin(manager, ctx, symbolSize)
		
		let grad = ctx.createLinearGradient(-symbolSize / 2, 0, symbolSize / 2, 0)
		grad.addColorStop(0, manager.getVoltageColor(manager.getNodeVoltage(this.nodes[0])))
		grad.addColorStop(1, manager.getVoltageColor(manager.getNodeVoltage(this.nodes[1])))
		ctx.strokeStyle = grad
		
		ctx.beginPath()
		ctx.moveTo(-symbolSize / 2, 0)
		
		let segmentX    = -symbolSize / 2
		let segmentSide = 1
		for (let i = 0; i < symbolSegments; i++)
		{
			segmentX    += symbolSize / symbolSegments
			segmentSide *= -1
			ctx.lineTo(segmentX, (i == symbolSegments - 1 ? 0 : symbolAmplitude * segmentSide))
		}
		
		ctx.stroke()
		
		this.drawSymbolEnd(manager, ctx)
	}
}