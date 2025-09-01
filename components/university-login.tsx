"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  GraduationCap,
  Shield,
  Users,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Mail,
  RefreshCw,
  ArrowLeft,
  User,
  Trophy,
  BookOpen,
  Phone,
  Award as IdCard,
  Building,
  Calendar,
  Award,
  Target,
  Lightbulb,
  Star,
  Copy,
  Info,
} from "lucide-react"
import { useUniversityVoting } from "@/hooks/use-university-voting"
import WalletConnection from "@/components/wallet-connection"
import { useAccount, useChainId } from "wagmi"

type AuthMode = "signin" | "signup" | "verify"
type UserType = "voter" | "candidate" | "admin"

const BASE_SEPOLIA_CHAIN_ID = 84532

export default function UniversityLogin() {
  const { login, signup, verifyEmail, resendVerification, isLoading, error, positions } = useUniversityVoting()
  const { address, isConnected } = useAccount()
  const chainId = useChainId()

  const [authMode, setAuthMode] = useState<AuthMode>("signin")
  const [userType, setUserType] = useState<UserType>("voter")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [verificationCodeSent, setVerificationCodeSent] = useState("")

  const [walletError, setWalletError] = useState<string | null>(null)

  // Signin form state
  const [signinData, setSigninData] = useState({
    email: "",
    password: "",
    accessCode: "",
  })

  // Signup form state
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    matricNumber: "",
    department: "",
    year: "",
    program: "",
    phone: "",
    gpa: "",
    // Candidate specific fields
    contestingPosition: "",
    platform: "",
    experience: "",
    campaignPromises: ["", "", ""],
  })

  // Verification state
  const [verificationData, setVerificationData] = useState({
    email: "",
    code: "",
  })

  const [verificationStep, setVerificationStep] = useState<"email" | "code">("email")
  const [canResend, setCanResend] = useState(true)
  const [resendTimer, setResendTimer] = useState(0)

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault()
    setWalletError(null)

    // Wallet connection & network validation before attempting traditional login
    if (!isConnected || !address) {
      setWalletError("Please connect your wallet to continue. Connect using the wallet panel above.")
      return
    }

    if (!chainId || chainId !== BASE_SEPOLIA_CHAIN_ID) {
      setWalletError(`Please switch your wallet to Base Sepolia (chain ${BASE_SEPOLIA_CHAIN_ID}) before signing in.`)
      return
    }

    try {
      const success = await login(signinData.email, signinData.password, signinData.accessCode)
      if (success) {
        // Login successful, component will redirect based on user role
      }
    } catch (err: any) {
      if (err.message === "EMAIL_NOT_VERIFIED") {
        setVerificationData({ email: signinData.email, code: "" })
        setAuthMode("verify")
        setVerificationStep("code")
      }
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (signupData.password !== signupData.confirmPassword) {
      return
    }

    if (signupData.password.length < 8) {
      return
    }

    // Candidate validation
    if (userType === "candidate") {
      if (!signupData.contestingPosition) {
        return
      }
      if (!signupData.gpa || Number.parseFloat(signupData.gpa) < 2.5) {
        return
      }
      if (!signupData.platform.trim()) {
        return
      }
    }

    try {
      await signup({
        ...signupData,
        userType,
        studentId: signupData.matricNumber, // Map matricNumber to studentId for backend compatibility
        campaignPromises: signupData.campaignPromises.filter((p) => p.trim() !== ""),
      })
      setVerificationData({ email: signupData.email, code: "" })
      setAuthMode("verify")
      setVerificationStep("code")
    } catch (err) {
      // Error handled by context
    }
  }

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await verifyEmail(verificationData.email, verificationData.code)
      setAuthMode("signin")
      setSigninData({ ...signinData, email: verificationData.email })
    } catch (err) {
      // Error handled by context
    }
  }

  const handleResendCode = async () => {
    if (!canResend) return

    try {
      await resendVerification(verificationData.email)
      setCanResend(false)
      setResendTimer(60)

      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            setCanResend(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (err) {
      // Error handled by context
    }
  }

  const updateCampaignPromise = (index: number, value: string) => {
    setSignupData((prev) => ({
      ...prev,
      campaignPromises: prev.campaignPromises.map((promise, i) => (i === index ? value : promise)),
    }))
  }

  const getPositionRequirements = (positionId: string) => {
    const position = positions.find((p) => p.id === positionId)
    return position?.requirements
  }

  const isEligibleForPosition = (positionId: string) => {
    const requirements = getPositionRequirements(positionId)
    if (!requirements || !signupData.gpa || !signupData.year) return true

    const gpa = Number.parseFloat(signupData.gpa)
    const year = Number.parseInt(signupData.year)

    return gpa >= requirements.minGPA && year >= requirements.minAcademicYear && year <= requirements.maxAcademicYear
  }

  const getUserTypeColor = (type: UserType) => {
    switch (type) {
      case "voter":
        return "from-purple-500 to-green-600"
      case "candidate":
        return "from-cyan-500 to-blue-600"
      case "admin":
        return "from-orange-500 to-red-600"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  const getUserTypeIcon = (type: UserType) => {
    switch (type) {
      case "voter":
        return <Users className="h-5 w-5" />
      case "candidate":
        return <Trophy className="h-5 w-5" />
      case "admin":
        return <Shield className="h-5 w-5" />
      default:
        return <User className="h-5 w-5" />
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Tech University</h1>
          <p className="text-slate-300">Blockchain Voting System</p>
        </div>

        {/* Wallet Connection Panel - Prominent and responsive */}
        <div className="mb-6">
          <WalletConnection />
        </div>

        {/* Show a lightweight inline wallet/network status bar for quick visibility on the form */}
        <div className="mb-4">
          {!isConnected ? (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Wallet not connected. Connect your wallet above to authenticate and perform blockchain actions.
              </AlertDescription>
            </Alert>
          ) : chainId && chainId !== BASE_SEPOLIA_CHAIN_ID ? (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Connected to <strong>Chain {chainId}</strong>. Please switch to <strong>Base Sepolia</strong> (chain{" "}
                {BASE_SEPOLIA_CHAIN_ID}).
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Wallet connected: <span className="font-medium">{address ? `${address}` : "Unknown address"}</span>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-white flex items-center justify-center gap-2">
              {authMode === "signin" && (
                <>
                  {getUserTypeIcon(userType)}
                  Sign In as {userType.charAt(0).toUpperCase() + userType.slice(1)}
                </>
              )}
              {authMode === "signup" && (
                <>
                  {getUserTypeIcon(userType)}
                  Sign Up as {userType.charAt(0).toUpperCase() + userType.slice(1)}
                </>
              )}
              {authMode === "verify" && (
                <>
                  <Mail className="h-5 w-5" />
                  Verify Email
                </>
              )}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {authMode === "signin" && "Enter your credentials to access the voting system"}
              {authMode === "signup" && "Create your account to participate in elections"}
              {authMode === "verify" && "Check your email for the verification code"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert className="bg-red-900/50 border-red-700">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-200">{error}</AlertDescription>
              </Alert>
            )}

            {walletError && (
              <Alert className="bg-red-50 border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{walletError}</AlertDescription>
              </Alert>
            )}

            {/* User Type Selection (only for signup) */}
            {authMode === "signup" && (
              <div className="space-y-3">
                <Label className="text-slate-200">Account Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(["voter", "candidate"] as UserType[]).map((type) => (
                    <Button
                      key={type}
                      type="button"
                      variant={userType === type ? "default" : "outline"}
                      className={`h-auto p-3 flex flex-col items-center gap-2 ${
                        userType === type
                          ? `bg-gradient-to-r ${getUserTypeColor(type)} text-white border-transparent`
                          : "bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600/50 hover:text-white"
                      }`}
                      onClick={() => setUserType(type)}
                    >
                      {getUserTypeIcon(type)}
                      <span className="text-xs font-medium capitalize">{type}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Sign In Form */}
            {authMode === "signin" && (
              <form onSubmit={handleSignin} className="space-y-4">
                {/* User Type Selection for Sign In */}
                <div className="space-y-3">
                  <Label className="text-slate-200">Sign in as</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["voter", "candidate", "admin"] as UserType[]).map((type) => (
                      <Button
                        key={type}
                        type="button"
                        variant={userType === type ? "default" : "outline"}
                        className={`h-auto p-3 flex flex-col items-center gap-2 ${
                          userType === type
                            ? `bg-gradient-to-r ${getUserTypeColor(type)} text-white border-transparent`
                            : "bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600/50 hover:text-white"
                        }`}
                        onClick={() => setUserType(type)}
                      >
                        {getUserTypeIcon(type)}
                        <span className="text-xs font-medium capitalize">{type}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-200">
                    University Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={signinData.email}
                    onChange={(e) => setSigninData({ ...signinData, email: e.target.value })}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    placeholder="your.email@techuni.edu"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-200">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={signinData.password}
                      onChange={(e) => setSigninData({ ...signinData, password: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 pr-10"
                      placeholder="••••••••"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-slate-600/50 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {userType === "admin" && (
                  <div className="space-y-2">
                    <Label htmlFor="accessCode" className="text-slate-200">
                      Admin Access Code
                    </Label>
                    <Input
                      id="accessCode"
                      type="text"
                      value={signinData.accessCode}
                      onChange={(e) => setSigninData({ ...signinData, accessCode: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                      placeholder="ADM-XXXX-XXX"
                      required
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-gradient-to-r ${getUserTypeColor(userType)} hover:opacity-90 text-white`}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      {getUserTypeIcon(userType)}
                      <span className="ml-2">Sign In as {userType.charAt(0).toUpperCase() + userType.slice(1)}</span>
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-slate-400 hover:text-white hover:bg-slate-700/50"
                    onClick={() => setAuthMode("signup")}
                  >
                    Don't have an account? Sign up
                  </Button>
                </div>
              </form>
            )}

            {/* Sign Up Form */}
            {authMode === "signup" && (
              <form onSubmit={handleSignup} className="space-y-4">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-slate-200 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Full Name
                      </Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={signupData.fullName}
                        onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="matricNumber" className="text-slate-200 flex items-center gap-2">
                        <IdCard className="h-4 w-4" />
                        Matric Number
                      </Label>
                      <Input
                        id="matricNumber"
                        type="text"
                        value={signupData.matricNumber}
                        onChange={(e) => setSignupData({ ...signupData, matricNumber: e.target.value })}
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                        placeholder="TU/2024/001"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-200 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      University Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                      placeholder="john.doe@student.techuni.edu"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-slate-200 flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Department
                      </Label>
                      <Select
                        value={signupData.department}
                        onValueChange={(value) => setSignupData({ ...signupData, department: value })}
                      >
                        <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="Computer Science">Computer Science</SelectItem>
                          <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                          <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                          <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Management">Management</SelectItem>
                          <SelectItem value="Accounting">Accounting</SelectItem>
                          <SelectItem value="Psychology">Psychology</SelectItem>
                          <SelectItem value="Biology">Biology</SelectItem>
                          <SelectItem value="Chemistry">Chemistry</SelectItem>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="History">History</SelectItem>
                          <SelectItem value="Medicine">Medicine</SelectItem>
                          <SelectItem value="Nursing">Nursing</SelectItem>
                          <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                          <SelectItem value="Dentistry">Dentistry</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="year" className="text-slate-200 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Academic Year
                      </Label>
                      <Select
                        value={signupData.year}
                        onValueChange={(value) => setSignupData({ ...signupData, year: value })}
                      >
                        <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="1">1st Year</SelectItem>
                          <SelectItem value="2">2nd Year</SelectItem>
                          <SelectItem value="3">3rd Year</SelectItem>
                          <SelectItem value="4">4th Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="program" className="text-slate-200 flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Program/Major {userType === "candidate" && <span className="text-red-400">*</span>}
                      </Label>
                      <Input
                        id="program"
                        type="text"
                        value={signupData.program}
                        onChange={(e) => setSignupData({ ...signupData, program: e.target.value })}
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                        placeholder="Bachelor of Science"
                        required={userType === "candidate"}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gpa" className="text-slate-200 flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        CGPA {userType === "candidate" && <span className="text-red-400">*</span>}
                      </Label>
                      <Input
                        id="gpa"
                        type="number"
                        step="0.01"
                        min="0"
                        max="4.0"
                        value={signupData.gpa}
                        onChange={(e) => setSignupData({ ...signupData, gpa: e.target.value })}
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                        placeholder="3.50"
                        required={userType === "candidate"}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-200 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={signupData.phone}
                      onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                {/* Candidate-specific fields */}
                {userType === "candidate" && (
                  <div className="space-y-4 p-4 bg-cyan-900/20 rounded-lg border border-cyan-700/50">
                    <div className="flex items-center gap-2 text-cyan-300 mb-3">
                      <Trophy className="h-5 w-5" />
                      <h3 className="font-semibold">Candidate Information</h3>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contestingPosition" className="text-slate-200 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Position Contesting For <span className="text-red-400">*</span>
                      </Label>
                      <Select
                        value={signupData.contestingPosition}
                        onValueChange={(value) => setSignupData({ ...signupData, contestingPosition: value })}
                      >
                        <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          {positions.map((position) => {
                            const eligible = isEligibleForPosition(position.id)
                            return (
                              <SelectItem
                                key={position.id}
                                value={position.id}
                                disabled={!eligible}
                                className={!eligible ? "opacity-50" : ""}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span>{position.title}</span>
                                  {!eligible && (
                                    <Badge variant="destructive" className="ml-2 text-xs">
                                      Not Eligible
                                    </Badge>
                                  )}
                                </div>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                      {signupData.contestingPosition && (
                        <div className="text-xs text-slate-400 mt-1">
                          {(() => {
                            const position = positions.find((p) => p.id === signupData.contestingPosition)
                            const requirements = position?.requirements
                            if (!requirements) return null

                            return (
                              <div className="space-y-1">
                                <p>
                                  Requirements: Min GPA {requirements.minGPA}, Year {requirements.minAcademicYear}-
                                  {requirements.maxAcademicYear}
                                </p>
                                <p>Salary: ${position.salary.toLocaleString()}/year</p>
                              </div>
                            )
                          })()}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="platform" className="text-slate-200 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Platform Statement <span className="text-red-400">*</span>
                      </Label>
                      <Textarea
                        id="platform"
                        value={signupData.platform}
                        onChange={(e) => setSignupData({ ...signupData, platform: e.target.value })}
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 h-24"
                        placeholder="Describe your main platform and vision for the position..."
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience" className="text-slate-200 flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Relevant Experience
                      </Label>
                      <Textarea
                        id="experience"
                        value={signupData.experience}
                        onChange={(e) => setSignupData({ ...signupData, experience: e.target.value })}
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 h-20"
                        placeholder="Describe your leadership experience, involvement in student organizations, etc..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-200">Key Campaign Promises</Label>
                      <div className="space-y-2">
                        {signupData.campaignPromises.map((promise, index) => (
                          <Input
                            key={index}
                            type="text"
                            value={promise}
                            onChange={(e) => updateCampaignPromise(index, e.target.value)}
                            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                            placeholder={`Promise ${index + 1} (optional)`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Password fields */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-200">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 pr-10"
                        placeholder="••••••••"
                        required
                        minLength={8}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-slate-600/50 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {signupData.password && signupData.password.length < 8 && (
                      <p className="text-xs text-red-400">Password must be at least 8 characters</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-slate-200">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 pr-10"
                        placeholder="••••••••"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-slate-600/50 hover:text-white"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {signupData.confirmPassword && signupData.password !== signupData.confirmPassword && (
                      <p className="text-xs text-red-400">Passwords do not match</p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={
                    isLoading ||
                    signupData.password !== signupData.confirmPassword ||
                    signupData.password.length < 8 ||
                    (userType === "candidate" && (!signupData.contestingPosition || !signupData.platform.trim()))
                  }
                  className={`w-full bg-gradient-to-r ${getUserTypeColor(userType)} hover:opacity-90 text-white`}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      {getUserTypeIcon(userType)}
                      <span className="ml-2">Create {userType.charAt(0).toUpperCase() + userType.slice(1)} Account</span>
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-slate-400 hover:text-white hover:bg-slate-700/50"
                    onClick={() => setAuthMode("signin")}
                  >
                    Already have an account? Sign in
                  </Button>
                </div>
              </form>
            )}

            {/* Email Verification Form */}
            {authMode === "verify" && (
              <div className="space-y-4">
                {verificationStep === "code" && (
                  <form onSubmit={handleVerifyEmail} className="space-y-4">
                    <div className="text-center space-y-2">
                      <div className="bg-blue-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                        <Mail className="h-8 w-8 text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Check Your Email</h3>
                      <p className="text-sm text-slate-400">
                        We've sent a 6-digit verification code to
                        <br />
                        <span className="font-medium text-white">{verificationData.email}</span>
                      </p>
                    </div>

                    {/* Demo Code Display */}
                    <Alert className="bg-blue-900/20 border-blue-500/50">
                      <Info className="h-4 w-4 text-blue-400" />
                      <AlertDescription className="text-blue-200">
                        <div className="space-y-2">
                          <p className="text-sm">
                            <strong>Demo Mode:</strong> Check the browser console for your verification code, or use the
                            demo code below:
                          </p>
                          <div className="flex items-center gap-2 bg-blue-800/30 p-2 rounded">
                            <code className="text-blue-300 font-mono text-lg">123456</code>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard("123456")}
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-800/50"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <Label htmlFor="code" className="text-slate-200">
                        Verification Code
                      </Label>
                      <Input
                        id="code"
                        type="text"
                        value={verificationData.code}
                        onChange={(e) => setVerificationData({ ...verificationData, code: e.target.value })}
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 text-center text-lg tracking-widest"
                        placeholder="000000"
                        maxLength={6}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || verificationData.code.length !== 6}
                      className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:opacity-90 text-white"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Verify Email
                        </>
                      )}
                    </Button>

                    <div className="text-center space-y-2">
                      <p className="text-sm text-slate-400">Didn't receive the code?</p>
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={!canResend}
                        onClick={handleResendCode}
                        className="text-blue-400 hover:text-blue-300 hover:bg-slate-700/50"
                      >
                        {canResend ? "Resend Code" : `Resend in ${resendTimer}s`}
                      </Button>
                    </div>

                    <div className="text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-slate-400 hover:text-white hover:bg-slate-700/50"
                        onClick={() => setAuthMode("signin")}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Sign In
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Demo Credentials - Only show admin since no other accounts exist initially */}
            {authMode === "signin" && (
              <div className="bg-slate-700/30 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-medium text-slate-300 text-center">Demo Admin Credentials:</h4>
                <div className="text-xs text-slate-400 space-y-1">
                  <p>
                    <strong>Admin:</strong> admin@techuni.edu / admin2024! / ADM-7892-XYZ
                  </p>
                  <p className="text-slate-500 italic">Note: No student or candidate accounts exist yet. Create them through signup.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="bg-slate-800/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
              <Shield className="h-6 w-6 text-green-400" />
            </div>
            <p className="text-xs text-slate-400">Secure</p>
          </div>
          <div className="space-y-2">
            <div className="bg-slate-800/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
              <RefreshCw className="h-6 w-6 text-blue-400" />
            </div>
            <p className="text-xs text-slate-400">Fast</p>
          </div>
          <div className="space-y-2">
            <div className="bg-slate-800/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-6 w-6 text-purple-400" />
            </div>
            <p className="text-xs text-slate-400">Transparent</p>
          </div>
        </div>
      </div>
    </div>
  )
}