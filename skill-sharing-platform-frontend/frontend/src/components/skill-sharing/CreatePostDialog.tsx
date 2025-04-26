import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { X, Image, Hash } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { API_BASE_URL } from "@/config/api";

const postSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }).max(100),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }).max(500),
  category: z.string().min(1, { message: "Please select a category" }),
  tags: z.array(z.string()).optional(),
  allowComments: z.boolean().default(true),
  visibility: z.enum(["public", "followers", "private"]),
});

type PostFormValues = z.infer<typeof postSchema>;

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostCreated?: (newPost: any) => void;
}

const CreatePostDialog: React.FC<CreatePostDialogProps> = ({ open, onOpenChange, onPostCreated }) => {
  const [tagInput, setTagInput] = useState("");
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      tags: [],
      allowComments: true,
      visibility: "public",
    },
  });

  const onSubmit = async (data: PostFormValues) => {
    const formData = new FormData();
    const postData = {
      ...data,
      likes: 0,
      comments: 0,
    };
    formData.append("post", JSON.stringify(postData));
    if (mediaFile) {
      formData.append("image", mediaFile);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/skill-posts`, {
        method: "POST",
        body: formData,
        credentials: "include", // Include cookies for OAuth
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create post: ${response.status} ${errorText}`);
      }
      const newPost = await response.json();
      toast.success("Post created successfully!");
      form.reset();
      setMediaPreview(null);
      setMediaFile(null);
      setTagInput("");
      onOpenChange(false);
      if (onPostCreated) onPostCreated(newPost);
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post. Please try again.");
    }
  };

  const addTag = () => {
    if (tagInput.trim() !== "") {
      const currentTags = form.getValues("tags") || [];
      if (!currentTags.includes(tagInput.trim())) {
        form.setValue("tags", [...currentTags, tagInput.trim()]);
        setTagInput("");
      }
    }
  };

  const removeTag = (tag: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue("tags", currentTags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      const reader = new FileReader();
      reader.onload = () => setMediaPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const categories = [
    "Programming", "Design", "Data Science", "Web Development",
    "Mobile Development", "DevOps", "Soft Skills", "Career", "Other",
  ];

  const watchTags = form.watch("tags");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
          <DialogDescription>Share your knowledge and skills with the community</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a descriptive title for your post" {...field} />
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
                        placeholder="Describe what you want to share..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid grid-cols-3 gap-2"
                      >
                        {categories.map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <RadioGroupItem value={category} id={`category-${category}`} />
                            <label htmlFor={`category-${category}`} className="text-sm cursor-pointer">
                              {category}
                            </label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add tags (press Enter to add)"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        className="flex-1"
                      />
                      <Button type="button" onClick={addTag} variant="secondary" size="sm">
                        <Hash className="h-4 w-4 mr-1" /> Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {watchTags && watchTags.length > 0 ? (
                        watchTags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No tags added</p>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-4">
                <FormLabel>Media</FormLabel>
                <div className="flex flex-col space-y-4">
                  <div className="border border-dashed border-gray-300 rounded-md p-6 text-center relative cursor-pointer hover:bg-gray-50">
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    {!mediaPreview ? (
                      <div>
                        <div className="flex justify-center mb-2 space-x-2">
                          <Image className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Drag and drop an image here, or click to select a file
                        </p>
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={mediaPreview}
                          alt="Preview"
                          className="max-h-[200px] mx-auto rounded-md"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => {
                            setMediaPreview(null);
                            setMediaFile(null);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-8">
                <FormField
                  control={form.control}
                  name="allowComments"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 rounded-md">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} id="allowComments" />
                      </FormControl>
                      <label htmlFor="allowComments" className="text-sm cursor-pointer">Allow comments</label>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="visibility"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel>Visibility:</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-row items-center space-x-4"
                        >
                          <div className="flex items-center space-x-1">
                            <RadioGroupItem value="public" id="visibility-public" />
                            <label htmlFor="visibility-public" className="text-sm cursor-pointer">Public</label>
                          </div>
                          <div className="flex items-center space-x-1">
                            <RadioGroupItem value="followers" id="visibility-followers" />
                            <label htmlFor="visibility-followers" className="text-sm cursor-pointer">Followers</label>
                          </div>
                          <div className="flex items-center space-x-1">
                            <RadioGroupItem value="private" id="visibility-private" />
                            <label htmlFor="visibility-private" className="text-sm cursor-pointer">Private</label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Post</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostDialog;