"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Shield, CheckCircle, AlertTriangle, User, BookOpen } from "lucide-react"
import { useUniversityVoting } from "@/hooks/use-university-voting"

export default function StudentAuthentication() {
  const { isAuthenticated, currentStudent, university, authenticateStudent, userRole } = useUniversityVoting()

  const [credentials, setCredentials] = useState({
    studentId: "",
    password: "",
  })
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [loginError, setLoginError] = useState("")

  const handleLogin = async () => {
    if (!credentials.studentId || !credentials.password) {
      setLoginError("Please enter both Student ID and password")
      return
    }

    setIsLoggingIn(true)
    setLoginError("")

    try {
      await authenticateStudent(credentials.studentId, credentials.password)
      setCredentials({ studentId: "", password: "" })
    } catch (error: any) {
      setLoginError(error.message || "Authentication failed")
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleLogin()
    }
  }

  if (isAuthenticated && currentStudent) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-3 rounded-full">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-blue-900">Welcome, {currentStudent.fullName}</CardTitle>
                <CardDescription className="text-blue-700">{university.name} Student Portal</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 capitalize">
              <CheckCircle className="h-3 w-3 mr-1" />
              {userRole}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Student Information
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Student ID:</span>
                  <span className="font-medium">{currentStudent.studentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{currentStudent.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Program:</span>
                  <span className="font-medium">{currentStudent.program}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Academic Year:</span>
                  <span className="font-medium">Year {currentStudent.academicYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Faculty:</span>
                  <span className="font-medium capitalize">{currentStudent.faculty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Department:</span>
                  <span className="font-medium">{currentStudent.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GPA:</span>
                  <span className="font-medium">{currentStudent.gpa.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Eligibility Status */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Election Eligibility
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle
                      className={`h-4 w-4 mr-2 ${currentStudent.isEligibleToVote ? "text-green-600" : "text-red-600"}`}
                    />
                    <span className="text-sm font-medium">Voting Eligibility</span>
                  </div>
                  <Badge
                    variant={currentStudent.isEligibleToVote ? "default" : "destructive"}
                    className={currentStudent.isEligibleToVote ? "bg-green-100 text-green-800" : ""}
                  >
                    {currentStudent.isEligibleToVote ? "Eligible" : "Not Eligible"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle
                      className={`h-4 w-4 mr-2 ${currentStudent.isEligibleToRun ? "text-green-600" : "text-red-600"}`}
                    />
                    <span className="text-sm font-medium">Candidacy Eligibility</span>
                  </div>
                  <Badge
                    variant={currentStudent.isEligibleToRun ? "default" : "destructive"}
                    className={currentStudent.isEligibleToRun ? "bg-green-100 text-green-800" : ""}
                  >
                    {currentStudent.isEligibleToRun ? "Eligible" : "Not Eligible"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle
                      className={`h-4 w-4 mr-2 ${currentStudent.verificationStatus === "verified" ? "text-green-600" : "text-yellow-600"}`}
                    />
                    <span className="text-sm font-medium">Verification Status</span>
                  </div>
                  <Badge
                    variant={currentStudent.verificationStatus === "verified" ? "default" : "secondary"}
                    className={
                      currentStudent.verificationStatus === "verified"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {currentStudent.verificationStatus}
                  </Badge>
                </div>
              </div>

              {/* Eligibility Requirements */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Eligibility Requirements</h4>
                <div className="text-xs text-blue-800 space-y-1">
                  <div>• Minimum GPA to vote: {university.electionRules.minGPAToVote}</div>
                  <div>• Minimum GPA to run: {university.electionRules.minGPAToRun}</div>
                  <div>• Minimum year to run: Year {university.electionRules.minAcademicYearToRun}</div>
                  <div>• Active enrollment status required</div>
                </div>
              </div>
            </div>
          </div>

          {/* University Information */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold text-gray-900 flex items-center mb-4">
              <BookOpen className="h-4 w-4 mr-2" />
              University Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Students:</span>
                <p className="font-medium">{university.studentBodySize.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-600">Faculties:</span>
                <p className="font-medium">{university.faculties.length}</p>
              </div>
              <div>
                <span className="text-gray-600">Current Semester:</span>
                <p className="font-medium">Fall 2024</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <GraduationCap className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl">{university.name}</CardTitle>
        <CardDescription>Student Union Election Portal</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {loginError && (
          <Alert className="bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{loginError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="studentId">Student ID</Label>
            <Input
              id="studentId"
              type="text"
              placeholder="TU2022123"
              value={credentials.studentId}
              onChange={(e) => setCredentials((prev) => ({ ...prev, studentId: e.target.value }))}
              onKeyDown={handleKeyPress}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={credentials.password}
              onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
              onKeyDown={handleKeyPress}
              className="mt-1"
            />
          </div>
        </div>

        <Button
          onClick={handleLogin}
          disabled={isLoggingIn || !credentials.studentId || !credentials.password}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          {isLoggingIn ? "Authenticating..." : "Sign In"}
        </Button>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">Use your university credentials to access the voting system</p>
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
            <Shield className="h-3 w-3" />
            <span>Secure university authentication</span>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="bg-gray-50 p-3 rounded-lg border">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Demo Credentials</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Student: TU2022123 / password123</div>
            <div>Admin: TU2020ADMIN / admin123</div>
            <div>Officer: TU2019OFFICER / officer123</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
