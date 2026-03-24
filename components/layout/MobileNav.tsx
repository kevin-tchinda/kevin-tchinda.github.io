"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sparkles, Home, Code, Folder, User, Mail } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { motion, AnimatePresence } from "framer-motion"

const mobileNavItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Demos", href: "/demos", icon: Code },
  { name: "Projects", href: "/projects", icon: Folder },
  { name: "About", href: "/about", icon: User },
  { name: "Contact", href: "/contact", icon: Mail },
]

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden overflow-hidden border-b"
        >
          <div className="container py-4">
            <nav className="flex flex-col space-y-2">
              {mobileNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-accent/10 hover:text-accent"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
              
              <div className="pt-4">
                <Button
                  variant="gradient"
                  className="w-full"
                  asChild
                >
                  <Link href="/contact" onClick={onClose}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Start a Project
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}