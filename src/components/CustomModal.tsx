'use client'

import React, { useEffect } from 'react'
import Modal from 'react-modal'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface CustomModalProps {
  isOpen: boolean
  onRequestClose: () => void
  title: string
  description: React.ReactNode
  onConfirm: () => void
  confirmText: string
  cancelText?: string
  hideCancelButton?: boolean
  hideConfirmButton?: boolean
  confirmDisabled?: boolean
}

const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  onRequestClose,
  title,
  description,
  onConfirm,
  confirmText,
  cancelText = 'Cancel',
  hideCancelButton = false,
  hideConfirmButton = false,
  confirmDisabled = false,
}) => {
  // Set the app element for react-modal when the component mounts
  useEffect(() => {
    // Ensure this only runs in the browser
    if (typeof window !== 'undefined') {
      // Try to find the root element for Next.js app router
      let appElement = document.getElementById('__next') || document.getElementById('root')
      
      // If neither exists, try to find the main element or body
      if (!appElement) {
        appElement = document.querySelector('main') || document.body
      }
      
      if (appElement) {
        Modal.setAppElement(appElement)
      } else {
        console.warn('Could not find app element for react-modal.')
      }
    }
  }, []) // Empty dependency array ensures this runs only once on mount

  // Animation variants for Framer Motion
  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30,
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.2,
      },
    },
  }

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  }

  // Custom styles for react-modal
  const customStyles = {
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      zIndex: 1000,
    },
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      border: 'none',
      padding: 0,
      borderRadius: '16px',
      background: 'transparent',
      maxWidth: '90%',
      width: '400px',
      overflow: 'visible',
    },
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel={title}
      closeTimeoutMS={200}
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
      ariaHideApp={false}
    >
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Animation */}
            <motion.div
              className="fixed inset-0 bg-black/60"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            />

            {/* Modal Content Animation */}
            <motion.div
              className="relative bg-white rounded-lg shadow-2xl p-6"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Close Button */}
              <button
                onClick={onRequestClose}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>

              {/* Modal Description */}
              <div className="text-gray-600 mb-6">
                {typeof description === 'string' ? <p>{description}</p> : description}
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3">
                {
                  !hideCancelButton && (
                    <button
                      onClick={onRequestClose}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      {cancelText}
                    </button>
                  )
                }
                {!hideConfirmButton && (
                  <button
                    onClick={onConfirm}
                    disabled={confirmDisabled}
                    className={`px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg transition-colors ${
                      confirmDisabled 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:from-indigo-700 hover:to-purple-700'
                    }`}
                  >
                    {confirmText}
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Modal>
  )
}

export default CustomModal