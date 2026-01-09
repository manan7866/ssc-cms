import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    // Get the requested path
    const filePath = params.path.join('/');

    // Construct the full path to the content file
    const fullPath = path.join(process.cwd(), 'content', 'prod', filePath);

    // Check if the file exists and is within the content directory
    if (!fullPath.startsWith(path.join(process.cwd(), 'content', 'prod'))) {
      return new Response(JSON.stringify({ error: 'Invalid path' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:6020',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Accept, Authorization',
        },
      });
    }

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return new Response(JSON.stringify({ error: 'File not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:6020',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Accept, Authorization',
        },
      });
    }

    // Check if it's a directory
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      // List directory contents
      const files = fs.readdirSync(fullPath);
      return new Response(JSON.stringify({ files }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:6020',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Accept, Authorization',
        },
      });
    }

    // Read the file
    const fileContent = fs.readFileSync(fullPath, 'utf8');

    // Determine content type based on file extension
    let contentType = 'application/json';
    if (fullPath.endsWith('.json')) {
      contentType = 'application/json';
    } else if (fullPath.endsWith('.txt')) {
      contentType = 'text/plain';
    } else if (fullPath.endsWith('.html')) {
      contentType = 'text/html';
    }

    // Return the file content with proper CORS headers
    return new Response(fileContent, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:6020',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Accept, Authorization',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error serving content:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:6020',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Accept, Authorization',
      },
    });
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:6020',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Accept, Authorization',
    },
  });
}