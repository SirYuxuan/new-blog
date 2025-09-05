import { Feed } from 'feed';
import fs from 'fs';
import { getAllPosts, Post } from './posts';

export async function generateRssFeed() {
  const posts = await getAllPosts();
  const siteURL = 'https://blog.oofo.cc';
  const date = new Date();

  const author = {
    name: 'Sir丶雨轩',
    email: 'dev@oofo.cc',
    link: siteURL,
  };

  const feed = new Feed({
    title: 'Sir丶雨轩的博客',
    description: 'Sir丶雨轩的个人博客，分享技术、生活和思考。',
    id: siteURL,
    link: siteURL,
    language: 'zh-CN',
    image: `${siteURL}/favicon.ico`,
    favicon: `${siteURL}/favicon.ico`,
    copyright: `All rights reserved ${date.getFullYear()}`,
    updated: date,
    generator: 'Feed for Node.js',
    feedLinks: {
      rss2: `${siteURL}/rss.xml`,
    },
    author,
  });

  posts.forEach((post: Post) => {
    const url = `${siteURL}/posts/${post.id}`;
    feed.addItem({
      title: post.title,
      id: url,
      link: url,
      description: post.excerpt,
      content: post.content,
      author: [author],
      date: new Date(post.date),
      category: post.tags && post.tags.length > 0
        ? post.tags.map(tag => ({ name: tag }))
        : undefined,
    });
  });

  fs.writeFileSync('./public/rss.xml', feed.rss2());
}
