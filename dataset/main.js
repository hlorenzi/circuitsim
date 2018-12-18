let gTable = null
let gIndex = 0

const IMAGE_WIDTH = 32
const IMAGE_HEIGHT = 32
const IMAGE_SCALE = 10


document.body.onload = function()
{
	gTable = document.createElement("table")
	document.body.appendChild(gTable)
	gTable.style.margin = "auto"
	
	createRowSection(10)
}


function createRowSection(rowNum)
{
	for (let i = 0; i < rowNum; i++)
		createRow()
	
	let tr = document.createElement("tr")
	gTable.appendChild(tr)
	
	let td = document.createElement("td")
	tr.appendChild(td)
	
	let buttonMore = document.createElement("button")
	buttonMore.innerHTML = "Create More 10 Rows"
	td.appendChild(buttonMore)
	
	buttonMore.onclick = () =>
	{
		gTable.removeChild(tr)
		createRowSection(10)
	}
}


function createRow()
{
	let tr = document.createElement("tr")
	gTable.appendChild(tr)
	
	let td = []
	for (let i = 0; i < 3; i++)
	{
		td[i] = document.createElement("td")
		tr.appendChild(td[i])
	}
	
	let spanInfo = document.createElement("span")
	spanInfo.innerHTML = "Image #" + gIndex
	td[0].appendChild(spanInfo)
	
	td[0].appendChild(document.createElement("br"))
	
	let buttonClear = document.createElement("button")
	buttonClear.innerHTML = "Clear"
	td[0].appendChild(buttonClear)
	
	let canvas = document.createElement("canvas")
	td[1].appendChild(canvas)
	canvas.width = IMAGE_WIDTH
	canvas.height = IMAGE_HEIGHT
	canvas.style.width = (IMAGE_WIDTH * IMAGE_SCALE) + "px"
	canvas.style.height = (IMAGE_HEIGHT * IMAGE_SCALE) + "px"
	
	let canvasManager = new CanvasManager(canvas, IMAGE_WIDTH, IMAGE_HEIGHT, IMAGE_SCALE)
	
	canvasManager.clear()
	buttonClear.onclick = () => canvasManager.clear()
	
	let textareaLabels = document.createElement("textarea")
	td[2].appendChild(textareaLabels)
	textareaLabels.style.width = (IMAGE_HEIGHT * IMAGE_SCALE * 2) + "px"
	textareaLabels.style.height = (IMAGE_HEIGHT * IMAGE_SCALE) + "px"
	textareaLabels.placeholder = "<same as above>"
	
	gIndex++
}


class CanvasManager
{
	constructor(canvas, width, height, scale)
	{
		this.canvas = canvas
		this.width = width
		this.height = height
		this.scale = scale
		this.ctx = this.canvas.getContext("2d")
		
		this.mouseDown = false
		this.mousePos = null
		
		this.touchDown = null
		
		this.canvas.onmousedown  = (ev) => this.onMouseDown(ev)
		this.canvas.onmousemove  = (ev) => this.onMouseMove(ev)
		this.canvas.onmouseup    = (ev) => this.onMouseUp  (ev)
		this.canvas.onmouseleave = (ev) => this.onMouseUp  (ev)
		
		this.canvas.addEventListener("touchstart",  (ev) => this.onTouchStart(ev))
		this.canvas.addEventListener("touchmove",   (ev) => this.onTouchMove (ev))
		this.canvas.addEventListener("touchend",    (ev) => this.onTouchEnd  (ev))
		this.canvas.addEventListener("touchcancel", (ev) => this.onTouchEnd  (ev))
	}
	
	
	clear()
	{
		this.ctx.fillStyle = "#000"
		this.ctx.fillRect(0, 0, this.width, this.height)
	}
	
	
	getMousePos(ev)
	{
		const rect = this.canvas.getBoundingClientRect()
		return {
			x: (ev.clientX - rect.left) / this.scale,
			y: (ev.clientY - rect.top ) / this.scale
		}
	}
	
	
	onMouseDown(ev)
	{
		ev.preventDefault()
		
		if (!this.mouseDown)
		{
			this.mouseDown = true
			this.mousePos = this.getMousePos(ev)
			
			this.drawStroke(this.mousePos, { x: this.mousePos.x + 0.1, y: this.mousePos.y })
		}
	}
	
	
	onMouseMove(ev)
	{
		ev.preventDefault()
		
		if (this.mouseDown)
		{
			const mousePosPrev = this.mousePos
			this.mousePos = this.getMousePos(ev)
			
			this.drawStroke(mousePosPrev, this.mousePos)
		}
	}
	
	
	onMouseUp(ev)
	{
		ev.preventDefault()
		
		if (this.mouseDown)
		{
			this.mouseDown = false
			
			const mousePosPrev = this.mousePos
			this.mousePos = this.getMousePos(ev)
			
			this.drawStroke(mousePosPrev, this.mousePos)
		}
	}
	
	
	onTouchStart(ev)
	{
		ev.preventDefault()
		
		if (this.touchDown == null)
		{
			this.touchDown = ev.touches[0].identifier
			this.touchPos = this.getMousePos(ev.touches[0])
		}
	}
	
	
	onTouchMove(ev)
	{
		ev.preventDefault()
		
		let touch = null
		for (const t of ev.touches)
		{
			if (t.identifier == this.touchDown)
				touch = t
		}
		
		if (touch != null)
		{
			const touchPosPrev = this.touchPos
			this.touchPos = this.getMousePos(touch)
			
			this.drawStroke(touchPosPrev, this.touchPos)
		}
	}
	
	
	onTouchEnd(ev)
	{
		ev.preventDefault()
		
		let touch = null
		for (const t of ev.touches)
		{
			if (t.identifier == this.touchDown)
				touch = t
		}
		
		if (touch == null)
		{
			this.touchDown = null
		}
	}
	
	
	drawStroke(p1, p2)
	{
		this.ctx.strokeStyle = "#fff"
		this.ctx.lineWidth = 1
		this.ctx.lineCap = "round"
		this.ctx.beginPath()
		this.ctx.moveTo(p1.x, p1.y)
		this.ctx.lineTo(p2.x, p2.y)
		this.ctx.stroke()
	}
}