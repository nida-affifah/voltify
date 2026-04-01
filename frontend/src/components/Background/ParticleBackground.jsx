// src/components/Background/ParticleBackground.jsx
import React, { useEffect, useRef } from 'react'

const ParticleBackground = () => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const particlesRef = useRef([])
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    let width = window.innerWidth
    let height = window.innerHeight
    
    // Particle class
    class Particle {
      constructor(x, y, vx, vy, size, color, opacity) {
        this.x = x
        this.y = y
        this.vx = vx
        this.vy = vy
        this.size = size
        this.color = color
        this.opacity = opacity
        this.originalOpacity = opacity
        this.angle = Math.random() * Math.PI * 2
        this.angularSpeed = (Math.random() - 0.5) * 0.02
      }
      
      update(time) {
        this.x += this.vx
        this.y += this.vy
        this.angle += this.angularSpeed
        
        // Wrap around edges
        if (this.x < -50) this.x = width + 50
        if (this.x > width + 50) this.x = -50
        if (this.y < -50) this.y = height + 50
        if (this.y > height + 50) this.y = -50
        
        // Pulsating opacity
        this.opacity = this.originalOpacity + Math.sin(time * 0.002 + this.angle) * 0.2
      }
      
      draw(ctx) {
        ctx.save()
        ctx.globalAlpha = Math.max(0, Math.min(1, this.opacity))
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()
        
        // Glow effect
        ctx.shadowBlur = 15
        ctx.shadowColor = this.color
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.restore()
      }
    }
    
    // Initialize particles
    const initParticles = () => {
      const particles = []
      const colors = [
        '#00d4ff', '#00ffaa', '#ff00ff', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'
      ]
      
      for (let i = 0; i < 150; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const vx = (Math.random() - 0.5) * 0.5
        const vy = (Math.random() - 0.5) * 0.3
        const size = Math.random() * 3 + 1
        const color = colors[Math.floor(Math.random() * colors.length)]
        const opacity = Math.random() * 0.5 + 0.2
        particles.push(new Particle(x, y, vx, vy, size, color, opacity))
      }
      return particles
    }
    
    // Draw connecting lines between nearby particles
    const drawLines = (ctx, particles, time) => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const maxDistance = 120
          
          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * 0.3
            const gradient = ctx.createLinearGradient(
              particles[i].x, particles[i].y,
              particles[j].x, particles[j].y
            )
            gradient.addColorStop(0, particles[i].color)
            gradient.addColorStop(1, particles[j].color)
            
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = gradient
            ctx.globalAlpha = opacity * (0.8 + Math.sin(time * 0.003) * 0.2)
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }
    }
    
    // Draw animated gradient orbs
    const drawOrbs = (ctx, time) => {
      const orbs = [
        { x: width * 0.2, y: height * 0.3, radius: 150, color1: '#00d4ff', color2: '#00ffaa', speed: 0.5 },
        { x: width * 0.8, y: height * 0.7, radius: 200, color1: '#ff00ff', color2: '#ff6b6b', speed: 0.3 },
        { x: width * 0.5, y: height * 0.5, radius: 250, color1: '#4ecdc4', color2: '#45b7d1', speed: 0.2 },
        { x: width * 0.1, y: height * 0.8, radius: 120, color1: '#96ceb4', color2: '#00d4ff', speed: 0.4 },
        { x: width * 0.9, y: height * 0.2, radius: 180, color1: '#ff6b6b', color2: '#ff00ff', speed: 0.35 }
      ]
      
      orbs.forEach((orb, index) => {
        const offsetX = Math.sin(time * 0.0005 * orb.speed + index) * 30
        const offsetY = Math.cos(time * 0.0004 * orb.speed + index) * 30
        
        const gradient = ctx.createRadialGradient(
          orb.x + offsetX, orb.y + offsetY, 0,
          orb.x + offsetX, orb.y + offsetY, orb.radius
        )
        gradient.addColorStop(0, orb.color1)
        gradient.addColorStop(0.5, `${orb.color1}40`)
        gradient.addColorStop(1, 'transparent')
        
        ctx.globalAlpha = 0.15
        ctx.beginPath()
        ctx.arc(orb.x + offsetX, orb.y + offsetY, orb.radius, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      })
    }
    
    // Draw floating geometric shapes
    const drawShapes = (ctx, time) => {
      const shapes = []
      for (let i = 0; i < 30; i++) {
        const x = (i * 137) % width
        const y = (i * 231) % height
        const size = 20 + Math.sin(i) * 10
        const angle = time * 0.001 * (i % 3 + 1)
        const type = i % 4
        
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(angle)
        ctx.globalAlpha = 0.03 + Math.sin(time * 0.001 + i) * 0.02
        ctx.strokeStyle = `hsl(${i * 30 + time * 0.1}, 70%, 60%)`
        ctx.lineWidth = 1
        
        if (type === 0) {
          // Triangle
          ctx.beginPath()
          ctx.moveTo(0, -size)
          ctx.lineTo(size, size)
          ctx.lineTo(-size, size)
          ctx.closePath()
          ctx.stroke()
        } else if (type === 1) {
          // Square
          ctx.strokeRect(-size/2, -size/2, size, size)
        } else if (type === 2) {
          // Circle
          ctx.beginPath()
          ctx.arc(0, 0, size/2, 0, Math.PI * 2)
          ctx.stroke()
        } else {
          // Cross
          ctx.beginPath()
          ctx.moveTo(0, -size)
          ctx.lineTo(0, size)
          ctx.moveTo(-size, 0)
          ctx.lineTo(size, 0)
          ctx.stroke()
        }
        ctx.restore()
      }
    }
    
    // Draw scanning line
    const drawScanLine = (ctx, time) => {
      const scanY = (time * 0.3) % (height + 200) - 100
      const gradient = ctx.createLinearGradient(0, scanY, 0, scanY + 50)
      gradient.addColorStop(0, 'transparent')
      gradient.addColorStop(0.5, 'rgba(0, 212, 255, 0.3)')
      gradient.addColorStop(1, 'transparent')
      
      ctx.fillStyle = gradient
      ctx.fillRect(0, scanY, width, 50)
    }
    
    // Draw glitch effect
    const drawGlitch = (ctx, time) => {
      if (Math.random() < 0.005) {
        const glitchY = Math.random() * height
        const glitchHeight = 20 + Math.random() * 50
        
        ctx.fillStyle = `rgba(255, 0, 255, ${Math.random() * 0.3})`
        ctx.fillRect(0, glitchY, width, glitchHeight)
        
        ctx.fillStyle = `rgba(0, 255, 255, ${Math.random() * 0.3})`
        ctx.fillRect(0, glitchY + glitchHeight, width, glitchHeight)
      }
    }
    
    // Animation loop
    const animate = () => {
      timeRef.current += 1
      const time = timeRef.current
      
      ctx.clearRect(0, 0, width, height)
      
      // Dark gradient background
      const gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, '#0a0a0f')
      gradient.addColorStop(0.5, '#0f0f1a')
      gradient.addColorStop(1, '#0a0a0f')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
      
      // Draw all effects
      drawOrbs(ctx, time)
      drawLines(ctx, particlesRef.current, time)
      drawShapes(ctx, time)
      drawScanLine(ctx, time)
      drawGlitch(ctx, time)
      
      // Update and draw particles
      particlesRef.current.forEach(particle => {
        particle.update(time)
        particle.draw(ctx)
      })
      
      animationRef.current = requestAnimationFrame(animate)
    }
    
    // Handle resize
    const handleResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
      particlesRef.current = initParticles()
    }
    
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

export default ParticleBackground
