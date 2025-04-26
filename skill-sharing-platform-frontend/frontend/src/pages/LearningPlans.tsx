import React, { useState, useEffect } from "react";
import PageContainer from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Clock, Copy, Plus, Share2, Users, Edit2, Trash2, BookOpen, Target, ChevronDown, ChevronUp } from "lucide-react";
import AnimatedTransition from "@/components/ui/AnimatedTransition";
import CreatePlanDialog from "@/components/learning-plans/CreatePlanDialog";
import EditPlanDialog from "@/components/learning-plans/EditPlanDialog";
import { API_BASE_URL } from "@/config/api";
import { toast } from "sonner";
import axios from "axios";

interface Author {
  name: string;
  avatar: string;
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

const LearningPlans: React.FC = () => {
  const [plans, setPlans] = useState<LearningPlan[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<LearningPlan | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  // State to track expanded/collapsed state for each card
  const [expandedPlans, setExpandedPlans] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/learning-plans`, { withCredentials: true });
        setPlans(response.data);
        // Initialize all plans as collapsed
        const initialExpanded = response.data.reduce((acc: { [key: string]: boolean }, plan: LearningPlan) => {
          acc[plan.id] = false;
          return acc;
        }, {});
        setExpandedPlans(initialExpanded);
      } catch (error) {
        console.error("Failed to load plans:", error);
        toast.error("Failed to load learning plans. Please try again.");
      }
    };

    const fetchUser = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/skill-posts/auth/check`, { withCredentials: true });
        if (response.status === 200) {
          setUserName(response.data.name);
        }
      } catch (error) {
        console.error("User not authenticated:", error);
      }
    };

    fetchPlans();
    fetchUser();
  }, []);

  const handlePlanCreated = (newPlan: LearningPlan) => {
    setPlans((prevPlans) => [...prevPlans, newPlan]);
    setExpandedPlans((prev) => ({ ...prev, [newPlan.id]: false }));
  };

  const handlePlanUpdated = (updatedPlan: LearningPlan) => {
    setPlans((prevPlans) =>
      prevPlans.map((plan) => (plan.id === updatedPlan.id ? updatedPlan : plan))
    );
    setEditDialogOpen(false);
    setSelectedPlan(null);
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm("Are you sure you want to delete this learning plan?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/learning-plans/${id}`, { withCredentials: true });
      setPlans((prevPlans) => prevPlans.filter((plan) => plan.id !== id));
      setExpandedPlans((prev) => {
        const newExpanded = { ...prev };
        delete newExpanded[id];
        return newExpanded;
      });
      toast.success("Learning plan deleted successfully!");
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast.error("Failed to delete learning plan. Please try again.");
    }
  };

  const isPlanOwner = (plan: LearningPlan) => {
    return plan.author.name === userName;
  };

  // Toggle expanded state for a specific plan
  const togglePlan = (planId: string) => {
    setExpandedPlans((prev) => ({
      ...prev,
      [planId]: !prev[planId],
    }));
  };

  return (
    <PageContainer
      title="Learning Plans"
      description="Discover structured learning plans or create your own to guide your learning journey."
    >
      <Tabs defaultValue="discover" className="w-full mb-8">
        <TabsList className="grid w-full max-w-md grid-cols-3 mx-auto">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="my">My Plans</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex justify-end mb-6">
        <Button className="rounded-full" onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Learning Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan, index) => (
          <AnimatedTransition key={plan.id} direction="up" delay={0.05 * index}>
            <Card>
              <CardHeader
                className="cursor-pointer"
                onClick={() => togglePlan(plan.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={plan.author.avatar} />
                      <AvatarFallback>{plan.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{plan.author.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(plan.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {/* Chevron icon to indicate collapsible state */}
                  {expandedPlans[plan.id] ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
                <CardTitle className="mt-2">{plan.title}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              {/* Conditionally render content based on expanded state */}
              {expandedPlans[plan.id] && (
                <>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Target className="h-4 w-4" /> Difficulty: {plan.difficulty}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {plan.topics.map((topic, i) => (
                          <Badge key={i} variant="secondary">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                      {plan.goals.length > 0 && (
                        <div>
                          <p className="text-sm font-medium">Goals:</p>
                          <ul className="list-disc pl-5 text-sm text-muted-foreground">
                            {plan.goals.map((goal, i) => (
                              <li key={i}>{goal}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {plan.resources.length > 0 && (
                        <div>
                          <p className="text-sm font-medium flex items-center gap-1">
                            <BookOpen className="h-4 w-4" /> Resources:
                          </p>
                          <ul className="list-disc pl-5 text-sm text-muted-foreground">
                            {plan.resources.map((resource, i) => (
                              <li key={i}>
                                <a href={resource} target="_blank" rel="noopener noreferrer" className="underline">
                                  {resource}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {plan.prerequisites && (
                        <div>
                          <p className="text-sm font-medium">Prerequisites:</p>
                          <p className="text-sm text-muted-foreground">{plan.prerequisites}</p>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{plan.duration}</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{plan.followers} followers</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm">
                      <CalendarDays className="h-4 w-4 mr-2" />
                      Follow Plan
                    </Button>
                    <div className="flex gap-2">
                      {isPlanOwner(plan) && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedPlan(plan);
                              setEditDialogOpen(true);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeletePlan(plan.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </>
              )}
            </Card>
          </AnimatedTransition>
        ))}
      </div>

      <CreatePlanDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onPlanCreated={handlePlanCreated}
      />
      {selectedPlan && (
        <EditPlanDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          plan={selectedPlan}
          onPlanUpdated={handlePlanUpdated}
        />
      )}
    </PageContainer>
  );
};

export default LearningPlans;


