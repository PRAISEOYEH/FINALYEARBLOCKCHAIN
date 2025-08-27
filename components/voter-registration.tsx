"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserPlus, Shield, CheckCircle, AlertCircle } from "lucide-react"
import { useBlockchain } from "@/hooks/use-blockchain"

export default function VoterRegistration() {
  const { registerVoter, isRegistered } = useBlockchain()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    dateOfBirth: "",
    nationalId: "",
    address: "",
    district: "",
  })
  const [isRegistering, setIsRegistering] = useState(false)
  const [registrationStatus, setRegistrationStatus] = useState<"idle" | "success" | "error">("idle")

  const handleRegister = async () => {
    setIsRegistering(true)
    try {
      await registerVoter(formData)
      setRegistrationStatus("success")
      setFormData({
        fullName: "",
        email: "",
        dateOfBirth: "",
        nationalId: "",
        address: "",
        district: "",
      })
    } catch (error) {
      setRegistrationStatus("error")
      console.error("Registration failed:", error)
    } finally {
      setIsRegistering(false)
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (isRegistered) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Already Registered</h3>
          <p className="text-gray-600">You are already registered to vote on the blockchain.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Voter Registration</h2>
        <p className="text-gray-600">Register to participate in blockchain-based elections</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserPlus className="h-5 w-5 mr-2" />
            Register as Voter
          </CardTitle>
          <CardDescription>Complete your registration to participate in secure blockchain voting</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {registrationStatus === "success" && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Registration successful! You can now participate in elections.
              </AlertDescription>
            </Alert>
          )}

          {registrationStatus === "error" && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Registration failed. Please check your information and try again.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => updateFormData("fullName", e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                placeholder="john@example.com"
              />
            </div>

            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="nationalId">National ID</Label>
              <Input
                id="nationalId"
                value={formData.nationalId}
                onChange={(e) => updateFormData("nationalId", e.target.value)}
                placeholder="123456789"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => updateFormData("address", e.target.value)}
                placeholder="123 Main Street, City, State"
              />
            </div>

            <div>
              <Label htmlFor="district">Voting District</Label>
              <Select value={formData.district} onValueChange={(value) => updateFormData("district", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your district" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="district-1">District 1</SelectItem>
                  <SelectItem value="district-2">District 2</SelectItem>
                  <SelectItem value="district-3">District 3</SelectItem>
                  <SelectItem value="district-4">District 4</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
              <div>
                <h4 className="font-medium text-blue-900">Security & Privacy</h4>
                <p className="text-sm text-blue-800 mt-1">
                  Your registration data is encrypted and stored securely on the blockchain. Only verified information
                  is used for voter eligibility verification.
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleRegister}
            disabled={isRegistering || !formData.fullName || !formData.email || !formData.nationalId}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isRegistering ? "Registering..." : "Register to Vote"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
