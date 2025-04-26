import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/config/api";
import axios from "axios";

const progressSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }).max(100),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }).max(500),
  milestone: z.string().min(3, { message: "Milestone must be specified" }),
  progressPercent: z.coerce.number().min(0).max(100),
  template: z.enum(["course", "project", "skill"]),
  skillsGained: z.array(z.string()).min(1, { message: "At least one skill must be added" }),
  challengesFaced: z.string().max(500).optional(),
  nextSteps: z.string().max(500).optional(),
  evidenceLink: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal("")),
});

type ProgressFormValues = z.infer<typeof progressSchema>;

interface EditProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progress: any;
  onProgressUpdated: (updatedProgress: any) => void;
}

const EditProgressDialog: React.FC<EditProgressDialogProps> = ({ open, onOpenChange, progress, onProgressUpdated }) => {
  const [skillInput, setSkillInput] = useState("");
  const form = useForm<ProgressFormValues>({
    resolver: zodResolver(progressSchema),
    defaultValues: {
      title: "",
      description: "",
      milestone: "",
      progressPercent: 0,
      template: "course",
      skillsGained: [],
      challengesFaced: "",
      nextSteps: "",
      evidenceLink: "",
    },
  });

  useEffect(() => {
    if (open && progress) {
      form.reset({
        title: progress.title || "",
        description: progress.description || "",
        milestone: progress.milestone || "",
        progressPercent: progress.progressPercent || 0,
        template: progress.template || "course",
        skillsGained: Array.isArray(progress.skillsGained) ? progress.skillsGained : [],
        challengesFaced: progress.challengesFaced || "",
        nextSteps: progress.nextSteps || "",
        evidenceLink: progress.evidenceLink || "",
      });
    }
  }, [open, progress, form]);

  const onSubmit = async (data: ProgressFormValues) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/learning-progress/${progress.id}`, data, {
        withCredentials: true,
      });
      toast.success("Progress update updated successfully!");
      form.reset();
      setSkillInput("");
      onOpenChange(false);
      onProgressUpdated(response.data);
    } catch (error) {
      console.error("Error updating progress:", error);
      toast.error("Failed to update progress update. Please try again.");
    }
  };

  const addSkill = () => {
    if (skillInput.trim() !== "") {
      const currentSkills = form.getValues("skillsGained") || [];
      if (!currentSkills.includes(skillInput.trim())) {
        form.setValue("skillsGained", [...currentSkills, skillInput.trim()]);
        setSkillInput("");
      }
    }
  };

  const removeSkill = (skill: string) => {
    const currentSkills = form.getValues("skillsGained");
    form.setValue("skillsGained", currentSkills.filter((s) => s !== skill));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const selectedTemplate = form.watch("template");
  const watchProgress = form.watch("progressPercent");
  const watchSkills = form.watch("skillsGained");

  React.useEffect(() => {
    if (selectedTemplate === "course") {
      form.setValue("title", form.getValues("title") || "Completed Course: ");
      form.setValue("milestone", form.getValues("milestone") || "Course Completion");
    } else if (selectedTemplate === "project") {
      form.setValue("title", form.getValues("title") || "Project Progress: ");
      form.setValue("milestone", form.getValues("milestone") || "Project Milestone");
    } else if (selectedTemplate === "skill") {
      form.setValue("title", form.getValues("title") || "Skill Development: ");
      form.setValue("milestone", form.getValues("milestone") || "Skill Mastery");
    }
  }, [selectedTemplate, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Progress Update</DialogTitle>
          <DialogDescription>Update your learning progress details</DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto px-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="template"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Update Template</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="course" id="course" />
                          <label htmlFor="course" className="text-sm">Course</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="project" id="project" />
                          <label htmlFor="project" className="text-sm">Project</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="skill" id="skill" />
                          <label htmlFor="skill" className="text-sm">Skill</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a title for your progress update" {...field} />
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
                        placeholder="Describe what you've learned or achieved..."
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
                name="milestone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Milestone</FormLabel>
                    <FormControl>
                      <Input placeholder="What milestone are you working towards?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="progressPercent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Progress: {field.value}%</FormLabel>
                    <FormControl>
                      <Input type="range" min="0" max="100" step="5" {...field} />
                    </FormControl>
                    <Progress value={watchProgress} className="h-2" />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="skillsGained"
                render={() => (
                  <FormItem>
                    <FormLabel>Skills Gained</FormLabel>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add skills you gained"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={handleSkillKeyDown}
                      />
                      <Button type="button" onClick={addSkill} variant="secondary">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {watchSkills &&
                        watchSkills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            {skill}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => removeSkill(skill)}
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
                name="challengesFaced"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Challenges Faced (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe any obstacles you encountered..."
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
                name="nextSteps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next Steps (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What are your next steps?"
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
                name="evidenceLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Evidence Link (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., GitHub repo, certificate URL" {...field} />
                    </FormControl>
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
            Update Progress
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProgressDialog;
