// API Service for external integrations
const RAPIDAPI_KEY = '809bb8c909mshf942a1f775a10aep15d048jsn3ad6bc7803dd';
const GEMINI_API_KEY = 'AIzaSyBV8aMrXXl96I5IgXlc99jsuY4e2QMnHZQ';
const YOUTUBE_API_KEY = 'AIzaSyBLNJRKGvi61U43ERTNXRYPiyY1EyKypsg';

export class APIService {
  // Judge0 API for code execution
  static async executeCode(code: string, language: string, input?: string) {
    try {
      const languageMap: Record<string, number> = {
        'python': 71,
        'javascript': 63,
        'java': 62,
        'cpp': 54,
        'c': 50
      };

      const response = await fetch('https://judge0-ce.p.rapidapi.com/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        },
        body: JSON.stringify({
          source_code: code,
          language_id: languageMap[language] || 71,
          stdin: input || '',
          expected_output: null
        })
      });

      const submission = await response.json();
      
      // Poll for result
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const resultResponse = await fetch(`https://judge0-ce.p.rapidapi.com/submissions/${submission.token}`, {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        }
      });

      return await resultResponse.json();
    } catch (error) {
      console.error('Code execution error:', error);
      throw error;
    }
  }

  // Gemini AI for explanations and narration
  static async getAIExplanation(prompt: string) {
    try {
      const response = await fetch(`https://gemini-ai-api.p.rapidapi.com/api002?prompt=${encodeURIComponent(prompt)}`, {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'gemini-ai-api.p.rapidapi.com'
        }
      });

      const data = await response.json();
      return data.response || data.text || 'AI explanation not available';
    } catch (error) {
      console.error('AI explanation error:', error);
      return 'AI explanation temporarily unavailable';
    }
  }

  // YouTube API for video suggestions
  static async searchYouTubeVideos(query: string, language: string = 'en') {
    try {
      const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=5&key=${YOUTUBE_API_KEY}&relevanceLanguage=${language}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      const data = await response.json();
      return data.items?.map((item: any) => ({
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        thumbnail: item.snippet.thumbnails.medium.url,
        language: language
      })) || [];
    } catch (error) {
      console.error('YouTube search error:', error);
      return [];
    }
  }

  // Open Library API for books
  static async searchBooks(query: string) {
    try {
      const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      const data = await response.json();
      
      return data.docs?.map((book: any) => ({
        title: book.title,
        author: book.author_name?.[0] || 'Unknown Author',
        isbn: book.isbn?.[0],
        coverUrl: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : null,
        readUrl: `https://openlibrary.org${book.key}`,
        publishYear: book.first_publish_year
      })) || [];
    } catch (error) {
      console.error('Book search error:', error);
      return [];
    }
  }
}