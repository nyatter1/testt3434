import { useState, useEffect, useRef, useMemo, ChangeEvent, FormEvent } from "react";
import { 
  X, Newspaper, Send, ThumbsUp, ThumbsDown, MessageSquare, Trash2, 
  Image as ImageIcon, Loader2, Calendar, User, Heart, ChevronLeft, Flame
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../lib/supabase";
import { uploadImageToStorage } from "../lib/storage";
import { UserProfile } from "../types";

interface NewsSidebarProps {
  user: UserProfile;
  onClose: () => void;
  allRanksInfo: any;
  computedUsers: UserProfile[];
  handleProfileClick: (target: UserProfile, mode?: "quick" | "view" | "edit") => void;
}

interface NewsItem {
  id: string;
  author_id: string;
  author_username: string;
  author_pfp: string;
  author_rank: string;
  title: string;
  content: string;
  image_url?: string;
  created_at: string;
  likes?: string[]; // Array of user IDs who liked
  dislikes?: string[]; // Array of user IDs who disliked
}

interface NewsComment {
  id: string;
  news_id: string;
  author_id: string;
  author_username: string;
  author_pfp: string;
  author_rank: string;
  content: string;
  created_at: string;
}

export default function NewsSidebar({
  user,
  onClose,
  allRanksInfo,
  computedUsers,
  handleProfileClick
}: NewsSidebarProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [comments, setComments] = useState<NewsComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states for creation
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Comments toggles
  const [activeCommentsNewsId, setActiveCommentsNewsId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState<{ [newsId: string]: string }>({});

  // Rank-based permissions
  const viewerPriority = allRanksInfo[user.rank]?.priority ?? 14;
  // Founder+ (Founder has priority 2, Co-Dev has priority 1, Dev has priority 0)
  const isFounderOrAbove = viewerPriority <= 2;
  const isDev = user.rank === "DEVELOPER" || ["dev@gmail.com", "haydensixseven@gmail.com", "haydensixsevennn@gmail.com", "test@gmail.com"].includes(user.email || "");

  // Load news and comments
  const fetchNewsAndComments = async () => {
    try {
      const { data: newsData } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: commentsData } = await supabase
        .from("news_comments")
        .select("*")
        .order("created_at", { ascending: true });

      if (newsData) {
        setNews(newsData.map((item: any) => ({
          ...item,
          likes: Array.isArray(item.likes) ? item.likes : [],
          dislikes: Array.isArray(item.dislikes) ? item.dislikes : []
        })));
      }
      if (commentsData) {
        setComments(commentsData);
      }
    } catch (err) {
      console.error("Error fetching news/comments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsAndComments();

    // Setup live listener channels
    const newsChannel = supabase
      .channel("news-realtime-channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "news" }, () => {
        fetchNewsAndComments();
      })
      .subscribe();

    const commentsChannel = supabase
      .channel("news-comments-realtime-channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "news_comments" }, () => {
        fetchNewsAndComments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(newsChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, []);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewImageFile(e.target.files[0]);
    }
  };

  // Submit news
  const handlePublishNews = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsSubmitting(true);
    try {
      let finalImageUrl = newImageUrl.trim();

      if (newImageFile) {
        try {
          finalImageUrl = await uploadImageToStorage(
            newImageFile,
            "news",
            `news_${Date.now()}_${newImageFile.name}`
          );
        } catch (uploadErr) {
          console.error("Image upload failed, skipping or falling back:", uploadErr);
        }
      }

      const newsPayload = {
        author_id: user.id,
        author_username: user.username,
        author_pfp: user.pfp,
        author_rank: user.rank,
        title: newTitle.trim(),
        content: newContent.trim(),
        image_url: finalImageUrl || null,
        created_at: new Date().toISOString(),
        likes: [],
        dislikes: []
      };

      await supabase.from("news").insert(newsPayload);

      // Clear fields
      setNewTitle("");
      setNewContent("");
      setNewImageFile(null);
      setNewImageUrl("");
      setShowCreateForm(false);
    } catch (err) {
      console.error("Failed to publish news:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete news
  const handleDeleteNews = async (newsId: string) => {
    if (!isDev) return;
    if (!confirm("Are you sure you want to delete this news post?")) return;

    try {
      // Delete news item
      await supabase.from("news").delete().eq("id", newsId);
      // Delete associated comments
      await supabase.from("news_comments").delete().eq("news_id", newsId);
    } catch (err) {
      console.error("Failed to delete news:", err);
    }
  };

  // Like news
  const handleLikeNews = async (item: NewsItem) => {
    const currentLikes = item.likes || [];
    const currentDislikes = item.dislikes || [];
    let updatedLikes = [...currentLikes];
    let updatedDislikes = [...currentDislikes];

    if (currentLikes.includes(user.id)) {
      // Toggle off
      updatedLikes = updatedLikes.filter(id => id !== user.id);
    } else {
      // Toggle on and remove from dislikes
      updatedLikes.push(user.id);
      updatedDislikes = updatedDislikes.filter(id => id !== user.id);
    }

    try {
      await supabase
        .from("news")
        .update({ likes: updatedLikes, dislikes: updatedDislikes })
        .eq("id", item.id);
    } catch (err) {
      console.error("Failed to like news:", err);
    }
  };

  // Dislike news
  const handleDislikeNews = async (item: NewsItem) => {
    const currentLikes = item.likes || [];
    const currentDislikes = item.dislikes || [];
    let updatedLikes = [...currentLikes];
    let updatedDislikes = [...currentDislikes];

    if (currentDislikes.includes(user.id)) {
      // Toggle off
      updatedDislikes = updatedDislikes.filter(id => id !== user.id);
    } else {
      // Toggle on and remove from likes
      updatedDislikes.push(user.id);
      updatedLikes = updatedLikes.filter(id => id !== user.id);
    }

    try {
      await supabase
        .from("news")
        .update({ likes: updatedLikes, dislikes: updatedDislikes })
        .eq("id", item.id);
    } catch (err) {
      console.error("Failed to dislike news:", err);
    }
  };

  // Add Comment
  const handleAddComment = async (newsId: string) => {
    const commentText = newCommentText[newsId] || "";
    if (!commentText.trim()) return;

    try {
      const commentPayload = {
        news_id: newsId,
        author_id: user.id,
        author_username: user.username,
        author_pfp: user.pfp,
        author_rank: user.rank,
        content: commentText.trim(),
        created_at: new Date().toISOString()
      };

      await supabase.from("news_comments").insert(commentPayload);
      setNewCommentText(prev => ({ ...prev, [newsId]: "" }));
    } catch (err) {
      console.error("Failed to post comment:", err);
    }
  };

  // Delete Comment
  const handleDeleteComment = async (commentId: string) => {
    if (!isDev) return;
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      await supabase.from("news_comments").delete().eq("id", commentId);
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  // Click news creator / commenter to open profile
  const handleUserClick = (username: string) => {
    const found = computedUsers.find(u => u.username === username);
    if (found) {
      handleProfileClick(found, "quick");
    }
  };

  // Group comments by news_id
  const commentsByNewsId = useMemo(() => {
    const group: { [newsId: string]: NewsComment[] } = {};
    comments.forEach(comment => {
      if (!group[comment.news_id]) {
        group[comment.news_id] = [];
      }
      group[comment.news_id].push(comment);
    });
    return group;
  }, [comments]);

  return (
    <div className="w-full max-w-sm md:w-[420px] h-full bg-[#110d24]/98 border-r border-purple-950/60 flex flex-col shrink-0 relative z-30 animate-in slide-in-from-left duration-250 shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-purple-950/50 flex items-center justify-between bg-[#0e0a1f]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-950/40 text-purple-400 border border-purple-900/40">
            <Newspaper className="w-5 h-5 text-purple-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white tracking-wider flex items-center gap-1.5 uppercase">
              Community News
            </h2>
            <p className="text-[10px] text-purple-400">Updates & Announcements</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-purple-400 hover:text-white bg-purple-950/30 hover:bg-purple-900/40 transition-colors"
          title="Collapse Sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Container Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* Founder+ Action Banner / Create Button */}
        {isFounderOrAbove && (
          <div className="p-3 bg-gradient-to-r from-purple-950/20 via-indigo-950/30 to-purple-950/20 rounded-xl border border-purple-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-[11px] font-black text-amber-200 tracking-wide">Founder Controls</span>
              </div>
              <button
                onClick={() => setShowCreateForm(prev => !prev)}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] rounded-lg transition-colors uppercase"
              >
                {showCreateForm ? "Cancel" : "Post News"}
              </button>
            </div>

            <AnimatePresence>
              {showCreateForm && (
                <motion.form 
                  onSubmit={handlePublishNews}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-3 pt-3 border-t border-purple-950/50 space-y-3 overflow-hidden"
                >
                  <div>
                    <label className="block text-[9px] font-black text-purple-400 uppercase tracking-wider mb-1">Title</label>
                    <input
                      type="text"
                      required
                      placeholder="Catchy headline..."
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      className="w-full bg-[#090714] border border-purple-900/40 focus:border-purple-500 rounded-lg p-2 text-xs text-white placeholder-purple-500/50 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-purple-400 uppercase tracking-wider mb-1">Content</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="What is the big news? Support full stories..."
                      value={newContent}
                      onChange={e => setNewContent(e.target.value)}
                      className="w-full bg-[#090714] border border-purple-900/40 focus:border-purple-500 rounded-lg p-2 text-xs text-white placeholder-purple-500/50 outline-none resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-black text-purple-400 uppercase tracking-wider mb-1">Image URL (Optional)</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={newImageUrl}
                        onChange={e => setNewImageUrl(e.target.value)}
                        className="w-full bg-[#090714] border border-purple-900/40 focus:border-purple-500 rounded-lg p-2 text-xs text-white placeholder-purple-500/50 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-purple-400 uppercase tracking-wider mb-1">Or Upload Image</label>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-[34px] bg-[#090714] border border-dashed border-purple-900/40 hover:border-purple-500 rounded-lg text-xs text-purple-300 flex items-center justify-center gap-1.5 transition-all truncate px-2"
                      >
                        <ImageIcon className="w-3.5 h-3.5 shrink-0 text-purple-400" />
                        <span className="truncate">{newImageFile ? newImageFile.name : "Select File"}</span>
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors uppercase tracking-wider"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Publish News</span>
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="h-40 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
          </div>
        ) : news.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-center p-4">
            <Newspaper className="w-8 h-8 text-purple-900 mb-2" />
            <p className="text-xs font-black text-purple-400 uppercase tracking-wider">No News Yet</p>
            <p className="text-[10px] text-purple-500/80 mt-1">Founders have not posted any community news yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {news.map(item => {
              const itemComments = commentsByNewsId[item.id] || [];
              const showComments = activeCommentsNewsId === item.id;
              const hasLiked = item.likes?.includes(user.id);
              const hasDisliked = item.dislikes?.includes(user.id);

              return (
                <div 
                  key={item.id} 
                  className="bg-[#141029] border border-purple-950/40 rounded-xl overflow-hidden shadow-lg hover:border-purple-900/30 transition-all flex flex-col"
                >
                  {/* Author Header */}
                  <div className="p-3 bg-[#0e0a1f]/80 flex items-center justify-between border-b border-purple-950/30">
                    <div className="flex items-center gap-2">
                      <div 
                        onClick={() => handleUserClick(item.author_username)}
                        className="w-7 h-7 rounded-full overflow-hidden cursor-pointer border border-purple-500/20 hover:border-purple-500/60 transition-all"
                      >
                        <img src={item.author_pfp} alt={item.author_username} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {item.author_rank && (
                            <img 
                              src={allRanksInfo[item.author_rank]?.icon || allRanksInfo['VIP']?.icon} 
                              alt={item.author_rank} 
                              className="h-3 w-auto object-contain shrink-0" 
                              referrerPolicy="no-referrer"
                              title={allRanksInfo[item.author_rank]?.name || item.author_rank}
                            />
                          )}
                          <span 
                            onClick={() => handleUserClick(item.author_username)}
                            className="text-xs font-extrabold text-white cursor-pointer hover:underline"
                          >
                            {item.author_username}
                          </span>
                        </div>
                        <p className="text-[9px] text-purple-500 font-medium">
                          {new Date(item.created_at).toLocaleDateString(undefined, { 
                            month: 'short', 
                            day: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>

                    {isDev && (
                      <button
                        onClick={() => handleDeleteNews(item.id)}
                        className="p-1 rounded text-purple-400 hover:text-rose-500 hover:bg-rose-950/20 transition-all"
                        title="Delete News Post"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Body Title & Text */}
                  <div className="p-3.5 space-y-2 flex-1">
                    <h3 className="text-sm font-black text-white leading-tight tracking-wide">
                      {item.title}
                    </h3>
                    <p className="text-xs text-purple-200/90 whitespace-pre-wrap leading-relaxed">
                      {item.content}
                    </p>

                    {item.image_url && (
                      <div className="relative rounded-lg overflow-hidden border border-purple-950/40 max-h-56 bg-[#090714] mt-2 group">
                        <img 
                          src={item.image_url} 
                          alt={item.title} 
                          className="w-full h-auto object-contain max-h-56 mx-auto group-hover:scale-[1.02] transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>

                  {/* Likes/Dislikes & Comments Bar */}
                  <div className="px-3 py-2 bg-[#0d091e]/50 border-t border-purple-950/40 flex items-center justify-between text-purple-300">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleLikeNews(item)}
                        className={`flex items-center gap-1.5 text-xs font-extrabold hover:text-white transition-colors py-1 px-2 rounded-lg ${hasLiked ? "bg-purple-900/30 text-white border border-purple-500/20" : "hover:bg-purple-950/30"}`}
                        title="Like News"
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? "fill-purple-500 text-purple-400" : ""}`} />
                        <span>{item.likes?.length || 0}</span>
                      </button>

                      <button
                        onClick={() => handleDislikeNews(item)}
                        className={`flex items-center gap-1.5 text-xs font-extrabold hover:text-white transition-colors py-1 px-2 rounded-lg ${hasDisliked ? "bg-purple-900/30 text-white border border-purple-500/20" : "hover:bg-purple-950/30"}`}
                        title="Dislike News"
                      >
                        <ThumbsDown className={`w-3.5 h-3.5 ${hasDisliked ? "fill-purple-500 text-purple-400" : ""}`} />
                        <span>{item.dislikes?.length || 0}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => setActiveCommentsNewsId(showComments ? null : item.id)}
                      className={`flex items-center gap-1.5 text-xs font-extrabold hover:text-white transition-colors py-1 px-2 rounded-lg ${showComments ? "bg-purple-900/30 text-white" : "hover:bg-purple-950/30"}`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                      <span>{itemComments.length} {itemComments.length === 1 ? "Comment" : "Comments"}</span>
                    </button>
                  </div>

                  {/* Nested Comments Section */}
                  <AnimatePresence>
                    {showComments && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-[#0b0818]/90 border-t border-purple-950/40 overflow-hidden"
                      >
                        {/* Comments List */}
                        <div className="max-h-60 overflow-y-auto p-3 space-y-2.5 custom-scrollbar bg-[#090714]/40">
                          {itemComments.length === 0 ? (
                            <p className="text-[10px] text-purple-500/80 italic text-center py-2">
                              No comments yet. Start the discussion!
                            </p>
                          ) : (
                            itemComments.map(comment => (
                              <div key={comment.id} className="flex gap-2 text-xs group">
                                <div 
                                  onClick={() => handleUserClick(comment.author_username)}
                                  className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-purple-500/20 cursor-pointer"
                                >
                                  <img src={comment.author_pfp} alt={comment.author_username} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 bg-purple-950/10 border border-purple-950/40 rounded-lg p-2 relative">
                                  <div className="flex items-center justify-between mb-0.5">
                                    <div className="flex items-center gap-1 flex-wrap">
                                      {comment.author_rank && (
                                        <img 
                                          src={allRanksInfo[comment.author_rank]?.icon || allRanksInfo['VIP']?.icon} 
                                          alt={comment.author_rank} 
                                          className="h-2.5 w-auto object-contain shrink-0" 
                                          referrerPolicy="no-referrer"
                                        />
                                      )}
                                      <span 
                                        onClick={() => handleUserClick(comment.author_username)}
                                        className="font-extrabold text-[10px] text-purple-300 hover:underline cursor-pointer"
                                      >
                                        {comment.author_username}
                                      </span>
                                    </div>
                                    <span className="text-[8px] text-purple-600">
                                      {new Date(comment.created_at).toLocaleDateString(undefined, { 
                                        month: 'short', 
                                        day: 'numeric', 
                                        hour: 'numeric', 
                                        minute: '2-digit' 
                                      })}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-purple-100 leading-relaxed break-words">
                                    {comment.content}
                                  </p>

                                  {isDev && (
                                    <button
                                      onClick={() => handleDeleteComment(comment.id)}
                                      className="absolute right-1 bottom-1 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-purple-500 hover:text-rose-500 hover:bg-rose-950/20"
                                      title="Delete Comment"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Add Comment Input Form */}
                        <div className="p-2 border-t border-purple-950/40 bg-[#090714]/80 flex gap-1.5 items-center">
                          <input
                            type="text"
                            placeholder="Add a comment..."
                            value={newCommentText[item.id] || ""}
                            onChange={e => setNewCommentText(prev => ({ ...prev, [item.id]: e.target.value }))}
                            onKeyDown={e => {
                              if (e.key === "Enter") handleAddComment(item.id);
                            }}
                            className="flex-1 bg-[#05040a] border border-purple-900/30 focus:border-purple-600 rounded-lg py-1.5 px-2.5 text-[11px] text-white placeholder-purple-600 outline-none"
                          />
                          <button
                            onClick={() => handleAddComment(item.id)}
                            className="p-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors shrink-0"
                            title="Send Comment"
                          >
                            <Send className="w-3 h-3" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
