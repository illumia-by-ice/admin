"use client"
\
<CodeProject id="admin-dashboard">

```tsx file="app/dashboard/settings/page.tsx"
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Bell, CreditCard, Globe, Mail, Save, Upload, Users } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SettingsPage() {
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "Property Management System",
    siteDescription: "A comprehensive platform for managing properties, products, and services",
    contactEmail: "admin@example.com",
    supportPhone: "+2348012345678",
    currency: "NGN",
    language: "en",
    timezone: "Africa/Lagos",
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    newUserAlerts: true,
    newPropertyAlerts: true,
    paymentAlerts: true,
    systemUpdates: true,
  })

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    passwordExpiry: "90",
    loginAttempts: "5",
    sessionTimeout: "30",
  })

  const [paymentSettings, setPaymentSettings] = useState({
    paymentGateway: "paystack",
    testMode: true,
    autoWithdrawal: false,
    withdrawalThreshold: "10000",
    transactionFee: "2.5",
  })

  const { toast } = useToast()

  const handleSaveGeneralSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your general settings have been saved successfully",
    })
  }

  const handleSaveNotificationSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your notification settings have been saved successfully",
    })
  }

  const handleSaveSecuritySettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your security settings have been saved successfully",
    })
  }

  const handleSavePaymentSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your payment settings have been saved successfully",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your application settings and preferences</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card className="border-none shadow-md">
            <CardHeader className="bg-muted/30">
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your basic application settings</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="site-name">Site Name</Label>
                    <Input
                      id="site-name"
                      value={generalSettings.siteName}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Contact Email</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={generalSettings.contactEmail}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="site-description">Site Description</Label>
                  <Textarea
                    id="site-description"
                    rows={3}
                    value={generalSettings.siteDescription}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, siteDescription: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="support-phone">Support Phone</Label>
                    <Input
                      id="support-phone"
                      value={generalSettings.supportPhone}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, supportPhone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Default Currency</Label>
                    <Select
                      value={generalSettings.currency}
                      onValueChange={(value) => setGeneralSettings({ ...generalSettings, currency: value })}
                    >
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NGN">Nigerian Naira (₦)</SelectItem>
                        <SelectItem value="USD">US Dollar ($)</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                        <SelectItem value="GBP">British Pound (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="language">Default Language</Label>
                    <Select
                      value={generalSettings.language}
                      onValueChange={(value) => setGeneralSettings({ ...generalSettings, language: value })}
                    >
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="ar">Arabic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={generalSettings.timezone}
                      onValueChange={(value) => setGeneralSettings({ ...generalSettings, timezone: value })}
                    >
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Africa/Lagos">Africa/Lagos (GMT+1)</SelectItem>
                        <SelectItem value="Europe/London">Europe/London (GMT+0)</SelectItem>
                        <SelectItem value="America/New_York">America/New_York (GMT-5)</SelectItem>
                        <SelectItem value="Asia/Dubai">Asia/Dubai (GMT+4)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 flex justify-end">
              <Button onClick={handleSaveGeneralSettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader className="bg-muted/30">
              <CardTitle>Company Profile</CardTitle>
              <CardDescription>Update your company information</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col gap-6 sm:flex-row">
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Company Logo" />
                    <AvatarFallback>CL</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Logo
                  </Button>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Company Name</Label>
                      <Input id="company-name" defaultValue="Property Management Ltd" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-email">Company Email</Label>
                      <Input id="company-email" type="email" defaultValue="info@propertymanagement.com" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="company-phone">Company Phone</Label>
                      <Input id="company-phone" defaultValue="+2348012345678" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-website">Company Website</Label>
                      <Input id="company-website" defaultValue="https://propertymanagement.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-address">Company Address</Label>
                    <Textarea id="company-address" defaultValue="15 Admiralty Way, Lekki Phase 1, Lagos, Nigeria" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 flex justify-end">
              <Button
                onClick={() => toast({ title: "Profile Saved", description: "Company profile has been updated" })}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Profile
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card className="border-none shadow-md">
            <CardHeader className="bg-muted/30">
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Card className="border">
                    <CardHeader>
                      <CardTitle className="text-base">Notification Channels</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor="email-notifications" className="text-sm">
                            Email Notifications
                          </Label>
                        </div>
                        <Switch
                          id="email-notifications"
                          checked={notificationSettings.emailNotifications}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                          }
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor="push-notifications" className="text-sm">
                            Push Notifications
                          </Label>
                        </div>
                        <Switch
                          id="push-notifications"
                          checked={notificationSettings.pushNotifications}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({ ...notificationSettings, pushNotifications: checked })
                          }
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor="marketing-emails" className="text-sm">
                            Marketing Emails
                          </Label>
                        </div>
                        <Switch
                          id="marketing-emails"
                          checked={notificationSettings.marketingEmails}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({ ...notificationSettings, marketingEmails: checked })
                          }
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor="sms-notifications" className="text-sm">
                            SMS Notifications
                          </Label>
                        </div>
                        <Switch
                          id="sms-notifications"
                          checked={notificationSettings.smsNotifications}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({ ...notificationSettings, smsNotifications: checked })
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border">
                    <CardHeader>
                      <CardTitle className="text-base">Notification Types</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor="new-user-alerts" className="text-sm">
                            New User Alerts
                          </Label>
                        </div>
                        <Switch
                          id="new-user-alerts"
                          checked={notificationSettings.newUserAlerts}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({ ...notificationSettings, newUserAlerts: checked })
                          }
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor="new-property-alerts" className="text-sm">
                            New Property Alerts
                          </Label>
                        </div>
                        <Switch
                          id="new-property-alerts"
                          checked={notificationSettings.newPropertyAlerts}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({ ...notificationSettings, newPropertyAlerts: checked })
                          }
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor="payment-alerts" className="text-sm">
                            Payment Alerts
                          </Label>
                        </div>
                        <Switch
                          id="payment-alerts"
                          checked={notificationSettings.paymentAlerts}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({ ...notificationSettings, paymentAlerts: checked })
                          }
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor="system-updates" className="text-sm">
                            System Updates
                          </Label>
                        </div>
                        <Switch
                          id="system-updates"
                          checked={notificationSettings.systemUpdates}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({ ...notificationSettings, systemUpdates: checked })
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border">
                  <CardHeader>
                    <CardTitle className="text-base">Email Template Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="email-sender">Email Sender Name</Label>
                        <Input id="email-sender" defaultValue="Property Management System" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reply-to">Reply-To Email</Label>
                        <Input id="reply-to" type="email" defaultValue="noreply@propertymanagement.com" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-footer">Email Footer Text</Label>
                      <Textarea
                        id="email-footer"
                        rows={2}
                        defaultValue="© 2023 Property Management System. All rights reserved."
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 flex justify-end">
              <Button onClick={handleSaveNotificationSettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card className="border-none shadow-md">
            <CardHeader className="bg-muted/30">
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your security preferences</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <Card className="border">
                  <CardHeader>
                    <CardTitle className="text-base">Authentication Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="two-factor-auth" className="text-base">
                          Two-Factor Authentication
                        </Label>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                      </div>
                      <Switch
                        id="two-factor-auth"
                        checked={securitySettings.twoFactorAuth}
                        onCheckedChange={(checked) =>
                          setSecuritySettings({ ...securitySettings, twoFactorAuth: checked })
                        }
                      />
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="password-expiry">Password Expiry (days)</Label>
                        <Select
                          value={securitySettings.passwordExpiry}
                          onValueChange={(value) => setSecuritySettings({ ...securitySettings, passwordExpiry: value })}
                        >
                          <SelectTrigger id="password-expiry">
                            <SelectValue placeholder="Select days" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 days</SelectItem>
                            <SelectItem value="60">60 days</SelectItem>
                            <SelectItem value="90">90 days</SelectItem>
                            <SelectItem value="180">180 days</SelectItem>
                            <SelectItem value="never">Never</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-attempts">Max Login Attempts</Label>
                        <Select
                          value={securitySettings.loginAttempts}
                          onValueChange={(value) => setSecuritySettings({ ...securitySettings, loginAttempts: value })}
                        >
                          <SelectTrigger id="login-attempts">
                            <SelectValue placeholder="Select attempts" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">3 attempts</SelectItem>
                            <SelectItem value="5">5 attempts</SelectItem>
                            <SelectItem value="10">10 attempts</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                      <Select
                        value={securitySettings.sessionTimeout}
                        onValueChange={(value) => setSecuritySettings({ ...securitySettings, sessionTimeout: value })}
                      >
                        <SelectTrigger id="session-timeout">
                          <SelectValue placeholder="Select timeout" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                          <SelectItem value="120">120 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border">
                  <CardHeader>
                    <CardTitle className="text-base">Password Policy</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Minimum Password Length</Label>
                        <p className="text-xs text-muted-foreground">Minimum 8 characters required</p>
                      </div>
                      <Badge>8 characters</Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Require Uppercase Letters</Label>
                        <p className="text-xs text-muted-foreground">At least one uppercase letter</p>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      >
                        Enabled
                      </Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Require Numbers</Label>
                        <p className="text-xs text-muted-foreground">At least one number</p>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      >
                        Enabled
                      </Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Require Special Characters</Label>
                        <p className="text-xs text-muted-foreground">At least one special character</p>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      >
                        Enabled
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Security Recommendation</AlertTitle>
                  <AlertDescription>
                    We recommend enabling two-factor authentication for enhanced account security.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 flex justify-end">
              <Button onClick={handleSaveSecuritySettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payments" className="space-y-4">
          <Card className="border-none shadow-md">
            <CardHeader className="bg-muted/30">
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>Configure your payment processing settings</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <Card className="border">
                  <CardHeader>
                    <CardTitle className="text-base">Payment Gateway</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="payment-gateway">Select Payment Gateway</Label>
                      <Select
                        value={paymentSettings.paymentGateway}
                        onValueChange={(value) => setPaymentSettings({ ...paymentSettings, paymentGateway: value })}
                      >
                        <SelectTrigger id="payment-gateway">
                          <SelectValue placeholder="Select gateway" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paystack">Paystack</SelectItem>
                          <SelectItem value="flutterwave">Flutterwave</SelectItem>
                          <SelectItem value="stripe">Stripe</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="test-mode" className="text-base">
                          Test Mode
                        </Label>
                        <p className="text-sm text-muted-foreground">Use test credentials for payment processing</p>
                      </div>
                      <Switch
                        id="test-mode"
                        checked={paymentSettings.testMode}
                        onCheckedChange={(checked) => setPaymentSettings({ ...paymentSettings, testMode: checked })}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="public-key">Public Key</Label>
                        <Input id="public-key" type="password" defaultValue="pk_test_1234567890" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="secret-key">Secret Key</Label>
                        <Input id="secret-key" type="password" defaultValue="sk_test_1234567890" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border">
                  <CardHeader>
                    <CardTitle className="text-base">Transaction Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="transaction-fee">Transaction Fee (%)</Label>
                        <Input
                          id="transaction-fee"
                          type="number"
                          value={paymentSettings.transactionFee}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, transactionFee: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="default-currency">Default Currency</Label>
                        <Select defaultValue="NGN">
                          <SelectTrigger id="default-currency">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NGN">Nigerian Naira (₦)</SelectItem>
                            <SelectItem value="USD">US Dollar ($)</SelectItem>
                            <SelectItem value="EUR">Euro (€)</SelectItem>
                            <SelectItem value="GBP">British Pound (£)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="auto-withdrawal" className="text-base">
                          Automatic Withdrawal
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically process withdrawals when threshold is reached
                        </p>
                      </div>
                      <Switch
                        id="auto-withdrawal"
                        checked={paymentSettings.autoWithdrawal}
                        onCheckedChange={(checked) =>
                          setPaymentSettings({ ...paymentSettings, autoWithdrawal: checked })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="withdrawal-threshold">Withdrawal Threshold (₦)</Label>
                      <Input
                        id="withdrawal-threshold"
                        type="number"
                        value={paymentSettings.withdrawalThreshold}
                        onChange={(e) =>
                          setPaymentSettings({ ...paymentSettings, withdrawalThreshold: e.target.value })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border">
                  <CardHeader>
                    <CardTitle className="text-base">Payment Notifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Payment Success Notifications</Label>
                        <p className="text-xs text-muted-foreground">Send notifications on successful payments</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Payment Failure Notifications</Label>
                        <p className="text-xs text-muted-foreground">Send notifications on failed payments</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Withdrawal Notifications</Label>
                        <p className="text-xs text-muted-foreground">Send notifications on withdrawals</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 flex justify-end">
              <Button onClick={handleSavePaymentSettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
