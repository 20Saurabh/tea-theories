'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockExtension from '@tiptap/extension-code-block';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { useCallback } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code, Link2,
  Image as ImageIcon, Video, Music, AlignLeft, AlignCenter, Minus
} from 'lucide-react';

interface EditorProps {
  content: string;
  onChange: (html: string) => void;
}

export default function RichEditor({ content, onChange }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockExtension,
      ImageExtension.configure({ inline: false, allowBase64: true }),
      LinkExtension.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: 'Start writing your article...' }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
    ],
    content,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[400px]',
      },
    },
  });

  const addImage = useCallback(() => {
    const url = prompt('Enter image URL (or copy URL from Media Library):');
    if (url && url.trim() && editor) {
      editor.chain().focus().setImage({ src: url.trim() }).run();
    }
  }, [editor]);

  const addLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href || '';
    const url = prompt('Enter URL:', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  }, [editor]);

  const addVideo = useCallback(() => {
    const url = prompt('Enter video URL:\n• YouTube: https://www.youtube.com/watch?v=...\n• Local: http://localhost:8801/uploads/video/filename.mp4');
    if (!url || !url.trim() || !editor) return;
    const trimmed = url.trim();
    let html = '';
    // YouTube
    const ytMatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s?]+)/);
    if (ytMatch) {
      html = `<iframe src="https://www.youtube.com/embed/${ytMatch[1]}" width="100%" height="400" frameborder="0" allowfullscreen style="border-radius:4px;margin:1.5rem 0;display:block"></iframe>`;
    } else {
      // Local/direct video file
      html = `<video controls style="width:100%;max-width:100%;border-radius:4px;margin:1.5rem 0;display:block"><source src="${trimmed}">Your browser does not support video.</video>`;
    }
    editor.chain().focus().insertContent(html).run();
  }, [editor]);

  const addAudio = useCallback(() => {
    const url = prompt('Enter audio URL:\nExample: http://localhost:8801/uploads/audio/filename.mp3');
    if (!url || !url.trim() || !editor) return;
    const html = `<audio controls style="width:100%;margin:1.5rem 0;display:block"><source src="${url.trim()}">Your browser does not support audio.</audio>`;
    editor.chain().focus().insertContent(html).run();
  }, [editor]);

  if (!editor) return (
    <div className="border border-[#e5e5e3] p-6 min-h-[400px] flex items-start">
      <span className="text-sm text-[#9b9b9b]">Loading editor...</span>
    </div>
  );

  const ToolBtn = ({
    onClick, active, title, children, disabled
  }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode; disabled?: boolean }) => (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); if (!disabled) onClick(); }}
      title={title}
      disabled={disabled}
      className={`p-1.5 rounded transition-colors ${
        disabled ? 'opacity-30 cursor-not-allowed' :
        active ? 'bg-[#0a0a0a] text-[#fafaf8]' : 'text-[#6b6b6b] hover:text-[#0a0a0a] hover:bg-[#f0f0ee]'
      }`}
    >
      {children}
    </button>
  );

  const Divider = () => <div className="w-px h-5 bg-[#e5e5e3] mx-0.5" />;

  return (
    <div className="border border-[#e5e5e3]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-[#e5e5e3] bg-[#f9f9f7]">
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold (Ctrl+B)">
          <Bold size={15} />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic (Ctrl+I)">
          <Italic size={15} />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline (Ctrl+U)">
          <UnderlineIcon size={15} />
        </ToolBtn>
        <Divider />
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1">
          <Heading1 size={15} />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
          <Heading2 size={15} />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
          <Heading3 size={15} />
        </ToolBtn>
        <Divider />
        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
          <List size={15} />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered List">
          <ListOrdered size={15} />
        </ToolBtn>
        <Divider />
        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote Block">
          <Quote size={15} />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code Block">
          <Code size={15} />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Horizontal Rule">
          <Minus size={15} />
        </ToolBtn>
        <Divider />
        <ToolBtn onClick={addLink} active={editor.isActive('link')} title="Insert / Edit Link">
          <Link2 size={15} />
        </ToolBtn>
        <ToolBtn onClick={addImage} active={false} title="Insert Image">
          <ImageIcon size={15} />
        </ToolBtn>
        <ToolBtn onClick={addVideo} active={false} title="Embed Video (YouTube or local)">
          <Video size={15} />
        </ToolBtn>
        <ToolBtn onClick={addAudio} active={false} title="Insert Audio Player">
          <Music size={15} />
        </ToolBtn>
        <Divider />
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align Left">
          <AlignLeft size={15} />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align Center">
          <AlignCenter size={15} />
        </ToolBtn>
      </div>

      {/* Editor content area */}
      <div className="p-6">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

