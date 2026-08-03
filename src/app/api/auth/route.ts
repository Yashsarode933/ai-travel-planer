import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, comparePassword, signToken } from '@/lib/auth';

// Handle CORS preflight requests
function handleCORS(request: NextRequest): NextResponse | null {
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }
  return null;
}

export async function POST(request: NextRequest) {
  // Handle CORS
  const corsResponse = handleCORS(request);
  if (corsResponse) return corsResponse;

  try {
    const body = await request.json();
    const { action, email, password, name, displayName } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    if (action === 'signup') {
      if (!email || !password || !name) {
        return NextResponse.json(
          { error: 'Email, password, and name are required for signup' },
          { status: 400 }
        );
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 409 }
        );
      }

      // Create user with hashed password
      const hashedPassword = await hashPassword(password);
      const user = await prisma.user.create({
        data: {
          email,
          name: displayName || name,
          password: hashedPassword,
        },
      });

      // Create token
      const token = signToken({ id: user.id, email: user.email });

      const response = NextResponse.json(
        {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          },
          token,
        },
        {
          status: 201,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Set JWT as httpOnly cookie for security
      response.cookies.set('token', token, {
        httpOnly: true,
        path: '/',
        maxAge: 604800, // 7 days
        sameSite: 'lax',
      });

      return response;
    }

    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json(
          { error: 'Email and password are required for login' },
          { status: 400 }
        );
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Verify password if user has a password set
      if (user.password) {
        const isValidPassword = await comparePassword(password, user.password);
        if (!isValidPassword) {
          return NextResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
          );
        }
      }

      // Create token
      const token = signToken({ id: user.id, email: user.email });

      const response = NextResponse.json(
        {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          },
          token,
        },
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Set JWT as httpOnly cookie for security
      response.cookies.set('token', token, {
        httpOnly: true,
        path: '/',
        maxAge: 604800, // 7 days
        sameSite: 'lax',
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Handle CORS preflight
  const corsResponse = handleCORS(request);
  if (corsResponse) return corsResponse;

  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT(request: NextRequest) {
  // Verify token endpoint
  const corsResponse = handleCORS(request);
  if (corsResponse) return corsResponse;

  try {
    // Try to get token from Authorization header first
    const authorization = request.headers.get('authorization');
    let token: string | null = null;
    
    if (authorization && authorization.startsWith('Bearer ')) {
      token = authorization.split(' ')[1];
    } else {
      // Fallback to cookie
      token = request.cookies.get('token')?.value || null;
    }
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token required' },
        { status: 401 }
      );
    }

    const { verifyToken } = await import('@/lib/auth');
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      },
      token,
    });
  } catch (error) {
    console.error('Verify token error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // Logout endpoint - clear the token cookie
  const corsResponse = handleCORS(request);
  if (corsResponse) return corsResponse;

  const response = NextResponse.json(
    { message: 'Logged out successfully' },
    { status: 200 }
  );

  // Clear the token cookie by setting it to empty with maxAge 0
  response.cookies.set('token', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
  });

  return response;
}