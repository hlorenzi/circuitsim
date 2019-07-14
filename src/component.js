export class Component
{
	constructor(p)
	{
		this.points = []
		this.nodes = []
		this.selected = []
		this.dragOrigin = []
		
		this.isVoltageSource = false
		this.voltageSourceIndex = -1
	}
	
	
	static getSaveId()
	{
		return "-"
	}
	
	
	static getName()
	{
		return ""
	}
	
	
	saveToString(manager)
	{
		return ""
	}
	
	
	loadFromString(manager, loadData, reader)
	{
		
	}
	
	
	reset(manager)
	{
		
	}
	
	
	updateCurrentAnim(manager, mult)
	{
		
	}
	
	
	solverBegin(manager, solver)
	{
		
	}
	
	
	solverFrameBegin(manager, solver)
	{
		
	}
	
	
	solverIterationBegin(manager, solver)
	{
		
	}
	
	
	solverIterationEnd(manager, solver)
	{
		
	}
	
	
	solverFrameEnd(manager, solver)
	{
		
	}
	
	
	isDegenerate()
	{
		return true
	}
	
	
	isFullySelected()
	{
		for (let i = 0; i < this.selected.length; i++)
			if (!this.selected[i])
				return false
			
		return true
	}
	
	
	isAnySelected()
	{
		for (let i = 0; i < this.selected.length; i++)
			if (this.selected[i])
				return true
			
		return false
	}
	
	
	getOutgoingDirectionFromNode(index)
	{
		return 0
	}
	
	
	getHover(pos)
	{
		return null
	}
	
	
	dragStart()
	{
		for (let i = 0; i < this.points.length; i++)
			this.dragOrigin[i] = this.points[i]
	}
	
	
	dragMove(manager, deltaPos)
	{
		for (let i = 0; i < this.selected.length; i++)
		{
			if (this.selected[i])
			{
				this.points[i] = manager.snapPos({
					x: this.dragOrigin[i].x + deltaPos.x,
					y: this.dragOrigin[i].y + deltaPos.y
				})
			}
		}
	}
	
	
	getBBox()
	{
		let xMin = this.points[0].x
		let xMax = this.points[0].x
		let yMin = this.points[0].y
		let yMax = this.points[0].y
		
		for (let i = 1; i < this.points.length; i++)
		{
			xMin = Math.min(xMin, this.points[i].x)
			xMax = Math.max(xMax, this.points[i].x)
			yMin = Math.min(yMin, this.points[i].y)
			yMax = Math.max(yMax, this.points[i].y)
		}
		
		return { xMin, xMax, yMin, yMax }
	}
	
	
	getEditBox(editBoxDef)
	{
		
	}
	
	
	render(manager, ctx)
	{
		
	}
	
	
	renderCurrent(manager, ctx)
	{
		
	}
	
	
	renderHover(manager, ctx, hoverData)
	{
		
	}
	
	
	renderSelection(manager, ctx)
	{
		
	}
	
	
	renderEditing(manager, ctx)
	{
		
	}
	
	
	drawCurrent(manager, ctx, anim, p1, p2)
	{
		if (manager.debugDrawClean)
			return
		
		ctx.save()
		
		ctx.lineWidth   = 8
		ctx.lineCap     = "round"
		ctx.strokeStyle = "#ff0"
		
		ctx.lineDashOffset = -47.5 * anim
		ctx.setLineDash([2.5, 45])
		
		ctx.beginPath()
		ctx.moveTo(p1.x, p1.y)
		ctx.lineTo(p2.x, p2.y)
		ctx.stroke()
		
		ctx.restore()
	}
}