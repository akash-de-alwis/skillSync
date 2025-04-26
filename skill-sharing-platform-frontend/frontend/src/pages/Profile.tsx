import React, { useState, useEffect } from "react";
import PageContainer from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpen,
  Edit,
  Github,
  Linkedin,
  Mail,
  MapPin,
  UserPlus,
  LogOut,
  Save,
  Heart,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  Send,
} from "lucide-react";
import AnimatedTransition from "@/components/ui/AnimatedTransition";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

interface Author {
  name: string;
  avatar: string;
}

interface Comment {
  id: string;
  content: string;
  author: Author;
  createdAt: string;
}

interface SkillPost {
  id: string;
  title: string;
  description: string;
  author: Author;
  likedBy: string[];
  createdAt: string;
  image?: string;
  category: string;
  tags?: string[];
  allowComments: boolean;
  visibility: "public" | "followers" | "private";
}

interface LearningPlan {
  id: string;
  title: string;
  description: string;
  author: Author;
  topics: string[];
  duration: string;
  followers: number;
  createdAt: string;
  goals: string[];
  resources: string[];
  difficulty: string;
  prerequisites: string;
}

interface LearningProgress {
  id: string;
  title: string;
  description: string;
  progressPercent: number;
  milestone: string;
  author: Author;
  createdAt: string;
  template: string;
  skillsGained: string[];
  challengesFaced: string;
  nextSteps: string;
  evidenceLink: string;
}

interface UserProfile {
  name: string;
  avatar: string;
  email: string;
  title?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  github?: string;
  linkedin?: string;
  stats: {
    posts: number;
    plans: number;
    following: number;
    followers: number;
  };
}

