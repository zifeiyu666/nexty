"use client";

import { deleteTagAction, updateTagAction } from "@/actions/posts/tags";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PostType } from "@/lib/db/schema";
import { useTagStore } from "@/stores/tagStore";
import { Tag } from "@/types/cms";
import { Check, Edit3, Loader2, Tags, Trash2, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { TagCreateForm } from "./TagCreateForm";

export function TagManagementDialog({ postType }: { postType: PostType }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editingTagName, setEditingTagName] = useState("");

  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {
    tags: tagsMap,
    isLoading: isLoadingMap,
    fetchTags,
    addTag,
    updateTag,
    removeTag,
  } = useTagStore();

  const tags = tagsMap[postType] || [];
  const isLoading = isLoadingMap[postType] ?? true;

  // Initial load when mounting or opening
  useEffect(() => {
    if (isOpen) {
      // Re-fetch in background to ensure freshness, but show cached data immediately
      fetchTags(postType, true);
    } else {
      // Ensure data is loaded at least once if not already
      fetchTags(postType);
    }
  }, [isOpen, postType, fetchTags]);

  const handleTagCreated = (tag: Tag) => {
    addTag(postType, tag);
  };

  const confirmDelete = (tag: Tag) => {
    setTagToDelete(tag);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteTag = () => {
    if (!tagToDelete) return;

    startTransition(async () => {
      const result = await deleteTagAction({ id: tagToDelete.id });
      if (result.success) {
        toast.success(`Tag "${tagToDelete.name}" deleted.`);
        removeTag(postType, tagToDelete.id);
        setIsDeleteDialogOpen(false); // Close dialog only on success
        setTagToDelete(null);
      } else {
        toast.error(`Failed to delete tag "${tagToDelete.name}".`, {
          description: result.error,
        });
        // Keep dialog open if failed, maybe user wants to try again or read error
      }
    });
  };

  const handleStartEdit = (tag: Tag) => {
    setEditingTag(tag);
    setEditingTagName(tag.name);
  };

  const handleCancelEdit = () => {
    setEditingTag(null);
    setEditingTagName("");
  };

  const handleUpdateTag = async () => {
    if (!editingTag || !editingTagName.trim()) {
      toast.info("Tag name is required.");
      return;
    }
    if (
      tags.some(
        (tag) =>
          tag.id !== editingTag.id &&
          tag.name.toLowerCase() === editingTagName.trim().toLowerCase()
      )
    ) {
      toast.info(`Tag "${editingTagName.trim()}" already exists.`);
      return;
    }

    startTransition(async () => {
      const result = await updateTagAction({
        id: editingTag.id,
        name: editingTagName.trim(),
      });
      if (result.success && result.data?.tag) {
        toast.success(`Tag updated.`);
        updateTag(postType, result.data.tag);
        handleCancelEdit();
      } else {
        toast.error("Failed to update tag.", {
          description: result.error,
        });
      }
    });
  };

  // Sort tags for display
  const sortedTags = [...tags].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Tags className="mr-2 h-4 w-4" /> Manage Tags
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] flex flex-col h-[600px] max-h-[85vh] p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>Manage Tags</DialogTitle>
            <DialogDescription>
              Create, edit, or delete tags for your posts.
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 border-b bg-muted/20">
            <TagCreateForm
              existingTags={tags}
              onTagCreated={handleTagCreated}
              disabled={isPending}
              postType={postType}
            />
          </div>

          <ScrollArea className="flex-1 min-h-0 overflow-hidden">
            {isLoading && tags.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-40 gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Loading tags...
                </span>
              </div>
            ) : sortedTags.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-40 text-center p-4">
                <Tags className="h-10 w-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm font-medium text-muted-foreground">
                  No tags found
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Create your first tag using the form above.
                </p>
              </div>
            ) : (
              <div className="p-4">
                <ul className="space-y-2">
                  {sortedTags.map((tag) => (
                    <li
                      key={tag.id}
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors group bg-card"
                    >
                      {editingTag?.id === tag.id ? (
                        <div className="flex items-center gap-2 w-full animate-in fade-in zoom-in-95 duration-200">
                          <Input
                            value={editingTagName}
                            onChange={(e) => setEditingTagName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !isPending) {
                                handleUpdateTag();
                              } else if (e.key === "Escape") {
                                handleCancelEdit();
                              }
                            }}
                            className="h-9 flex-1"
                            disabled={isPending}
                            autoFocus
                            placeholder="Tag name"
                          />
                          <div className="flex space-x-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleUpdateTag}
                              disabled={isPending || !editingTagName.trim()}
                              className="h-9 w-9 hover:bg-green-100 hover:text-green-700"
                              title="Save"
                            >
                              {isPending && editingTag?.id === tag.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleCancelEdit}
                              disabled={isPending}
                              className="h-9 w-9 hover:bg-red-100 hover:text-red-700"
                              title="Cancel"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              <Tags className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-medium">
                              {tag.name}
                            </span>
                          </div>
                          <div className="flex space-x-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleStartEdit(tag)}
                              title="Edit tag"
                              disabled={isPending}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => confirmDelete(tag)}
                              title="Delete tag"
                              disabled={isPending}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </ScrollArea>

          <DialogFooter className="p-4 border-t bg-background">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          if (!isPending) setIsDeleteDialogOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the tag "
              <span className="font-semibold text-foreground">
                {tagToDelete?.name}
              </span>
              ". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault(); // Prevent auto-closing
                handleDeleteTag();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
