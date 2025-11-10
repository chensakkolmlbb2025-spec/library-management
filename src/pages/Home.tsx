import { useState, useEffect, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Sparkles, TrendingUp, Users, Award } from "lucide-react";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { db, type Book } from "@/lib/database";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAllBooks = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await db.getBooks();
      setBooks(data || []);
    } catch (error) {
      toast.error("Failed to fetch books");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchBooks = async () => {
    if (!searchQuery.trim()) {
      fetchAllBooks();
      return;
    }

    setIsLoading(true);
    try {
      const data = await db.getBooks({ search: searchQuery });
      setBooks(data || []);
    } catch (error) {
      const err = error as Error;
      toast.error("Failed to search books");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const requestBorrow = async (bookId: string) => {
    if (!user?.id) return;

    try {
      await db.createBorrowRequest(user.id, bookId);
      toast.success("Borrow request submitted successfully!");
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Failed to submit request");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAllBooks();
  }, [fetchAllBooks]);

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Premium Hero Section */}
        <div className="relative overflow-hidden rounded-2xl glass-strong border-2 border-white/70 shadow-xl">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-[0.06]">
            <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-success rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          <div className="relative grid md:grid-cols-2 gap-8 p-6 md:p-10">
            {/* Left Content */}
            <div className="flex flex-col justify-center space-y-5">
              <div className="space-y-3 animate-slide-in">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-success/20 border-2 border-primary/40 rounded-full px-4 py-1.5 w-fit backdrop-blur-sm">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                  <span className="text-xs font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                    Welcome to Your Digital Library
                  </span>
                </div>
                
                <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight">
                  <span className="text-foreground">Discover Knowledge &</span>
                  <br />
                  <span className="bg-gradient-to-r from-primary via-success to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                    Adventure
                  </span>
                </h1>
              </div>
              
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
                Explore our collection of timeless classics, bestsellers, and hidden gems. 
                Your next favorite book is just a click away.
              </p>

              {/* Compact Stats */}
              <div className="grid grid-cols-3 gap-3 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="group text-center p-3 rounded-xl bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-md border border-white/70 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                  <BookOpen className="h-5 w-5 mx-auto mb-1 text-primary group-hover:scale-110 transition-transform" />
                  <div className="text-2xl font-black text-foreground">{books.length}+</div>
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase">Books</div>
                </div>
                <div className="group text-center p-3 rounded-xl bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-md border border-white/70 hover:border-success/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                  <Users className="h-5 w-5 mx-auto mb-1 text-success group-hover:scale-110 transition-transform" />
                  <div className="text-2xl font-black text-foreground">1K+</div>
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase">Readers</div>
                </div>
                <div className="group text-center p-3 rounded-xl bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-md border border-white/70 hover:border-warning/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                  <Award className="h-5 w-5 mx-auto mb-1 text-warning group-hover:scale-110 transition-transform" />
                  <div className="text-2xl font-black text-foreground">24/7</div>
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase">Access</div>
                </div>
              </div>

              {/* Compact CTA Buttons */}
              <div className="flex flex-wrap gap-3 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <Button 
                  className="group btn-primary px-6 py-5 text-base h-auto shadow-lg hover:shadow-xl relative overflow-hidden"
                  onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <span className="relative z-10 flex items-center">
                    <BookOpen className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                    Browse Collection
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                </Button>
                <Button 
                  variant="outline" 
                  className="group btn-secondary px-6 py-5 text-base h-auto border-2 hover:border-primary/60"
                >
                  <TrendingUp className="mr-2 h-4 w-4 group-hover:translate-y-[-2px] transition-transform" />
                  Trending
                </Button>
              </div>
            </div>

            {/* Right Visual - Lottie Animation */}
            <div className="relative hidden md:flex items-center justify-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="relative w-full h-full min-h-[400px] flex items-center justify-center">
                <DotLottieReact
                  src="https://lottie.host/14ba68fb-5b56-47b5-b343-48c4554f118e/NClhoR6wwX.lottie"
                  loop
                  autoplay
                  className="w-full h-full max-w-[500px] max-h-[500px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Header and Controls */}
        <div id="catalog" className="flex flex-col gap-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-3xl font-bold text-foreground mb-1">Library Catalog</h3>
              <p className="text-sm text-muted-foreground">Browse and request books from our collection</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setBooks((prev) =>
                        [...prev].sort((a, b) => a.title.localeCompare(b.title))
                      )
                    }
                    className="btn-secondary text-sm font-medium"
                  >
                    Sort by Title
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setBooks((prev) =>
                        [...prev].sort((a, b) =>
                          a.author.localeCompare(b.author)
                        )
                      )
                    }
                    className="btn-secondary text-sm font-medium"
                  >
                    Sort by Author
                  </Button>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by title, author, or ISBN..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (!e.target.value.trim()) fetchAllBooks();
                      }}
                      onKeyDown={(e) => e.key === "Enter" && searchBooks()}
                      className="pl-9 glass border-white/60 focus:border-primary/60 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/70 h-10"
                    />
                  </div>
                  <Button
                    onClick={searchBooks}
                    disabled={isLoading}
                    className="glass-button text-white rounded-xl px-5 h-10 font-medium shadow-sm"
                  >
                    {isLoading ? "Searching..." : "Search"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Books Grid */}
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-base">Loading books...</p>
              </div>
            ) : books.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-base">No books found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                {books.map((book) => (
                  <Card
                    key={book.id}
                    className="glass-strong border-2 border-white/80 flex flex-col h-full overflow-hidden hover:border-primary/40 transition-all duration-300 shadow-md hover:shadow-xl"
                  >
                    <div className="flex flex-col h-full">
                      {/* Book Cover Image */}
                      <div className="w-full aspect-[2/3] bg-gradient-to-br from-primary/8 to-purple-500/8 overflow-hidden relative group">
                        {book.cover_image_url ? (
                          <img
                            src={book.cover_image_url}
                            alt={`${book.title} cover`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`flex items-center justify-center w-full h-full ${book.cover_image_url ? 'hidden' : ''}`}>
                          <BookOpen className="w-16 h-16 text-primary/25" />
                        </div>
                      </div>
                      
                      {/* Book Details */}
                      <div className="p-4 flex flex-col flex-1 bg-white/40">
                        <div className="flex-1">
                          <h4 className="font-semibold text-base line-clamp-2 mb-1 text-foreground">
                            {book.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2 font-medium">
                            {book.author}
                          </p>
                          {book.description && (
                            <p className="text-xs text-muted-foreground/90 mb-3 line-clamp-2 leading-relaxed">
                              {book.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {book.genre && (
                              <Badge variant="secondary" className="text-xs bg-primary/12 text-primary border-primary/25 font-medium px-2 py-0.5">{book.genre}</Badge>
                            )}
                            <Badge
                              variant={
                                book.available_copies > 0
                                  ? "default"
                                  : "destructive"
                              }
                              className="text-xs font-medium px-2 py-0.5"
                            >
                              {book.available_copies}/{book.total_copies}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground/70 font-mono">
                            ISBN: {book.isbn}
                          </p>
                        </div>
                        <div className="mt-3 pt-3 border-t border-white/50">
                          <Button
                            onClick={() => requestBorrow(book.id)}
                            disabled={book.available_copies === 0}
                            className="w-full glass-button text-white text-sm h-9 rounded-xl shadow-sm font-medium"
                          >
                            {book.available_copies === 0
                              ? "Not Available"
                              : "Request Borrow"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
      </div>
    </Layout>
  );
}
