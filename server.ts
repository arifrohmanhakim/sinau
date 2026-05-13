import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import he from "he";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Route to fetch categories (Books)
  app.get("/api/books", async (req, res) => {
    try {
      const response = await axios.get("https://ilmiyyah.com/wp-json/wp/v2/categories?per_page=100&hide_empty=true");
      const categories = response.data;

      // Fetch featured images for these categories by looking at one post per category
      // We do this in parallel for efficiency
      const covers: Record<string, string> = {};
      
      const books = categories.map((cat: any) => {
        const name = he.decode(cat.name);
        
        // Better Muallif (Author) extraction from category name
        let muallif = "Ilmiyyah";
        if (name.includes("Syaikh")) {
          const authorParts = name.match(/Syaikh\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/);
          if (authorParts) muallif = authorParts[0];
        } else if (name.includes("Ustadz")) {
          const authorParts = name.match(/Ustadz\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/);
          if (authorParts) muallif = authorParts[0];
        }

        return {
          id: cat.id.toString(),
          name: name,
          slug: cat.slug,
          count: cat.count,
          parent: cat.parent.toString(),
          description: he.decode(cat.description || ""),
          coverColor: `hsl(${Math.abs(cat.slug.split('').reduce((a:any,b:any)=>a+b.charCodeAt(0),0)) % 360}, 30%, 40%)`,
          image: null,
          muallif: muallif
        };
      });

      // Try to fetch covers for the most popular books
      const topBooks = books.filter((b: any) => b.count > 5).slice(0, 20);
      try {
        const postPromises = topBooks.map((b: any) => 
          axios.get(`https://ilmiyyah.com/wp-json/wp/v2/posts?categories=${b.id}&per_page=1&_embed`)
        );
        const postResults = await Promise.allSettled(postPromises);
        
        postResults.forEach((result, idx) => {
          if (result.status === 'fulfilled' && result.value.data.length > 0) {
            const post = result.value.data[0];
            const img = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
            if (img) {
              const bookId = topBooks[idx].id;
              const book = books.find((b: any) => b.id === bookId);
              if (book) book.image = img;
            }
          }
        });
      } catch (e) {
        console.error("Error fetching covers:", e);
      }

      res.json(books);
    } catch (error) {
      console.error("Error fetching books:", error);
      res.status(500).json({ error: "Failed to fetch books" });
    }
  });

  // API Route to fetch articles within a specific book (category)
  app.get("/api/books/:id/articles", async (req, res) => {
    const { id } = req.params;
    try {
      const response = await axios.get(`https://ilmiyyah.com/wp-json/wp/v2/posts?categories=${id}&per_page=100&_embed`);
      const articles = response.data.map((post: any) => {
        const author = post._embedded?.author?.[0]?.name || "Ilmiyyah";
        const featuredImage = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null;
        
        return {
          id: post.id.toString(),
          title: he.decode(post.title.rendered),
          excerpt: he.decode(post.excerpt.rendered.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...'),
          content: post.content.rendered,
          author: author,
          date: new Date(post.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
          readTime: Math.ceil(post.content.rendered.split(' ').length / 200) + " min",
          image: featuredImage
        };
      });
      res.json(articles);
    } catch (error) {
      console.error(`Error fetching articles for book ${id}:`, error);
      res.status(500).json({ error: "Failed to fetch articles" });
    }
  });

  // API Route to fetch home articles (featured)
  app.get("/api/articles", async (req, res) => {
    try {
      const response = await axios.get("https://ilmiyyah.com/wp-json/wp/v2/posts?_embed&per_page=20");
      const posts = response.data.map((post: any) => {
        // Find category
        const categories = post._embedded?.["wp:term"]?.[0] || [];
        const category = categories.length > 0 ? categories[0].name : "Umum";
        
        // Find author
        const author = post._embedded?.author?.[0]?.name || "Ilmiyyah";

        return {
          id: post.id.toString(),
          title: he.decode(post.title.rendered),
          excerpt: he.decode(post.excerpt.rendered.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...'),
          content: post.content.rendered, // This is HTML
          category: category,
          author: author,
          date: new Date(post.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
          readTime: Math.ceil(post.content.rendered.split(' ').length / 200) + " min",
        };
      });
      res.json(posts);
    } catch (error) {
      console.error("Error fetching articles:", error);
      res.status(500).json({ error: "Failed to fetch articles" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
