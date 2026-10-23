"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";

interface AnimatedFooterProps {
  onScrollToBuilder?: () => void;
  onOpenStudio?: () => void;
  onSelectPrompt?: (promptText: string) => void;
  brandTitle?: string;
  tagline?: string;
  giantText?: string;
}

const XIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.09c.92 0 1.66-.74 1.66-1.66 0-.91-.74-1.66-1.66-1.66-.91 0-1.66.75-1.66 1.66 0 .92.75 1.66 1.66 1.66m1.39 9.91v-8.37H5.07v8.37h2.78z" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export function AnimatedFooter({
  onScrollToBuilder,
  onOpenStudio,
  brandTitle = "SokoAI",
  tagline = "Best AI Powered African E-commerce Platform",
  giantText = "Soko AI",
}: AnimatedFooterProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <footer className="relative z-10 w-full bg-[#050505] border-t border-white/[0.08] text-neutral-400 overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-20 sm:pt-24 pb-0">
        
        {/* Top Section: Brand Left & 4 Columns Right */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start"
        >
          {/* Brand Info (Left Side) */}
          <motion.div variants={itemVariants} className="lg:col-span-5 space-y-3 text-left">
            <h3 className="text-2xl font-bold tracking-tight text-white">
              {brandTitle}
            </h3>
            <p className="text-xs text-neutral-400 font-normal leading-relaxed max-w-sm">
              {tagline}
            </p>

            {/* Social Icons (X, LinkedIn, Facebook) */}
            <div className="flex items-center gap-4 text-neutral-400 pt-3">
              <motion.a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.15, color: "#ffffff" }}
                whileTap={{ scale: 0.95 }}
                className="hover:text-white transition-colors cursor-pointer"
                aria-label="X (Twitter)"
              >
                <XIcon />
              </motion.a>
              <motion.a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.15, color: "#ffffff" }}
                whileTap={{ scale: 0.95 }}
                className="hover:text-white transition-colors cursor-pointer"
                aria-label="LinkedIn"
              >
                <LinkedInIcon />
              </motion.a>
              <motion.a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.15, color: "#ffffff" }}
                whileTap={{ scale: 0.95 }}
                className="hover:text-white transition-colors cursor-pointer"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </motion.a>
            </div>
          </motion.div>

          {/* 4 Clean Minimal Columns (Right Side) */}
          <motion.div variants={itemVariants} className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-8 text-left">
            {/* Column 1: Quick Links */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-white tracking-tight">
                Quick Links
              </h4>
              <ul className="space-y-3 text-xs text-neutral-400 font-normal">
                <li>
                  <button onClick={onScrollToBuilder} className="hover:text-white transition-colors cursor-pointer text-left">
                    Features
                  </button>
                </li>
                <li>
                  <a href="#solutions" className="hover:text-white transition-colors">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Changelog
                  </span>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Roadmap
                  </span>
                </li>
              </ul>
            </div>

            {/* Column 2: Company */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-white tracking-tight">
                Company
              </h4>
              <ul className="space-y-3 text-xs text-neutral-400 font-normal">
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Our team
                  </span>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Our values
                  </span>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Blog
                  </span>
                </li>
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-white tracking-tight">
                Resources
              </h4>
              <ul className="space-y-3 text-xs text-neutral-400 font-normal">
                <li>
                  <button onClick={onOpenStudio} className="hover:text-white transition-colors cursor-pointer text-left">
                    Downloads
                  </button>
                </li>
                <li>
                  <a href="#docs" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Legal */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-white tracking-tight">
                Legal
              </h4>
              <ul className="space-y-3 text-xs text-neutral-400 font-normal">
                <li>
                  <a href="#terms" className="hover:text-white transition-colors">
                    Terms of services
                  </a>
                </li>
                <li>
                  <a href="#license" className="hover:text-white transition-colors">
                    License
                  </a>
                </li>
                <li>
                  <a href="#privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </motion.div>
        </motion.div>

        {/* Subtle Horizontal Divider */}
        <div className="border-t border-white/[0.08] my-10 sm:my-14" />

        {/* Sub-Footer Row: Legal Inline Left & Copyright Right */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400 font-normal">
          <div className="flex items-center gap-6">
            <a href="#terms" className="hover:text-neutral-200 transition-colors">
              Terms of services
            </a>
            <a href="#license" className="hover:text-neutral-200 transition-colors">
              License
            </a>
            <a href="#privacy" className="hover:text-neutral-200 transition-colors">
              Privacy Policy
            </a>
          </div>

          <div>
            <span>© 2026 {brandTitle}, Inc. All rights reserved.</span>
          </div>
        </div>

        {/* Grand Bottom Oversized Monumental Text */}
        <div className="w-full overflow-hidden flex justify-center items-end mt-12 sm:mt-18 pt-6 select-none pointer-events-none">
          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="text-[13vw] sm:text-[15vw] md:text-[16.5vw] font-bold tracking-tight text-white leading-none whitespace-nowrap translate-y-2 sm:translate-y-4"
          >
            {giantText}
          </motion.h1>
        </div>

      </div>
    </footer>
  );
}

export default AnimatedFooter;
