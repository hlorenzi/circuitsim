import { ComponentSingleEnded } from "./componentSingleEnded.js"


export class ComponentGround extends ComponentSingleEnded
{
	constructor(pos)
	{
		super(pos)
		
		this.isVoltageSource = true
	}
	
	
	static getSaveId()
	{
		return "g"
	}
	
	
	static getName()
	{
		return "Ground"
	}
	
	
	saveToString(manager)
	{
		return this.joints[0] + "," + this.joints[1] + ","
	}
	
	
	solverBegin(manager, solver)
	{
		solver.stampVoltage(this.voltageSourceIndex, this.nodes[0], 0, 0)
	}
	
	
	solverIterationEnd(manager)
	{
		this.current = -manager.getVoltageSourceCurrent(this.voltageSourceIndex)
	}
	
	
	render(manager, ctx)
	{
		const symbolSize       = Math.min(20, this.getLength())
		const smallStrokeSize  = 2
		const mediumStrokeSize = 10
		const bigStrokeSize    = 20
	
		this.drawSymbolBegin(manager, ctx, symbolSize)
		
		ctx.strokeStyle = manager.getVoltageColor(manager.getNodeVoltage(this.nodes[0]))
		
		ctx.beginPath()
		ctx.moveTo(-symbolSize / 2, -smallStrokeSize)
		ctx.lineTo(-symbolSize / 2,  smallStrokeSize)
		ctx.stroke()
		
		ctx.beginPath()
		ctx.moveTo(0, -mediumStrokeSize)
		ctx.lineTo(0,  mediumStrokeSize)
		ctx.stroke()
		
		ctx.beginPath()
		ctx.moveTo(symbolSize / 2, -bigStrokeSize)
		ctx.lineTo(symbolSize / 2,  bigStrokeSize)
		ctx.stroke()
		
		this.drawSymbolEnd(manager, ctx)
	}
}