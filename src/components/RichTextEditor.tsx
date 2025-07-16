import { useState, useRef, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { 
  Bold, 
  Italic, 
  Underline, 
  Link, 
  Image, 
  List, 
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Palette,
  Upload
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    updateContent()
  }

  const updateContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const insertLink = () => {
    if (linkUrl && linkText) {
      const linkHtml = `<a href="${linkUrl}" style="color: #2563EB; text-decoration: underline;">${linkText}</a>`
      execCommand('insertHTML', linkHtml)
      setLinkUrl('')
      setLinkText('')
      setShowLinkDialog(false)
    }
  }

  const insertImage = () => {
    if (imageUrl) {
      const imageHtml = `<img src="${imageUrl}" alt="${imageAlt}" style="max-width: 100%; height: auto; margin: 10px 0;" />`
      execCommand('insertHTML', imageHtml)
      setImageUrl('')
      setImageAlt('')
      setShowImageDialog(false)
    }
  }

  const insertVariable = (variable: string) => {
    const variableHtml = `<span style="background: #EFF6FF; color: #1D4ED8; padding: 2px 6px; border-radius: 4px; font-family: monospace;">{${variable}}</span>`
    execCommand('insertHTML', variableHtml)
  }

  const formatText = (format: string) => {
    switch (format) {
      case 'bold':
        execCommand('bold')
        break
      case 'italic':
        execCommand('italic')
        break
      case 'underline':
        execCommand('underline')
        break
      case 'alignLeft':
        execCommand('justifyLeft')
        break
      case 'alignCenter':
        execCommand('justifyCenter')
        break
      case 'alignRight':
        execCommand('justifyRight')
        break
      case 'insertUnorderedList':
        execCommand('insertUnorderedList')
        break
      case 'insertOrderedList':
        execCommand('insertOrderedList')
        break
      case 'fontSize':
        execCommand('fontSize', '3')
        break
      case 'foreColor':
        execCommand('foreColor', '#2563EB')
        break
    }
  }

  const variables = [
    'client_name',
    'company_name',
    'invoice_number',
    'total_amount',
    'currency',
    'due_date',
    'issue_date',
    'payment_link'
  ]

  return (
    <div className={`border rounded-lg ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50">
        {/* Text Formatting */}
        <div className="flex items-center gap-1 pr-2 border-r">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => formatText('bold')}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => formatText('italic')}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => formatText('underline')}
            title="Underline"
          >
            <Underline className="h-4 w-4" />
          </Button>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1 pr-2 border-r">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => formatText('alignLeft')}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => formatText('alignCenter')}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => formatText('alignRight')}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 pr-2 border-r">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => formatText('insertUnorderedList')}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => formatText('insertOrderedList')}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>

        {/* Insert Elements */}
        <div className="flex items-center gap-1 pr-2 border-r">
          <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                title="Insert Link"
              >
                <Link className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Insert Link</DialogTitle>
                <DialogDescription>Add a hyperlink to your email</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Link Text</label>
                  <Input
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    placeholder="Click here"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">URL</label>
                  <Input
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={insertLink}>Insert Link</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                title="Insert Image"
              >
                <Image className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Insert Image</DialogTitle>
                <DialogDescription>Add an image to your email</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Image URL</label>
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Alt Text (Optional)</label>
                  <Input
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="Description of the image"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowImageDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={insertImage}>Insert Image</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Variables */}
        <div className="flex items-center gap-1">
          <select
            className="text-sm border rounded px-2 py-1"
            onChange={(e) => {
              if (e.target.value) {
                insertVariable(e.target.value)
                e.target.value = ''
              }
            }}
            defaultValue=""
          >
            <option value="">Insert Variable</option>
            {variables.map((variable) => (
              <option key={variable} value={variable}>
                {variable.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={updateContent}
        onBlur={updateContent}
        className="min-h-[200px] p-4 focus:outline-none"
        style={{
          lineHeight: '1.6',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
        dangerouslySetInnerHTML={{ __html: value }}
        data-placeholder={placeholder}
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}