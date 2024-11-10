'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { FaTwitter, FaFacebook, FaLinkedin, FaUtensils, FaMotorcycle, FaMobileAlt } from 'react-icons/fa'
import confetti from 'canvas-confetti'
import emailjs from '@emailjs/browser'

emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY as string);

export default function WaitlistPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [popupMessage, setPopupMessage] = useState('')
  const [mounted, setMounted] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!validateEmail(email)) {
      setPopupMessage('Abeg, put correct email address.')
      setShowPopup(true)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      })

      const data = await response.json()

      if (response.ok) {
        setPopupMessage('You don successfully join our waitlist! Check your email to verify.')
        setShowPopup(true)
        setShowVerification(true)
      } else {
        setPopupMessage(data.error || 'Something don go wrong. Abeg try again.')
        setShowPopup(true)
      }
    } catch (error) {
      setPopupMessage('Something don go wrong. Abeg try again.')
      setShowPopup(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, verificationCode }),
      })

      const data = await response.json()

      if (response.ok) {
        setPopupMessage('Your email don verify successfully!')
        setShowPopup(true)
        setShowVerification(false)
        setName('')
        setEmail('')
        setVerificationCode('')
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
      } else {
        setPopupMessage(data.error || 'Verification no work. Abeg try again.')
        setShowPopup(true)
      }
    } catch (error) {
      setPopupMessage('Something don go wrong. Abeg try again.')
      setShowPopup(true)
    } finally {
      setIsLoading(false)
    }
  }

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return re.test(email)
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <div className="absolute inset-0">
        <AnimatedBackground />
      </div>
      <header className="w-full max-w-4xl text-center mb-12 z-10">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text"
        >
          Chop Beta for Uyo
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl mb-8"
        >
          Order the best local food for quick delivery right to your doorstep!
        </motion.p>
      </header>

      <main className="w-full max-w-4xl z-10 flex flex-col md:flex-row gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 backdrop-blur-lg bg-opacity-30 bg-white dark:bg-opacity-30 dark:bg-gray-800 p-8 rounded-lg shadow-lg"
        >
          <h2 className="text-3xl font-bold mb-6 text-center">Join Our Waitlist!</h2>
          <p className="text-lg mb-8 text-center">
            You wan chop beta Uyo food without stress? Join our waitlist make you be first to know when we launch!
          </p>
          {!showVerification ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full p-3 bg-opacity-50 bg-white dark:bg-opacity-50 dark:bg-gray-700 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full p-3 bg-opacity-50 bg-white dark:bg-opacity-50 dark:bg-gray-700 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md font-bold transition duration-300 ease-in-out hover:from-purple-600 hover:to-pink-600"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Dey process...' : 'Join Waitlist'}
              </motion.button>
            </form>
          ) : (
            <form onSubmit={handleVerification} className="space-y-4">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter verification code"
                className="w-full p-3 bg-opacity-50 bg-white dark:bg-opacity-50 dark:bg-gray-700 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md font-bold transition duration-300 ease-in-out hover:from-purple-600 hover:to-pink-600"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Dey verify...' : 'Verify Email'}
              </motion.button>
            </form>
          )}
          <div className="mt-6 flex justify-center space-x-4">
            <motion.a
              href={`https://twitter.com/intent/tweet?text=Check out this awesome food ordering app for Uyo!&url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaTwitter className="text-2xl text-blue-400" />
            </motion.a>
            <motion.a
              href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaFacebook className="text-2xl text-blue-600" />
            </motion.a>
            <motion.a
              href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaLinkedin className="text-2xl text-blue-800" />
            </motion.a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 backdrop-blur-lg bg-opacity-30 bg-white dark:bg-opacity-30 dark:bg-gray-800 p-8 rounded-lg shadow-lg"
        >
          <h2 className="text-3xl font-bold mb-6 text-center">Why Choose Us?</h2>
          <ul className="space-y-4">
            <li className="flex items-center">
              <FaUtensils className="mr-4 text-2xl text-yellow-500" />
              <span>Order the best local food from top Uyo restaurants</span>
            </li>
            <li className="flex items-center">
              <FaMotorcycle className="mr-4 text-2xl  text-green-500" />
              <span>Quick delivery straight to your doorstep</span>
            </li>
            <li className="flex items-center">
              <FaMobileAlt className="mr-4 text-2xl text-blue-500" />
              <span>Easy to use web app to order anytime</span>
            </li>
          </ul>
          <div className="mt-8">
            <h3 className="text-2xl font-bold mb-4">Popular Dishes You Fit Order</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Afang Soup with correct eba</li>
              <li>Edikang Ikong with fufu</li>
              <li>Fisherman Soup wey go make you lick your fingers</li>
              <li>Uyo special pepper soup, Etc</li>
            </ul>
          </div>
          <div className="mt-8 p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> We currently serve ONLY Uyo based customers but no worry, we get everybody for mind
            </p>
          </div>
        </motion.div>
      </main>

      <footer className="w-full max-w-4xl mt-12 text-center z-10">
        <p className="text-sm text-gray-500">
          © 2024 Chop Beta for Uyo. All rights reserved. 
          <br />
          We no dey only deliver food, we dey deliver happiness for your belle!
        </p>
      </footer>

      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
          >
            <div className="bg-white dark:bg-gray-800 text-black dark:text-white p-8 rounded-md shadow-lg max-w-md w-full">
              <p className="text-xl mb-4">{popupMessage}</p>
              <button
                onClick={() => setShowPopup(false)}
                className="w-full p-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {mounted && (
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="fixed top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-800"
        >
          {theme === 'dark' ? '🌞' : '🌙'}
        </button>
      )}
      <FloatingEmoji />
      <SocialProof />
    </div>
  )
}

function AnimatedBackground() {
  return (
    <div className="absolute inset-0">
      {[...Array(100)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-purple-500 rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            repeat: Infinity,
            duration: Math.random() * 5 + 5,
            delay: Math.random() * 5,
          }}
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 4 + 1}px`,
            height: `${Math.random() * 4 + 1}px`,
          }}
        />
      ))}
    </div>
  )
}

function FloatingEmoji() {
  const emojis = ['🍽️', '🍗', '🍚', '🌶️', '🥘', '🏍️']
  return (
    <>
      {emojis.map((emoji, index) => (
        <motion.div
          key={index}
          className="fixed text-4xl"
          animate={{
            y: [0, -20, 0],
            x: [0, 10, -10, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: index * 0.5,
          }}
          style={{
            top: `${20 + index * 15}%`,
            left: `${10 + index * 20}%`,
          }}
        >
          {emoji}
        </motion.div>
      ))}
    </>
  )
}

function SocialProof() {
  const [show, setShow] = useState(false)
  const messages = [
    "Oga John just join our waitlist for Uyo sharp sharp delivery! 🎉",
    "Aunty Mary don sign up to order Afang Soup! 😋",
    "Okon can't wait to get his Edikang Ikong delivered! 🍲",
    "Mma Ekaette dey excited to order Uyo pepper soup! 🌶️",
    "Uncle Chinedu don join to get quick food delivery for Uyo! 🏍️"
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setShow(true)
      setTimeout(() => setShow(false), 3000)
    }, 10000)

    return () => clearInterval(timer)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-4 bg-white dark:bg-gray-800 text-black dark:text-white p-4 rounded-md shadow-lg"
        >
          <p>{messages[Math.floor(Math.random() * messages.length)]}</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

