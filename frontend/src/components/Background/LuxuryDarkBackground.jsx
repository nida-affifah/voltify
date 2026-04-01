// src/components/Background/LuxuryDarkBackground.jsx
import React, { useEffect, useRef } from 'react'

const LuxuryDarkBackground = () => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const timeRef = useRef(0)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    let width = window.innerWidth
    let height = window.innerHeight
    
    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMouseMove)
    
    // ========== SLOW DANCING ORBS ==========
    class SlowOrb {
      constructor(x, y, radius, color, speed) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.speed = speed
        this.angleX = Math.random() * Math.PI * 2
        this.angleY = Math.random() * Math.PI * 2
        this.pulseAngle = Math.random() * Math.PI * 2
      }
      
      draw(ctx, time, width, height, mouseX, mouseY) {
        // Gerakan sangat lambat
        const danceX = Math.sin(time * 0.0008 * this.speed + this.angleX) * 12
        const danceY = Math.cos(time * 0.0007 * this.speed + this.angleY) * 10
        const waveX = Math.sin(time * 0.0004) * 5
        const waveY = Math.cos(time * 0.0005) * 4
        
        let finalX = this.x + danceX + waveX
        let finalY = this.y + danceY + waveY
        
        // Interaksi mouse yang lebih subtle
        const dx = mouseX - finalX
        const dy = mouseY - finalY
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance < 200) {
          const angle = Math.atan2(dy, dx)
          const push = (200 - distance) / 80
          finalX -= Math.cos(angle) * push
          finalY -= Math.sin(angle) * push
        }
        
        // Pulse sangat lambat
        const pulse = 1 + Math.sin(time * 0.002 + this.pulseAngle) * 0.04
        const currentRadius = this.radius * pulse
        
        const gradient = ctx.createRadialGradient(
          finalX - 15, finalY - 15, 0,
          finalX, finalY, currentRadius
        )
        gradient.addColorStop(0, this.color + '30')
        gradient.addColorStop(0.5, this.color + '15')
        gradient.addColorStop(1, 'transparent')
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(finalX, finalY, currentRadius, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.beginPath()
        ctx.arc(finalX, finalY, currentRadius * 0.3, 0, Math.PI * 2)
        ctx.fillStyle = this.color + '20'
        ctx.fill()
      }
    }
    
    // ========== SLOW WAVY LINES ==========
    class SlowWave {
      constructor(y, amplitude, frequency, color, speed) {
        this.y = y
        this.amplitude = amplitude
        this.frequency = frequency
        this.color = color
        this.speed = speed
      }
      
      draw(ctx, time, width, height) {
        ctx.beginPath()
        ctx.moveTo(0, this.y)
        
        for (let x = 0; x <= width; x += 25) {
          const y = this.y + 
            Math.sin(x * this.frequency + time * this.speed * 0.5) * this.amplitude +
            Math.sin(x * this.frequency * 1.5 + time * this.speed * 0.3) * (this.amplitude * 0.3)
          
          ctx.lineTo(x, y)
        }
        
        ctx.strokeStyle = this.color
        ctx.lineWidth = 1.2
        ctx.shadowBlur = 6
        ctx.shadowColor = this.color
        ctx.stroke()
        
        ctx.lineTo(width, height)
        ctx.lineTo(0, height)
        ctx.closePath()
        
        const gradient = ctx.createLinearGradient(0, this.y - 40, 0, this.y + 80)
        gradient.addColorStop(0, 'rgba(0, 212, 255, 0.08)')
        gradient.addColorStop(1, 'transparent')
        ctx.fillStyle = gradient
        ctx.fill()
        
        ctx.shadowBlur = 0
      }
    }
    
    // ========== SLOW FLOATING PARTICLES ==========
    class SlowParticle {
      constructor(width, height) {
        this.reset(width, height)
        this.danceSpeed = 0.2 + Math.random() * 0.5
        this.dancePhase = Math.random() * Math.PI * 2
      }
      
      reset(width, height) {
        this.x = Math.random() * width
        this.y = Math.random() * height
        this.vx = (Math.random() - 0.5) * 0.03
        this.vy = (Math.random() - 0.5) * 0.02
        this.size = Math.random() * 1.5 + 0.5
        this.baseAlpha = Math.random() * 0.2 + 0.05
        this.twinkleSpeed = 0.0008 + Math.random() * 0.001
        this.twinklePhase = Math.random() * Math.PI * 2
      }
      
      update(width, height, time, mouseX, mouseY) {
        const danceX = Math.sin(time * 0.001 * this.danceSpeed + this.dancePhase) * 0.3
        const danceY = Math.cos(time * 0.0009 * this.danceSpeed + this.dancePhase) * 0.2
        
        this.x += this.vx + danceX
        this.y += this.vy + danceY
        
        const dx = mouseX - this.x
        const dy = mouseY - this.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance < 120) {
          const angle = Math.atan2(dy, dx)
          this.x -= Math.cos(angle) * 0.8
          this.y -= Math.sin(angle) * 0.8
        }
        
        if (this.x < -20) this.x = width + 20
        if (this.x > width + 20) this.x = -20
        if (this.y < -20) this.y = height + 20
        if (this.y > height + 20) this.y = -20
        
        this.alpha = this.baseAlpha + Math.sin(time * this.twinkleSpeed + this.twinklePhase) * 0.05
      }
      
      draw(ctx) {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.02, Math.min(0.25, this.alpha))})`
        ctx.fill()
      }
    }
    
    // ========== SLOW SPIRAL ==========
    class SlowSpiral {
      constructor(cx, cy, color) {
        this.cx = cx
        this.cy = cy
        this.color = color
        this.angle = 0
        this.points = []
        for (let i = 0; i < 50; i++) {
          this.points.push({ radius: i * 2.5, angle: i * 0.25 })
        }
      }
      
      draw(ctx, time, width, height) {
        this.angle = time * 0.0005
        
        ctx.beginPath()
        for (let i = 0; i < this.points.length; i++) {
          const r = this.points[i].radius + Math.sin(time * 0.001 + i * 0.05) * 3
          const a = this.points[i].angle + this.angle + Math.sin(time * 0.0008) * 0.2
          const x = this.cx + Math.cos(a) * r
          const y = this.cy + Math.sin(a) * r + Math.sin(time * 0.001 + i * 0.03) * 4
          
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        
        ctx.strokeStyle = this.color + '20'
        ctx.lineWidth = 1
        ctx.stroke()
      }
    }
    
    // ========== SLOW RING ==========
    class SlowRing {
      constructor(cx, cy, radius, color) {
        this.cx = cx
        this.cy = cy
        this.radius = radius
        this.color = color
        this.angle = 0
        this.dots = []
        for (let i = 0; i < 12; i++) {
          this.dots.push({ angle: (i / 12) * Math.PI * 2, speed: 0.2 + Math.random() * 0.3 })
        }
      }
      
      draw(ctx, time, width, height) {
        this.angle = time * 0.0004
        
        ctx.beginPath()
        ctx.arc(this.cx, this.cy, this.radius, 0, Math.PI * 2)
        ctx.strokeStyle = this.color + '15'
        ctx.lineWidth = 0.8
        ctx.setLineDash([6, 12])
        ctx.stroke()
        ctx.setLineDash([])
        
        this.dots.forEach(dot => {
          const dotAngle = dot.angle + this.angle + Math.sin(time * 0.0008 * dot.speed) * 0.15
          const dotX = this.cx + Math.cos(dotAngle) * this.radius
          const dotY = this.cy + Math.sin(dotAngle) * this.radius + Math.sin(time * 0.001 * dot.speed) * 2
          
          ctx.beginPath()
          ctx.arc(dotX, dotY, 1.5, 0, Math.PI * 2)
          ctx.fillStyle = this.color + '60'
          ctx.fill()
          
          ctx.shadowBlur = 6
          ctx.shadowColor = this.color
          ctx.fill()
          ctx.shadowBlur = 0
        })
      }
    }
    
    // Initialize
    let orbs = []
    let waves = []
    let particles = []
    let spirals = []
    let rings = []
    
    const init = () => {
      orbs = [
        new SlowOrb(width * 0.2, height * 0.3, 280, '#00D4FF', 0.4),
        new SlowOrb(width * 0.75, height * 0.55, 320, '#00FFAA', 0.5),
        new SlowOrb(width * 0.5, height * 0.7, 240, '#FF00FF', 0.45),
        new SlowOrb(width * 0.85, height * 0.25, 200, '#FF6B6B', 0.6),
        new SlowOrb(width * 0.15, height * 0.8, 220, '#FFD700', 0.35)
      ]
      
      waves = [
        new SlowWave(height * 0.25, 25, 0.005, 'rgba(0, 212, 255, 0.25)', 0.002),
        new SlowWave(height * 0.45, 35, 0.0035, 'rgba(0, 255, 170, 0.2)', 0.0018),
        new SlowWave(height * 0.65, 30, 0.0045, 'rgba(255, 0, 255, 0.18)', 0.0022),
        new SlowWave(height * 0.82, 22, 0.006, 'rgba(255, 107, 107, 0.15)', 0.0015)
      ]
      
      particles = []
      for (let i = 0; i < 80; i++) {
        particles.push(new SlowParticle(width, height))
      }
      
      spirals = [
        new SlowSpiral(width * 0.35, height * 0.4, '#00D4FF'),
        new SlowSpiral(width * 0.7, height * 0.6, '#00FFAA'),
        new SlowSpiral(width * 0.5, height * 0.5, '#FF00FF')
      ]
      
      rings = [
        new SlowRing(width * 0.5, height * 0.5, 200, '#00D4FF'),
        new SlowRing(width * 0.5, height * 0.5, 300, '#00FFAA'),
        new SlowRing(width * 0.3, height * 0.7, 140, '#FF6B6B'),
        new SlowRing(width * 0.7, height * 0.3, 160, '#FFD700')
      ]
    }
    
    const handleResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
      init()
    }
    
    const animate = () => {
      timeRef.current += 1
      const time = timeRef.current
      const mouseX = mouseRef.current.x
      const mouseY = mouseRef.current.y
      
      ctx.clearRect(0, 0, width, height)
      
      ctx.fillStyle = '#0A0A0F'
      ctx.fillRect(0, 0, width, height)
      
      waves.forEach(wave => wave.draw(ctx, time, width, height))
      spirals.forEach(spiral => spiral.draw(ctx, time, width, height))
      orbs.forEach(orb => orb.draw(ctx, time, width, height, mouseX, mouseY))
      rings.forEach(ring => ring.draw(ctx, time, width, height))
      particles.forEach(p => {
        p.update(width, height, time, mouseX, mouseY)
        p.draw(ctx)
      })
      
      if (mouseX > 0 && mouseY > 0) {
        const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 100)
        gradient.addColorStop(0, 'rgba(0, 212, 255, 0.05)')
        gradient.addColorStop(1, 'transparent')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)
      }
      
      animationRef.current = requestAnimationFrame(animate)
    }
    
    init()
    handleResize()
    window.addEventListener('resize', handleResize)
    animate()
    
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
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

export default LuxuryDarkBackground
