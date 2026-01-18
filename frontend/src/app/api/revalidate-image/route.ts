import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const imageUrl = searchParams.get("url");
    const tag = searchParams.get("tag");

    if (!imageUrl && !tag) {
      return NextResponse.json(
        { error: "Either URL or tag parameter is required" },
        { status: 400 }
      );
    }

    // Use Next.js revalidateTag for proper cache invalidation
    if (tag) {
      revalidateTag(tag);
      console.log(`Cache tag invalidated: ${tag}`);
    }

    // For URL-based invalidation, create a tag from the URL
    if (imageUrl) {
      const urlTag = `image-${Buffer.from(imageUrl)
        .toString("base64")
        .slice(0, 16)}`;
      revalidateTag(urlTag);
      console.log(`Cache invalidated for image: ${imageUrl}`);
    }

    const response = NextResponse.json({
      success: true,
      message: "Cache invalidation completed",
      imageUrl,
      tag,
      timestamp: new Date().toISOString(),
    });

    // Prevent caching of this response
    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );

    return response;
  } catch (error) {
    console.error("Cache invalidation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to invalidate cache",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
