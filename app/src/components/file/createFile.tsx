import { useState, type ReactNode } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { toast } from "sonner";

import { checkDirFile, createFile } from "@lumia/functions";

import {
  Input,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  FormGroup,
  Button,
} from "@lumia/ui";

import Tip from "@/components/tip";
import Workspaces from "@/components/workspaces";

interface CreateFileProps {
  trigger: ReactNode;
}

interface CreateFileInputs {
  title: string;
}

const CreateFile = ({ trigger }: CreateFileProps) => {
  const { register, handleSubmit, reset, formState } = useForm<CreateFileInputs>({ mode: 'onChange' });
  const [openDialog, setOpenDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const selectFile = useWorkspaceStore((state) => state.setSelectedFile);
  const addFile = useWorkspaceStore((state) => state.addFileToWorkspace);
  const selectedWorkspace = useWorkspaceStore((state) => state.selectedWorkspace);
  const deleteWorkspace = useWorkspaceStore((state) => state.deleteWorkspace);

  const navigate = useNavigate();

  useHotkeys("ctrl+n", () => setOpenDialog(true));

  const forbiddenChars = /[\\/:*?"<>|'']/;

  const handleCreateFile: SubmitHandler<CreateFileInputs> = async (data) => {
    if (!selectedWorkspace) {
      toast.error("Please select a workspace.");
      return;
    }

    if (forbiddenChars.test(data.title)) {
      toast.error("Invalid title.", {
        description: "Title cannot contain special characters like \\ / : * ? \" < > | '",
      });
      return;
    }

    setIsLoading(true);

    try {
      const directoryExists = await checkDirFile(selectedWorkspace.folderPath);

      if (!directoryExists) {
        setIsLoading(false);
        toast.error("Directory not found.", {
          description: `The directory ${selectedWorkspace.folderPath} was not found.`,
        });
        deleteWorkspace(selectedWorkspace.folderPath);
        setOpenDialog(false);
        reset();
        return;
      }

      const fullPath = await createFile({
        path: selectedWorkspace.folderPath,
        filename: data.title,
        extension: "md",
        content: "",
      });

      if (!fullPath) {
        throw new Error("Failed to create file.");
      }

      const file = {
        name: `${data.title}.md`,
        path: fullPath,
      };

      addFile(selectedWorkspace.folderPath, file);
      selectFile({ path: fullPath, content: "" });

      toast.success("Note created successfully.", {
        description: `Saved in ${selectedWorkspace.folderPath}`,
      });

      reset();
      setOpenDialog(false);
      navigate("/editor");
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while creating the file.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={openDialog} onOpenChange={(open) => { setOpenDialog(open); reset(); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Note</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleCreateFile)} className="space-y-4">
          <FormGroup>
            <label htmlFor="title" className="text-sm">
              Title:
            </label>
            <Input
              id="title"
              placeholder="Enter title..."
              disabled={isLoading}
              {...register("title", { required: "Title is required" })}
            />
          </FormGroup>

          <FormGroup>
            <div className="flex items-center justify-between">
              <label htmlFor="workspace" className="text-sm">
                Workspace:
              </label>
              <Tip
                text="The workspace is the folder where your document will be saved. Select a folder and it will automatically be added to the workspace."
                iconSize={13}
              />
            </div>
            <Workspaces checkOption />
          </FormGroup>

          <DialogFooter>
            <Button
              variant="ghost"
              type="button"
              onClick={() => { setOpenDialog(false); reset(); }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedWorkspace || isLoading || !formState.isValid}
            >
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFile;
