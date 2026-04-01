// src/components/Background/PremiumBackground.jsx
import React, { useEffect, useRef } from 'react'

const PremiumBackground = () => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    let width = window.innerWidth
    let height = window.innerHeight
    
    // Track mouse position for interactive effects
    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMouseMove)
    
    // === 1. STARFIELD WITH TWINKLE ===
    class Star {
      constructor() {
        this.x = Math.random() * width
        this.y = Math.random() * height
        this.size = Math.random() * 2 + 0.5
        this.alpha = Math.random() * 0.5 + 0.3
        this.twinkleSpeed = 0.02 + Math.random() * 0.03
        this.twinklePhase = Math.random() * Math.PI * 2
      }
      
      update(time) {
        this.alpha = 0.3 + Math.sin(time * this.twinkleSpeed + this.twinklePhase) * 0.3
      }
      
      draw(ctx) {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`
        ctx.fill()
        
        // Glow for bigger stars
        if (this.size > 1.2) {
          ctx.shadowBlur = 8
          ctx.shadowColor = `rgba(255, 255, 200, ${this.alpha * 0.5})`
          ctx.fill()
          ctx.shadowBlur = 0
        }
      }
    }
    
    // === 2. AURORA WAVES (Northern Lights effect) ===
    class AuroraWave {
      constructor(y, amplitude, frequency, color) {
        this.y = y
        this.amplitude = amplitude
        this.frequency = frequency
        this.color = color
        this.offset = Math.random() * Math.PI * 2
      }
      
      draw(ctx, time, width, height) {
        ctx.beginPath()
        ctx.moveTo(0, height)
        
        for (let x = 0; x <= width; x += 20) {
          const y = this.y + 
            Math.sin(x * this.frequency + time * 0.002 + this.offset) * this.amplitude +
            Math.cos(x * this.frequency * 2 + time * 0.001) * (this.amplitude * 0.5)
          
          ctx.lineTo(x, Math.max(0, Math.min(height, y)))
        }
        
        ctx.lineTo(width, height)
        ctx.closePath()
        
        const gradient = ctx.createLinearGradient(0, 0, 0, height)
        gradient.addColorStop(0, `${this.color}80`)
        gradient.addColorStop(1, 'transparent')
        ctx.fillStyle = gradient
        ctx.fill()
      }
    }
    
    // === 3. LUMINOUS ORBS WITH TRAILS ===
    class LuminousOrb {
      constructor(x, y, radius, color, speed) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.speed = speed
        this.angle = Math.random() * Math.PI * 2
        this.trail = []
        this.maxTrail = 20
      }
      
      update(width, height, time) {
        this.angle += this.speed * 0.01
        this.x = width * 0.5 + Math.cos(this.angle) * (width * 0.3)
        this.y = height * 0.5 + Math.sin(this.angle * 0.7) * (height * 0.25)
        
        // Add to trail
        this.trail.unshift({ x: this.x, y: this.y, life: 1 })
        if (this.trail.length > this.maxTrail) this.trail.pop()
        
        // Update trail life
        this.trail.forEach(point => { point.life -= 0.05 })
        this.trail = this.trail.filter(p => p.life > 0)
      }
      
      draw(ctx, time) {
        // Draw trail
        this.trail.forEach((point, i) => {
          const alpha = point.life * 0.3
          const size = this.radius * (point.life * 0.5 + 0.2)
          ctx.beginPath()
          ctx.arc(point.x, point.y, size, 0, Math.PI * 2)
          ctx.fillStyle = `${this.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`
          ctx.fill()
        })
        
        // Draw orb with glow
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        
        const gradient = ctx.createRadialGradient(
          this.x - 5, this.y - 5, 0,
          this.x, this.y, this.radius
        )
        gradient.addColorStop(0, this.color)
        gradient.addColorStop(0.6, `${this.color}cc`)
        gradient.addColorStop(1, 'transparent')
        
        ctx.fillStyle = gradient
        ctx.fill()
        
        // Outer glow
        ctx.shadowBlur = 30
        ctx.shadowColor = this.color
        ctx.fill()
        ctx.shadowBlur = 0
      }
    }
    
    // === 4. DATA STREAM (Matrix-like but elegant) ===
    class DataStream {
      constructor(x, speed) {
        this.x = x
        this.y = Math.random() * height
        this.speed = speed
        this.characters = ['0', '1', '⚡', '●', '◆', '■', '▲', '▼']
        this.length = 5 + Math.floor(Math.random() * 10)
        this.active = true
      }
      
      update() {
        this.y += this.speed
        if (this.y > height + 100) {
          this.active = false
        }
      }
      
      draw(ctx) {
        for (let i = 0; i < this.length; i++) {
          const charY = this.y - i * 20
          if (charY > 0 && charY < height) {
            const alpha = 0.2 - (i / this.length) * 0.15
            ctx.font = '12px monospace'
            ctx.fillStyle = `rgba(0, 212, 255, ${alpha})`
            ctx.fillText(
              this.characters[Math.floor(Math.random() * this.characters.length)],
              this.x, charY
            )
          }
        }
      }
    }
    
    // === 5. GEOMETRIC WAVES ===
    class GeometricWave {
      constructor(amplitude, frequency, color) {
        this.amplitude = amplitude
        this.frequency = frequency
        this.color = color
      }
      
      draw(ctx, time, width, height) {
        ctx.beginPath()
        ctx.moveTo(0, height / 2)
        
        for (let x = 0; x <= width; x += 10) {
          const y = height / 2 + 
            Math.sin(x * this.frequency + time * 0.003) * this.amplitude +
            Math.sin(x * this.frequency * 2 + time * 0.002) * (this.amplitude * 0.5)
          
          ctx.lineTo(x, y)
        }
        
        ctx.strokeStyle = this.color
        ctx.lineWidth = 1.5
        ctx.shadowBlur = 8
        ctx.shadowColor = this.color
        ctx.stroke()
        ctx.shadowBlur = 0
      }
    }
    
    // Initialize objects
    let stars = []
    let auroras = []
    let orbs = []
    let dataStreams = []
    let waves = []
    
    const init = () => {
      // Stars
      for (let i = 0; i < 400; i++) {
        stars.push(new Star())
      }
      
      // Aurora waves
      auroras = [
        new AuroraWave(height * 0.3, 40, 0.008, '#00d4ff'),
        new AuroraWave(height * 0.5, 60, 0.006, '#00ffaa'),
        new AuroraWave(height * 0.7, 50, 0.007, '#ff00ff'),
        new AuroraWave(height * 0.2, 30, 0.009, '#ff6b6b')
      ]
      
      // Luminous orbs
      orbs = [
        new LuminousOrb(width * 0.3, height * 0.3, 80, '#00d4ff', 0.5),
        new LuminousOrb(width * 0.7, height * 0.6, 100, '#ff00ff', 0.7),
        new LuminousOrb(width * 0.5, height * 0.4, 60, '#00ffaa', 0.4),
        new LuminousOrb(width * 0.2, height * 0.7, 70, '#ff6b6b', 0.6),
        new LuminousOrb(width * 0.8, height * 0.2, 90, '#4ecdc4', 0.55)
      ]
      
      // Geometric waves
      waves = [
        new GeometricWave(80, 0.003, 'rgba(0, 212, 255, 0.3)'),
        new GeometricWave(50, 0.005, 'rgba(0, 255, 170, 0.3)'),
        new GeometricWave(100, 0.002, 'rgba(255, 0, 255, 0.2)')
      ]
    }
    
    // Create data streams periodically
    const createDataStream = () => {
      if (Math.random() < 0.02) {
        dataStreams.push(new DataStream(
          Math.random() * width,
          0.8 + Math.random() * 1.5
        ))
      }
      dataStreams = dataStreams.filter(s => s.active)
    }
    
    // Draw interactive cursor effect
    const drawCursorEffect = (ctx, time) => {
      if (mouseRef.current.x && mouseRef.current.y) {
        const gradient = ctx.createRadialGradient(
          mouseRef.current.x, mouseRef.current.y, 0,
          mouseRef.current.x, mouseRef.current.y, 150
        )
        gradient.addColorStop(0, 'rgba(0, 212, 255, 0.1)')
        gradient.addColorStop(1, 'transparent')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)
        
        // Ripple effect
        const ripple = Math.sin(time * 0.02) * 10 + 20
        ctx.beginPath()
        ctx.arc(mouseRef.current.x, mouseRef.current.y, ripple, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.4)'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
    }
    
    // Animation loop
    const animate = () => {
      timeRef.current += 1
      const time = timeRef.current
      
      ctx.clearRect(0, 0, width, height)
      
      // Deep black background with subtle gradient
      const gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, '#050508')
      gradient.addColorStop(0.3, '#0a0a12')
      gradient.addColorStop(0.7, '#0a0a12')
      gradient.addColorStop(1, '#050508')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
      
      // Draw auroras (subtle)
      auroras.forEach(a => a.draw(ctx, time, width, height))
      
      // Draw geometric waves
      waves.forEach(w => w.draw(ctx, time, width, height))
      
      // Draw stars with twinkle
      stars.forEach(star => {
        star.update(time)
        star.draw(ctx)
      })
      
      // Draw luminous orbs
      orbs.forEach(orb => {
        orb.update(width, height, time)
        orb.draw(ctx, time)
      })
      
      // Draw data streams
      dataStreams.forEach(stream => {
        stream.update()
        stream.draw(ctx)
      })
      createDataStream()
      
      // Draw interactive cursor effect
      drawCursorEffect(ctx, time)
      
      // Add floating particles around mouse
      if (mouseRef.current.x && mouseRef.current.y) {
        for (let i = 0; i < 3; i++) {
          ctx.beginPath()
          ctx.arc(
            mouseRef.current.x + (Math.random() - 0.5) * 30,
            mouseRef.current.y + (Math.random() - 0.5) * 30,
            Math.random() * 3 + 1,
            0, Math.PI * 2
          )
          ctx.fillStyle = `rgba(0, 212, 255, ${Math.random() * 0.5})`
          ctx.fill()
        }
      }
      
      animationRef.current = requestAnimationFrame(animate)
    }
    
    // Handle resize
    const handleResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
      stars = []
      for (let i = 0; i < 400; i++) {
        stars.push(new Star())
      }
      orbs.forEach((orb, i) => {
        orb.x = width * [0.3, 0.7, 0.5, 0.2, 0.8][i]
        orb.y = height * [0.3, 0.6, 0.4, 0.7, 0.2][i]
      })
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

export default PremiumBackground
