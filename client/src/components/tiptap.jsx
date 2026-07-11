"use client";

import React, { useState } from "react";
import {
  useEditor,
  EditorContent,
  useEditorState,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";

import { Toggle } from "./ui/toggle";
import {
  BoldIcon,
  CodeIcon,
  HighlighterIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  Quote,
  RedoIcon,
  StrikethroughIcon,
  UnderlineIcon,
  UndoIcon,
  UnlinkIcon,
} from "lucide-react";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

import { BubbleMenu as TiptapBubbleMenu } from "@tiptap/react/menus";
import { FloatingMenu as TiptapFloatingMenu } from "@tiptap/react/menus";

const Tiptap = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight.configure({ multicolor: true }),
    ],
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert prose-sm sm:prose-base focus:outline-none max-w-none",
      },
    },
    content,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
    immediatelyRender: false,
  });

  React.useEffect(() => {
    if (!editor) return;
    // Ensure external changes (reset/edit) update editor content
    if (content !== editor.getHTML()) {
      editor.commands.setContent(content || "");
    }
  }, [editor, content]);

  return (
    <div className="bg-background relative rounded-lg border shadow-sm">
      {editor && (
        <>
          <ToolBar editor={editor} />
          <BubbleMenu editor={editor} />
          <FloatingMenu editor={editor} />
        </>
      )}
      <EditorContent editor={editor} className="min-h-[300] px-4 py-3" />
    </div>
  );
};

export default Tiptap;

function LinkComponent({ editor, children }) {
  const [linkUrl, setLinkUrl] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSetLink = () => {
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
    } else {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    }

    setIsOpen(false);
    setLinkUrl("");
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="flex flex-col gap-4">
          <h3 className="font-medium">Insert Link</h3>

          <Input
            placeholder="https://example.com"
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSetLink();
            }}
          />

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSetLink}>Save</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const ToolBar = ({ editor }) => {
  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      isBold: ctx.editor.isActive("bold"),
      isItalic: ctx.editor.isActive("italic"),
      isUnderline: ctx.editor.isActive("underline"),
      isStrike: ctx.editor.isActive("strike"),
      isCode: ctx.editor.isActive("code"),
      isHighlight: ctx.editor.isActive("highlight"),
      isBulletList: ctx.editor.isActive("bulletList"),
      isOrderedList: ctx.editor.isActive("orderedList"),
      isBlockquote: ctx.editor.isActive("blockquote"),
      isLink: ctx.editor.isActive("link"),
      canRedo: editor.can().redo(),
      canUndo: editor.can().undo(),
      isHeading2: ctx.editor.isActive("heading", { level: 2 }),
      isHeading3: ctx.editor.isActive("heading", { level: 3 }),
      isHeading4: ctx.editor.isActive("heading", { level: 4 }),
      isHeading5: ctx.editor.isActive("heading", { level: 5 }),
      isHeading6: ctx.editor.isActive("heading", { level: 6 }),
    }),
  });

  const handleHeadingChange = (value) => {
    if (value === "paragraph") {
      editor.chain().focus().setParagraph().run();
    } else {
      const level = parseInt(value.replace("heading", ""));
      editor.chain().focus().setHeading({ level }).run();
    }
  };

  return (
    <div className="bg-background sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b p-2">
      <Select onValueChange={handleHeadingChange} value="paragraph">
        <SelectTrigger className="w-[180]">
          <SelectValue placeholder="Paragraph" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="paragraph">Paragraph</SelectItem>
          <SelectItem value="heading2">Heading 1</SelectItem>
          <SelectItem value="heading3">Heading 2</SelectItem>
          <SelectItem value="heading4">Heading 3</SelectItem>
          <SelectItem value="heading5">Heading 4</SelectItem>
          <SelectItem value="heading6">Heading 5</SelectItem>
        </SelectContent>
      </Select>

      <Toggle size="sm" pressed={editorState.isBold} onPressedChange={() => editor.chain().focus().toggleBold().run()}>
        <BoldIcon className="h-4 w-4" />
      </Toggle>

      <Toggle size="sm" pressed={editorState.isItalic} onPressedChange={() => editor.chain().focus().toggleItalic().run()}>
        <ItalicIcon className="h-4 w-4" />
      </Toggle>

      <Toggle size="sm" pressed={editorState.isUnderline} onPressedChange={() => editor.chain().focus().toggleUnderline().run()}>
        <UnderlineIcon className="h-4 w-4" />
      </Toggle>

      <Toggle size="sm" pressed={editorState.isStrike} onPressedChange={() => editor.chain().focus().toggleStrike().run()}>
        <StrikethroughIcon className="h-4 w-4" />
      </Toggle>

      <Toggle size="sm" pressed={editorState.isHighlight} onPressedChange={() => editor.chain().focus().toggleHighlight({ color: "#fdeb80" }).run()}>
        <HighlighterIcon className="h-4 w-4" />
      </Toggle>

      <Toggle size="sm" pressed={editorState.isCode} onPressedChange={() => editor.chain().focus().toggleCode().run()}>
        <CodeIcon className="h-4 w-4" />
      </Toggle>

      <Toggle size="sm" pressed={editorState.isBulletList} onPressedChange={() => editor.chain().focus().toggleBulletList().run()}>
        <ListIcon className="h-4 w-4" />
      </Toggle>

      <Toggle size="sm" pressed={editorState.isOrderedList} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrderedIcon className="h-4 w-4" />
      </Toggle>

      <Toggle size="sm" pressed={editorState.isBlockquote} onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className="h-4 w-4" />
      </Toggle>

      <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().undo().run()} disabled={!editorState.canUndo}>
        <UndoIcon className="h-4 w-4" />
      </Button>

      <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().redo().run()} disabled={!editorState.canRedo}>
        <RedoIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};

export const BubbleMenu = ({ editor }) => (
  <TiptapBubbleMenu editor={editor} className="bg-background flex items-center rounded-md border shadow-md">
    <Toggle size="sm" onPressedChange={() => editor.chain().focus().toggleBold().run()}>
      <BoldIcon className="h-4 w-4" />
    </Toggle>
  </TiptapBubbleMenu>
);

export const FloatingMenu = ({ editor }) => (
  <TiptapFloatingMenu editor={editor} className="bg-background flex items-center rounded-md border shadow-md">
    <Toggle size="sm" onPressedChange={() => editor.chain().focus().toggleBold().run()}>
      <BoldIcon className="h-4 w-4" />
    </Toggle>
  </TiptapFloatingMenu>
);