import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import ListItem from '@tiptap/extension-list-item';
import { BulletList, OrderedList } from '@tiptap/extension-list';
import TextAlign from '@tiptap/extension-text-align';
import Typography from '@tiptap/extension-typography';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import * as React from 'react';
import { AlignCenterIcon } from './tiptap-icons/align-center-icon';
import { AlignLeftIcon } from './tiptap-icons/align-left-icon';
import { AlignRightIcon } from './tiptap-icons/align-right-icon';

type RichTextEditorProps = {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
};

export default function RichTextEditor({ value, onChange, placeholder = 'Write something…' }: RichTextEditorProps) {
    const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
                bulletList: false, // Disable StarterKit's bulletList
                orderedList: false, // Disable StarterKit's orderedList
                listItem: false, // Disable StarterKit's listItem
                link: {
                    openOnClick: false,
                    HTMLAttributes: {
                        class: 'text-blue-600 underline cursor-pointer',
                    },
                },
            }),
            BulletList.configure({
                keepMarks: true,
                keepAttributes: false,
                HTMLAttributes: {
                    class: 'bullet-list',
                    style: 'list-style-type: disc; padding-left: 1.5rem;',
                },
            }),
            OrderedList.configure({
                keepMarks: true,
                keepAttributes: false,
                HTMLAttributes: {
                    class: 'ordered-list',
                    style: 'list-style-type: decimal; padding-left: 1.5rem;',
                },
            }),
            ListItem.configure({
                HTMLAttributes: {
                    class: 'list-item',
                    style: 'display: list-item; margin-bottom: 0.25rem;',
                },
            }),
            Highlight.configure({ multicolor: true }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Image.configure({
                HTMLAttributes: {
                    class: 'max-w-full h-auto rounded-lg',
                },
            }),
            Typography,
        ],
        content: value || '<p></p>',
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
            forceUpdate(); // Force re-render to update toolbar button states
        },
        onSelectionUpdate: () => {
            forceUpdate(); // Force re-render when selection changes
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4 prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-a:underline prose-strong:font-bold prose-em:italic prose-li:mb-1',
                spellCheck: 'true',
                'data-placeholder': placeholder,
            },
        },
    });

    React.useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value || '<p></p>');
        }
    }, [value]);

    if (!editor) return null;

    const toggleLink = () => {
        const prev = editor.getAttributes('link').href as string | undefined;
        const url = window.prompt('Enter URL', prev || 'https://');
        if (url === null) return; // cancelled
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const addImage = () => {
        const url = window.prompt('Enter image URL');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    return (
        <div className="rich-text-editor rounded-lg border border-gray-200 shadow-sm">
            <style dangerouslySetInnerHTML={{
                __html: `
                    .rich-text-editor .ProseMirror ul {
                        list-style-type: disc !important;
                        padding-left: 1.5rem !important;
                        margin: 0.5rem 0 !important;
                    }
                    .rich-text-editor .ProseMirror ol {
                        list-style-type: decimal !important;
                        padding-left: 1.5rem !important;
                        margin: 0.5rem 0 !important;
                    }
                    .rich-text-editor .ProseMirror li {
                        display: list-item !important;
                        margin-bottom: 0.25rem !important;
                    }
                `
            }} />
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 border-b border-gray-200 bg-blue-100 p-3">
                {/* Text Formatting */}
                <div className="flex gap-1 border-r border-gray-300 pr-2">
                    <ToolbarButton
                        onClick={() => {
                            editor.chain().focus().toggleBold().run();
                            forceUpdate();
                        }}
                        active={editor.isActive('bold')}
                        title="Bold (Ctrl+B)"
                    >
                        <strong>B</strong>
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => {
                            editor.chain().focus().toggleItalic().run();
                            forceUpdate();
                        }}
                        active={editor.isActive('italic')}
                        title="Italic (Ctrl+I)"
                    >
                        <em>I</em>
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => {
                            editor.chain().focus().toggleUnderline().run();
                            forceUpdate();
                        }}
                        active={editor.isActive('underline')}
                        title="Underline (Ctrl+U)"
                    >
                        <u>U</u>
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => {
                            editor.chain().focus().toggleStrike().run();
                            forceUpdate();
                        }}
                        active={editor.isActive('strike')}
                        title="Strikethrough"
                    >
                        <s>S</s>
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => {
                            editor.chain().focus().toggleHighlight().run();
                            forceUpdate();
                        }}
                        active={editor.isActive('highlight')}
                        title="Highlight"
                    >
                        <span className="rounded bg-yellow-200 px-1">H</span>
                    </ToolbarButton>
                </div>

                {/* Headings */}
                <div className="flex gap-1 border-r border-gray-300 pr-2"></div>

                {/* Lists */}
                <div className="flex gap-1 border-r border-gray-300 pr-2">
                    <ToolbarButton
                        onClick={() => {
                            editor.chain().focus().toggleBulletList().run();
                            forceUpdate();
                        }}
                        active={editor.isActive('bulletList')}
                        title="Bullet List"
                    >
                        • List
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => {
                            editor.chain().focus().toggleOrderedList().run();
                            forceUpdate();
                        }}
                        active={editor.isActive('orderedList')}
                        title="Numbered List"
                    >
                        1. List
                    </ToolbarButton>
                </div>

                {/* Alignment */}
                <div className="flex gap-1 border-r border-gray-300 pr-2">
                    <ToolbarButton
                        onClick={() => {
                            editor.chain().focus().setTextAlign('left').run();
                            forceUpdate();
                        }}
                        active={editor.isActive({ textAlign: 'left' })}
                        title="Align Left"
                    >
                        <AlignLeftIcon />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => {
                            editor.chain().focus().setTextAlign('center').run();
                            forceUpdate();
                        }}
                        active={editor.isActive({ textAlign: 'center' })}
                        title="Align Center"
                    >
                        <AlignCenterIcon />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => {
                            editor.chain().focus().setTextAlign('right').run();
                            forceUpdate();
                        }}
                        active={editor.isActive({ textAlign: 'right' })}
                        title="Align Right"
                    >
                        <AlignRightIcon />
                    </ToolbarButton>
                </div>

                {/* Media & Links */}
                <div className="flex gap-1 border-r border-gray-300 pr-2">
                    <ToolbarButton
                        onClick={() => {
                            toggleLink();
                            forceUpdate();
                        }}
                        active={editor.isActive('link')}
                        title="Add Link"
                    >
                        🔗
                    </ToolbarButton>
                </div>

                {/* Actions */}
                <div className="flex gap-1">
                    <ToolbarButton
                        onClick={() => {
                            editor.chain().focus().unsetAllMarks().clearNodes().run();
                            forceUpdate();
                        }}
                        title="Clear Formatting"
                    >
                        Clear Formatting
                    </ToolbarButton>
                </div>
            </div>

            {/* Editor Content */}
            <div className="max-h-96 min-h-[200px] overflow-y-auto p-4">
                <EditorContent
                    editor={editor}
                    className="prose prose-sm max-w-none focus:outline-none"
                    style={{
                        minHeight: '200px',
                    }}
                />
            </div>
        </div>
    );
}
type ToolbarButtonProps = {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
    title?: string;
};

function ToolbarButton({ onClick, active, children, title }: ToolbarButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`inline-flex items-center justify-center rounded-md px-2 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${
                active
                    ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                    : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            } `}
        >
            {children}
        </button>
    );
}
