// src/components/Background/ElectronBackground.jsx
import React, { useEffect, useRef } from 'react'

const ElectronBackground = () => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    let width = window.innerWidth
    let height = window.innerHeight
    
    // ========== 1. GRID 3D FUTURISTIK ==========
    class Grid3D {
      constructor() {
        this.spacing = 80
        this.offset = 0
      }
      
      draw(ctx, time, width, height) {
        ctx.save()
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.2)'
        ctx.lineWidth = 1
        
        // Perspective grid (horizontal lines)
        for (let i = 0; i < 20; i++) {
          const y = height - (i * 30)
          const scale = (y - height) / (height - 300)
          const xOffset = Math.sin(time * 0.001 + i * 0.2) * 20
          
          ctx.beginPath()
          ctx.moveTo(width * 0.2 + xOffset, y)
          ctx.lineTo(width * 0.8 - xOffset, y)
          ctx.stroke()
        }
        
        // Vertical lines
        for (let i = 0; i < 15; i++) {
          const x = width * 0.2 + (i * (width * 0.6 / 15))
          ctx.beginPath()
          ctx.moveTo(x, height - 100)
          ctx.lineTo(x, height - 600)
          ctx.stroke()
        }
        
        // Glowing dots at intersections
        for (let i = 0; i < 15; i++) {
          for (let j = 0; j < 20; j++) {
            const x = width * 0.2 + (i * (width * 0.6 / 15))
            const y = height - (j * 30)
            if (y > height - 600 && y < height - 100) {
              ctx.beginPath()
              ctx.arc(x, y, 1.5, 0, Math.PI * 2)
              ctx.fillStyle = `rgba(0, 212, 255, ${0.5 + Math.sin(time * 0.005 + i + j) * 0.3})`
              ctx.fill()
            }
          }
        }
        
        ctx.restore()
      }
    }
    
    // ========== 2. CIRCUIT BOARD LINES ==========
    class CircuitLines {
      constructor() {
        this.lines = []
        this.init()
      }
      
      init() {
        for (let i = 0; i < 12; i++) {
          this.lines.push({
            startX: Math.random() * 200,
            startY: Math.random() * height,
            endX: width - Math.random() * 200,
            endY: Math.random() * height,
            speed: 0.5 + Math.random() * 1,
            progress: Math.random()
          })
        }
      }
      
      draw(ctx, time, width, height) {
        this.lines.forEach(line => {
          line.progress += 0.002 * line.speed
          if (line.progress > 1) line.progress = 0
          
          const currentX = line.startX + (line.endX - line.startX) * line.progress
          const currentY = line.startY + (line.endY - line.startY) * line.progress
          
          ctx.beginPath()
          ctx.moveTo(line.startX, line.startY)
          ctx.lineTo(currentX, currentY)
          ctx.strokeStyle = `rgba(0, 212, 255, ${0.15 + Math.sin(time * 0.01) * 0.05})`
          ctx.lineWidth = 1.5
          ctx.stroke()
          
          // Glowing dot at moving point
          ctx.beginPath()
          ctx.arc(currentX, currentY, 2, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(0, 212, 255, 0.6)`
          ctx.fill()
        })
      }
    }
    
    // ========== 3. FLOATING PARTICLES (like electrons) ==========
    class ElectronParticle {
      constructor(width, height) {
        this.x = Math.random() * width
        this.y = Math.random() * height
        this.vx = (Math.random() - 0.5) * 0.5
        this.vy = (Math.random() - 0.5) * 0.3
        this.size = Math.random() * 2 + 1
        this.color = Math.random() > 0.7 ? '#00D4FF' : '#FF00FF'
        this.alpha = Math.random() * 0.4 + 0.2
      }
      
      update(width, height) {
        this.x += this.vx
        this.y += this.vy
        
        if (this.x < -20) this.x = width + 20
        if (this.x > width + 20) this.x = -20
        if (this.y < -20) this.y = height + 20
        if (this.y > height + 20) this.y = -20
      }
      
      draw(ctx) {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = `${this.color}${Math.floor(this.alpha * 255).toString(16).padStart(2, '0')}`
        ctx.fill()
      }
    }
    
    // ========== 4. PULSING RINGS ==========
    class PulsingRing {
      constructor(x, y, maxRadius) {
        this.x = x
        this.y = y
        this.maxRadius = maxRadius
        this.progress = Math.random()
        this.speed = 0.002 + Math.random() * 0.003
      }
      
      draw(ctx, time) {
        this.progress += this.speed
        if (this.progress > 1) this.progress = 0
        
        const radius = this.maxRadius * this.progress
        const alpha = 0.3 * (1 - this.progress)
        
        ctx.beginPath()
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
    }
    
    // ========== 5. STATIC NOISE (subtle) ==========
    const drawNoise = (ctx, width, height) => {
      for (let i = 0; i < 100; i++) {
        if (Math.random() < 0.02) {
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.03})`
          ctx.fillRect(
            Math.random() * width,
            Math.random() * height,
            1,
            1
          )
        }
      }
    }
    
    // ========== INITIALIZATION ==========
    const grid = new Grid3D()
    const circuits = new CircuitLines()
    let particles = []
    let rings = []
    
    const init = () => {
      // Particles
      for (let i = 0; i < 100; i++) {
        particles.push(new ElectronParticle(width, height))
      }
      
      // Rings at strategic positions
      rings = [
        new PulsingRing(width * 0.2, height * 0.3, 100),
        new PulsingRing(width * 0.8, height * 0.6, 120),
        new PulsingRing(width * 0.5, height * 0.7, 150),
        new PulsingRing(width * 0.3, height * 0.8, 80),
        new PulsingRing(width * 0.7, height * 0.2, 90),
        new PulsingRing(width * 0.5, height * 0.4, 200)
      ]
    }
    
    // Handle resize
    const handleResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
      
      particles = []
      for (let i = 0; i < 100; i++) {
        particles.push(new ElectronParticle(width, height))
      }
    }
    
    // Animation loop
    const animate = () => {
      timeRef.current += 1
      const time = timeRef.current
      
      ctx.clearRect(0, 0, width, height)
      
      // Deep black background
      ctx.fillStyle = '#05050A'
      ctx.fillRect(0, 0, width, height)
      
      // Draw circuit lines
      circuits.draw(ctx, time, width, height)
      
      // Draw grid
      grid.draw(ctx, time, width, height)
      
      // Draw particles
      particles.forEach(p => {
        p.update(width, height)
        p.draw(ctx)
      })
      
      // Draw rings
      rings.forEach(ring => ring.draw(ctx, time))
      
      // Draw subtle noise
      drawNoise(ctx, width, height)
      
      // Add vignette effect
      const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, height/1.5)
      gradient.addColorStop(0, 'transparent')
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
      
      animationRef.current = requestAnimationFrame(animate)
    }
    
    handleResize()
    init()
    window.addEventListener('resize', handleResize)
    animate()
    
    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])
  
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  )
}

export default ElectronBackground
