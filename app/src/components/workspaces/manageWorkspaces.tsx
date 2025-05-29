import type { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@lumia/ui";

import Workspaces from "@/components/workspaces";

interface ManageWorkspacesProps {
  trigger: ReactNode;
}

const ManageWorkspaces = (props: ManageWorkspacesProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{props.trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage workspaces</DialogTitle>
          <DialogDescription>
            A workspace is a system folder. Here you can add and delete
            workspaces.
          </DialogDescription>
        </DialogHeader>
        <Workspaces checkOption={false} />
      </DialogContent>
    </Dialog>
  );
};

export default ManageWorkspaces;
