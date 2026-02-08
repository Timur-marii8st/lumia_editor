import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { useWorkspaceStore } from "@/store/workspaceStore";
import "@/styles/tiptap-code.css";

import { getFileNameWithoutExtension, updateFile } from "@lumia/functions";
import { useEditor, Menu, Editor, Extensions } from "@lumia/editor";
import { AIAssistantPanel } from "@/components/AIAssistantPanel";
import { OllamaLaunchButton } from "@/components/OllamaLaunchButton";

import PageNavbar from "@/components/pageNavbar";

import {
  cn,
  buttonVariants,
  TooltipStyles,
  ProseClasses,
  Button,
} from "@lumia/ui";

const ProseStyle = cn(
  "focus:outline-none outline-none",
  "overflow-y-auto overflow-x-hidden mx-auto",
  ProseClasses,
);

const EditorPage = () => {
  const fileSelected = useWorkspaceStore((state) => state.selectedFile);
  const [text, setText] = useState<string | undefined>("");
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  
  const editor = useEditor({
    extensions: [
      ...Extensions,
    ],
    injectCSS: false,
    content: fileSelected?.content,
    onUpdate: ({ editor }) => {
      setText(editor.storage.markdown.getMarkdown());
    },
    autofocus: true,
    editable: true,
    editorProps: {
      attributes: {
        class: ProseStyle,
      },
    },
  });

  useHotkeys("ctrl+s", () => handleSaveFile());

  useEffect(() => {
    if (!fileSelected) return;
    editor?.chain().focus().setContent(fileSelected.content).run();
    setText(fileSelected.content);
  }, [fileSelected]);

  if (!fileSelected) return null;

  const handleSaveFile = async () => {
    try {
      await updateFile({
        path: fileSelected.path,
        content: text!,
      });
      toast.success("File saved!");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Editor
        editor={editor}
        defaultValue={fileSelected.content}
        autoFocus={true}
        spellCheck={false}
        editorContentClassName="p-4"
        onUpdate={({ editor }) => {
          setText(editor.storage.markdown.getMarkdown());
        }}
      >
        <PageNavbar
          title={getFileNameWithoutExtension(fileSelected.path)!}
          close={true}
        >
          <div className="flex items-center space-x-2 w-full">
            <Menu
              editor={editor}
              btnClassName={buttonVariants({
                variant: "ghost",
                className:
                  "p-1 text-neutral-500/80 dark:text-neutral-500/80 hover:bg-transparent dark:hover:bg-transparent",
              })}
              btnActiveClassName="text-dark dark:text-white"
              btnGroupClassName="flex items-center border-b border-neutral-300/50 dark:border-neutral-800 overflow-x-auto bg-neutral-100 dark:bg-neutral-900 flex-1 z-50 pb-2"
              btnGroupDividerClassName="flex items-center space-x-1 h-6 px-2 first:border-none border-l border-neutral-300/50 dark:border-neutral-800"
              btnToolTipClassName={TooltipStyles}
              saveOnClickFn={handleSaveFile}
            />
            
            <div className="flex items-center space-x-2 pr-4">
              <OllamaLaunchButton />
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAIPanelOpen(!isAIPanelOpen)}
                className={cn(
                  "text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300",
                  isAIPanelOpen && "bg-pink-50 dark:bg-pink-900/20"
                )}
                title="AI Assistant"
              >
                <Sparkles size={20} />
              </Button>
            </div>
          </div>
        </PageNavbar>
      </Editor>

      <AIAssistantPanel
        editor={editor}
        isOpen={isAIPanelOpen}
        onClose={() => setIsAIPanelOpen(false)}
      />
    </>
  );
};

export default EditorPage;
