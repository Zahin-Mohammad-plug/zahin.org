"use client"

import { Github, Linkedin, Mail } from "lucide-react"

export default function ContactLinks() {
  return (
    <div className="fixed top-4 left-4 md:bottom-6 md:left-6 md:top-auto z-50 flex items-center gap-2 md:gap-3">
      <a
        href="https://github.com/Zahin-Mohammad-plug"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:bg-white/15 hover:scale-110 hover:border-white/40"
        aria-label="GitHub"
      >
        <Github className="h-4 w-4 md:h-5 md:w-5 text-gray-300 transition-colors group-hover:text-white" />
      </a>
      <a
        href="https://www.linkedin.com/in/zahin-mohammad/"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:bg-white/15 hover:scale-110 hover:border-white/40"
        aria-label="LinkedIn"
      >
        <Linkedin className="h-4 w-4 md:h-5 md:w-5 text-gray-300 transition-colors group-hover:text-white" />
      </a>
      <a
        href="mailto:zahin@zahin.org"
        className="group flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:bg-white/15 hover:scale-110 hover:border-white/40"
        aria-label="Email"
      >
        <Mail className="h-4 w-4 md:h-5 md:w-5 text-gray-300 transition-colors group-hover:text-white" />
      </a>
    </div>
  )
}
