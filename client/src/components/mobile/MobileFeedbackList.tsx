import { useState, useEffect, useRef, useCallback } from "react";
import { MobileFeedbackCard } from "./MobileFeedbackCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search,
  Filter,
  SortDesc,
  RefreshCw,
  MessageSquare,
  Clock,
  CheckCircle,
  Star,
  ChevronDown,
  Smartphone,
  ArrowUp
} from "lucide-react";

interface MobileFeedbackListProps {
  feedbackItems: any[];
  userRole: 'student' | 'supervisor';
  isLoading?: boolean;
  onRefresh?: () => void;
  onSubmitResponse?: (feedbackId: string, responseText: string) => Promise<void>;
}

export function MobileFeedbackList({ 
  feedbackItems, 
  userRole, 
  isLoading = false, 
  onRefresh,
  onSubmitResponse
}: MobileFeedbackListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'responded' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'status'>('date');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [visibleItems, setVisibleItems] = useState(10);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  // Mobile-optimized infinite scrolling
  const handleScroll = useCallback(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
    
    // Show scroll to top button
    setShowScrollTop(scrollTop > 200);

    // Load more items when near bottom
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      if (visibleItems < filteredAndSortedItems.length) {
        setVisibleItems(prev => Math.min(prev + 10, filteredAndSortedItems.length));
      }
    }
  }, [visibleItems]);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Filter and sort logic
  const filteredAndSortedItems = feedbackItems
    .filter(feedback => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const supervisorName = `${feedback.supervisor?.firstName || ''} ${feedback.supervisor?.lastName || ''}`.toLowerCase();
        const traineeName = `${feedback.trainee?.firstName || ''} ${feedback.trainee?.lastName || ''}`.toLowerCase();
        const feedbackText = feedback.writtenFeedback?.toLowerCase() || '';
        
        if (!supervisorName.includes(searchLower) && 
            !traineeName.includes(searchLower) && 
            !feedbackText.includes(searchLower)) {
          return false;
        }
      }

      // Status filter
      if (selectedFilter === 'responded') return !!feedback.studentResponse;
      if (selectedFilter === 'pending') return !feedback.studentResponse;
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'rating':
          return (b.overallRating || 0) - (a.overallRating || 0);
        case 'status':
          // Pending first, then responded
          if (a.studentResponse && !b.studentResponse) return 1;
          if (!a.studentResponse && b.studentResponse) return -1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getFilterCounts = () => {
    const responded = feedbackItems.filter(f => f.studentResponse).length;
    const pending = feedbackItems.filter(f => !f.studentResponse).length;
    return { all: feedbackItems.length, responded, pending };
  };

  const counts = getFilterCounts();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 text-sm">Loading feedback...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Mobile Header with Controls */}
      <div className="bg-white border-b border-gray-200 p-4 space-y-4 sticky top-0 z-10">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search feedback..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 text-sm"
          />
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 p-2"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {[
            { value: 'all', label: 'All', count: counts.all },
            { value: 'pending', label: 'Pending', count: counts.pending },
            { value: 'responded', label: 'Responded', count: counts.responded }
          ].map((filter) => (
            <Button
              key={filter.value}
              variant={selectedFilter === filter.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter(filter.value as any)}
              className="flex-shrink-0 text-xs whitespace-nowrap"
            >
              {filter.label}
              {filter.count > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {filter.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {filteredAndSortedItems.length} feedback {filteredAndSortedItems.length === 1 ? 'item' : 'items'}
          </span>
          <div className="flex space-x-1">
            {[
              { value: 'date', label: 'Date', icon: Clock },
              { value: 'status', label: 'Status', icon: CheckCircle },
              { value: 'rating', label: 'Rating', icon: Star }
            ].map((sort) => {
              const Icon = sort.icon;
              return (
                <Button
                  key={sort.value}
                  variant={sortBy === sort.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSortBy(sort.value as any)}
                  className="text-xs p-2"
                >
                  <Icon className="w-3 h-3" />
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ height: 'calc(100vh - 200px)' }}
      >
        {filteredAndSortedItems.length > 0 ? (
          <>
            {filteredAndSortedItems.slice(0, visibleItems).map((feedback) => (
              <MobileFeedbackCard
                key={feedback.id}
                feedback={feedback}
                onSubmitResponse={onSubmitResponse}
                userRole={userRole}
              />
            ))}
            
            {/* Loading indicator for infinite scroll */}
            {visibleItems < filteredAndSortedItems.length && (
              <div ref={loadingRef} className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* End of list indicator */}
            {visibleItems >= filteredAndSortedItems.length && filteredAndSortedItems.length > 10 && (
              <div className="text-center py-6 text-gray-500 text-sm">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                You've reached the end of your feedback
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Feedback Found</h3>
              <p className="text-gray-600 text-sm">
                {searchQuery 
                  ? `No feedback matches "${searchQuery}"`
                  : selectedFilter === 'responded' 
                    ? "No students have responded to feedback yet"
                    : selectedFilter === 'pending'
                      ? "All feedback has been responded to"
                      : "No feedback available"
                }
              </p>
              {searchQuery && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSearchQuery('')}
                  className="mt-3"
                >
                  Clear search
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg z-20"
          size="sm"
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      )}

      {/* Mobile Optimization Indicator */}
      <div className="hidden md:flex items-center justify-center p-2 bg-blue-50 text-blue-700 text-xs">
        <Smartphone className="w-3 h-3 mr-1" />
        Mobile Optimized Interface
      </div>
    </div>
  );
}