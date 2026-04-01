// src/components/Background/GenZBackground.jsx
import React, { useEffect, useRef } from 'react'

const GenZBackground = () => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    let width = window.innerWidth
    let height = window.innerHeight
    
    // ========== 1. SOFT BLOBS (Aesthetic & Trendy) ==========
    class SoftBlob {
      constructor(x, y, size, color, speedX, speedY) {
        this.x = x
        this.y = y
        this.size = size
        this.color = color
        this.speedX = speedX
        this.speedY = speedY
        this.angle = 0
      }
      
      update(width, height) {
        this.x += this.speedX
        this.y += this.speedY
        
        if (this.x < -this.size) this.x = width + this.size
        if (this.x > width + this.size) this.x = -this.size
        if (this.y < -this.size) this.y = height + this.size
        if (this.y > height + this.size) this.y = -this.size
        
        this.angle += 0.01
      }
      
      draw(ctx, time) {
        ctx.save()
        
        // Create organic blob shape
        ctx.beginPath()
        const points = 8
        const radiusVariation = Math.sin(time * 0.002) * 0.1 + 0.9
        
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2 + this.angle
          const r = this.size * (0.85 + Math.sin(angle * 3 + time * 0.003) * 0.15) * radiusVariation
          const x = this.x + Math.cos(angle) * r
          const y = this.y + Math.sin(angle) * r
          
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
        
        // Gradient fill
        const gradient = ctx.createRadialGradient(
          this.x - 20, this.y - 20, 0,
          this.x, this.y, this.size
        )
        gradient.addColorStop(0, this.color)
        gradient.addColorStop(0.7, `${this.color}80`)
        gradient.addColorStop(1, 'transparent')
        
        ctx.fillStyle = gradient
        ctx.fill()
        
        // Glow effect
        ctx.shadowBlur = 40
        ctx.shadowColor = this.color
        ctx.fill()
        ctx.shadowBlur = 0
        
        ctx.restore()
      }
    }
    
    // ========== 2. FLOATING STARS (Sparkle Effect) ==========
    class SparkleStar {
      constructor() {
        this.x = Math.random() * window.innerWidth
        this.y = Math.random() * window.innerHeight
        this.size = Math.random() * 3 + 1
        this.alpha = Math.random() * 0.5 + 0.3
        this.pulseSpeed = 0.01 + Math.random() * 0.02
        this.pulsePhase = Math.random() * Math.PI * 2
      }
      
      draw(ctx, time) {
        const alpha = this.alpha + Math.sin(time * this.pulseSpeed + this.pulsePhase) * 0.2
        
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`
        ctx.fill()
        
        // Cross shape for star effect
        ctx.beginPath()
        ctx.moveTo(this.x - this.size * 2, this.y)
        ctx.lineTo(this.x + this.size * 2, this.y)
        ctx.moveTo(this.x, this.y - this.size * 2)
        ctx.lineTo(this.x, this.y + this.size * 2)
        ctx.strokeStyle = `rgba(255, 255, 200, ${alpha * 0.5})`
        ctx.lineWidth = 1
        ctx.stroke()
      }
    }
    
    // ========== 3. GRADIENT BARS (Clean & Modern) ==========
    class GradientBar {
      constructor(x, width, color1, color2, speed) {
        this.x = x
        this.width = width
        this.color1 = color1
        this.color2 = color2
        this.speed = speed
        this.y = 0
      }
      
      update(height) {
        this.y += this.speed
        if (this.y > height + 100) this.y = -100
      }
      
      draw(ctx, height) {
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y + 80)
        gradient.addColorStop(0, this.color1)
        gradient.addColorStop(1, this.color2)
        
        ctx.fillStyle = gradient
        ctx.fillRect(this.x, this.y, this.width, 80)
      }
    }
    
    // ========== 4. ORBITING PARTICLES (Fun & Dynamic) ==========
    class OrbitingParticle {
      constructor(cx, cy, radius, color, speed) {
        this.cx = cx
        this.cy = cy
        this.radius = radius
        this.color = color
        this.speed = speed
        this.angle = Math.random() * Math.PI * 2
      }
      
      update() {
        this.angle += this.speed
      }
      
      draw(ctx) {
        const x = this.cx + Math.cos(this.angle) * this.radius
        const y = this.cy + Math.sin(this.angle) * this.radius
        
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()
        
        // Trail effect
        for (let i = 1; i <= 3; i++) {
          const trailX = this.cx + Math.cos(this.angle - i * 0.1) * this.radius
          const trailY = this.cy + Math.sin(this.angle - i * 0.1) * this.radius
          ctx.beginPath()
          ctx.arc(trailX, trailY, 2 - i * 0.5, 0, Math.PI * 2)
          ctx.fillStyle = `${this.color}${Math.floor((1 - i * 0.3) * 100).toString(16).padStart(2, '0')}`
          ctx.fill()
        }
      }
    }
    
    // ========== 5. WAVY LINES (Trendy & Aesthetic) ==========
    class WavyLine {
      constructor(y, amplitude, frequency, color, speed) {
        this.y = y
        this.amplitude = amplitude
        this.frequency = frequency
        this.color = color
        this.speed = speed
      }
      
      draw(ctx, time, width) {
        ctx.beginPath()
        ctx.moveTo(0, this.y)
        
        for (let x = 0; x <= width; x += 20) {
          const y = this.y + 
            Math.sin(x * this.frequency + time * this.speed) * this.amplitude +
            Math.sin(x * this.frequency * 2 + time * this.speed * 1.5) * (this.amplitude * 0.3)
          
          ctx.lineTo(x, y)
        }
        
        ctx.strokeStyle = this.color
        ctx.lineWidth = 2
        ctx.shadowBlur = 8
        ctx.shadowColor = this.color
        ctx.stroke()
        ctx.shadowBlur = 0
      }
    }
    
    // Initialize objects
    let blobs = []
    let stars = []
    let bars = []
    let particles = []
    let waves = []
    
    const init = () => {
      // Soft blobs - color palette: neon, pastel, vibrant
      const colors = [
        '#FF6B6B', '#4ECDC4', '#FFE66D', '#FF8C42', '#6C63FF', '#FF00FF', '#00D4FF'
      ]
      
      for (let i = 0; i < 6; i++) {
        blobs.push(new SoftBlob(
          Math.random() * width,
          Math.random() * height,
          120 + Math.random() * 80,
          colors[Math.floor(Math.random() * colors.length)],
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.2
        ))
      }
      
      // Sparkle stars
      for (let i = 0; i < 80; i++) {
        stars.push(new SparkleStar())
      }
      
      // Gradient bars
      const barColors = [
        ['#FF6B6B', '#FF8C42'],
        ['#4ECDC4', '#6C63FF'],
        ['#FFE66D', '#FF6B6B'],
        ['#00D4FF', '#FF00FF']
      ]
      for (let i = 0; i < 8; i++) {
        const colors = barColors[Math.floor(Math.random() * barColors.length)]
        bars.push(new GradientBar(
          Math.random() * width,
          40 + Math.random() * 60,
          colors[0],
          colors[1],
          0.5 + Math.random() * 1
        ))
      }
      
      // Orbiting particles (around center)
      for (let i = 0; i < 12; i++) {
        particles.push(new OrbitingParticle(
          width * 0.5,
          height * 0.5,
          150 + Math.random() * 100,
          colors[Math.floor(Math.random() * colors.length)],
          0.003 + Math.random() * 0.005
        ))
      }
      
      // Wavy lines
      waves = [
        new WavyLine(height * 0.25, 25, 0.008, 'rgba(255, 107, 107, 0.4)', 0.004),
        new WavyLine(height * 0.5, 35, 0.006, 'rgba(78, 205, 196, 0.4)', 0.005),
        new WavyLine(height * 0.75, 30, 0.007, 'rgba(108, 99, 255, 0.4)', 0.003),
        new WavyLine(height * 0.4, 20, 0.009, 'rgba(255, 230, 109, 0.4)', 0.006),
        new WavyLine(height * 0.6, 28, 0.0055, 'rgba(0, 212, 255, 0.4)', 0.0045)
      ]
    }
    
    // Handle resize
    const handleResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
      
      blobs = []
      stars = []
      bars = []
      particles = []
      init()
    }
    
    // Animation loop
    const animate = () => {
      timeRef.current += 1
      const time = timeRef.current
      
      ctx.clearRect(0, 0, width, height)
      
      // Dark gradient background (but not too dark)
      const gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, '#0F0F1A')
      gradient.addColorStop(0.5, '#1A1A2E')
      gradient.addColorStop(1, '#0F0F1A')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
      
      // Draw gradient bars (in background)
      bars.forEach(bar => {
        bar.update(height)
        bar.draw(ctx, height)
      })
      
      // Draw wavy lines
      waves.forEach(wave => wave.draw(ctx, time, width))
      
      // Draw soft blobs
      blobs.forEach(blob => {
        blob.update(width, height)
        blob.draw(ctx, time)
      })
      
      // Draw orbiting particles
      particles.forEach(particle => {
        particle.update()
        particle.draw(ctx)
      })
      
      // Draw sparkle stars
      stars.forEach(star => star.draw(ctx, time))
      
      // Add floating text effect (trendy)
      if (time % 180 < 60) {
        ctx.font = 'bold 14px "Poppins", "Inter", sans-serif'
        ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + Math.sin(time * 0.02) * 0.05})`
        ctx.fillText('⚡ VOLTIFY ⚡', width - 120, height - 30)
        ctx.fillText('⚡ TECH FOR GEN Z ⚡', 20, height - 30)
      }
      
      // Subtle vignette
      const vignette = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, height/1.2)
      vignette.addColorStop(0, 'transparent')
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.3)')
      ctx.fillStyle = vignette
      ctx.fillRect(0, 0, width, height)
      
      animationRef.current = requestAnimationFrame(animate)
    }
    
    init()
    handleResize()
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

export default GenZBackground
