import { useState } from "react";
import { FolderIcon, FolderOpen, FolderPlus, Search, X } from "lucide-react";
import { toast } from "sonner";
import { removeDir } from "@tauri-apps/api/fs";
import { useWorkspaceStore } from "@/store/workspaceStore";
import {
  checkDirFile,
  readFilesFromFolder,
  selectFolder,
} from "@lumia/functions";
import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Input,
  RadioGroup,
  RadioGroupItem,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@lumia/ui";
import CreateFolder from "../folder/createFolder";

interface Workspace {
  folderName: string;
  folderPath: string;
  files?: unknown[];
  createdAt?: Date;
}

interface WorkspacesProps {
  checkOption?: boolean;
}

const Workspaces = ({ checkOption }: WorkspacesProps) => {
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const addWorkspace = useWorkspaceStore((state) => state.addWorkspace);
  const deleteWorkspace = useWorkspaceStore((state) => state.deleteWorkspace);
  const selectWorkspace = useWorkspaceStore((state) => state.selectWorkspace);
  const selectedWorkspace = useWorkspaceStore((state) => state.selectedWorkspace);

  const [search, setSearch] = useState<string>("");
  const [openCollapsible, setOpenCollapsible] = useState<boolean>(false);

  // Confirmation dialog state
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<Workspace | null>(null);

  const handleAddWorkspace = async () => {
    try {
      const folder = await selectFolder();
      if (!folder) return;

      if (workspaces.some((w) => w.folderPath === folder.folderPath)) {
        toast.error("The workspace already exists.", {
          description: `${folder.folderName} is already added as a workspace.`,
        });
        return;
      }

      const result = await readFilesFromFolder({ path: folder.folderPath });
      addWorkspace({
        folderName: folder.folderName,
        folderPath: folder.folderPath,
        files: result || [],
        createdAt: new Date(),
      });
      selectWorkspace(folder.folderPath);
      toast.success("Workspace added.", {
        description: `You can now start working on ${folder.folderName}.`,
      });
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    }
  };

  const promptDelete = (workspace: Workspace) => {
    setWorkspaceToDelete(workspace);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!workspaceToDelete) return;

    try {
      // Physically remove folder and its contents
      await removeDir(workspaceToDelete.folderPath, { recursive: true });

      // Update store
      deleteWorkspace(workspaceToDelete.folderPath);
      selectWorkspace(null);

      toast.success("Workspace deleted permanently.");
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to delete workspace.", {
        description: error.message,
      });
    } finally {
      setConfirmOpen(false);
      setWorkspaceToDelete(null);
    }
  };

  const handleSelectWorkspace = async (path: string) => {
    try {
      const exists = await checkDirFile(path);
      if (!exists) {
        toast.error("Directory not found.", {
          description: `The directory ${path} was not found.`,
        });
        deleteWorkspace(path);
        return;
      }
      selectWorkspace(path);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <Collapsible open={openCollapsible} onOpenChange={setOpenCollapsible}>
        <div className="flex items-center space-x-2">
          <CreateFolder
            trigger={
              <Button variant="outline" className="flex w-full items-center space-x-2">
                <FolderPlus size={16} />
                <span>New</span>
              </Button>
            }
          />
          <Button
            variant="outline"
            className="flex w-full items-center space-x-2"
            onClick={(e) => {
              e.preventDefault();
              handleAddWorkspace();
            }}
          >
            <FolderOpen size={16} />
            <span>Open</span>
          </Button>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="icon" className="flex w-32">
              {openCollapsible ? <X size={16} /> : <Search size={16} />}
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <Input
            autoFocus
            placeholder="Search..."
            value={search}
            className="mt-2"
            onChange={(e) => setSearch(e.target.value)}
          />
        </CollapsibleContent>
      </Collapsible>

      <RadioGroup className="rounded-md border border-neutral-300 p-3 text-sm dark:border-neutral-800">
        {workspaces.length > 0 ? (
          workspaces
            .slice()
            .sort((a, b) => a.folderName.localeCompare(b.folderName))
            .filter((w) =>
              search
                ? w.folderName.toLowerCase().includes(search.toLowerCase())
                : true
            )
            .map((workspace) => (
              <div
                key={workspace.folderPath}
                className="flex items-center justify-between overflow-hidden"
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  {checkOption ? (
                    <RadioGroupItem
                      value={workspace.folderPath}
                      id={workspace.folderPath}
                      checked={workspace.folderPath === selectedWorkspace?.folderPath}
                      onClick={() => handleSelectWorkspace(workspace.folderPath)}
                    />
                  ) : (
                    <FolderIcon size={16} className="text-neutral-500" />
                  )}
                  <label
                    htmlFor={workspace.folderPath}
                    className="truncate"
                    title={workspace.folderName}
                  >
                    {workspace.folderName}
                  </label>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => promptDelete(workspace)}
                      >
                        <X size={15} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      Delete workspace
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ))
        ) : (
          <div className="flex flex-col justify-center space-y-2 text-center text-neutral-600 dark:text-neutral-400">
            <p>You don't have any workspaces yet.</p>
          </div>
        )}
      </RadioGroup>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogTrigger asChild>
          {/* Hidden trigger; we open programmatically */}
          <span style={{ display: "none" }} />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Workspace</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to permanently delete workspace "{workspaceToDelete?.folderName}" and all of its contents?
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Workspaces;
