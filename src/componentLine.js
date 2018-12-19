export class ComponentLine
{
	constructor(p)
	{
		this.points = [p, p]
		this.nodes = [-1, -1]
		this.selected = [false, false]
		this.dragOrigin = [p, p]
		
		this.isVoltageSource = false
		this.voltageSourceIndex = -1
		
		this.current = 0
		this.currentAnim = 0
	}
	
	
	step(manager)
	{
		this.stepCurrentAnim(1)
	}
	
	
	stepCurrentAnim(mult)
	{
		const delta = Math.max(-0.25, Math.min(0.25, mult * (this.current * 4.5)))
		
		this.currentAnim = (1 + this.currentAnim + delta) % 1
	}
	
	
	stamp(manager, solver)
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
	
	
	solverIteration(manager, solver)
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
		return this.points[0].x == this.points[1].x && this.points[0].y == this.points[1].y
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
		const p1 = this.points[index]
		const p2 = this.points[index == 0 ? 1 : 0]
		
		return Math.atan2(p1.y - p2.y, p2.x - p1.x)
	}
	
	
	getHover(pos)
	{
		const pax = pos.x - this.points[0].x
		const pay = pos.y - this.points[0].y
		const bax = this.points[1].x - this.points[0].x
		const bay = this.points[1].y - this.points[0].y
		const dotPaBa = pax * bax + pay * bay
		const dotBaBa = bax * bax + bay * bay
		const t = Math.max(0, Math.min(1, dotPaBa / dotBaBa))
		
		const fx = pax - bax * t
		const fy = pay - bay * t
		const distSqr = (fx * fx + fy * fy)
		
		if (distSqr > 25 * 25)
			return null
		
		if (t < 0.1)
			return { kind: "junction", index: 0, distSqr }
		
		if (t > 0.9)
			return { kind: "junction", index: 1, distSqr }
		
		if (t < 0.33)
			return { kind: "vertex", index: 0, distSqr }
		
		if (t > 0.66)
			return { kind: "vertex", index: 1, distSqr }
		
		return { kind: "full", distSqr }
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
	
	
	getLength()
	{
		const vector = {
			x: this.points[1].x - this.points[0].x,
			y: this.points[1].y - this.points[0].y
		}
		
		return Math.sqrt(vector.x * vector.x + vector.y * vector.y)
	}
	
	
	draw(manager, ctx)
	{
		ctx.save()
		
		ctx.strokeStyle = "#eeeeee"
		
		ctx.beginPath()
		ctx.arc(this.points[0].x, this.points[0].y, 2, 0, Math.PI * 2)
		ctx.moveTo(this.points[0].x, this.points[0].y)
		ctx.lineTo(this.points[1].x, this.points[1].y)
		ctx.arc(this.points[1].x, this.points[1].y, 2, 0, Math.PI * 2)
		ctx.stroke()
		
		ctx.restore()
	}
	
	
	drawSymbolBegin(manager, ctx, symbolSize)
	{
		const vector = {
			x: this.points[1].x - this.points[0].x,
			y: this.points[1].y - this.points[0].y
		}
		
		const vectorLen = Math.sqrt(vector.x * vector.x + vector.y * vector.y)
		
		const vectorUnit = {
			x: vector.x / vectorLen,
			y: vector.y / vectorLen
		}
		
		const break1 = Math.max(        0, vectorLen / 2 - symbolSize / 2)
		const break2 = Math.min(vectorLen, vectorLen / 2 + symbolSize / 2)
		
		ctx.save()
		
		ctx.strokeStyle = manager.getVoltageColor(manager.getNodeVoltage(this.nodes[0]))
		ctx.beginPath()
		ctx.arc(this.points[0].x, this.points[0].y, 2, 0, Math.PI * 2)
		ctx.moveTo(this.points[0].x, this.points[0].y)
		ctx.lineTo(this.points[0].x + vectorUnit.x * break1, this.points[0].y + vectorUnit.y * break1)
		ctx.stroke()
		
		ctx.strokeStyle = manager.getVoltageColor(manager.getNodeVoltage(this.nodes[1]))
		ctx.beginPath()
		ctx.arc(this.points[1].x, this.points[1].y, 2, 0, Math.PI * 2)
		ctx.moveTo(this.points[0].x + vectorUnit.x * break2, this.points[0].y + vectorUnit.y * break2)
		ctx.lineTo(this.points[1].x, this.points[1].y)
		ctx.stroke()
		
		ctx.translate(this.points[0].x + vector.x / 2, this.points[0].y + vector.y / 2)
		ctx.transform(vectorUnit.x, vectorUnit.y, -vectorUnit.y, vectorUnit.x, 0, 0)
	}
	
	
	drawSymbolSetGradient(manager, ctx, symbolSize, color1, color2)
	{
		let grad = ctx.createLinearGradient(-symbolSize / 2, 0, symbolSize / 2, 0)
		grad.addColorStop(0, color1)
		grad.addColorStop(1, color2)
		ctx.strokeStyle = grad
	}
	
	
	drawSymbolEnd(manager, ctx)
	{
		ctx.restore()
	}
	
	
	drawCurrent(manager, ctx)
	{
		if (this.current == 0 || manager.debugDrawClean)
			return
		
		ctx.save()
		
		ctx.lineWidth   = 8
		ctx.lineCap     = "round"
		ctx.strokeStyle = "#ff0"
		
		ctx.lineDashOffset = 27.5 * this.currentAnim
		ctx.setLineDash([2.5, 25])
		
		ctx.beginPath()
		ctx.moveTo(this.points[0].x, this.points[0].y)
		ctx.lineTo(this.points[1].x, this.points[1].y)
		ctx.stroke()
		
		ctx.restore()
	}
	
	
	drawHover(manager, ctx, hover)
	{
		if (manager.debugDrawClean)
			return
		
		ctx.save()
		
		const highlightSize = 20
		
		ctx.strokeStyle = "#4af"
		ctx.fillStyle = "#4af"
		ctx.lineWidth = highlightSize
		
		if (hover.kind == "full")
		{
			ctx.beginPath()
			ctx.moveTo(this.points[0].x, this.points[0].y)
			ctx.lineTo(this.points[1].x, this.points[1].y)
			ctx.stroke()
		}
		
		if (hover.kind == "junction")
		{
			ctx.beginPath()
			ctx.arc(this.points[hover.index].x, this.points[hover.index].y, highlightSize / 2, 0, Math.PI * 2)
			ctx.fill()
		}
		
		if (hover.kind == "vertex")
		{
			const centerX = (this.points[0].x + this.points[1].x) / 2
			const centerY = (this.points[0].y + this.points[1].y) / 2
			
			ctx.beginPath()
			ctx.moveTo(this.points[hover.index].x, this.points[hover.index].y)
			ctx.lineTo(centerX, centerY)
			ctx.stroke()
		}
		
		ctx.restore()
	}
	
	
	drawSelection(manager, ctx)
	{
		if (manager.debugDrawClean)
			return
		
		ctx.save()
		
		const highlightSize = 18
		
		ctx.strokeStyle = "#26a"
		ctx.fillStyle = "#26a"
		ctx.lineWidth = highlightSize
		
		if (this.selected[0] && this.selected[1])
		{
			ctx.beginPath()
			ctx.moveTo(this.points[0].x, this.points[0].y)
			ctx.lineTo(this.points[1].x, this.points[1].y)
			ctx.stroke()
		}
		
		else if (this.selected[0])
		{
			ctx.beginPath()
			ctx.arc(this.points[0].x, this.points[0].y, highlightSize / 2, 0, Math.PI * 2)
			ctx.fill()
		}
		
		else if (this.selected[1])
		{
			ctx.beginPath()
			ctx.arc(this.points[1].x, this.points[1].y, highlightSize / 2, 0, Math.PI * 2)
			ctx.fill()
		}

		ctx.restore()
	}
}