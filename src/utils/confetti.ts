function playSound(audioFile: string) {
  try {
    const audio = new Audio(audioFile)
    audio.volume = 0.7 // Set volume to 70%
    audio.playbackRate = 0.8 // Slow down to 80% speed
    audio.play().catch((e) => console.log('Audio play failed:', e))
  } catch (e) {
    console.log('Audio loading failed:', e)
  }
}

export function triggerConfetti(playMusic: boolean = true) {
  // Play celebration sounds only if music is enabled
  if (playMusic) {
    playSound('/crowd cheering.mp3')
    playSound('/trumpet.mp3')
  }

  const colors = ['', 'blue', 'yellow', 'purple', 'pink', 'green']
  const confettiCount = 200

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div')
    confetti.className = `confetti ${colors[Math.floor(Math.random() * colors.length)]}`

    // Random starting position across the top of the screen
    const startX = Math.random() * window.innerWidth
    const startY = -50 // Start above the visible area

    confetti.style.left = startX + 'px'
    confetti.style.top = startY + 'px'

    document.body.appendChild(confetti)

    // Animate the confetti falling from top
    const animation = confetti.animate(
      [
        {
          transform: `translate(0, 0) rotate(0deg)`,
          opacity: 1,
        },
        {
          transform: `translate(${(Math.random() - 0.5) * 200}px, ${window.innerHeight + 100}px) rotate(${Math.random() * 720}deg)`,
          opacity: 0.8,
        },
      ],
      {
        duration: 3000 + Math.random() * 2000,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }
    )

    // Remove the confetti element after animation
    animation.addEventListener('finish', () => {
      confetti.remove()
    })
  }
}
