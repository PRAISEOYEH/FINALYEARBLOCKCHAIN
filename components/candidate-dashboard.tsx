"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Users,
  TrendingUp,
  Calendar,
  DollarSign,
  MessageSquare,
  Target,
  Bell,
  Settings,
  LogOut,
  Edit,
  Save,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity,
  MapPin,
  Share2,
  Heart,
  Eye,
} from "lucide-react"
import { useUniversityVoting } from "@/hooks/use-university-voting"
import { useMultiWallet } from "@/hooks/use-multi-wallet"

interface CampaignEvent {
  id: string
  title: string
  date: string
  time: string
  location: string
  description: string
  attendees: number
  status: "upcoming" | "ongoing" | "completed"
}

interface CampaignPost {
  id: string
  content: string
  timestamp: string
  likes: number
  shares: number
  comments: number
  platform: "instagram" | "twitter" | "facebook"
}

export default function CandidateDashboard() {
  const { user, logout } = useUniversityVoting()
  const { account, connectedWallet, disconnectWallet } = useMultiWallet()
  const [activeTab, setActiveTab] = useState("overview")
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    platform:
      "Building a stronger, more inclusive campus community through innovative student services and transparent governance.",
    goals: [
      "Implement 24/7 study spaces with enhanced WiFi",
      "Establish mental health support programs",
      "Create more affordable dining options",
      "Increase student representation in university committees",
    ],
    experience:
      "Former class representative, debate team captain, volunteer coordinator for campus sustainability initiatives.",
  })

  // Mock campaign data
  const campaignStats = {
    totalVotes: 1247,
    voteGoal: 2000,
    supporterGrowth: 15.3,
    eventAttendance: 89,
    socialMediaReach: 12500,
    campaignBudget: 2500,
    budgetSpent: 1750,
    daysLeft: 12,
  }

  const campaignEvents: CampaignEvent[] = [
    {
      id: "1",
      title: "Meet & Greet with Engineering Students",
      date: "2024-10-25",
      time: "14:00",
      location: "Engineering Building Lobby",
      description: "Informal discussion about campus technology improvements",
      attendees: 45,
      status: "upcoming",
    },
    {
      id: "2",
      title: "Policy Debate: Student Services",
      date: "2024-10-28",
      time: "19:00",
      location: "Main Auditorium",
      description: "Debate with other candidates about student service improvements",
      attendees: 120,
      status: "upcoming",
    },
    {
      id: "3",
      title: "Campus Sustainability Forum",
      date: "2024-10-22",
      time: "16:00",
      location: "Student Center",
      description: "Discussion on environmental initiatives",
      attendees: 67,
      status: "completed",
    },
  ]

  const recentPosts: CampaignPost[] = [
    {
      id: "1",
      content:
        "Just finished an amazing discussion with the Computer Science Association about improving campus tech infrastructure! 💻 #TechForAll",
      timestamp: "2 hours ago",
      likes: 89,
      shares: 23,
      comments: 15,
      platform: "twitter",
    },
    {
      id: "2",
      content:
        "Thank you to everyone who attended our sustainability forum! Together we can make our campus greener 🌱",
      timestamp: "1 day ago",
      likes: 156,
      shares: 34,
      comments: 28,
      platform: "instagram",
    },
  ]

  const handleLogout = () => {
    logout()
    disconnectWallet()
  }

  const handleSaveProfile = () => {
    setIsEditingProfile(false)
    // Here you would save the profile data to the backend
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getVoteProgress = () => {
    return (campaignStats.totalVotes / campaignStats.voteGoal) * 100
  }

  const getBudgetProgress = () => {
    return (campaignStats.budgetSpent / campaignStats.campaignBudget) * 100
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-green-600 w-8 h-8 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Candidate Portal</h1>
                <p className="text-sm text-gray-600">Campaign Management Dashboard</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Users className="h-3 w-3 mr-1" />
                Candidate
              </Badge>
              {account && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {truncateAddress(account)}
                </Badge>
              )}
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h2>
                <p className="text-green-100">
                  Running for: <span className="font-semibold">{user?.position || "Student Union President"}</span>
                </p>
                <p className="text-green-100">
                  Party: <span className="font-semibold">{user?.party || "Progressive Student Alliance"}</span>
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{campaignStats.daysLeft}</div>
                <div className="text-green-100">Days Left</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Current Votes</p>
                  <p className="text-2xl font-bold text-gray-900">{campaignStats.totalVotes.toLocaleString()}</p>
                  <p className="text-xs text-green-600">+{campaignStats.supporterGrowth}% this week</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Event Attendance</p>
                  <p className="text-2xl font-bold text-gray-900">{campaignStats.eventAttendance}%</p>
                  <p className="text-xs text-blue-600">Average turnout</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Social Reach</p>
                  <p className="text-2xl font-bold text-gray-900">{campaignStats.socialMediaReach.toLocaleString()}</p>
                  <p className="text-xs text-purple-600">Total impressions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Budget Used</p>
                  <p className="text-2xl font-bold text-gray-900">{getBudgetProgress().toFixed(0)}%</p>
                  <p className="text-xs text-orange-600">
                    ${campaignStats.budgetSpent} of ${campaignStats.campaignBudget}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaign">Campaign</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Vote Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Vote Progress
                  </CardTitle>
                  <CardDescription>Track your progress toward the vote goal</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Current Votes</span>
                      <span className="text-sm text-gray-600">
                        {campaignStats.totalVotes} / {campaignStats.voteGoal}
                      </span>
                    </div>
                    <Progress value={getVoteProgress()} className="h-3" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-600">On track to win!</span>
                      <span className="text-gray-600">{getVoteProgress().toFixed(1)}% complete</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest campaign updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="bg-green-100 w-8 h-8 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Event completed successfully</p>
                        <p className="text-xs text-gray-600">Campus Sustainability Forum - 67 attendees</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New social media post</p>
                        <p className="text-xs text-gray-600">89 likes, 23 shares on Twitter</p>
                        <p className="text-xs text-gray-500">4 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-purple-100 w-8 h-8 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New endorsement received</p>
                        <p className="text-xs text-gray-600">Computer Science Association</p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Upcoming Events
                </CardTitle>
                <CardDescription>Your scheduled campaign events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaignEvents
                    .filter((event) => event.status === "upcoming")
                    .map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{event.title}</h3>
                            <p className="text-sm text-gray-600">
                              {event.date} at {event.time}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {event.location}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-blue-100 text-blue-700">
                          {event.attendees} expected
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaign" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Campaign Budget */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Campaign Budget
                  </CardTitle>
                  <CardDescription>Track your campaign spending</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Budget Used</span>
                      <span className="text-sm text-gray-600">
                        ${campaignStats.budgetSpent} / ${campaignStats.campaignBudget}
                      </span>
                    </div>
                    <Progress value={getBudgetProgress()} className="h-3" />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Remaining</p>
                        <p className="font-semibold text-green-600">
                          ${campaignStats.campaignBudget - campaignStats.budgetSpent}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Percentage Used</p>
                        <p className="font-semibold text-orange-600">{getBudgetProgress().toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Media Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Share2 className="h-5 w-5 mr-2" />
                    Social Media
                  </CardTitle>
                  <CardDescription>Recent posts and engagement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentPosts.map((post) => (
                      <div key={post.id} className="border rounded-lg p-3">
                        <p className="text-sm text-gray-900 mb-2">{post.content}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{post.timestamp}</span>
                          <div className="flex items-center space-x-3">
                            <span className="flex items-center">
                              <Heart className="h-3 w-3 mr-1" />
                              {post.likes}
                            </span>
                            <span className="flex items-center">
                              <Share2 className="h-3 w-3 mr-1" />
                              {post.shares}
                            </span>
                            <span className="flex items-center">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              {post.comments}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Campaign Events
                </CardTitle>
                <CardDescription>Manage your campaign events and track attendance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaignEvents.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                        <Badge
                          variant={
                            event.status === "completed"
                              ? "default"
                              : event.status === "ongoing"
                                ? "secondary"
                                : "outline"
                          }
                          className={
                            event.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : event.status === "ongoing"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {event.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          {event.date} at {event.time}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          {event.location}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Users className="h-4 w-4 mr-2" />
                          {event.attendees} {event.status === "completed" ? "attended" : "expected"}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Vote Trends
                  </CardTitle>
                  <CardDescription>Your voting support over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
                    <p className="text-gray-600 mb-4">Detailed analytics and trends will be displayed here</p>
                    <Button variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Detailed Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    Demographic Breakdown
                  </CardTitle>
                  <CardDescription>Support by student demographics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <PieChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Demographic Analysis</h3>
                    <p className="text-gray-600 mb-4">Support breakdown by year, faculty, and program</p>
                    <Button variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Demographics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Candidate Profile
                    </CardTitle>
                    <CardDescription>Manage your campaign information and platform</CardDescription>
                  </div>
                  <Button
                    variant={isEditingProfile ? "outline" : "default"}
                    onClick={() => (isEditingProfile ? handleSaveProfile() : setIsEditingProfile(true))}
                  >
                    {isEditingProfile ? (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Basic Information</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Name:</strong> {user?.name}
                      </div>
                      <div>
                        <strong>Student ID:</strong> {user?.studentId}
                      </div>
                      <div>
                        <strong>Position:</strong> {user?.position || "Student Union President"}
                      </div>
                      <div>
                        <strong>Party:</strong> {user?.party || "Progressive Student Alliance"}
                      </div>
                      <div>
                        <strong>Department:</strong> {user?.department}
                      </div>
                      <div>
                        <strong>Year:</strong> {user?.year}
                      </div>
                      {user?.gpa && (
                        <div>
                          <strong>GPA:</strong> {user.gpa}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Campaign Status</h3>
                    <div className="space-y-2">
                      <Badge className="bg-green-100 text-green-800">Verified Candidate</Badge>
                      <Badge className="bg-blue-100 text-blue-800">Campaign Active</Badge>
                      <Badge className="bg-purple-100 text-purple-800">Blockchain Connected</Badge>
                    </div>
                  </div>
                </div>

                {/* Platform Statement */}
                <div>
                  <Label htmlFor="platform">Platform Statement</Label>
                  {isEditingProfile ? (
                    <Textarea
                      id="platform"
                      value={profileData.platform}
                      onChange={(e) => setProfileData({ ...profileData, platform: e.target.value })}
                      className="mt-1 h-24"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-700 p-3 bg-gray-50 rounded-lg">{profileData.platform}</p>
                  )}
                </div>

                {/* Campaign Goals */}
                <div>
                  <Label>Campaign Goals</Label>
                  <div className="mt-2 space-y-2">
                    {profileData.goals.map((goal, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{goal}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <Label htmlFor="experience">Relevant Experience</Label>
                  {isEditingProfile ? (
                    <Textarea
                      id="experience"
                      value={profileData.experience}
                      onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                      className="mt-1 h-20"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-700 p-3 bg-gray-50 rounded-lg">{profileData.experience}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
