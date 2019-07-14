import { ComponentDoubleEnded } from "./componentDoubleEnded.js"


export class ComponentWire extends ComponentDoubleEnded
{
	constructor(p)
	{
		super(p)
		
		this.isVoltageSource = true
	}
	
	
	static getSaveId()
	{
		return "w"
	}
	
	
	static getName()
	{
		return "Wire"
	}
	
	
	saveToString(manager)
	{
		return this.nodes[0] + "," + this.nodes[1] + ","
	}
	
	
	solverBegin(manager, solver)
	{
		solver.stampVoltage(this.voltageSourceIndex, this.nodes[0], this.nodes[1], 0)
	}
	
	
	solverIterationEnd(manager)
	{
		this.current = -manager.getVoltageSourceCurrent(this.voltageSourceIndex)
	}
	
	
	render(manager, ctx)
	{
		ctx.save()
		
		ctx.strokeStyle = manager.getVoltageColor(manager.getNodeVoltage(this.nodes[0]))
		
		ctx.beginPath()
		ctx.arc(this.points[0].x, this.points[0].y, 2, 0, Math.PI * 2)
		ctx.moveTo(this.points[0].x, this.points[0].y)
		ctx.lineTo(this.points[1].x, this.points[1].y)
		ctx.arc(this.points[1].x, this.points[1].y, 2, 0, Math.PI * 2)
		ctx.stroke()
		
		ctx.restore()
	}
}