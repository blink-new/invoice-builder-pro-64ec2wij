import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '../lib/utils'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet'
import { blink } from '../lib/blink'
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  CreditCard, 
  Mail,
  Menu,
  LogOut,
  User,
  Plus,
  PieChart,
  Receipt,
  TrendingUp
} from 'lucide-react'

const navigation = [
  { name: 'Financial Dashboard', href: '/financial-dashboard', icon: PieChart },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Expenses', href: '/expenses', icon: Receipt },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Payment Setup', href: '/payment-setup', icon: CreditCard },
  { name: 'Email Templates', href: '/email-templates', icon: Mail },
  { name: 'Settings', href: '/settings', icon: Settings },
]

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    blink.auth.logout()
  }

  const NavItems = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navigation.map((item) => {
        const isActive = location.pathname === item.href
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={() => mobile && setMobileMenuOpen(false)}
            className={cn(
              'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </Link>
        )
      })}
    </>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">FinanceFlow Pro</h1>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex-grow flex flex-col">
            <nav className="flex-1 px-4 space-y-1">
              <NavItems />
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="lg:hidden">
        {/* Demo Banner Mobile */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 text-center text-sm">
          <span className="font-medium">🚀 Demo Mode:</span> Complete Financial Management System for Freelancers & Small Business
        </div>
        
        <div className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">FinanceFlow Pro</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <Link to="/invoices/new">
                <Plus className="h-4 w-4 mr-1" />
                New Invoice
              </Link>
            </Button>
            
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <nav className="flex flex-col space-y-1 mt-6">
                  <NavItems mobile />
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Demo Banner */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 text-center text-sm">
          <span className="font-medium">🚀 Demo Mode:</span> Complete Financial Management System for Freelancers & Small Business. 
          <span className="ml-2 opacity-90">Track expenses, manage invoices, monitor cash flow, and grow your business!</span>
        </div>
        
        {/* Top bar */}
        <div className="hidden lg:flex lg:items-center lg:justify-between lg:bg-white lg:border-b lg:border-gray-200 lg:px-6 lg:py-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 capitalize">
              {location.pathname.split('/')[1] || 'Dashboard'}
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="default"
              size="sm"
              asChild
            >
              <Link to="/invoices/new">
                <Plus className="h-4 w-4 mr-1" />
                New Invoice
              </Link>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt="User" />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}