import { ComponentLine } from "./componentLine.js"


export class ComponentCurrentSource extends ComponentLine
{
	constructor(pos)
	{
		super(pos)
		
		this.current = 0.01
	}
	
	
	static getSaveId()
	{
		return "i"
	}
	
	
	saveToString(manager)
	{
		return this.nodes[0] + "," + this.nodes[1] + "," + this.current + ","
	}
	
	
	loadFromString(manager, loadData, reader)
	{
		super.loadFromString(manager, loadData, reader)
		this.current = parseFloat(reader.read())
	}
	
	
	step(manager)
	{
		this.stepCurrentAnim(-1)
	}
	
	
	stamp(manager, solver)
	{
		solver.stampCurrentSource(this.nodes[0], this.nodes[1], this.current)
	}
	
	
	draw(manager, ctx)
	{
		const symbolSize = Math.min(50, this.getLength())
	
		this.drawSymbolBegin(manager, ctx, symbolSize)
		
		let grad = ctx.createLinearGradient(-symbolSize / 2, 0, symbolSize / 2, 0)
		grad.addColorStop(0, manager.getVoltageColor(manager.getNodeVoltage(this.nodes[0])))
		grad.addColorStop(1, manager.getVoltageColor(manager.getNodeVoltage(this.nodes[1])))
		ctx.strokeStyle = grad
		ctx.fillStyle = grad
		
		const centerX = (this.nodes[0].x + this.nodes[1].x) / 2
		const centerY = (this.nodes[0].y + this.nodes[1].y) / 2
		
		ctx.beginPath()
		ctx.arc(0, 0, symbolSize / 2, 0, Math.PI * 2)
		ctx.stroke()
		
		ctx.beginPath()
		ctx.moveTo(-symbolSize * 0.3, 0)
		ctx.lineTo( symbolSize * 0.2, 0)
		ctx.stroke()
		
		ctx.beginPath()
		ctx.moveTo(symbolSize * 0.4, 0)
		ctx.lineTo(symbolSize * 0.2, -symbolSize * 0.2)
		ctx.lineTo(symbolSize * 0.2,  symbolSize * 0.2)
		ctx.lineTo(symbolSize * 0.4, 0)
		ctx.fill()
		
		this.drawSymbolEnd(manager, ctx)
	}
}