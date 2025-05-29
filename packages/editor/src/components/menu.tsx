import { useState, useRef } from 'react';
import type { MenuEditorProps } from "../types/menuProps";
import { cn } from "../utils/cn";
import { motion } from "framer-motion";
import AssistantDialog from './assistant_dialog'
import ImageSizeDialog from './ImageSizeDialog'
import { JsonRenderer } from './JsonRenderer';

// All icons:
import {
  ArrowLeft,
  ArrowRight,
  BoldIcon,
  CodeIcon,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  ItalicIcon,
  Link2,
  Image as ImageIcon,
  List,
  ListOrdered,
  Minus,
  Paintbrush,
  Pilcrow,
  SaveAll,
  Sparkles,
  StrikethroughIcon,
  Table2,
  TextQuote,
  WrapText,
  XSquare,
  Presentation,
} from "lucide-react";

// Components:
import BtnTooltip from "./tooltip";

const Menu = (props: MenuEditorProps) => {
  // Icons size:
  const iconSize = props.iconSize ?? 16;

  const [isAssistantDialogOpen, setIsAssistantDialogOpen] = useState(false);
  const [showSizeDialog, setShowSizeDialog] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && props.editor) {
      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        alert("Please select an image file (JPEG, PNG, GIF, WebP).");
        return;
      }

      // Size validation (optional)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert("File size should not exceed 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        if (src) {
          setTempImageSrc(src);
          setShowSizeDialog(true);
        }
      };
      reader.onerror = () => {
        alert("Error reading file");
      };
      reader.readAsDataURL(file);
    }

    // Reset input
    if (event.target) {
      event.target.value = '';
    }
  };

  // Функция для клика по кнопке (открывает диалог выбора файла)
  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  // Функция для обработки выбора размера
  const handleSizeSelect = (scale: number) => {
    if (tempImageSrc && props.editor) {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const resizedImage = canvas.toDataURL('image/png');
        
        props.editor?.chain()
          .focus()
          .setImage({ src: resizedImage })
          .run();
      };
      img.src = tempImageSrc;
    }
    setTempImageSrc(null);
  };

  // Handle JSON file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && props.editor) {
      // Check file type
      const isImage = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type);
      const isJson = file.type === 'application/json';

      if (!isImage && !isJson) {
        alert("Please select an image file (JPEG, PNG, GIF, WebP) or JSON file");
        return;
      }

      // Handle image files as before
      if (isImage) {
        // Validate file type
        if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
          alert("Please select an image file (JPEG, PNG, GIF, WebP).");
          return;
        }

        // Size validation (optional)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
          alert("File size should not exceed 5MB");
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const src = e.target?.result as string;
          if (src) {
            setTempImageSrc(src);
            setShowSizeDialog(true);
          }
        };
        reader.onerror = () => {
          alert("Error reading file");
        };
        reader.readAsDataURL(file);
        return;
      }

      // Handle JSON files
      if (isJson) {
        try {
          const text = await file.text();
          const jsonData = JSON.parse(text);
          
          // Create a temporary canvas for rendering
          const canvas = document.createElement('canvas');
          canvas.width = 800;
          canvas.height = 600;
          
          // Render JSON data to canvas using JsonRenderer
          await JsonRenderer.render(canvas, jsonData);
          
          // Convert canvas to image
          const imageDataUrl = canvas.toDataURL('image/png');
          
          // Show size dialog for the rendered image
          setTempImageSrc(imageDataUrl);
          setShowSizeDialog(true);
        } catch (error) {
          console.error('Error processing JSON file:', error);
          alert('Error processing JSON file');
        }
      }
    }

    // Reset input
    if (event.target) {
      event.target.value = '';
    }
  };

  return (
    <div className={cn(props.btnGroupClassName, "flex items-center")}>
      <div className="flex items-center">
        {/* ------------------------ */}
        {/* Undo & Redo */}
        {/* ------------------------ */}
        <div className={cn(props.btnGroupDividerClassName)}>
          <BtnTooltip text="Undo" className={props.btnToolTipClassName}>
            <button
              onClick={() => props.editor?.chain().focus().undo().run()}
              disabled={!props.editor?.can().chain().focus().undo().run()}
              className={cn(props.btnClassName)}
              aria-label="Undo"
            >
              <ArrowLeft size={iconSize} />
            </button>
          </BtnTooltip>
          <BtnTooltip text="Redo" className={props.btnToolTipClassName}>
            <button
              onClick={() => props.editor?.chain().focus().redo().run()}
              disabled={!props.editor?.can().chain().focus().redo().run()}
              className={cn(props.btnClassName)}
              aria-label="Redo"
            >
              <ArrowRight size={iconSize} />
            </button>
          </BtnTooltip>
        </div>
        {/* ------------------------ */}
        {/* Bold, Italic & Striket: */}
        {/* ------------------------ */}
        <div className={cn(props.btnGroupDividerClassName)}>
          <BtnTooltip text="Bold" className={props.btnToolTipClassName}>
            <button
              onClick={() => props.editor?.chain().focus().toggleBold().run()}
              disabled={!props.editor?.can().chain().focus().toggleBold().run()}
              className={cn(
                props.btnClassName,
                props.editor?.isActive("bold") ? props.btnActiveClassName : "",
              )}
              aria-label="Bold"
            >
              <BoldIcon size={iconSize} />
            </button>
          </BtnTooltip>
          <BtnTooltip text="Italic" className={props.btnToolTipClassName}>
            <button
              onClick={() => props.editor?.chain().focus().toggleItalic().run()}
              disabled={!props.editor?.can().chain().focus().toggleItalic().run()}
              className={cn(
                props.btnClassName,
                props.editor?.isActive("italic") ? props.btnActiveClassName : "",
              )}
              aria-label="Italic"
            >
              <ItalicIcon size={iconSize} />
            </button>
          </BtnTooltip>
          <BtnTooltip text="Strike" className={props.btnToolTipClassName}>
            <button
              onClick={() => props.editor?.chain().focus().toggleStrike().run()}
              disabled={!props.editor?.can().chain().focus().toggleStrike().run()}
              className={cn(
                props.btnClassName,
                props.editor?.isActive("strike") ? props.btnActiveClassName : "",
              )}
            >
              <StrikethroughIcon size={iconSize} />
            </button>
          </BtnTooltip>
        </div>
        {/* -------------------- */}
        {/* Code blocks: */}
        {/* -------------------- */}
        <div className={cn(props.btnGroupDividerClassName)}>
          <BtnTooltip text="Inline code" className={props.btnToolTipClassName}>
            <button
              onClick={() => props.editor?.chain().focus().toggleCode().run()}
              disabled={!props.editor?.can().chain().focus().toggleCode().run()}
              className={cn(
                props.btnClassName,
                props.editor?.isActive("code") ? props.btnActiveClassName : "",
              )}
            >
              <CodeIcon size={iconSize} />
            </button>
          </BtnTooltip>
          <BtnTooltip text="Link" className={props.btnToolTipClassName}>
            <button
                onClick={() => {
                // Сначала проверим, есть ли уже ссылка, чтобы ее можно было убрать
                if (props.editor?.isActive('link')) {
                    props.editor?.chain().focus().unsetLink().run();
                    return;
                }
                const url = window.prompt('Введите URL ссылки:');
                if (url) {
                    props.editor
                    ?.chain()
                    .focus()
                    .extendMarkRange('link')
                    .setLink({ href: url, target: "_blank" })
                    .run();
                }
                }}
                className={cn(
                props.btnClassName,
                props.editor?.isActive("link")
                    ? props.btnActiveClassName
                    : "",
                )}
            >
                <Link2 size={iconSize} />
            </button>
            </BtnTooltip>
        </div>
        {/* -------------------- */}
        {/* Text size: */}
        {/* -------------------- */}
        <div className={cn(props.btnGroupDividerClassName)}>
          <BtnTooltip text="Paragraph" className={props.btnToolTipClassName}>
            <button
              onClick={() => props.editor?.chain().focus().setParagraph().run()}
              className={cn(
                props.btnClassName,
                props.editor?.isActive("paragraph")
                  ? props.btnActiveClassName
                  : "",
              )}
            >
              <Pilcrow size={iconSize} />
            </button>
          </BtnTooltip>
          <BtnTooltip text="Heading 1" className={props.btnToolTipClassName}>
            <button
              onClick={() =>
                props.editor?.chain().focus().toggleHeading({ level: 1 }).run()
              }
              className={cn(
                props.btnClassName,
                props.editor?.isActive("heading", { level: 1 })
                  ? props.btnActiveClassName
                  : "",
              )}
            >
              <Heading1 size={iconSize} />
            </button>
          </BtnTooltip>
          <BtnTooltip text="Heading 2" className={props.btnToolTipClassName}>
            <button
              onClick={() =>
                props.editor?.chain().focus().toggleHeading({ level: 2 }).run()
              }
              className={cn(
                props.btnClassName,
                props.editor?.isActive("heading", { level: 2 })
                  ? props.btnActiveClassName
                  : "",
              )}
            >
              <Heading2 size={iconSize} />
            </button>
          </BtnTooltip>
          <BtnTooltip text="Heading 3" className={props.btnToolTipClassName}>
            <button
              onClick={() =>
                props.editor?.chain().focus().toggleHeading({ level: 3 }).run()
              }
              className={cn(
                props.btnClassName,
                props.editor?.isActive("heading", { level: 3 })
                  ? props.btnActiveClassName
                  : "",
              )}
            >
              <Heading3 size={iconSize} />
            </button>
          </BtnTooltip>
          <BtnTooltip text="Heading 4" className={props.btnToolTipClassName}>
            <button
              onClick={() =>
                props.editor?.chain().focus().toggleHeading({ level: 4 }).run()
              }
              className={cn(
                props.btnClassName,
                props.editor?.isActive("heading", { level: 4 })
                  ? props.btnActiveClassName
                  : "",
              )}
            >
              <Heading4 size={iconSize} />
            </button>
          </BtnTooltip>
          <BtnTooltip text="Heading 5" className={props.btnToolTipClassName}>
            <button
              onClick={() =>
                props.editor?.chain().focus().toggleHeading({ level: 5 }).run()
              }
              className={cn(
                props.btnClassName,
                props.editor?.isActive("heading", { level: 5 })
                  ? props.btnActiveClassName
                  : "",
              )}
            >
              <Heading5 size={iconSize} />
            </button>
          </BtnTooltip>
          <BtnTooltip text="Heading 6" className={props.btnToolTipClassName}>
            <button
              onClick={() =>
                props.editor?.chain().focus().toggleHeading({ level: 6 }).run()
              }
              className={cn(
                props.btnClassName,
                props.editor?.isActive("heading", { level: 6 })
                  ? props.btnActiveClassName
                  : "",
              )}
            >
              <Heading6 size={iconSize} />
            </button>
          </BtnTooltip>
        </div>
        {/* -------------------- */}
        {/* Table: */}
        {/* -------------------- */}
        <div className={cn(props.btnGroupDividerClassName)}>
          <BtnTooltip text="Insert Table" className={props.btnToolTipClassName}>
            <button
              onClick={() => {
                const rowsInput = prompt("Enter the number of rows (maximum: 8):");
                if (rowsInput === null || rowsInput.trim() === "") {
                  return;
                }

                const rows = parseInt(rowsInput, 10);

                if (isNaN(rows) || rows <= 0) {
                  alert("Incorrect number of rows. Please enter a positive number.");
                  return;
                }

                // Запрашиваем количество столбцов
                const colsInput = prompt("Enter the number of columns (maximum: 8):");
                if (colsInput === null || colsInput.trim() === "") {
                  return;
                }

                const cols = parseInt(colsInput, 10);

                if (isNaN(cols) || cols <= 0) {
                  alert("Incorrect number of columns. Please enter a positive number.");
                  return;
                }

                // Если оба значения корректны, вызываем команду вставки таблицы с новыми размерами
                props.editor
                  ?.chain()
                  .focus()
                  .insertTable({ rows: rows, cols: cols, withHeaderRow: true })
                  .run();
              }}
              className={cn(props.btnClassName)}
              aria-label="Insert Table"
            >
              <Table2 size={iconSize} />
            </button>
          </BtnTooltip>
          <BtnTooltip text="Delete Table" className={props.btnToolTipClassName}>
            <button
              onClick={() => props.editor?.chain().focus().deleteTable().run()}
              className={cn(props.btnClassName)}
            >
              <XSquare size={iconSize} />
            </button>
          </BtnTooltip>
        </div>
        {/* -------------------- */}
        {/* Lists: */}
        {/* -------------------- */}
        <div className={cn(props.btnGroupDividerClassName)}>
          <BtnTooltip text="Bullet list" className={props.btnToolTipClassName}>
            <button
              onClick={() =>
                props.editor?.chain().focus().toggleBulletList().run()
              }
              className={cn(
                props.btnClassName,
                props.editor?.isActive("bulletList")
                  ? props.btnActiveClassName
                  : "",
              )}
            >
              <List size={iconSize} />
            </button>
          </BtnTooltip>
          <BtnTooltip text="Ordered list" className={props.btnToolTipClassName}>
            <button
              onClick={() =>
                props.editor?.chain().focus().toggleOrderedList().run()
              }
              className={cn(
                props.btnClassName,
                props.editor?.isActive("orderedList")
                  ? props.btnActiveClassName
                  : "",
              )}
            >
              <ListOrdered size={iconSize} />
            </button>
          </BtnTooltip>
        </div>
        {/* -------------------- */}
        {/* Quote: */}
        {/* -------------------- */}
        <div className={cn(props.btnGroupDividerClassName)}>
          <BtnTooltip text="Blockquote" className={props.btnToolTipClassName}>
            <button
              onClick={() =>
                props.editor?.chain().focus().toggleBlockquote().run()
              }
              className={cn(
                props.btnClassName,
                props.editor?.isActive("blockquote")
                  ? props.btnActiveClassName
                  : "",
              )}
            >
              <TextQuote size={iconSize} />
            </button>
          </BtnTooltip>
          <BtnTooltip
            text="Horizontal Rule"
            className={props.btnToolTipClassName}
          >
            <button
              onClick={() =>
                props.editor?.chain().focus().setHorizontalRule().run()
              }
              className={cn(props.btnClassName)}
            >
              <Minus size={iconSize} />
            </button>
          </BtnTooltip>
          <BtnTooltip text="Hard break" className={props.btnToolTipClassName}>
            <button
              onClick={() => props.editor?.chain().focus().setHardBreak().run()}
              className={cn(props.btnClassName)}
            >
              <WrapText size={iconSize} />
            </button>
          </BtnTooltip>
        </div>
        {/* -------------------- */}
        {/* Save option: */}
        {/* -------------------- */}
        <div className={cn(props.btnGroupDividerClassName)}>
          {props.saveOnClickFn && (
            <BtnTooltip text="Save" className={props.btnToolTipClassName}>
              <button
                onClick={props.saveOnClickFn}
                className={cn(props.btnClassName)}
              >
                <SaveAll size={iconSize} />
              </button>
            </BtnTooltip>
          )}
          <BtnTooltip
            text="Remove all marks"
            className={props.btnToolTipClassName}
          >
            <button
              onClick={() => props.editor?.chain().focus().unsetAllMarks().run()}
              className={cn(props.btnClassName)}
            >
              <Paintbrush size={iconSize} />
            </button>
          </BtnTooltip>
        </div>
      </div>

      {/* -------------------- */}
      {/* Вставка изображения:  */}
      {/* -------------------- */}
      <div className={cn(props.btnGroupDividerClassName)}>
        <BtnTooltip text="Insert Image" className={props.btnToolTipClassName}>
          <button
            onClick={triggerImageUpload}
            className={cn(props.btnClassName)}
            aria-label="Insert Image"
          >
            <ImageIcon size={iconSize} />
          </button>
        </BtnTooltip>
        {/* Скрытый input для выбора файла */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/png, image/jpeg, image/gif, image/webp, application/json"
          style={{ display: 'none' }}
        />
      </div>

      {/* -------------------- */}
      {/* Вставка Json:  */}
      {/* -------------------- */}
      <div className={cn(props.btnGroupDividerClassName)}>
        <BtnTooltip text="Insert file" className={props.btnToolTipClassName}>
          <button
            onClick={triggerImageUpload}
            className={cn(props.btnClassName)}
            aria-label="Insert file"
          >
            <Presentation size={iconSize} />
          </button>
        </BtnTooltip>
        {/* Скрытый input для выбора файла */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/png, image/jpeg, image/gif, image/webp, application/json"
          style={{ display: 'none' }}
        />
      </div>


      {/* -------------------- */}
      {/* AI Assistant */}
      {/* -------------------- */}
      <div className={cn(props.btnGroupDividerClassName)} style={{ margin: "0", padding: "0" }}></div>
        <BtnTooltip text="Mia AI Assistant" className={props.btnToolTipClassName}>
          <motion.button
        onClick={() => {
          setIsAssistantDialogOpen(true);
        }}
        className={cn(
          props.btnClassName,
          "relative",
          "hover:text-white transition-colors",
          "text-pink-500 hover:text-pink-300"
        )}
        initial={{ 
          boxShadow: "0 0 0 rgba(236, 72, 153, 0)",
          position: "relative",
        }}
        whileHover={{ 
          boxShadow: [
            "0 0 15px rgba(236, 72, 153, 0.6)", 
            "0 0 25px rgba(236, 72, 153, 0.4)",
            "0 0 35px rgba(236, 72, 153, 0.2)"
          ],
          scale: 1.05,
        }}
        transition={{ 
          repeat: Infinity, 
          repeatType: "reverse", 
          duration: 1.5,
          boxShadow: {
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse",
          },
          scale: {
            duration: 0.2
          }
        }}
        style={{
          padding: "1px 8px", 
          borderRadius: "9px",
          marginTop: "4px"
        }}
        aria-label="AI Assistant"
          >
        <div className="flex items-center space-x-1">
          <Sparkles size={iconSize} />
        </div>
          </motion.button>
        </BtnTooltip>

        <AssistantDialog 
        isOpen={isAssistantDialogOpen}
        onClose={() => setIsAssistantDialogOpen(false)}
        title="✨Mia AI"
      />
      <ImageSizeDialog
        isOpen={showSizeDialog}
        onClose={() => setShowSizeDialog(false)}
        onSizeSelect={handleSizeSelect}
      />
      </div>
  );
};

export { Menu };