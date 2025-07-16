import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { blink } from '../lib/blink'
import { toast } from 'sonner'
import { FileText, Zap, Shield, CreditCard } from 'lucide-react'

export default function Login() {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = () => {
    setIsLoading(true)
    try {
      blink.auth.login()
    } catch (error) {
      toast.error('Login failed. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Hero */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900">
              Invoice Builder
              <span className="text-primary"> Pro</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-lg">
              Complete invoicing solution with automated reminders, multiple payment gateways, and customizable templates.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Smart Invoicing</h3>
                <p className="text-xs text-gray-600">Create & send professional invoices</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Zap className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Auto Reminders</h3>
                <p className="text-xs text-gray-600">Automated follow-ups & thank you notes</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Multi-Gateway</h3>
                <p className="text-xs text-gray-600">Stripe, PayPal, Wise & more</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Secure & Fast</h3>
                <p className="text-xs text-gray-600">Enterprise-grade security</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to access your invoice management dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full h-12 text-base font-medium"
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In with Blink'
                )}
              </Button>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Secure authentication powered by Blink
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}