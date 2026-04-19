import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  const basicAuth = req.headers.get('authorization');
  const url = req.nextUrl;
  const isAdminPath = url.pathname.startsWith('/admin');

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    // === 一時的に管理者認証を無効化し、全体をViewer用認証で統一 ===
    // if (isAdminPath) {
    //   // 管理者用の認証
    //   const validAdminUser = process.env.ADMIN_USER || 'admin';
    //   const validAdminPwd = process.env.ADMIN_PASSWORD || 'password';
    //   if (user === validAdminUser && pwd === validAdminPwd) {
    //     return NextResponse.next();
    //   }
    // } else {

      // 閲覧者（ランキング画面等）用の認証
      const validViewerUser = process.env.VIEWER_USER || 'viewer';
      const validViewerPwd = process.env.VIEWER_PASSWORD || 'viewerpass';
      if (user === validViewerUser && pwd === validViewerPwd) {
        return NextResponse.next();
      }

    // }
  }

  return new NextResponse('Auth required', {
    status: 401,
    headers: {
      // 一時的にレルムを固定
      'WWW-Authenticate': `Basic realm="Viewer Area"`,
      // 'WWW-Authenticate': `Basic realm="${isAdminPath ? 'Admin Area' : 'Viewer Area'}"`,
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
