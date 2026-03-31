import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/global.css'
import './styles/animations.css'

// Create meteor shower effect
const createMeteors = () => {
  const meteorCount = 8
  for (let i = 0; i < meteorCount; i++) {
    const meteor = document.createElement('div')
    meteor.className = 'meteor'
    meteor.style.left = `${Math.random() * 100}%`
    meteor.style.top = `${Math.random() * 100}%`
    meteor.style.animationDuration = `${Math.random() * 2 + 2}s`
    meteor.style.animationDelay = `${Math.random() * 5}s`
    document.body.appendChild(meteor)
  }
}

// Create galaxy background
const createGalaxy = () => {
  const galaxy = document.createElement('div')
  galaxy.className = 'galaxy-bg'
  document.body.appendChild(galaxy)
}

// Create confetti effect on success
const createConfetti = () => {
  const colors = ['#00d4ff', '#00ffaa', '#ff6b6b', '#ffd93d']
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div')
    confetti.style.position = 'fixed'
    confetti.style.left = `${Math.random() * 100}%`
    confetti.style.top = '-20px'
    confetti.style.width = `${Math.random() * 8 + 4}px`
    confetti.style.height = `${Math.random() * 8 + 4}px`
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)]
    confetti.style.borderRadius = '50%'
    confetti.style.pointerEvents = 'none'
    confetti.style.zIndex = '9999'
    confetti.style.animation = `confetti ${Math.random() * 2 + 2}s linear forwards`
    confetti.style.animationDelay = `${Math.random() * 0.5}s`
    document.body.appendChild(confetti)
    setTimeout(() => confetti.remove(), 3000)
  }
}

// Add click effect with confetti
const addCelebrationEffect = () => {
  const celebrationElements = document.querySelectorAll('.celebrate-on-click')
  celebrationElements.forEach(el => {
    el.addEventListener('click', () => {
      createConfetti()
    })
  })
}

// Scroll reveal with animation
const initScrollReveal = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed')
        // Add bounce effect when revealed
        entry.target.style.animation = 'none'
        setTimeout(() => {
          entry.target.style.animation = ''
        }, 10)
      }
    })
  }, { threshold: 0.1, rootMargin: '50px' })
  
  document.querySelectorAll('.scroll-reveal, .reveal-on-scroll').forEach(el => observer.observe(el))
}

// Add 3D tilt effect to cards
const addTiltEffect = () => {
  const cards = document.querySelectorAll('.card, .product-card, .stat-card')
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      card.style.transform = `perspective(1000px) rotateX(${y * 5}deg) rotateY(${x * 5}deg) translateY(-5px)`
    })
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)'
    })
  })
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  createMeteors()
  createGalaxy()
  initScrollReveal()
  addTiltEffect()
  addCelebrationEffect()
  
  // Re-run on dynamic content
  const observer = new MutationObserver(() => {
    addTiltEffect()
    addCelebrationEffect()
  })
  observer.observe(document.body, { childList: true, subtree: true })
})

// Make createConfetti available globally
window.createConfetti = createConfetti

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)