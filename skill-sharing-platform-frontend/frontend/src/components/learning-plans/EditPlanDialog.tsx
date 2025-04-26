import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/config/api";
import axios from "axios";

const planSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }).max(100),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }).max(500),
  duration: z.string().min(1, { message: "Duration must be specified" }),
  topics: z.array(z.string()).min(1, { message: "At least one topic must be added" }),
  goals: z.array(z.string()).min(1, { message: "At least one goal must be added" }),
  resources: z.array(z.string()).optional(),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  prerequisites: z.string().max(500).optional(),
});

type PlanFormValues = z.infer<typeof planSchema>;

interface EditPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: any;
  onPlanUpdated: (updatedPlan: any) => void;
}

const EditPlanDialog: React.FC<EditPlanDialogProps> = ({ open, onOpenChange, plan, onPlanUpdated }) => {
  const [topicInput, setTopicInput] = useState("");
  const [goalInput, setGoalInput] = useState("");
  const [resourceInput, setResourceInput] = useState("");
  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      title: "",
      description: "",
      duration: "",
      topics: [],
      goals: [],
      resources: [],
      difficulty: "Beginner",
      prerequisites: "",
    },
  });

  useEffect(() => {
    if (open && plan) {
      form.reset({
        title: plan.title || "",
        description: plan.description || "",
        duration: plan.duration || "",
        topics: Array.isArray(plan.topics) ? plan.topics : [],
        goals: Array.isArray(plan.goals) ? plan.goals : [],
        resources: Array.isArray(plan.resources) ? plan.resources : [],
        difficulty: plan.difficulty || "Beginner",
        prerequisites: plan.prerequisites || "",
      });
    }
  }, [open, plan, form]);

  const onSubmit = async (data: PlanFormValues) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/learning-plans/${plan.id}`, data, {
        withCredentials: true,
      });
      toast.success("Learning plan updated successfully!");
      form.reset();
      setTopicInput("");
      setGoalInput("");
      setResourceInput("");
      onOpenChange(false);
      onPlanUpdated(response.data);
    } catch (error) {
      console.error("Error updating plan:", error);
      toast.error("Failed to update learning plan. Please try again.");
    }
  };

  const addTopic = () => {
    if (topicInput.trim() !== "") {
      const currentTopics = form.getValues("topics") || [];
      if (!currentTopics.includes(topicInput.trim())) {
        form.setValue("topics", [...currentTopics, topicInput.trim()]);
        setTopicInput("");
      }
    }
  };

  const removeTopic = (topic: string) => {
    const currentTopics = form.getValues("topics");
    form.setValue("topics", currentTopics.filter((t) => t !== topic));
  };

  const addGoal = () => {
    if (goalInput.trim() !== "") {
      const currentGoals = form.getValues("goals") || [];
      if (!currentGoals.includes(goalInput.trim())) {
        form.setValue("goals", [...currentGoals, goalInput.trim()]);
        setGoalInput("");
      }
    }
  };

  const removeGoal = (goal: string) => {
    const currentGoals = form.getValues("goals");
    form.setValue("goals", currentGoals.filter((g) => g !== goal));
  };

  const addResource = () => {
    if (resourceInput.trim() !== "") {
      const currentResources = form.getValues("resources") || [];
      if (!currentResources.includes(resourceInput.trim())) {
        form.setValue("resources", [...currentResources, resourceInput.trim()]);
        setResourceInput("");
      }
    }
  };

  const removeResource = (resource: string) => {
    const currentResources = form.getValues("resources");
    form.setValue("resources", currentResources.filter((r) => r !== resource));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, addFn: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addFn();
    }
  };

  const watchTopics = form.watch("topics");
  const watchGoals = form.watch("goals");
  const watchResources = form.watch("resources");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Learning Plan</DialogTitle>
          <DialogDescription>Update the details of your learning plan</DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto px-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a title for your learning plan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what this learning plan covers..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 8 weeks, 3 months" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prerequisites"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prerequisites (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List any prior knowledge required..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="topics"
                render={() => (
                  <FormItem>
                    <FormLabel>Topics</FormLabel>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add topics covered in this plan"
                        value={topicInput}
                        onChange={(e) => setTopicInput(e.target.value)}
                        onKeyDown={(e) => handleInputKeyDown(e, addTopic)}
                      />
                      <Button type="button" onClick={addTopic} variant="secondary">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {watchTopics &&
                        watchTopics.map((topic, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            {topic}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => removeTopic(topic)}
                            />
                          </Badge>
                        ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="goals"
                render={() => (
                  <FormItem>
                    <FormLabel>Goals</FormLabel>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add specific learning objectives"
                        value={goalInput}
                        onChange={(e) => setGoalInput(e.target.value)}
                        onKeyDown={(e) => handleInputKeyDown(e, addGoal)}
                      />
                      <Button type="button" onClick={addGoal} variant="secondary">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {watchGoals &&
                        watchGoals.map((goal, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            {goal}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => removeGoal(goal)}
                            />
                          </Badge>
                        ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="resources"
                render={() => (
                  <FormItem>
                    <FormLabel>Resources (Optional)</FormLabel>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add recommended resources (e.g., books, URLs)"
                        value={resourceInput}
                        onChange={(e) => setResourceInput(e.target.value)}
                        onKeyDown={(e) => handleInputKeyDown(e, addResource)}
                      />
                      <Button type="button" onClick={addResource} variant="secondary">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {watchResources &&
                        watchResources.map((resource, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            {resource}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => removeResource(resource)}
                            />
                          </Badge>
                        ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
            Update Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPlanDialog;
