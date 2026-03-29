"use client";

import { useState, useTransition } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { saveNotesAction } from "@/lib/actions/notes";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function NotesEditor({ subjectKey, initialHtml }: { subjectKey: string; initialHtml: string }) {
  const [isPending, startTransition] = useTransition();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({
        placeholder: "Write high-yield points, mnemonics, and traps…",
      }),
    ],
    content: initialHtml,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "tiptap max-w-none min-h-[220px] rounded-lg border border-card-border bg-background px-3 py-2 text-sm leading-relaxed text-foreground focus:outline-none [&_h2]:mt-3 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:mt-2 [&_h3]:text-sm [&_h3]:font-semibold [&_li]:my-0.5 [&_ol]:ml-4 [&_ol]:list-decimal [&_p]:my-1 [&_ul]:ml-4 [&_ul]:list-disc",
      },
    },
  });

  const save = () => {
    if (!editor) return;
    const html = editor.getHTML();
    startTransition(async () => {
      try {
        await saveNotesAction(subjectKey, html);
        toast.success("Notes saved");
      } catch {
        toast.error("Could not save notes");
      }
    });
  };

  if (!editor) {
    return <p className="text-sm text-muted">Loading editor…</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="secondary" onClick={() => editor.chain().focus().toggleBold().run()}>
          Bold
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Italic
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          Bullets
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          Numbered
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </Button>
      </div>
      <EditorContent editor={editor} />
      <Button type="button" disabled={isPending} onClick={save}>
        Save notes
      </Button>
    </div>
  );
}
