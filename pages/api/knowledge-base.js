import { Client } from '@notionhq/client';

const notion = new Client({ 
  auth: process.env.NOTION_TOKEN 
});

async function getPageContent(blockId) {
  let content = '';
  
  try {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      page_size: 100,
    });

    for (const block of response.results) {
      if (block.type === 'paragraph' && block.paragraph.rich_text.length > 0) {
        const text = block.paragraph.rich_text.map(t => t.plain_text).join('');
        content += text + '\n\n';
      }
      
      if (block.type === 'heading_1' && block.heading_1.rich_text.length > 0) {
        const text = block.heading_1.rich_text.map(t => t.plain_text).join('');
        content += '# ' + text + '\n\n';
      }
      
      if (block.type === 'heading_2' && block.heading_2.rich_text.length > 0) {
        const text = block.heading_2.rich_text.map(t => t.plain_text).join('');
        content += '## ' + text + '\n\n';
      }
      
      if (block.type === 'heading_3' && block.heading_3.rich_text.length > 0) {
        const text = block.heading_3.rich_text.map(t => t.plain_text).join('');
        content += '### ' + text + '\n\n';
      }
      
      if (block.type === 'bulleted_list_item' && block.bulleted_list_item.rich_text.length > 0) {
        const text = block.bulleted_list_item.rich_text.map(t => t.plain_text).join('');
        content += '- ' + text + '\n';
      }
      
      if (block.type === 'numbered_list_item' && block.numbered_list_item.rich_text.length > 0) {
        const text = block.numbered_list_item.rich_text.map(t => t.plain_text).join('');
        content += '1. ' + text + '\n';
      }

      if (block.has_children) {
        const childContent = await getPageContent(block.id);
        content += childContent;
      }
    }

  } catch (error) {
    console.error('Error fetching Notion content:', error);
    throw error;
  }

  return content;
}

export default async function handler(req, res) {
  try {
    const pageId = process.env.NOTION_PAGE_ID;
    
    if (!pageId) {
      return res.status(500).json({ 
        error: 'NOTION_PAGE_ID not configured' 
      });
    }

    const content = await getPageContent(pageId);
    
    res.status(200).json({ content });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch knowledge base',
      details: error.message 
    });
  }
}
