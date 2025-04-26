import React, { useState, useEffect } from "react";
import PageContainer from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, MessageSquare, Heart, Share2, Edit2, Trash2, LogOut, Send, ChevronDown, ChevronUp } from "lucide-react";
import AnimatedTransition from "@/components/ui/AnimatedTransition";
import CreatePostDialog from "@/components/skill-sharing/CreatePostDialog";
import EditPostDialog from "@/components/skill-sharing/EditPostDialog";
import { API_BASE_URL } from "@/config/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import axios from "axios";

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

const SkillSharing: React.FC = () => {
  const [posts, setPosts] = useState<SkillPost[]>([]);
  const [comments, setComments] = useState<{ [postId: string]: Comment[] }>({});
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<SkillPost | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [editingComment, setEditingComment] = useState<{ postId: string; commentId: string; content: string } | null>(null);
  const [showComments, setShowComments] = useState<{ [postId: string]: boolean }>({});

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/skill-posts`, { withCredentials: true });
        setPosts(response.data);
        const initialShowComments: { [postId: string]: boolean } = {};
        for (const post of response.data) {
          fetchComments(post.id);
          initialShowComments[post.id] = false;
        }
        setShowComments(initialShowComments);
      } catch (error) {
        console.error("Failed to load posts:", error);
        toast.error("Failed to load posts. Please try again.");
      }
    };

    const fetchUser = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/skill-posts/auth/check`, { withCredentials: true });
        if (response.status === 200) {
          setUserName(response.data.name);
          setUserId(response.data.sub);
        }
      } catch (error) {
        console.error("User not authenticated:", error);
      }
    };

    fetchPosts();
    fetchUser();
  }, []);

  const fetchComments = async (postId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/comments/post/${postId}`, { withCredentials: true });
      setComments((prev) => ({ ...prev, [postId]: response.data }));
    } catch (error) {
      console.error(`Failed to load comments for post ${postId}:`, error);
    }
  };

  const handlePostCreated = (newPost: SkillPost) => {
    setPosts((prevPosts) => [...prevPosts, newPost]);
    setComments((prev) => ({ ...prev, [newPost.id]: [] }));
    setShowComments((prev) => ({ ...prev, [newPost.id]: false }));
  };

  const handlePostUpdated = (updatedPost: SkillPost) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    );
    setEditDialogOpen(false);
    setSelectedPost(null);
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/skill-posts/${id}`, { withCredentials: true });
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
      setComments((prev) => {
        const newComments = { ...prev };
        delete newComments[id];
        return newComments;
      });
      setShowComments((prev) => {
        const newShowComments = { ...prev };
        delete newShowComments[id];
        return newShowComments;
      });
      toast.success("Post deleted successfully!");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post. Please try again.");
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

  const handleLogout = () => {
    window.location.href = "http://localhost:8081/logout";
  };

  const isPostOwner = (post: SkillPost) => {
    return post.author.name === userName;
  };

  const isCommentOwner = (comment: Comment) => {
    return comment.author.name === userName;
  };

  return (
    <PageContainer
      title="Skill Sharing"
      description="Share your skills and knowledge with others, or discover new skills to learn."
    >
      <div className="flex justify-between items-center mb-8">
        <div className="flex gap-4">
          <Button variant="outline" className="rounded-full">All Posts</Button>
          <Button variant="outline" className="rounded-full">Popular</Button>
          <Button variant="outline" className="rounded-full">Recent</Button>
        </div>
        <div className="flex gap-4">
          <Button className="rounded-full" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Post
          </Button>
          <Button variant="outline" className="rounded-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post, index) => (
          <AnimatedTransition key={post.id} direction="up" delay={0.05 * index}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Avatar>
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{post.author.name}</p>
                    <p className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription>{post.description}</CardDescription>
                <div className="mt-2">
                  <Badge variant="secondary" className="mr-2">{post.category}</Badge>
                  {post.tags && post.tags.map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="mr-1">{tag}</Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                {post.image ? (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="aspect-video object-cover rounded-lg w-full"
                    onError={(e) => console.error("Image failed to load:", post.image)}
                  />
                ) : (
                  <div className="aspect-video bg-secondary/50 rounded-lg flex items-center justify-center text-muted-foreground">
                    No media available
                  </div>
                )}
                <div className="mt-4">
                  <div className="flex justify-between mb-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleLike(post.id)}
                      className={`flex items-center gap-1 ${
                        userId && post.likedBy.includes(userId) ? "text-red-500" : ""
                      }`}
                    >
                      <Heart
                        className={`h-4 w-4 ${userId && post.likedBy.includes(userId) ? "fill-red-500" : ""}`}
                      />
                      {post.likedBy.length}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center gap-1"
                    >
                      <MessageSquare className="h-4 w-4" />
                      {(comments[post.id] || []).length}
                      {showComments[post.id] ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      )}
                    </Button>
                  </div>
                  {showComments[post.id] && (
                    <div className="mt-4 transition-all duration-300">
                      {post.allowComments && (
                        <div className="flex items-center gap-2 mb-4">
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
                      <div className="space-y-4 max-h-[200px] overflow-y-auto">
                        {(comments[post.id] || []).length > 0 ? (
                          (comments[post.id] || []).map((comment) => (
                            <div key={comment.id} className="flex items-start gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={comment.author.avatar} />
                                <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium">{comment.author.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(comment.createdAt).toLocaleString()}
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
                                  <div className="flex gap-2 mt-1">
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
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteComment(post.id, comment.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
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
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                {isPostOwner(post) && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedPost(post);
                        setEditDialogOpen(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </AnimatedTransition>
        ))}
      </div>

      <CreatePostDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onPostCreated={handlePostCreated}
      />
      {selectedPost && (
        <EditPostDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          post={selectedPost}
          onPostUpdated={handlePostUpdated}
        />
      )}
    </PageContainer>
  );
};

export default SkillSharing;