const Profile: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<SkillPost[]>([]);
  const [learningPlans, setLearningPlans] = useState<LearningPlan[]>([]);
  const [learningProgress, setLearningProgress] = useState<LearningProgress[]>([]);
  const [likedPosts, setLikedPosts] = useState<SkillPost[]>([]);
  const [comments, setComments] = useState<{ [postId: string]: Comment[] }>({});
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [plansLoading, setPlansLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(true);
  const [likedLoading, setLikedLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [editingComment, setEditingComment] = useState<{ postId: string; commentId: string; content: string } | null>(null);
  const [showComments, setShowComments] = useState<{ [postId: string]: boolean }>({});
  const [showFullDescription, setShowFullDescription] = useState<{ [postId: string]: boolean }>({});

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Fetch authenticated user details
        const authResponse = await axios.get(`${API_BASE_URL}/skill-posts/auth/check`, {
          withCredentials: true,
        });

        if (authResponse.data.status !== "Authenticated") {
          throw new Error("User not authenticated");
        }

        const email = authResponse.data.email;
        const name = authResponse.data.name || "Unknown User";
        const avatar = authResponse.data.picture || name.substring(0, 2).toUpperCase();
        setUserId(authResponse.data.sub);

        // Fetch additional profile data
        let profileData;
        try {
          const profileResponse = await axios.get(`${API_BASE_URL}/users/${email}`, {
            withCredentials: true,
          });
          profileData = profileResponse.data;
        } catch (profileError: any) {
          console.warn("Profile not found in database, using auth data:", profileError.message);
          profileData = null;
        }

        const profile: UserProfile = {
          name,
          avatar,
          email,
          title: profileData?.title || "",
          location: profileData?.location || "",
          bio: profileData?.bio || "",
          skills: profileData?.skills || [],
          github: profileData?.github || "",
          linkedin: profileData?.linkedin || "",
          stats: {
            posts: profileData?.stats?.posts || 0,
            plans: profileData?.stats?.plans || 0,
            following: profileData?.stats?.following || 0,
            followers: profileData?.stats?.followers || 0,
          },
        };
        setUserProfile(profile);
        setFormData(profile);

        // Fetch user's posts
        const postsResponse = await axios.get(`${API_BASE_URL}/skill-posts`, { withCredentials: true });
        const userPosts = postsResponse.data.filter((post: SkillPost) => post.author.name === name);
        setPosts(userPosts);

        // Fetch user's learning plans
        const plansResponse = await axios.get(`${API_BASE_URL}/learning-plans`, { withCredentials: true });
        const userPlans = plansResponse.data.filter((plan: LearningPlan) => plan.author.name === name);
        setLearningPlans(userPlans);

        // Fetch user's learning progress
        const progressResponse = await axios.get(`${API_BASE_URL}/learning-progress`, { withCredentials: true });
        const userProgress = progressResponse.data.filter((progress: LearningProgress) => progress.author.name === name);
        setLearningProgress(userProgress);

        // Fetch liked posts
        const likedPostsResponse = await axios.get(`${API_BASE_URL}/skill-posts`, { withCredentials: true });
        const userLikedPosts = likedPostsResponse.data.filter((post: SkillPost) => post.likedBy.includes(authResponse.data.sub));
        setLikedPosts(userLikedPosts);

        // Initialize comments and showComments
        const initialShowComments: { [postId: string]: boolean } = {};
        const initialShowFullDescription: { [postId: string]: boolean } = {};
        for (const post of [...userPosts, ...userLikedPosts]) {
          fetchComments(post.id);
          initialShowComments[post.id] = false;
          initialShowFullDescription[post.id] = false;
        }
        setShowComments(initialShowComments);
        setShowFullDescription(initialShowFullDescription);
      } catch (error: any) {
        console.error("Error fetching profile:", error.message);
        setErrorMessage("Failed to load profile. Please try logging in again.");
        toast.error("Redirecting to login...");
        setTimeout(() => {
          window.location.href = "http://localhost:8081/oauth2/authorization/google";
        }, 2000);
      } finally {
        setLoading(false);
        setPostsLoading(false);
        setPlansLoading(false);
        setProgressLoading(false);
        setLikedLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const fetchComments = async (postId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/comments/post/${postId}`, { withCredentials: true });
      setComments((prev) => ({ ...prev, [postId]: response.data }));
    } catch (error) {
      console.error(`Failed to load comments for post ${postId}:`, error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(userProfile || {});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skills = e.target.value.split(",").map((skill) => skill.trim()).filter(Boolean);
    setFormData((prev) => ({ ...prev, skills }));
  };

  const handleSave = async () => {
    if (!userProfile?.email) return;
    try {
      const updatedProfile = {
        ...userProfile,
        ...formData,
        email: userProfile.email,
        name: userProfile.name,
        avatar: userProfile.avatar,
      };
      const response = await axios.put(`${API_BASE_URL}/users/${userProfile.email}`, updatedProfile, {
        withCredentials: true,
      });
      setUserProfile(response.data);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error.message);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const handleToggleLike = async (postId: string) => {
    if (!userId) {
      toast.error("Please log in to like posts.");
      return;
    }
    try {
      const response = await axios.post(`${API_BASE_URL}/skill-posts/${postId}/like`, {}, { withCredentials: true });
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, likedBy: response.data.likedBy } : post
        )
      );
      setLikedPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, likedBy: response.data.likedBy } : post
        )
      );
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like. Please try again.");
    }
  };

  const handleAddComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content) {
      toast.error("Comment cannot be empty.");
      return;
    }
    try {
      const response = await axios.post(
        `${API_BASE_URL}/comments/post/${postId}`,
        { content },
        { withCredentials: true }
      );
      setComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), response.data],
      }));
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      toast.success("Comment added!");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment. Please try again.");
    }
  };

  const handleEditComment = async (postId: string, commentId: string) => {
    if (!editingComment || !editingComment.content.trim()) {
      toast.error("Comment cannot be empty.");
      return;
    }
    try {
      const response = await axios.put(
        `${API_BASE_URL}/comments/${commentId}`,
        { content: editingComment.content },
        { withCredentials: true }
      );
      setComments((prev) => ({
        ...prev,
        [postId]: prev[postId].map((c) => (c.id === commentId ? response.data : c)),
      }));
      setEditingComment(null);
      toast.success("Comment updated!");
    } catch (error: any) {
      console.error("Error updating comment:", error);
      if (error.response?.status === 403) {
        toast.error("You are not authorized to edit this comment.");
      } else {
        toast.error("Failed to update comment. Please try again.");
      }
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/comments/${commentId}`, { withCredentials: true });
      setComments((prev) => ({
        ...prev,
        [postId]: prev[postId].filter((c) => c.id !== commentId),
      }));
      toast.success("Comment deleted!");
    } catch (error: any) {
      console.error("Error deleting comment:", error);
      if (error.response?.status === 403) {
        toast.error("You are not authorized to delete this comment.");
      } else {
        toast.error("Failed to delete comment. Please try again.");
      }
    }
  };

  const toggleComments = (postId: string) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const toggleDescription = (postId: string) => {
    setShowFullDescription((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleLogout = () => {
    window.location.href = "http://localhost:8081/logout";
  };

  const isCommentOwner = (comment: Comment) => {
    return comment.author.name === userProfile?.name;
  };

  const truncateDescription = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="text-center py-10">Loading profile...</div>
      </PageContainer>
    );
  }

  if (!userProfile) {
    return (
      <PageContainer>
        <div className="text-center py-10">
          {errorMessage || "Profile not available. Please log in."}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <AnimatedTransition direction="up">
          <div className="relative mb-8">
            <div className="h-48 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/30 w-full"></div>
            <div className="absolute -bottom-16 left-8 flex items-end">
              <Avatar className="h-32 w-32 border-4 border-background">
                <AvatarImage src={userProfile.avatar} />
                <AvatarFallback className="text-3xl">{userProfile.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
            <div className="absolute right-4 bottom-4 flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleSave} className="bg-background/80 backdrop-blur-sm">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCancel} className="bg-background/80 backdrop-blur-sm">
                    Cancel
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={handleEdit} className="bg-background/80 backdrop-blur-sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
              <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </AnimatedTransition>

        <div className="pt-16 px-4">
          <AnimatedTransition direction="up" delay={0.1}>
            <div className="flex flex-col md:flex-row justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold">{userProfile.name}</h1>
                {isEditing ? (
                  <div className="mt-2 space-y-2">
                    <Input
                      name="title"
                      value={formData.title || ""}
                      onChange={handleInputChange}
                      placeholder="Title (e.g., Developer)"
                    />
                    <Input
                      name="location"
                      value={formData.location || ""}
                      onChange={handleInputChange}
                      placeholder="Location (e.g., Panadura, Sri Lanka)"
                    />
                    <Textarea
                      name="bio"
                      value={formData.bio || ""}
                      onChange={handleInputChange}
                      placeholder="Bio"
                    />
                    <Input
                      name="skills"
                      value={formData.skills?.join(", ") || ""}
                      onChange={handleSkillsChange}
                      placeholder="Skills (comma-separated, e.g., React, Java)"
                    />
                    <Input
                      name="github"
                      value={formData.github || ""}
                      onChange={handleInputChange}
                      placeholder="GitHub username"
                    />
                    <Input
                      name="linkedin"
                      value={formData.linkedin || ""}
                      onChange={handleInputChange}
                      placeholder="LinkedIn username"
                    />
                  </div>
                ) : (
                  <>
                    {userProfile.title && (
                      <p className="text-muted-foreground flex items-center mt-1">
                        {userProfile.title}
                        {userProfile.location && (
                          <>
                            <span className="mx-2">•</span>
                            <MapPin className="h-4 w-4 mr-1" />
                            {userProfile.location}
                          </>
                        )}
                      </p>
                    )}
                    {userProfile.bio && <p className="mt-4 max-w-xl">{userProfile.bio}</p>}
                  </>
                )}

                <div className="flex gap-4 mt-4">
                  <Button variant="outline" size="sm" asChild>
                    <a href={`mailto:${userProfile.email}`}>
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </a>
                  </Button>
                  {userProfile.github && !isEditing && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`https://github.com/${userProfile.github}`} target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4 mr-2" />
                        GitHub
                      </a>
                    </Button>
                  )}
                  {userProfile.linkedin && !isEditing && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`https://linkedin.com/in/${userProfile.linkedin}`} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="h-4 w-4 mr-2" />
                        LinkedIn
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-6 md:mt-0">
                <Button className="w-full">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Follow
                </Button>

                <div className="grid grid-cols-4 gap-4 mt-4 text-center">
                  <div>
                    <div className="font-bold">{userProfile.stats.posts}</div>
                    <div className="text-xs text-muted-foreground">Posts</div>
                  </div>
                  <div>
                    <div className="font-bold">{userProfile.stats.plans}</div>
                    <div className="text-xs text-muted-foreground">Plans</div>
                  </div>
                  <div>
                    <div className="font-bold">{userProfile.stats.following}</div>
                    <div className="text-xs text-muted-foreground">Following</div>
                  </div>
                  <div>
                    <div className="font-bold">{userProfile.stats.followers}</div>
                    <div className="text-xs text-muted-foreground">Followers</div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedTransition>

          <AnimatedTransition direction="up" delay={0.2}>
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {userProfile.skills && userProfile.skills.length > 0 ? (
                  userProfile.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground">No skills listed yet.</p>
                )}
              </div>
            </div>
          </AnimatedTransition>

          <AnimatedTransition direction="up" delay={0.3}>
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="w-full max-w-md">
                <TabsTrigger value="posts" className="flex-1">Posts</TabsTrigger>
                <TabsTrigger value="progress" className="flex-1">Progress</TabsTrigger>
                <TabsTrigger value="plans" className="flex-1">Plans</TabsTrigger>
                <TabsTrigger value="liked" className="flex-1">Liked</TabsTrigger>
              </TabsList>

              {/* Posts Tab */}
              <TabsContent value="posts" className="mt-6">
                {postsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, index) => (
                      <Skeleton key={index} className="h-48 w-full rounded-lg" />
                    ))}
                  </div>
                ) : posts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {posts.map((post, index) => (
                      <AnimatedTransition key={post.id} direction="up" delay={0.05 * index}>
                        <Card className="hover:shadow-md transition-shadow">
                          <CardHeader className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={post.author.avatar} />
                                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-semibold">{post.author.name}</p>
                                <p className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            {post.image && (
                              <img
                                src={post.image}
                                alt={post.title}
                                className="h-32 w-full object-cover rounded-md mb-2"
                                onError={(e) => console.error("Image failed to load:", post.image)}
                              />
                            )}
                            <p className="text-sm text-muted-foreground">
                              {showFullDescription[post.id]
                                ? post.description
                                : truncateDescription(post.description, 100)}
                              {post.description.length > 100 && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="p-0 h-auto text-xs"
                                  onClick={() => toggleDescription(post.id)}
                                >
                                  {showFullDescription[post.id] ? "Show Less" : "Read More"}
                                </Button>
                              )}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                              {post.tags && post.tags.slice(0, 3).map((tag, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">{tag}</Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleToggleLike(post.id)}
                                      className={`p-1 ${userId && post.likedBy.includes(userId) ? "text-red-500" : ""}`}
                                    >
                                      <Heart
                                        className={`h-4 w-4 ${userId && post.likedBy.includes(userId) ? "fill-red-500" : ""}`}
                                      />
                                      <span className="ml-1 text-xs">{post.likedBy.length}</span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Like</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleComments(post.id)}
                                      className="p-1"
                                    >
                                      <MessageSquare className="h-4 w-4" />
                                      <span className="ml-1 text-xs">{(comments[post.id] || []).length}</span>
                                      {showComments[post.id] ? (
                                        <ChevronUp className="h-3 w-3 ml-1" />
                                      ) : (
                                        <ChevronDown className="h-3 w-3 ml-1" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Comments</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            {showComments[post.id] && (
                              <div className="mt-3 border-t pt-3 transition-all duration-300">
                                {post.allowComments && (
                                  <div className="flex items-center gap-2 mb-3">
                                    <Input
                                      placeholder="Add a comment..."
                                      value={commentInputs[post.id] || ""}
                                      onChange={(e) =>
                                        setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          handleAddComment(post.id);
                                        }
                                      }}
                                      className="text-sm"
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() => handleAddComment(post.id)}
                                      disabled={!commentInputs[post.id]?.trim()}
                                    >
                                      <Send className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                                <div className="space-y-3 max-h-[150px] overflow-y-auto">
                                  {(comments[post.id] || []).length > 0 ? (
                                    (comments[post.id] || []).map((comment) => (
                                      <div key={comment.id} className="flex items-start gap-2">
                                        <Avatar className="h-6 w-6">
                                          <AvatarImage src={comment.author.avatar} />
                                          <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                          <div className="flex items-center justify-between">
                                            <p className="text-xs font-medium">{comment.author.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                              {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                          </div>
                                          {editingComment?.postId === post.id && editingComment?.commentId === comment.id ? (
                                            <div className="flex items-center gap-2 mt-1">
                                              <Input
                                                value={editingComment.content}
                                                onChange={(e) =>
                                                  setEditingComment({
                                                    ...editingComment,
                                                    content: e.target.value,
                                                  })
                                                }
                                                onKeyDown={(e) => {
                                                  if (e.key === "Enter") {
                                                    handleEditComment(post.id, comment.id);
                                                  }
                                                }}
                                                className="text-sm"
                                              />
                                              <Button
                                                size="sm"
                                                onClick={() => handleEditComment(post.id, comment.id)}
                                                disabled={!editingComment.content.trim()}
                                              >
                                                Save
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setEditingComment(null)}
                                              >
                                                Cancel
                                              </Button>
                                            </div>
                                          ) : (
                                            <p className="text-sm">{comment.content}</p>
                                          )}
                                          {isCommentOwner(comment) && !editingComment && (
                                            <div className="flex gap-1 mt-1">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                  setEditingComment({
                                                    postId: post.id,
                                                    commentId: comment.id,
                                                    content: comment.content,
                                                  })
                                                }
                                                className="p-1"
                                              >
                                                <Edit2 className="h-3 w-3" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteComment(post.id, comment.id)}
                                                className="p-1"
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-sm text-muted-foreground">No comments yet.</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </AnimatedTransition>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">No posts yet</h3>
                    <p className="text-muted-foreground mt-2">Start sharing your skills and knowledge.</p>
                    <Button className="mt-4">Create Post</Button>
                  </div>
                )}
              </TabsContent>

              {/* Progress Tab */}
              <TabsContent value="progress" className="mt-6">
                {progressLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, index) => (
                      <Skeleton key={index} className="h-48 w-full rounded-lg" />
                    ))}
                  </div>
                ) : learningProgress.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {learningProgress.map((progress, index) => (
                      <AnimatedTransition key={progress.id} direction="up" delay={0.05 * index}>
                        <Card className="hover:shadow-md transition-shadow">
                          <CardHeader className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={progress.author.avatar} />
                                <AvatarFallback>{progress.author.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-semibold">{progress.author.name}</p>
                                <p className="text-xs text-muted-foreground">{new Date(progress.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <CardTitle className="text-lg line-clamp-2">{progress.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <p className="text-sm text-muted-foreground">{truncateDescription(progress.description, 100)}</p>
                            <div className="mt-2">
                              <p className="text-xs font-medium">Progress: {progress.progressPercent}%</p>
                              <div className="w-full bg-secondary h-1 rounded-full mt-1">
                                <div
                                  className="bg-primary h-1 rounded-full"
                                  style={{ width: `${progress.progressPercent}%` }}
                                ></div>
                              </div>
                            </div>
                            {progress.milestone && (
                              <p className="text-xs mt-2">Milestone: {progress.milestone}</p>
                            )}
                            {progress.skillsGained.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {progress.skillsGained.slice(0, 3).map((skill, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">{skill}</Badge>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </AnimatedTransition>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">No progress updates yet</h3>
                    <p className="text-muted-foreground mt-2">Start tracking your learning journey.</p>
                    <Button className="mt-4">Add Progress Update</Button>
                  </div>
                )}
              </TabsContent>

              {/* Plans Tab */}
              <TabsContent value="plans" className="mt-6">
                {plansLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, index) => (
                      <Skeleton key={index} className="h-48 w-full rounded-lg" />
                    ))}
                  </div>
                ) : learningPlans.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {learningPlans.map((plan, index) => (
                      <AnimatedTransition key={plan.id} direction="up" delay={0.05 * index}>
                        <Card className="hover:shadow-md transition-shadow">
                          <CardHeader className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={plan.author.avatar} />
                                <AvatarFallback>{plan.author.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-semibold">{plan.author.name}</p>
                                <p className="text-xs text-muted-foreground">{new Date(plan.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <CardTitle className="text-lg line-clamp-2">{plan.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <p className="text-sm text-muted-foreground">{truncateDescription(plan.description, 100)}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {plan.topics.slice(0, 3).map((topic, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">{topic}</Badge>
                              ))}
                            </div>
                            <p className="text-xs mt-2">Difficulty: {plan.difficulty}</p>
                            <p className="text-xs">Duration: {plan.duration}</p>
                            <p className="text-xs">Followers: {plan.followers}</p>
                          </CardContent>
                        </Card>
                      </AnimatedTransition>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">No learning plans yet</h3>
                    <p className="text-muted-foreground mt-2">Create a structured learning plan.</p>
                    <Button className="mt-4">Create Learning Plan</Button>
                  </div>
                )}
              </TabsContent>

              {/* Liked Tab */}
              <TabsContent value="liked" className="mt-6">
                {likedLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, index) => (
                      <Skeleton key={index} className="h-48 w-full rounded-lg" />
                    ))}
                  </div>
                ) : likedPosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {likedPosts.map((post, index) => (
                      <AnimatedTransition key={post.id} direction="up" delay={0.05 * index}>
                        <Card className="hover:shadow-md transition-shadow">
                          <CardHeader className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={post.author.avatar} />
                                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-semibold">{post.author.name}</p>
                                <p className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            {post.image && (
                              <img
                                src={post.image}
                                alt={post.title}
                                className="h-32 w-full object-cover rounded-md mb-2"
                                onError={(e) => console.error("Image failed to load:", post.image)}
                              />
                            )}
                            <p className="text-sm text-muted-foreground">
                              {showFullDescription[post.id]
                                ? post.description
                                : truncateDescription(post.description, 100)}
                              {post.description.length > 100 && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="p-0 h-auto text-xs"
                                  onClick={() => toggleDescription(post.id)}
                                >
                                  {showFullDescription[post.id] ? "Show Less" : "Read More"}
                                </Button>
                              )}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                              {post.tags && post.tags.slice(0, 3).map((tag, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">{tag}</Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleToggleLike(post.id)}
                                      className={`p-1 ${userId && post.likedBy.includes(userId) ? "text-red-500" : ""}`}
                                    >
                                      <Heart
                                        className={`h-4 w-4 ${userId && post.likedBy.includes(userId) ? "fill-red-500" : ""}`}
                                      />
                                      <span className="ml-1 text-xs">{post.likedBy.length}</span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Like</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleComments(post.id)}
                                      className="p-1"
                                    >
                                      <MessageSquare className="h-4 w-4" />
                                      <span className="ml-1 text-xs">{(comments[post.id] || []).length}</span>
                                      {showComments[post.id] ? (
                                        <ChevronUp className="h-3 w-3 ml-1" />
                                      ) : (
                                        <ChevronDown className="h-3 w-3 ml-1" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Comments</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            {showComments[post.id] && (
                              <div className="mt-3 border-t pt-3 transition-all duration-300">
                                {post.allowComments && (
                                  <div className="flex items-center gap-2 mb-3">
                                    <Input
                                      placeholder="Add a comment..."
                                      value={commentInputs[post.id] || ""}
                                      onChange={(e) =>
                                        setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          handleAddComment(post.id);
                                        }
                                      }}
                                      className="text-sm"
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() => handleAddComment(post.id)}
                                      disabled={!commentInputs[post.id]?.trim()}
                                    >
                                      <Send className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                                <div className="space-y-3 max-h-[150px] overflow-y-auto">
                                  {(comments[post.id] || []).length > 0 ? (
                                    (comments[post.id] || []).map((comment) => (
                                      <div key={comment.id} className="flex items-start gap-2">
                                        <Avatar className="h-6 w-6">
                                          <AvatarImage src={comment.author.avatar} />
                                          <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                          <div className="flex items-center justify-between">
                                            <p className="text-xs font-medium">{comment.author.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                              {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                          </div>
                                          {editingComment?.postId === post.id && editingComment?.commentId === comment.id ? (
                                            <div className="flex items-center gap-2 mt-1">
                                              <Input
                                                value={editingComment.content}
                                                onChange={(e) =>
                                                  setEditingComment({
                                                    ...editingComment,
                                                    content: e.target.value,
                                                  })
                                                }
                                                onKeyDown={(e) => {
                                                  if (e.key === "Enter") {
                                                    handleEditComment(post.id, comment.id);
                                                  }
                                                }}
                                                className="text-sm"
                                              />
                                              <Button
                                                size="sm"
                                                onClick={() => handleEditComment(post.id, comment.id)}
                                                disabled={!editingComment.content.trim()}
                                              >
                                                Save
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setEditingComment(null)}
                                              >
                                                Cancel
                                              </Button>
                                            </div>
                                          ) : (
                                            <p className="text-sm">{comment.content}</p>
                                          )}
                                          {isCommentOwner(comment) && !editingComment && (
                                            <div className="flex gap-1 mt-1">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                  setEditingComment({
                                                    postId: post.id,
                                                    commentId: comment.id,
                                                    content: comment.content,
                                                  })
                                                }
                                                className="p-1"
                                              >
                                                <Edit2 className="h-3 w-3" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteComment(post.id, comment.id)}
                                                className="p-1"
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-sm text-muted-foreground">No comments yet.</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </AnimatedTransition>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">No liked content yet</h3>
                    <p className="text-muted-foreground mt-2">Like posts and plans to see them here.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </AnimatedTransition>
        </div>
      </div>
    </PageContainer>
  );
};

export default Profile;