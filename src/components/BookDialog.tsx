import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Book {
  id?: string;
  title: string;
  author: string;
  isbn: string;
  description: string | null;
  genre: string | null;
  cover_image_url?: string;
  total_copies: number;
  available_copies: number;
}

interface BookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (book: Omit<Book, 'id'>) => void;
  book?: Book;
  mode: 'create' | 'edit';
}

export function BookDialog({
  open,
  onOpenChange,
  onSubmit,
  book,
  mode,
}: BookDialogProps) {
  const [formData, setFormData] = useState<Omit<Book, 'id'>>({
    title: '',
    author: '',
    isbn: '',
    description: '',
    genre: '',
    cover_image_url: '',
    total_copies: 1,
    available_copies: 1,
  });

  useEffect(() => {
    if (book && mode === 'edit') {
      setFormData({
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        description: book.description || '',
        genre: book.genre || '',
        cover_image_url: book.cover_image_url || '',
        total_copies: book.total_copies,
        available_copies: book.available_copies,
      });
    } else if (mode === 'create') {
      setFormData({
        title: '',
        author: '',
        isbn: '',
        description: '',
        genre: '',
        cover_image_url: '',
        total_copies: 1,
        available_copies: 1,
      });
    }
  }, [book, mode, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add New Book' : 'Edit Book'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Fill in the book details to add it to the library'
              : 'Update the book information'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                placeholder="Enter book title"
                className="glass"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="author">
                Author <span className="text-destructive">*</span>
              </Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                required
                placeholder="Enter author name"
                className="glass"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="isbn">
                ISBN <span className="text-destructive">*</span>
              </Label>
              <Input
                id="isbn"
                value={formData.isbn}
                onChange={(e) =>
                  setFormData({ ...formData, isbn: e.target.value })
                }
                required
                placeholder="978-0-123456-78-9"
                className="glass"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="genre">Category/Genre</Label>
              <Input
                id="genre"
                value={formData.genre || ''}
                onChange={(e) =>
                  setFormData({ ...formData, genre: e.target.value })
                }
                placeholder="Fiction, Science, etc."
                className="glass"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cover_image_url">
                Cover Image URL
              </Label>
              <Input
                id="cover_image_url"
                type="url"
                value={formData.cover_image_url || ''}
                onChange={(e) =>
                  setFormData({ ...formData, cover_image_url: e.target.value })
                }
                placeholder="https://example.com/book-cover.jpg"
                className="glass"
              />
              {formData.cover_image_url && (
                <div className="mt-2">
                  <img
                    src={formData.cover_image_url}
                    alt="Book cover preview"
                    className="h-32 w-auto object-cover rounded border"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of the book"
                className="min-h-[80px] glass"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="total_copies">
                  Total Copies <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="total_copies"
                  type="number"
                  min="1"
                  value={formData.total_copies}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      total_copies: parseInt(e.target.value) || 1,
                      available_copies: Math.min(
                        formData.available_copies,
                        parseInt(e.target.value) || 1
                      ),
                    })
                  }
                  required
                  className="glass"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="available_copies">
                  Available Copies <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="available_copies"
                  type="number"
                  min="0"
                  max={formData.total_copies}
                  value={formData.available_copies}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      available_copies: Math.min(
                        parseInt(e.target.value) || 0,
                        formData.total_copies
                      ),
                    })
                  }
                  required
                  className="glass"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="btn-primary">
              {mode === 'create' ? 'Add Book' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
