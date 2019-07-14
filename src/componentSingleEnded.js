import { Component } from "./component.js"
import * as MathUtils from "./math.js"


export class ComponentSingleEnded extends Component
{
	constructor(p)
	{
		super(p)
		
		this.points = [p, p]
		this.joints = [-1, -1]
		this.nodes = [-1, -1]
		this.selected = [false, false]
		this.dragOrigin = [p, p]
		
		this.isVoltageSource = false
		this.voltageSourceIndex = -1
		
		this.current = 0
		this.currentAnim = 0
	}
	
	
	loadFromString(manager, loadData, reader)
	{
		const joint1 = parseInt(reader.read())
		const joint2 = parseInt(reader.read())
		 
		this.points[0] = { x: loadData.joints[joint1].x, y: loadData.joints[joint1].y }
		this.points[1] = { x: loadData.joints[joint2].x, y: loadData.joints[joint2].y }
	}
	
	
	reset(manager)
	{
		this.current = 0
		this.currentAnim = 0
	}
	
	
	updateCurrentAnim(manager, mult)
	{
		const delta = Math.max(-0.25, Math.min(0.25, mult * (this.current * 4.5)))
		
		this.currentAnim = (1 + this.currentAnim + delta) % 1
	}
	
	
	isDegenerate()
	{
		return this.points[0].x == this.points[1].x && this.points[0].y == this.points[1].y
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
		
		if (t < 0.2)
			return { kind: "vertex", index: 0, distSqr }
		
		if (t > 0.8)
			return { kind: "vertex", index: 1, distSqr }
		
		return { kind: "full", distSqr }
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
			x: this.points[0].x - this.points[1].x,
			y: this.points[0].y - this.points[1].y
		}
		
		const vectorLen = Math.sqrt(vector.x * vector.x + vector.y * vector.y)
		
		const vectorUnit = {
			x: vector.x / vectorLen,
			y: vector.y / vectorLen
		}
		
		const break1 = Math.min(vectorLen, symbolSize)
		
		ctx.save()
		
		ctx.strokeStyle = manager.getVoltageColor(manager.getNodeVoltage(this.nodes[0]))
		ctx.beginPath()
		ctx.arc(this.points[0].x, this.points[0].y, 2, 0, Math.PI * 2)
		ctx.moveTo(this.points[0].x, this.points[0].y)
		ctx.lineTo(this.points[1].x + vectorUnit.x * break1, this.points[1].y + vectorUnit.y * break1)
		ctx.stroke()
		
		ctx.translate(this.points[1].x + vectorUnit.x * symbolSize / 2, this.points[1].y + vectorUnit.y * symbolSize / 2)
		ctx.transform(vectorUnit.x, vectorUnit.y, -vectorUnit.y, vectorUnit.x, 0, 0)
	}
	
	
	drawSymbolSetGradient(manager, ctx, symbolSize, color1, color2)
	{
		let grad = ctx.createLinearGradient(-symbolSize / 2, 0, symbolSize / 2, 0)
		grad.addColorStop(0, color1)
		grad.addColorStop(1, color2)
		ctx.strokeStyle = grad
		ctx.fillStyle = grad
	}
	
	
	drawSymbolEnd(manager, ctx)
	{
		ctx.restore()
	}
	
	
	renderCurrent(manager, ctx)
	{
		this.drawCurrent(manager, ctx, this.currentAnim, this.points[0], this.points[1])
	}
	
	
	renderHover(manager, ctx, hover)
	{
		if (manager.debugDrawClean)
			return
		
		ctx.save()
		
		const highlightSize = 20
		
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
			let centerX = (this.points[0].x + this.points[1].x) / 2
			let centerY = (this.points[0].y + this.points[1].y) / 2
			
			for (let i = 0; i < 3; i++)
			{
				centerX = (centerX + this.points[hover.index].x) / 2
				centerY = (centerY + this.points[hover.index].y) / 2
			}
			
			ctx.beginPath()
			ctx.moveTo(this.points[hover.index].x, this.points[hover.index].y)
			ctx.lineTo(centerX, centerY)
			ctx.stroke()
		}
		
		ctx.restore()
	}
	
	
	renderSelection(manager, ctx)
	{
		if (manager.debugDrawClean)
			return
		
		ctx.save()
		
		const highlightSize = 18
		
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
	
	
	renderEditing(manager, ctx)
	{
		if (manager.debugDrawClean)
			return
		
		ctx.save()
		
		const highlightSize = 20
		
		ctx.lineWidth = highlightSize
		
		ctx.beginPath()
		ctx.moveTo(this.points[0].x, this.points[0].y)
		ctx.lineTo(this.points[1].x, this.points[1].y)
		ctx.stroke()

		ctx.restore()
	}
	
	
	drawRatingText(manager, ctx, value, unit, xDistance = 35, yDistance = 35)
	{
		ctx.font = "15px Verdana"
		ctx.textBaseline = "middle"
		
		const labelDirection = this.getOutgoingDirectionFromNode(1) + Math.PI / 2
		
		const xCenter = (this.points[0].x + this.points[1].x) / 2
		const yCenter = (this.points[0].y + this.points[1].y) / 2
		const xOffset = xDistance *  Math.cos(labelDirection)
		const yOffset = yDistance * -Math.sin(labelDirection)
		
		if (Math.abs(xOffset) < Math.abs(yOffset) * 0.1)
			ctx.textAlign = "center"
		else if (xOffset > 0)
			ctx.textAlign = "left"
		else
			ctx.textAlign = "right"
		
		const str = MathUtils.valueToStringWithUnitPrefix(value, " ") + unit
			
		ctx.fillStyle = "#fff"
		ctx.fillText(str, xCenter + xOffset, yCenter + yOffset)
	}
}