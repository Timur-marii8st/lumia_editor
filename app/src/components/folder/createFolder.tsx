import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Input,
  FormGroup,
  DialogFooter,
  Button,
} from "@lumia/ui";
import { SubmitHandler, useForm } from "react-hook-form";
import { createFolder } from "@lumia/functions";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { toast } from "sonner";

interface CreateFolderProps {
  trigger: ReactNode;
}

interface CreateFolderInputs {
  title: string;
}

const CreateFolder = ({ trigger }: CreateFolderProps): JSX.Element => {
  const { register, handleSubmit, reset } = useForm<CreateFolderInputs>();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const addWorkspace = useWorkspaceStore((state) => state.addWorkspace);

  const forbiddenChars = /[\\/:*?"<>|' ]/;

  const handleCreateFolder: SubmitHandler<CreateFolderInputs> = async (data) => {
    setIsLoading(true);

    // Check for forbidden characters first
    if (forbiddenChars.test(data.title)) {
      toast.error("Invalid title.", {
        description:
          "Title cannot contain special characters like \\ / : * ? \" < > | ' or spaces.",
      });
      setIsLoading(false);
      return;
    }

    // Check for duplicate workspace name
    if (workspaces.some((ws) => ws.folderName === data.title)) {
      toast.error("Folder already exists.");
      setIsLoading(false);
      return;
    }

    try {
      const result = await createFolder(data.title);
      if (!result?.directory) {
        throw new Error("No directory returned from createFolder");
      }

      addWorkspace({
        folderName: data.title,
        folderPath: result.directory,
        files: [],
        createdAt: new Date(),
      });

      toast.success("Folder created successfully.", {
        description: `Created at ${result.directory}`,
      });

      reset();
      setOpen(false);
    } catch (error: any) {
      console.error("Create folder error:", error);
      toast.error("An error occurred while creating the folder.", {
        description: error.message || undefined,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) reset();
    }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Workspace</DialogTitle>
          <DialogDescription>
            A folder will be created inside your system documents folder.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleCreateFolder)} className="space-y-4">
          <FormGroup>
            <label htmlFor="title">Folder name:</label>
            <Input
              id="title"
              disabled={isLoading}
              {...register("title", { required: "Folder name is required" })}
            />
          </FormGroup>

          <DialogFooter>
            <Button
              variant="ghost"
              type="button"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFolder;
