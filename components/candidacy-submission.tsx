"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  UserPlus,
  Trophy,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  FileText,
  Calendar,
  Instagram,
  Twitter,
  Linkedin,
} from "lucide-react"
import { useUniversityVoting } from "@/hooks/use-university-voting"

export default function CandidacySubmission() {
  const { currentStudent, positions, elections, submitCandidacy, university } = useUniversityVoting()

  const [selectedPosition, setSelectedPosition] = useState("")
  const [candidateData, setCandidateData] = useState({
    platform: "",
    experience: "",
    campaignPromises: ["", "", ""],
    campaignBudget: 0,
    socialMedia: {
      instagram: "",
      twitter: "",
      linkedin: "",
    },
    endorsements: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const activeElections = elections.filter((e) => e.status === "campaign" || e.status === "upcoming")

  const handleSubmit = async () => {
    if (!selectedPosition || !candidateData.platform || !candidateData.experience) {
      setErrorMessage("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    setErrorMessage("")

    try {
      const submissionData = {
        ...candidateData,
        campaignPromises: candidateData.campaignPromises.filter((promise) => promise.trim() !== ""),
        endorsements: candidateData.endorsements
          .split(",")
          .map((e) => e.trim())
          .filter((e) => e !== ""),
      }

      await submitCandidacy(selectedPosition, submissionData)
      setSubmissionStatus("success")

      // Reset form
      setSelectedPosition("")
      setCandidateData({
        platform: "",
        experience: "",
        campaignPromises: ["", "", ""],
        campaignBudget: 0,
        socialMedia: { instagram: "", twitter: "", linkedin: "" },
        endorsements: "",
      })
    } catch (error: any) {
      setSubmissionStatus("error")
      setErrorMessage(error.message || "Failed to submit candidacy")
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateCampaignPromise = (index: number, value: string) => {
    setCandidateData((prev) => ({
      ...prev,
      campaignPromises: prev.campaignPromises.map((promise, i) => (i === index ? value : promise)),
    }))
  }

  const updateSocialMedia = (platform: string, value: string) => {
    setCandidateData((prev) => ({
      ...prev,
      socialMedia: { ...prev.socialMedia, [platform]: value },
    }))
  }

  const getEligibilityStatus = (position: any) => {
    if (!currentStudent) return { eligible: false, reasons: ["Not authenticated"] }

    const reasons = []

    if (currentStudent.gpa < position.requirements.minGPA) {
      reasons.push(`GPA below ${position.requirements.minGPA} (current: ${currentStudent.gpa})`)
    }

    if (currentStudent.academicYear < position.requirements.minAcademicYear) {
      reasons.push(
        `Academic year below ${position.requirements.minAcademicYear} (current: ${currentStudent.academicYear})`,
      )
    }

    if (currentStudent.academicYear > position.requirements.maxAcademicYear) {
      reasons.push(
        `Academic year above ${position.requirements.maxAcademicYear} (current: ${currentStudent.academicYear})`,
      )
    }

    if (
      position.requirements.requiredFaculties &&
      !position.requirements.requiredFaculties.includes(currentStudent.faculty)
    ) {
      reasons.push(`Faculty not eligible (required: ${position.requirements.requiredFaculties.join(", ")})`)
    }

    if (!currentStudent.isEligibleToRun) {
      reasons.push("Not eligible to run for office")
    }

    return { eligible: reasons.length === 0, reasons }
  }

  if (!currentStudent) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <UserPlus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600">Please sign in to submit your candidacy.</p>
        </CardContent>
      </Card>
    )
  }

  if (activeElections.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Campaign Period</h3>
          <p className="text-gray-600">Candidacy submissions are not currently open.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Submit Your Candidacy</h2>
        <p className="text-gray-600">Run for a student union position and make a difference</p>
      </div>

      {submissionStatus === "success" && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Candidacy submitted successfully! Your application is under review.
          </AlertDescription>
        </Alert>
      )}

      {submissionStatus === "error" && (
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2" />
            Position Selection
          </CardTitle>
          <CardDescription>Choose the position you want to run for</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="position">Select Position</Label>
            <Select value={selectedPosition} onValueChange={setSelectedPosition}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a position" />
              </SelectTrigger>
              <SelectContent>
                {positions.map((position) => {
                  const eligibility = getEligibilityStatus(position)
                  return (
                    <SelectItem key={position.id} value={position.id} disabled={!eligibility.eligible}>
                      <div className="flex items-center justify-between w-full">
                        <span>{position.title}</span>
                        {!eligibility.eligible && (
                          <Badge variant="destructive" className="ml-2">
                            Not Eligible
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {selectedPosition && (
            <div className="space-y-4">
              {(() => {
                const position = positions.find((p) => p.id === selectedPosition)
                const eligibility = getEligibilityStatus(position)

                if (!position) return null

                return (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2">{position.title}</h3>
                    <p className="text-blue-800 text-sm mb-3">{position.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-blue-900">Requirements:</span>
                        <ul className="text-blue-800 mt-1 space-y-1">
                          <li>• Min GPA: {position.requirements.minGPA}</li>
                          <li>
                            • Academic Year: {position.requirements.minAcademicYear}-
                            {position.requirements.maxAcademicYear}
                          </li>
                          {position.requirements.requiredFaculties && (
                            <li>• Faculties: {position.requirements.requiredFaculties.join(", ")}</li>
                          )}
                        </ul>
                      </div>
                      <div>
                        <span className="font-medium text-blue-900">Benefits:</span>
                        <ul className="text-blue-800 mt-1 space-y-1">
                          <li>• Term: {position.term}</li>
                          {position.salary && (
                            <li className="flex items-center">
                              • Salary: <DollarSign className="h-3 w-3 mx-1" />
                              {position.salary.toLocaleString()}
                            </li>
                          )}
                          <li>• Leadership experience</li>
                        </ul>
                      </div>
                    </div>

                    {!eligibility.eligible && (
                      <Alert className="mt-4 bg-red-50 border-red-200">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          <strong>Not Eligible:</strong>
                          <ul className="mt-1 space-y-1">
                            {eligibility.reasons.map((reason, index) => (
                              <li key={index}>• {reason}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedPosition &&
        (() => {
          const position = positions.find((p) => p.id === selectedPosition)
          const eligibility = getEligibilityStatus(position)
          return eligibility.eligible
        })() && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Campaign Information
              </CardTitle>
              <CardDescription>Tell voters about your platform and experience</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Platform */}
              <div>
                <Label htmlFor="platform">Platform Statement *</Label>
                <Textarea
                  id="platform"
                  placeholder="Describe your main platform and vision for the position..."
                  value={candidateData.platform}
                  onChange={(e) => setCandidateData((prev) => ({ ...prev, platform: e.target.value }))}
                  className="mt-1 h-32"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be displayed to voters. Be clear and concise about your goals.
                </p>
              </div>

              {/* Experience */}
              <div>
                <Label htmlFor="experience">Relevant Experience *</Label>
                <Textarea
                  id="experience"
                  placeholder="Describe your leadership experience, involvement in student organizations, etc..."
                  value={candidateData.experience}
                  onChange={(e) => setCandidateData((prev) => ({ ...prev, experience: e.target.value }))}
                  className="mt-1 h-24"
                />
              </div>

              {/* Campaign Promises */}
              <div>
                <Label>Key Campaign Promises</Label>
                <div className="space-y-3 mt-2">
                  {candidateData.campaignPromises.map((promise, index) => (
                    <div key={index}>
                      <Input
                        placeholder={`Promise ${index + 1} (optional)`}
                        value={promise}
                        onChange={(e) => updateCampaignPromise(index, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">List specific commitments you plan to fulfill if elected.</p>
              </div>

              {/* Campaign Budget */}
              <div>
                <Label htmlFor="budget">Campaign Budget</Label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="budget"
                    type="number"
                    placeholder="0"
                    value={candidateData.campaignBudget}
                    onChange={(e) => setCandidateData((prev) => ({ ...prev, campaignBudget: Number(e.target.value) }))}
                    className="pl-10"
                    max={activeElections[0]?.electionRules.campaignSpendingLimit || 3000}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Maximum allowed: ${activeElections[0]?.electionRules.campaignSpendingLimit?.toLocaleString() || 3000}
                </p>
              </div>

              {/* Social Media */}
              <div>
                <Label>Social Media (Optional)</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div className="relative">
                    <Instagram className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="@username"
                      value={candidateData.socialMedia.instagram}
                      onChange={(e) => updateSocialMedia("instagram", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="relative">
                    <Twitter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="@username"
                      value={candidateData.socialMedia.twitter}
                      onChange={(e) => updateSocialMedia("twitter", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="linkedin-profile"
                      value={candidateData.socialMedia.linkedin}
                      onChange={(e) => updateSocialMedia("linkedin", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Endorsements */}
              <div>
                <Label htmlFor="endorsements">Endorsements (Optional)</Label>
                <Input
                  id="endorsements"
                  placeholder="Student organizations, clubs, or groups that support you (comma-separated)"
                  value={candidateData.endorsements}
                  onChange={(e) => setCandidateData((prev) => ({ ...prev, endorsements: e.target.value }))}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Example: Computer Science Club, Debate Society, Environmental Group
                </p>
              </div>

              {/* Submission Requirements */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-900 mb-2 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Submission Requirements
                </h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Candidacy deposit: ${activeElections[0]?.electionRules.depositAmount || 100} (refundable)</li>
                  <li>
                    • Campaign spending limit: $
                    {activeElections[0]?.electionRules.campaignSpendingLimit?.toLocaleString() || 3000}
                  </li>
                  <li>• All information will be verified by the election committee</li>
                  <li>• False information may result in disqualification</li>
                  <li>
                    • Campaign period: {new Date(activeElections[0]?.campaignStartTime || "").toLocaleDateString()} -{" "}
                    {new Date(activeElections[0]?.campaignEndTime || "").toLocaleDateString()}
                  </li>
                </ul>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !candidateData.platform || !candidateData.experience}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {isSubmitting ? "Submitting Candidacy..." : "🏆 Submit Candidacy"}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                By submitting, you agree to the university election rules and code of conduct.
              </p>
            </CardContent>
          </Card>
        )}
    </div>
  )
}
